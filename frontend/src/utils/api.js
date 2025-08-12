// src/utils/api.js

// Base de API:
// - En dev usa "/api" y CRA proxy lo manda a :4000.
// - En prod también "/api" y Nginx lo reenvía al backend.
// - Puedes forzar con REACT_APP_API_BASE o REACT_APP_BACKEND_URL.
const RAW_API_BASE =
  (process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "/api").trim();

// Normaliza sin barra final
export const API_BASE = RAW_API_BASE.endsWith("/")
  ? RAW_API_BASE.slice(0, -1)
  : RAW_API_BASE;

// Construye URL (acepta rutas absolutas http/https)
export const apiUrl = (path = "") => {
  if (/^https?:\/\//i.test(path)) return path;
  const p = String(path).startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
};

const isFormData = (body) =>
  typeof FormData !== "undefined" && body instanceof FormData;

const getToken = () =>
  (typeof localStorage !== "undefined" && localStorage.getItem("token")) || null;

const handleAutoLogout = (res, autoLogout = true) => {
  if (!autoLogout) return;
  if (res.status === 401 || res.status === 403) {
    try {
      if (typeof localStorage !== "undefined") localStorage.removeItem("token");
      if (typeof window !== "undefined") window.location.href = "/admin-login";
    } catch {}
  }
};

// Wrapper básico de fetch con:
// - Header Accept y Content-Type automático (excepto FormData)
// - Bearer token automático (puedes desactivar con { withAuth: false })
// - Timeout (por defecto 20s, cambia con { timeoutMs })
// - Auto-logout en 401/403 (desactiva con { autoLogout: false })
export async function apiFetch(path, options = {}) {
  const url = apiUrl(path);
  const headers = new Headers(options.headers || {});
  const withAuth = options.withAuth !== false;
  const autoLogout = options.autoLogout !== false; // por defecto true

  // Accept por defecto
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  // Content-Type automático salvo FormData o si ya está definido
  if (!isFormData(options.body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Token automático si existe y no está seteado
  if (withAuth && !headers.has("Authorization")) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutMs = Number(options.timeoutMs ?? 20000);
  const timeoutId = setTimeout(() => controller.abort("timeout"), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    // Manejo centralizado 401/403
    handleAutoLogout(res, autoLogout);

    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Parseo seguro de JSON (si no es JSON retorna texto)
async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Helpers que DEVUELVEN el cuerpo ya parseado (o lanzan error con mensaje)
export async function apiGet(path, opts) {
  const res = await apiFetch(path, { ...opts, method: "GET" });
  const data = await parseJsonSafe(res);
  if (!res.ok)
    throw new Error(typeof data === "string" ? `HTTP ${res.status}: ${data}` : data?.message || `HTTP ${res.status}`);
  return data;
}

export async function apiPost(path, body, opts = {}) {
  const isFD = isFormData(body);
  const res = await apiFetch(path, {
    ...opts,
    method: "POST",
    body: isFD ? body : JSON.stringify(body ?? {}),
    // si es FormData, no forzar Content-Type (lo hace el browser)
  });
  const data = await parseJsonSafe(res);
  if (!res.ok)
    throw new Error(typeof data === "string" ? `HTTP ${res.status}: ${data}` : data?.message || `HTTP ${res.status}`);
  return data;
}

export async function apiPut(path, body, opts = {}) {
  const isFD = isFormData(body);
  const res = await apiFetch(path, {
    ...opts,
    method: "PUT",
    body: isFD ? body : JSON.stringify(body ?? {}),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok)
    throw new Error(typeof data === "string" ? `HTTP ${res.status}: ${data}` : data?.message || `HTTP ${res.status}`);
  return data;
}

export async function apiDelete(path, opts) {
  const res = await apiFetch(path, { ...opts, method: "DELETE" });
  const data = await parseJsonSafe(res);
  if (!res.ok)
    throw new Error(typeof data === "string" ? `HTTP ${res.status}: ${data}` : data?.message || `HTTP ${res.status}`);
  return data;
}
