/**
 * Agrega la columna usuarios.rol (si no existe) y asigna 'admin' a una cuenta EXISTENTE.
 * No crea cuentas ni lee o modifica contraseñas.
 * Uso: npm run rol:admin                      (camilotobon34@gmail.com)
 *      npm run rol:admin -- otro@correo.com
 * Usa 1 sola conexión (límite ~5 del add-on).
 */
require("dotenv").config();
const mysql = require("mysql2/promise");

const ADMIN_EMAIL = (process.argv[2] || "camilotobon34@gmail.com").trim().toLowerCase();

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
  });

  try {
    const [cols] = await conn.query(
      `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'rol'`
    );

    if (cols[0].n === 0) {
      await conn.query(
        "ALTER TABLE usuarios ADD COLUMN rol ENUM('usuario','admin') NOT NULL DEFAULT 'usuario'"
      );
      console.log("Columna usuarios.rol creada (todos los usuarios quedan como 'usuario').");
    } else {
      console.log("La columna usuarios.rol ya existe.");
    }

    const [rows] = await conn.query(
      "SELECT id, nombre, rol FROM usuarios WHERE LOWER(email) = ? LIMIT 1",
      [ADMIN_EMAIL]
    );

    if (!rows.length) {
      console.log(
        `No existe una cuenta con ${ADMIN_EMAIL}. Regístrala desde la app y vuelve a ejecutar este script.`
      );
      return;
    }

    if (rows[0].rol === "admin") {
      console.log(`${rows[0].nombre} (${ADMIN_EMAIL}) ya es admin.`);
    } else {
      await conn.query("UPDATE usuarios SET rol = 'admin' WHERE id = ?", [rows[0].id]);
      console.log(`${rows[0].nombre} (${ADMIN_EMAIL}) ahora es admin.`);
    }

    const [resumen] = await conn.query("SELECT rol, COUNT(*) AS total FROM usuarios GROUP BY rol");
    console.log("Usuarios por rol:", resumen);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("No se pudo asignar el rol:", err.message);
  process.exit(1);
});
