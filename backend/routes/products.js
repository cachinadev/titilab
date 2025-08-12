// backend/routes/products.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { db } from "../db.js";
import { verifyAdmin } from "../middleware/auth.js"; // ✅ protección con el mismo JWT_SECRET

dotenv.config();
const router = express.Router();

// ---------- Helpers ----------
function normalizeImagePath(image) {
  if (!image) return null;
  // normaliza separadores y quita ./ o /
  let p = String(image).trim().replace(/\\/g, "/").replace(/^\.?\//, "");
  // si no empieza con uploads/, asumimos que el valor era solo filename
  if (!p.startsWith("uploads/")) p = `uploads/${p}`;
  return `/${p}`;
}

// ---------- Multer (subidas) ----------
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname) || "";
    cb(null, `${ts}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  if (!file.mimetype?.startsWith("image/")) {
    return cb(new Error("Solo se permiten imágenes"), false);
  }
  cb(null, true);
};
const upload = multer({ storage, fileFilter });

// ---------- GET: listar productos ----------
router.get("/", async (req, res) => {
  try {
    const products = await db.all("SELECT * FROM products");
    const mapped = (Array.isArray(products) ? products : []).map((p) => ({
      _id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      stock: p.stock,
      image: normalizeImagePath(p.image),
    }));
    res.json(mapped);
  } catch (error) {
    console.error("❌ Error obteniendo productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// ---------- GET: producto por ID ----------
router.get("/:id", async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const p = await db.get("SELECT * FROM products WHERE id = ?", [id]);
    if (!p) return res.status(404).json({ error: "Producto no encontrado" });

    const product = {
      _id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      stock: p.stock,
      image: normalizeImagePath(p.image),
    };

    res.json(product);
  } catch (error) {
    console.error("❌ Error obteniendo producto por ID:", error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

// ---------- POST: crear producto (protegido) ----------
router.post("/", verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const price = Number(req.body.price ?? 0);
    const stock = Number(req.body.stock ?? 0);

    const image = req.file ? `uploads/${req.file.filename}` : null;

    await db.run(
      "INSERT INTO products (name, description, category, price, stock, image) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, category, price, stock, image]
    );

    res.json({ message: "✅ Producto creado correctamente" });
  } catch (error) {
    console.error("❌ Error creando producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// ---------- PUT: descontar stock al completar pedido (protegido) ----------
router.put("/:id/stock", verifyAdmin, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const quantity = Number(req.body.quantity ?? 0);

    if (Number.isNaN(id) || Number.isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "Parámetros inválidos" });
    }

    const product = await db.get("SELECT stock FROM products WHERE id = ?", [id]);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    const current = Number(product.stock ?? 0);
    const newStock = Math.max(0, current - quantity);

    await db.run("UPDATE products SET stock = ? WHERE id = ?", [newStock, id]);

    res.json({ message: "📉 Stock actualizado", stock: newStock });
  } catch (error) {
    console.error("❌ Error actualizando stock:", error);
    res.status(500).json({ error: "Error al actualizar stock" });
  }
});

// ---------- DELETE: eliminar producto + imagen (protegido) ----------
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const product = await db.get("SELECT * FROM products WHERE id = ?", [id]);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    const result = await db.run("DELETE FROM products WHERE id = ?", [id]);
    if (!result?.changes) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Eliminar archivo físico si existe
    if (product.image) {
      const rel = String(product.image).replace(/^\//, "");
      const imagePath = path.join(process.cwd(), rel);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.warn("⚠️ No se pudo eliminar la imagen:", err.message);
        } else {
          console.log("🗑️ Imagen eliminada:", imagePath);
        }
      });
    }

    res.json({ message: "🗑️ Producto e imagen eliminados correctamente" });
  } catch (error) {
    console.error("❌ Error eliminando producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

export default router;
