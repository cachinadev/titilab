import express from 'express';
import cors from 'cors';
import productsRoutes from './routes/products.js';
import adminRoutes from './routes/admin.js';
import checkoutRoutes from './routes/checkout.js';
import ordersRoutes from './routes/orders.js'; // 📌 Nueva ruta de pedidos

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// 📌 Middleware para loguear todas las solicitudes a checkout
app.use('/api/checkout', (req, res, next) => {
  console.log("🛒 Nuevo checkout recibido:");
  console.log("Headers:", req.headers);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  next();
});

// 📌 Rutas API
app.use('/api/products', productsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', ordersRoutes); // 📌 Nueva API de pedidos

const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Backend corriendo en puerto ${PORT}`));
