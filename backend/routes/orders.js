// backend/routes/orders.js
import express from "express";
import { db } from "../db.js";
import { verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

const norm = (s) => String(s || "").trim().toLowerCase();

function safeParseCart(value) {
  try {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return JSON.parse(value);
  } catch {
    return [];
  }
}

/**
 * 📌 Obtener todos los pedidos (solo admin con token)
 * Devuelve: { id, nombre, email, telefono, direccion, total, status, cart, fecha }
 */
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const rows = await db.all(
      `SELECT id, nombre, email, telefono, direccion, total, status, cart, fecha
       FROM pedidos
       ORDER BY fecha DESC`
    );

    const formatted = (rows || []).map((o) => ({
      id: o.id,
      nombre: o.nombre,
      email: o.email,
      telefono: o.telefono,
      direccion: o.direccion,
      total: o.total,
      status: o.status || "pendiente",
      cart: safeParseCart(o.cart),
      fecha: o.fecha,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error listando pedidos:", err);
    res.status(500).json({ error: "Error al listar pedidos" });
  }
});

/**
 * 📌 Obtener un pedido por ID (solo admin con token)
 */
router.get("/:id", verifyAdmin, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const o = await db.get(
      `SELECT id, nombre, email, telefono, direccion, total, status, cart, fecha
       FROM pedidos WHERE id = ?`,
      [id]
    );
    if (!o) return res.status(404).json({ error: "Pedido no encontrado" });

    res.json({
      id: o.id,
      nombre: o.nombre,
      email: o.email,
      telefono: o.telefono,
      direccion: o.direccion,
      total: o.total,
      status: o.status || "pendiente",
      cart: safeParseCart(o.cart),
      fecha: o.fecha,
    });
  } catch (err) {
    console.error("❌ Error obteniendo pedido:", err);
    res.status(500).json({ error: "Error al obtener pedido" });
  }
});

/**
 * 📌 Actualizar estado de un pedido (solo admin con token)
 * - Descuenta stock SOLO si el cambio es: (prev !== "completado") → (next === "completado")
 */
router.put("/:id/status", verifyAdmin, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const { status } = req.body || {};
    if (Number.isNaN(id) || !status) {
      return res.status(400).json({ error: "Parámetros inválidos" });
    }

    // Obtener estado previo y carrito
    const row = await db.get(`SELECT status, cart FROM pedidos WHERE id = ?`, [id]);
    if (!row) return res.status(404).json({ error: "Pedido no encontrado" });

    const prev = norm(row.status || "pendiente");
    const next = norm(status);

    // Actualizar estado
    await db.run(`UPDATE pedidos SET status = ? WHERE id = ?`, [status, id]);

    // Solo descontar si se transiciona a COMPLETADO por primera vez
    if (prev !== "completado" && next === "completado") {
      const cart = safeParseCart(row.cart);

      await db.exec("BEGIN TRANSACTION");
      try {
        for (const item of cart) {
          const pid = Number(item?._id ?? item?.id);
          const qty = Number(item?.quantity ?? 0);
          if (!pid || qty <= 0) continue;

          const prod = await db.get(`SELECT stock FROM products WHERE id = ?`, [pid]);
          if (!prod) continue;

          const current = Number(prod.stock ?? 0);
          const newStock = Math.max(0, current - qty);

          await db.run(`UPDATE products SET stock = ? WHERE id = ?`, [newStock, pid]);
        }
        await db.exec("COMMIT");
      } catch (errTx) {
        await db.exec("ROLLBACK");
        console.error("❌ Error descontando stock (rollback):", errTx);
        return res.status(500).json({ error: "Error descontando stock" });
      }
    }

    res.json({
      success: true,
      message:
        next === "completado" && prev !== "completado"
          ? "Estado actualizado y stock descontado."
          : "Estado actualizado.",
    });
  } catch (err) {
    console.error("❌ Error actualizando pedido:", err);
    res.status(500).json({ error: "Error al actualizar pedido" });
  }
});

export default router;
