require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "shoppy_tm",
  waitForConnections: true,
  // Clever Cloud MySQL: máx. 5 conexiones por usuario entre TODAS las instancias de Vercel
  // (más scripts locales). En serverless cada instancia usa una sola conexión.
  connectionLimit: process.env.VERCEL ? 1 : 2,
  queueLimit: 50,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  charset: "utf8mb4",
});

// Las instancias congeladas de Vercel no cierran sus sockets; así el servidor
// libera la conexión tras 60 s sin uso en lugar de las 8 h por defecto.
pool.on("connection", (conn) => {
  conn.query("SET SESSION wait_timeout = 60, interactive_timeout = 60");
});

const ERRORES_CONEXION = new Set(["PROTOCOL_CONNECTION_LOST", "ECONNRESET", "EPIPE"]);
const query = pool.query.bind(pool);
pool.query = async (...args) => {
  try {
    return await query(...args);
  } catch (e) {
    const cerrada = ERRORES_CONEXION.has(e.code) || /closed state/i.test(e.message || "");
    if (!cerrada) throw e;
    return query(...args);
  }
};

module.exports = pool;
