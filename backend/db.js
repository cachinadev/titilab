import sqlite3 from "sqlite3";
import { open } from "sqlite";

// 📦 Conexión a SQLite
export const db = await open({
  filename: "./database.sqlite",
  driver: sqlite3.Database,
});

// PRAGMA útiles
await db.exec("PRAGMA foreign_keys = ON;");
await db.exec("PRAGMA journal_mode = WAL;");

// 🧱 Tabla de productos
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

// 🔁 Migración ligera: si existe 'orders' y no 'pedidos', renombrar
const hasPedidos = await db.get(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='pedidos'"
);
const hasOrders = await db.get(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='orders'"
);

if (!hasPedidos && hasOrders) {
  await db.exec(`ALTER TABLE orders RENAME TO pedidos;`);
}

// 🧱 Tabla de pedidos (alineada con rutas/checkout)
await db.exec(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    direccion TEXT NOT NULL,
    telefono TEXT NOT NULL,
    tipoComprobante TEXT,
    dni TEXT,
    ruc TEXT,
    empresa TEXT,
    departamento TEXT,
    provincia TEXT,
    distrito TEXT,
    courier TEXT,
    metodoPago TEXT,
    cart TEXT,        -- JSON del carrito
    total REAL,
    fecha TEXT,       -- ISO string o datetime
    status TEXT DEFAULT 'pendiente'
  )
`);

// 🔧 Asegura columnas por si venías de un esquema viejo (no falla si ya existen)
async function ensureColumn(table, columnDef) {
  try {
    await db.exec(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
  } catch {
    /* columna ya existe */
  }
}
await ensureColumn("pedidos", "status TEXT DEFAULT 'pendiente'");
await ensureColumn("pedidos", "tipoComprobante TEXT");
await ensureColumn("pedidos", "departamento TEXT");
await ensureColumn("pedidos", "provincia TEXT");
await ensureColumn("pedidos", "distrito TEXT");
await ensureColumn("pedidos", "courier TEXT");
await ensureColumn("pedidos", "metodoPago TEXT");
await ensureColumn("pedidos", "total REAL");
await ensureColumn("pedidos", "fecha TEXT");

console.log("📦 Base de datos conectada y lista");
