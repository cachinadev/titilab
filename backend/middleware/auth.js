// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secreto";

/**
 * Middleware de autenticación para rutas de admin.
 * - Requiere header: Authorization: Bearer <token>
 * - Verifica firma y expiración del JWT
 * - En éxito, adjunta `req.user`
 */
export function verifyAdmin(req, res, next) {
  // Deja pasar preflights CORS
  if (req.method === "OPTIONS") return next();

  const authHeader = req.headers?.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.setHeader('WWW-Authenticate', 'Bearer realm="admin", error="invalid_request"');
    return res.status(401).json({ code: "TOKEN_MISSING", message: "⚠️ Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      res.setHeader('WWW-Authenticate', 'Bearer realm="admin", error="invalid_token", error_description="expired"');
      console.error("❌ Autenticación: token expirado");
      return res.status(401).json({ code: "TOKEN_EXPIRED", message: "❌ Token expirado" });
    }
    res.setHeader('WWW-Authenticate', 'Bearer realm="admin", error="invalid_token"');
    console.error("❌ Autenticación: token inválido →", err.message);
    return res.status(401).json({ code: "TOKEN_INVALID", message: "❌ Token inválido" });
  }
}

// Compatibilidad con imports por defecto: import verifyAdmin from ".../auth.js"
export default verifyAdmin;
