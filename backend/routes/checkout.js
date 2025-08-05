import express from 'express';
import { db } from '../db.js'; // ✅ Named export desde db.js

const router = express.Router();

// 📌 Crear tabla pedidos si no existe
await db.exec(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    email TEXT,
    direccion TEXT,
    telefono TEXT,
    tipoComprobante TEXT,
    dni TEXT,
    ruc TEXT,
    empresa TEXT,
    departamento TEXT,
    provincia TEXT,
    distrito TEXT,
    courier TEXT,
    metodoPago TEXT,
    total REAL,
    cart TEXT,
    fecha TEXT
  )
`);

// 📌 Intentar agregar columna 'status' si no existe
await db.exec(`ALTER TABLE pedidos ADD COLUMN status TEXT DEFAULT 'pendiente'`)
  .catch(() => {
    console.log("ℹ️ Columna 'status' ya existe en la tabla pedidos");
  });

// 📌 Ruta para crear un nuevo pedido (sin autenticación)
router.post('/', async (req, res) => {
  try {
    const {
      nombre, email, direccion, telefono,
      tipoComprobante, dni, ruc, empresa,
      departamento, provincia, distrito,
      courier, metodoPago, total, cart,
      status // opcional
    } = req.body;

    const fecha = new Date().toISOString();
    const pedidoStatus = status || 'pendiente';

    // Guardar en la BD y obtener el ID del pedido
    const result = await db.run(
      `INSERT INTO pedidos 
      (nombre, email, direccion, telefono, tipoComprobante, dni, ruc, empresa, 
      departamento, provincia, distrito, courier, metodoPago, total, cart, fecha, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre, email, direccion, telefono, tipoComprobante, dni, ruc, empresa,
        departamento, provincia, distrito, courier, metodoPago, total,
        JSON.stringify(cart), fecha, pedidoStatus
      ]
    );

    const orderId = result.lastID;
    const trackingCode = `T-${orderId}-${Date.now().toString().slice(-4)}`;

    console.log(`✅ Pedido #${orderId} guardado con estado: ${pedidoStatus}`);

    res.status(200).json({
      success: true,
      message: "Pedido procesado y guardado",
      orderId,
      tracking: trackingCode
    });

  } catch (error) {
    console.error("❌ Error en checkout:", error.message, error.stack);
    res.status(500).json({
      success: false,
      error: "Error procesando el pedido",
      details: error.message
    });
  }
});

export default router;
