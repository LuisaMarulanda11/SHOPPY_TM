/**
 * Migra/crea el schema en Clever Cloud MySQL.
 * Usa 1 sola conexión (límite ~5 del add-on).
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function main() {
  const config = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    charset: "utf8mb4",
  };

  console.log("Conectando a", config.host, config.database, "...");
  const conn = await mysql.createConnection(config);
  console.log("Conexión OK");

  const schemaPath = path.join(__dirname, "../sql/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  await conn.query(sql);
  console.log("Schema aplicado");

  const [tables] = await conn.query("SHOW TABLES");
  console.log("Tablas:", tables);

  const [cats] = await conn.query("SELECT COUNT(*) AS n FROM categorias");
  const [users] = await conn.query("SELECT COUNT(*) AS n FROM usuarios");
  const [pubs] = await conn.query("SELECT COUNT(*) AS n FROM publicaciones");
  console.log("conteos:", {
    categorias: cats[0].n,
    usuarios: users[0].n,
    publicaciones: pubs[0].n,
  });

  await conn.end();
  console.log("Listo");
}

main().catch((err) => {
  console.error("Migración falló:", err.message);
  process.exit(1);
});
