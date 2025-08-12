import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ENV_PASS_HASH = (process.env.ADMIN_PASS_HASH || "").trim();
const ENV_PASS_PLAIN = (process.env.ADMIN_PASS || "").trim();
const JWT_SECRET = process.env.JWT_SECRET || "secreto";

function isBcryptHash(s) {
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(s || "");
}

let ADMIN_PASS_HASH = null;
let source = "DEFAULT_FALLBACK";

if (isBcryptHash(ENV_PASS_HASH)) {
  ADMIN_PASS_HASH = ENV_PASS_HASH;
  source = "ENV_HASH";
} else if (ENV_PASS_PLAIN) {
  ADMIN_PASS_HASH = bcrypt.hashSync(ENV_PASS_PLAIN, 10);
  source = "ENV_PLAIN";
} else {
  ADMIN_PASS_HASH = bcrypt.hashSync("Titil@b1234", 10);
  source = "DEFAULT_FALLBACK";
}

if (process.env.NODE_ENV !== "production") {
  console.log(`🔐 [adminAuth] Admin user: ${ADMIN_USER} | password source: ${source}`);
}

// Opcional: login también aquí (NO montes dos routers /login a la vez)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (username !== ADMIN_USER) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    const isMatch = await bcrypt.compare(password || "", ADMIN_PASS_HASH);
    if (!isMatch) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "2h" });
    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Middleware para proteger rutas con Bearer Token
export function verifyAdmin(req, res, next) {
  try {
    const authHeader = req.headers?.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(403).json({ message: "Token requerido" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Token inválido o expirado" });
      req.user = decoded;
      next();
    });
  } catch (err) {
    console.error("verifyAdmin error:", err);
    return res.status(403).json({ message: "Token inválido" });
  }
}

export default router;
