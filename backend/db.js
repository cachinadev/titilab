import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// 📌 Conexión a la base de datos SQLite
export const db = await open({
  filename: './database.sqlite', // Nombre del archivo de base de datos
  driver: sqlite3.Database
});

// 📌 Crear tabla de productos si no existe
await db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    image TEXT
  )
`);

// 📌 Crear tabla de pedidos si no existe
await db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    direccion TEXT NOT NULL,
    telefono TEXT NOT NULL,
    dni TEXT,
    ruc TEXT,
    empresa TEXT,
    tipoComprobante TEXT,
    departamento TEXT,
    provincia TEXT,
    distrito TEXT,
    courier TEXT,
    metodoPago TEXT,
    cart TEXT, -- Guardar JSON del carrito
    total REAL,
    fecha TEXT DEFAULT (datetime('now','localtime')),
        fecha TEXT DEFAULT (datetime('now','localtime'))
  )
`);

console.log("📦 Base de datos conectada y lista");
