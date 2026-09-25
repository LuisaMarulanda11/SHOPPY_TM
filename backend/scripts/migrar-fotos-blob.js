/**
 * Sube a Vercel Blob las fotos que la BD referencia como uploads/<archivo>
 * y actualiza esas rutas por la URL pública. No modifica el esquema.
 * Uso: npm run migrar:fotos -- --dry-run   (solo muestra lo que haría)
 *      npm run migrar:fotos
 * Requiere BLOB_READ_WRITE_TOKEN y las variables DB_* en backend/.env.
 * Usa 1 sola conexión (límite ~5 del add-on).
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { put } = require("@vercel/blob");

const DRY_RUN = process.argv.includes("--dry-run");
const UPLOADS = path.join(__dirname, "../uploads");
const TABLAS = [
  { tabla: "publicaciones", columna: "foto" },
  { tabla: "fotos_publicacion", columna: "foto" },
  { tabla: "usuarios", columna: "foto" },
];

function contentType(nombre) {
  const ext = path.extname(nombre).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !DRY_RUN) {
    throw new Error("Falta BLOB_READ_WRITE_TOKEN en backend/.env");
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
  });

  const rutas = new Set();
  for (const { tabla, columna } of TABLAS) {
    const [rows] = await conn.query(
      `SELECT DISTINCT ${columna} AS ruta FROM ${tabla}
       WHERE ${columna} IS NOT NULL AND ${columna} <> '' AND ${columna} NOT LIKE 'http%'`
    );
    rows.forEach((r) => rutas.add(r.ruta));
  }

  console.log(`${rutas.size} ruta(s) locales encontradas en la BD${DRY_RUN ? " (dry-run)" : ""}`);
  const faltantes = [];
  let migradas = 0;

  for (const ruta of rutas) {
    const nombre = String(ruta).replace(/\\/g, "/").split("/").pop();
    const abs = path.join(UPLOADS, nombre);
    if (!nombre || !fs.existsSync(abs)) {
      faltantes.push(ruta);
      continue;
    }

    if (DRY_RUN) {
      console.log(`  subiría ${nombre}`);
      continue;
    }

    const blob = await put(`shoppy/${nombre}`, fs.readFileSync(abs), {
      access: "public",
      contentType: contentType(nombre),
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    for (const { tabla, columna } of TABLAS) {
      await conn.query(`UPDATE ${tabla} SET ${columna} = ? WHERE ${columna} = ?`, [blob.url, ruta]);
    }
    migradas += 1;
    console.log(`  ✓ ${nombre} -> ${blob.url}`);
  }

  await conn.end();
  console.log(`Migradas: ${migradas}`);
  if (faltantes.length) {
    console.log(`Sin archivo en backend/uploads (no se modificaron): ${faltantes.length}`);
    faltantes.forEach((r) => console.log(`  - ${r}`));
  }
}

main().catch((err) => {
  console.error("Migración de fotos falló:", err.message);
  process.exit(1);
});
