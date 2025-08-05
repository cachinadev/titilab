import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// 🔹 Usuario administrador (puedes reemplazar con base de datos)
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS_HASH || bcrypt.hashSync("Titil@b1234", 10);

// 🔹 Ruta de login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Validar usuario
  if (username !== ADMIN_USER) {
    return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
  }

  // Validar contraseña
  const isMatch = await bcrypt.compare(password, ADMIN_PASS);
  if (!isMatch) {
    return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
  }

  // Generar token JWT
  const token = jwt.sign({ username }, process.env.JWT_SECRET || "secreto", {
    expiresIn: "2h",
  });

  res.json({ token });
});

export default router;
