require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "shoppy_tm",
  waitForConnections: true,
  // Clever Cloud MySQL: max ~5 conexiones — dejar margen
  connectionLimit: 3,
  queueLimit: 20,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  charset: "utf8mb4",
});

module.exports = pool;
