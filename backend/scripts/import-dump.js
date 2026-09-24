/**
 * Importa un dump SQL local hacia Clever Cloud (1 conexión).
 * Uso: node scripts/import-dump.js [ruta.sql]
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function main() {
  const dumpPath =
    process.argv[2] ||
    path.join(__dirname, "../sql/local_dump.sql");

  if (!fs.existsSync(dumpPath)) {
    console.error("No existe el dump:", dumpPath);
    console.error("Arranca MySQL en XAMPP y genera el dump, o pásame el archivo .sql");
    process.exit(1);
  }

  let sql = fs.readFileSync(dumpPath, "utf8");
  // Quitar CREATE DATABASE / USE de XAMPP para no romper el nombre Clever
  sql = sql
    .replace(/CREATE DATABASE[\s\S]*?;/gi, "")
    .replace(/USE\s+`?shoppy_tm`?\s*;/gi, "")
    .replace(/USE\s+`?[^`;]+`?\s*;/gi, "");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    charset: "utf8mb4",
  });

  console.log("Importando", dumpPath, "...");
  await conn.query("SET FOREIGN_KEY_CHECKS=0");
  await conn.query(sql);
  await conn.query("SET FOREIGN_KEY_CHECKS=1");

  const [users] = await conn.query("SELECT COUNT(*) AS n FROM usuarios");
  const [pubs] = await conn.query("SELECT COUNT(*) AS n FROM publicaciones");
  console.log("Importado. usuarios:", users[0].n, "publicaciones:", pubs[0].n);
  await conn.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
