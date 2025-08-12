import express from "express";
import { db } from "../db.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Crea tabla si no existe (buena práctica dejar registro)
await db.exec(`
  CREATE TABLE IF NOT EXISTS reclamos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombres TEXT,
    apellidos TEXT,
    tipoDoc TEXT,
    nroDoc TEXT,
    email TEXT,
    telefono TEXT,
    direccion TEXT,
    tipo TEXT, -- reclamo | queja
    productoServicio TEXT,
    pedidoId TEXT,
    detalle TEXT,
    pedidoConsumidor TEXT,
    fecha TEXT
  )
`);

router.post("/", async (req, res) => {
  try {
    const {
      nombres, apellidos, tipoDoc, nroDoc, email, telefono, direccion,
      tipo, productoServicio, pedidoId, detalle, pedidoConsumidor
    } = req.body || {};

    const fecha = new Date().toISOString();

    // Guarda en BD
    const result = await db.run(
      `INSERT INTO reclamos
      (nombres, apellidos, tipoDoc, nroDoc, email, telefono, direccion, tipo, productoServicio, pedidoId, detalle, pedidoConsumidor, fecha)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombres, apellidos, tipoDoc, nroDoc, email, telefono, direccion, tipo, productoServicio, pedidoId, detalle, pedidoConsumidor, fecha]
    );

    // Envía correo
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE || "false") === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const toAddress = process.env.CLAIMS_TO || process.env.EMAIL_USER;

    const html = `
      <h2>Nuevo ${tipo === "queja" ? "Queja" : "Reclamo"}</h2>
      <p><b>Fecha:</b> ${fecha}</p>
      <h3>Datos del consumidor</h3>
      <ul>
        <li><b>Nombres:</b> ${nombres} ${apellidos}</li>
        <li><b>Doc.:</b> ${tipoDoc} ${nroDoc}</li>
        <li><b>Email:</b> ${email}</li>
        <li><b>Teléfono:</b> ${telefono}</li>
        <li><b>Dirección:</b> ${direccion || "-"}</li>
      </ul>
      <h3>Detalle</h3>
      <ul>
        <li><b>Tipo:</b> ${tipo}</li>
        <li><b>Producto/Servicio:</b> ${productoServicio || "-"}</li>
        <li><b>N° Pedido:</b> ${pedidoId || "-"}</li>
      </ul>
      <p><b>Descripción:</b><br/>${(detalle || "").replace(/\n/g, "<br/>")}</p>
      <p><b>Pedido del consumidor:</b><br/>${(pedidoConsumidor || "").replace(/\n/g, "<br/>")}</p>
    `;

    await transporter.sendMail({
      from: `"Titilab Store" <${process.env.EMAIL_USER}>`,
      to: toAddress,
      subject: `Nuevo ${tipo === "queja" ? "Queja" : "Reclamo"} #${result.lastID}`,
      html,
    });

    return res.json({ success: true, id: result.lastID });
  } catch (err) {
    console.error("❌ Error creando reclamo:", err);
    return res.status(500).json({ success: false, error: "Error creando reclamo" });
  }
});

export default router;
