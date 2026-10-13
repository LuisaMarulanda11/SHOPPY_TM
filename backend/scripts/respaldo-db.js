/**
 * Respaldo completo de la BD (estructura + datos) en backend/backups/shoppy_tm_<fecha>.sql
 * Uso: npm run db:respaldo
 * Restaurar: importar el archivo .sql en MySQL (p. ej. `mysql -u root shoppy_tm < archivo.sql`).
 * Los respaldos contienen datos personales y hashes de contraseñas: no se suben a Git.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
    dateStrings: true,
  });

  try {
    const [tablas] = await conn.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
    const nombres = tablas.map((t) => Object.values(t)[0]);

    const lineas = [
      `-- Respaldo SHOPPY T&M — ${new Date().toISOString()}`,
      "SET NAMES utf8mb4;",
      "SET FOREIGN_KEY_CHECKS = 0;",
      "",
    ];
    const resumen = [];

    for (const tabla of nombres) {
      const [[create]] = await conn.query(`SHOW CREATE TABLE \`${tabla}\``);
      // utf8mb4_0900_ai_ci solo existe en MySQL 8; unicode_ci permite restaurar también en MariaDB/XAMPP.
      const ddl = create["Create Table"].replace(/utf8mb4_0900_ai_ci/g, "utf8mb4_unicode_ci");
      lineas.push(`DROP TABLE IF EXISTS \`${tabla}\`;`, `${ddl};`, "");

      const [filas] = await conn.query(`SELECT * FROM \`${tabla}\``);
      for (const fila of filas) {
        const cols = Object.keys(fila).map((c) => `\`${c}\``).join(", ");
        const vals = Object.values(fila).map((v) => conn.escape(v)).join(", ");
        lineas.push(`INSERT INTO \`${tabla}\` (${cols}) VALUES (${vals});`);
      }
      lineas.push("");
      resumen.push({ tabla, filas: filas.length });
    }
    lineas.push("SET FOREIGN_KEY_CHECKS = 1;", "");

    const dir = path.join(__dirname, "../backups");
    fs.mkdirSync(dir, { recursive: true });
    const fecha = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
    const archivo = path.join(dir, `shoppy_tm_${fecha}.sql`);
    fs.writeFileSync(archivo, lineas.join("\n"), "utf8");

    console.table(resumen);
    console.log(`Respaldo guardado en ${archivo}`);
  } finally {
    await conn.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
