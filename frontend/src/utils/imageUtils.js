// src/utils/imageUtils.js

/**
 * Utilidades para construir URLs de imágenes de forma robusta en dev/prod.
 * - Mantiene http(s):// y data: tal cual
 * - Normaliza rutas relativas (backslashes, ./)
 * - Si falta el prefijo, asume /uploads/<archivo>
 * - En dev, usa http://localhost:4000 para /uploads
 * - En prod, intenta mismo origen (o REACT_APP_BACKEND_ORIGIN/REACT_APP_UPLOADS_BASE)
 */

const STRIP_TRAILING_SLASH = (s = "") => s.replace(/\/+$/, "");
const isAbsoluteUrl = (u) => /^https?:\/\//i.test(u || "");
const isDataUrl = (u) => typeof u === "string" && u.startsWith("data:");

const getEnv = (k) => {
  try { return (process.env?.[k] ?? "").trim(); } catch { return ""; }
};

const guessIsLocalhost = () => {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname || "";
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
};

/**
 * Obtiene un ORIGEN (scheme+host+port) válido para alcanzar el backend.
 * Prioridad:
 * 1) REACT_APP_BACKEND_ORIGIN
 * 2) REACT_APP_UPLOADS_BASE
 * 3) ORIGIN de REACT_APP_API_BASE/REACT_APP_BACKEND_URL si son absolutas
 * 4) Si estamos en localhost -> http://localhost:4000
 * 5) window.location.origin (Nginx sirviendo /uploads)
 */
export const getBackendOrigin = () => {
  const forced = getEnv("REACT_APP_BACKEND_ORIGIN") || getEnv("REACT_APP_UPLOADS_BASE");
  if (forced) return STRIP_TRAILING_SLASH(forced);

  const apiBase = getEnv("REACT_APP_API_BASE") || getEnv("REACT_APP_BACKEND_URL") || "/api";
  if (isAbsoluteUrl(apiBase)) {
    try { return new URL(apiBase).origin; } catch {}
  }

  if (guessIsLocalhost()) return "http://localhost:4000";
  if (typeof window !== "undefined") return window.location.origin;
  return "";
};

/**
 * Devuelve la URL correcta de imagen.
 * @param {string} imagePath - Ruta/archivo de imagen desde la BD.
 * @returns {string} - URL completa o placeholder.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.png"; // fallback

  // Absolutas o data:
  if (isAbsoluteUrl(imagePath) || isDataUrl(imagePath)) return imagePath;

  // Normaliza separadores y quita prefijos './' o '/'
  let p = String(imagePath).trim().replace(/\\/g, "/").replace(/^\.?\//, "");

  // Si no viene con /uploads al inicio, asumimos que vive en /uploads
  if (!p.startsWith("uploads/")) {
    p = `uploads/${p}`;
  }

  // Asegura slash inicial y escapa caracteres (espacios, etc.)
  p = `/${p}`;
  const safePath = encodeURI(p);

  // Resuelve origen adecuado
  const origin = getBackendOrigin();
  return origin ? `${STRIP_TRAILING_SLASH(origin)}${safePath}` : safePath;
};

export default getImageUrl;
