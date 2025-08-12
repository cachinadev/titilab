// backend/routes/admin.js
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
  console.log(`🔐 Admin user: ${ADMIN_USER} | password source: ${source}`);
}

// POST /api/admin/login
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

    // 👉 Incluimos role en el payload para que el Navbar pueda mostrar el enlace Admin
    const payload = { username: ADMIN_USER, role: "admin" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });

    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
