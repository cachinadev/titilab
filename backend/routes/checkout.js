// backend/routes/checkout.js
import express from "express";
import { db } from "../db.js";
import nodemailer from "nodemailer";

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
    fecha TEXT,
    status TEXT DEFAULT 'pendiente'
  )
`);

router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      email,
      direccion,
      telefono,
      tipoComprobante,
      dni,
      ruc,
      empresa,
      departamento, // Ahora viene como nombre
      provincia,    // Ahora viene como nombre
      distrito,     // Ahora viene como nombre
      courier,
      metodoPago,
      total,
      cart,
      status
    } = req.body;

    const fecha = new Date().toISOString();
    const pedidoStatus = status || "pendiente";

    // Guardar pedido en BD
    const result = await db.run(
      `INSERT INTO pedidos 
      (nombre, email, direccion, telefono, tipoComprobante, dni, ruc, empresa, 
      departamento, provincia, distrito, courier, metodoPago, total, cart, fecha, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        email,
        direccion,
        telefono,
        tipoComprobante,
        dni,
        ruc,
        empresa,
        departamento,
        provincia,
        distrito,
        courier,
        metodoPago,
        total,
        JSON.stringify(cart),
        fecha,
        pedidoStatus
      ]
    );

    const orderId = result.lastID;
    const trackingCode = `T-${orderId}-${Date.now().toString().slice(-4)}`;

    // 📩 Configuración de nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 📄 Generar tabla HTML de productos
    const itemsHTML = JSON.parse(cart)
      .map(
        (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${item.name}</td>
          <td style="padding:8px;border:1px solid #ddd;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;">S/ ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    // 📄 HTML del correo
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1976d2; color: white; padding: 16px; text-align: center;">
        <h1 style="margin: 0;">Titilab Store</h1>
        <p style="margin: 0; font-size: 16px;">Confirmación de tu pedido</p>
      </div>
      <div style="padding: 20px;">
        <p>Hola <b>${nombre}</b>,</p>
        <p>Gracias por tu compra en <b>Titilab Store</b>. Hemos recibido tu pedido y lo estamos procesando.</p>
        
        <h2 style="color: #1976d2;">Detalles del pedido</h2>
        <p><b>Pedido N°:</b> ${orderId}</p>
        <p><b>Código de seguimiento:</b> ${trackingCode}</p>
        <p><b>Total:</b> S/ ${total}</p>
        <p><b>Método de pago:</b> ${metodoPago}</p>

        <h3 style="color: #1976d2;">Productos</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8f8f8;">
              <th style="padding:8px;border:1px solid #ddd;">Producto</th>
              <th style="padding:8px;border:1px solid #ddd;">Cantidad</th>
              <th style="padding:8px;border:1px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <h3 style="color: #1976d2;">Datos de envío</h3>
        <p>${direccion}, ${distrito}, ${provincia}, ${departamento}</p>
        <p><b>Teléfono:</b> ${telefono}</p>

        <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          📌 <b>Por favor envía el comprobante de pago al número 985979119</b>
        </div>

        <p style="margin-top: 20px;">Si tienes alguna consulta, responde a este correo o contáctanos por WhatsApp.</p>
      </div>
      <div style="background-color: #1976d2; color: white; text-align: center; padding: 10px;">
        <p style="margin: 0; font-size: 14px;">&copy; ${new Date().getFullYear()} Titilab Store - Todos los derechos reservados.</p>
      </div>
    </div>
    `;

    await transporter.sendMail({
      from: `"Titilab Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🛒 Confirmación de tu pedido - Titilab Store",
      html: htmlContent
    });

    console.log(`📧 Email enviado a ${email}`);

    res.status(200).json({
      success: true,
      message: "Pedido procesado, guardado y correo enviado",
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
