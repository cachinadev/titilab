// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productsRoutes from "./routes/products.js";
import adminRoutes from "./routes/admin.js";
import checkoutRoutes from "./routes/checkout.js";
import ordersRoutes from "./routes/orders.js";
import claimsRoutes from "./routes/claims.js";

dotenv.config();

const app = express();

// Si vas a poner Nginx delante, esto ayuda con X-Forwarded-*
app.set("trust proxy", 1);

// --- CORS ---
const isProd = process.env.NODE_ENV === "production";

const allowedOrigins = (process.env.ALLOWED_ORIGINS ||
  "http://localhost:3000,https://www.titilab.store"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Rangos privados típicos para desarrollo en LAN
const privateLAN = [
  /^http:\/\/localhost(?::\d+)?$/i,
  /^http:\/\/127\.0\.0\.1(?::\d+)?$/i,
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?$/i,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(?::\d+)?$/i,
  /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}(?::\d+)?$/i,
];

app.use(
  cors({
    origin(origin, cb) {
      // Permitir curl/postman/same-origin (sin Origin)
      if (!origin) return cb(null, true);

      // Lista blanca explícita por .env
      if (allowedOrigins.includes(origin)) return cb(null, true);

      // En desarrollo, permitir orígenes de redes privadas
      if (!isProd && privateLAN.some((rx) => rx.test(origin))) {
        return cb(null, true);
      }

      return cb(new Error(`CORS bloqueado para origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Preflight
app.options("*", cors());

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (subidas)
app.use("/uploads", express.static("uploads"));

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

// Log de checkout
app.use("/api/checkout", (req, res, next) => {
  console.log("🛒 Nuevo checkout recibido:");
  console.log("Headers:", req.headers);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  next();
});

// Rutas API
app.use("/api/products", productsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/claims", claimsRoutes);

// Handler específico para errores de CORS (403) antes del genérico
app.use((err, req, res, next) => {
  if (err && typeof err.message === "string" && err.message.startsWith("CORS bloqueado")) {
    return res.status(403).json({ message: err.message });
  }
  return next(err);
});

// Manejo genérico de errores
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "JSON inválido en la solicitud" });
  }
  console.error("❗️Error no manejado:", err);
  return res.status(500).json({ message: "Error interno del servidor" });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend corriendo en http://0.0.0.0:${PORT}`);
});
