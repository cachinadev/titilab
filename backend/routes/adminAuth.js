import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

const ADMIN_USER = "admin";
// Nuevo hash de "Titil@b1234"
const ADMIN_PASS = "$2b$10$g6l8FWwAH8RzjZCXrJmIKulZQ4JdwIoVxZ.g1TtV2Bpp8pCMM4O/S"; 

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN_USER) {
    return res.status(401).json({ message: "Usuario incorrecto" });
  }

  const isMatch = await bcrypt.compare(password, ADMIN_PASS);
  if (!isMatch) {
    return res.status(401).json({ message: "Contraseña incorrecta" });
  }

  const token = jwt.sign({ user: username }, "secret-key", { expiresIn: '2h' });
  res.json({ token });
});

// Middleware para proteger rutas
export function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: "Token requerido" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, "secret-key", (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });
    req.user = decoded;
    next();
  });
}

export default router;
