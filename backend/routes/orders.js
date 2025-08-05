import express from 'express';
import { db } from '../db.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

/**
 * 📌 Obtener todos los pedidos (solo admin con token)
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await db.all(`SELECT * FROM pedidos ORDER BY fecha DESC`);
    const formatted = orders.map(o => ({
      ...o,
      cart: JSON.parse(o.cart || "[]")
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Obtener un pedido por ID (solo admin con token)
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await db.get(`SELECT * FROM pedidos WHERE id = ?`, [req.params.id]);
    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    order.cart = JSON.parse(order.cart || "[]");
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Actualizar estado de un pedido (solo admin con token)
 * Si el estado es "completado", reduce automáticamente el stock de los productos
 */
router.put('/:id/status', verifyToken, async (req, res) => {
  const { status } = req.body;

  try {
    // Obtener pedido
    const order = await db.get(`SELECT * FROM pedidos WHERE id = ?`, [req.params.id]);
    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // Actualizar estado
    await db.run(`UPDATE pedidos SET status = ? WHERE id = ?`, [status, req.params.id]);

    // Si es "completado", reducir stock
    if (status.toLowerCase() === "completado") {
      const cart = JSON.parse(order.cart || "[]");

      for (const item of cart) {
        if (!item._id || !item.quantity) continue;

        // Obtener producto actual
        const product = await db.get(`SELECT * FROM products WHERE id = ?`, [item._id]);
        if (!product) continue;

        // Calcular nuevo stock
        const newStock = Math.max(0, product.stock - item.quantity);

        // Actualizar en DB
        await db.run(`UPDATE products SET stock = ? WHERE id = ?`, [newStock, item._id]);
      }
    }

    res.json({ success: true, message: "Estado actualizado y stock ajustado si corresponde" });
  } catch (err) {
    console.error("❌ Error actualizando pedido:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
