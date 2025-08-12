// frontend/src/components/ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function isTokenValid(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    // si no trae exp por compatibilidad, lo consideramos inválido
    if (!payload?.exp) return false;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token || !isTokenValid(token)) {
    // limpia tokens inválidos/expirados
    localStorage.removeItem("token");
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
