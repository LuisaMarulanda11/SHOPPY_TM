/**
 * Restablece la contraseña de una o varias cuentas (la app no tiene "olvidé mi contraseña").
 * Uso: npm run password:restablecer -- <nueva_contraseña> <id|correo> [<id|correo> ...]
 * Ej.: npm run password:restablecer -- MiClave2026 1 2 correo@ejemplo.com
 */
require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function main() {
  const [nueva, ...cuentas] = process.argv.slice(2);
  if (!nueva || !cuentas.length) {
    throw new Error("Uso: npm run password:restablecer -- <nueva_contraseña> <id|correo> [...]");
  }
  if (nueva.length < 8) throw new Error("La contraseña debe tener mínimo 8 caracteres.");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
  });

  try {
    const hash = await bcrypt.hash(nueva, 10);
    for (const cuenta of cuentas) {
      const porId = /^\d+$/.test(cuenta);
      const [rows] = await conn.query(
        `SELECT id, nombre, email FROM usuarios WHERE ${porId ? "id = ?" : "LOWER(email) = ?"} LIMIT 1`,
        [porId ? Number(cuenta) : cuenta.toLowerCase()]
      );
      if (!rows.length) {
        console.log(`- ${cuenta}: no existe, se omite.`);
        continue;
      }
      await conn.query("UPDATE usuarios SET password = ? WHERE id = ?", [hash, rows[0].id]);
      console.log(`✓ ${rows[0].nombre} (${rows[0].email}): contraseña restablecida.`);
    }
  } finally {
    await conn.end();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
