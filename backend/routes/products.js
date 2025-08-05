import express from 'express';
import multer from 'multer';
import { db } from '../db.js';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// 📂 Configuración de almacenamiento para imágenes
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // nombre único con extensión original
  }
});
const upload = multer({ storage });

// 📌 GET - Obtener todos los productos con _id e imagen completa
router.get('/', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products');
    const baseUrl = process.env.BACKEND_URL || `http://localhost:4000`;

    const mappedProducts = products.map((p) => ({
      _id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      stock: p.stock,
      image: p.image ? `${baseUrl}${p.image}` : null
    }));

    res.json(mappedProducts);
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// 📌 GET - Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const baseUrl = process.env.BACKEND_URL || `http://localhost:4000`;
    product._id = product.id;
    product.image = product.image ? `${baseUrl}${product.image}` : null;

    res.json(product);
  } catch (error) {
    console.error('❌ Error obteniendo producto por ID:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// 📌 POST - Crear producto (Admin)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, price, stock } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    await db.run(
      'INSERT INTO products (name, description, category, price, stock, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, category, price, stock, image]
    );

    res.json({ message: '✅ Producto creado correctamente' });
  } catch (error) {
    console.error('❌ Error creando producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// 📌 DELETE - Eliminar producto + imagen (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Obtener el producto antes de eliminarlo
    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Eliminar de la base de datos
    const result = await db.run('DELETE FROM products WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Eliminar la imagen asociada (si existe)
    if (product.image) {
      const imagePath = path.join(process.cwd(), product.image.replace(/^\//, ''));
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.warn('⚠️ No se pudo eliminar la imagen:', err.message);
        } else {
          console.log('🗑️ Imagen eliminada:', imagePath);
        }
      });
    }

    res.json({ message: '🗑️ Producto e imagen eliminados correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;
