require("dotenv").config();
const pool = require("../src/db");

async function main() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        expira_en DATETIME NOT NULL,
        creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_password_reset_token_hash (token_hash),
        KEY idx_password_reset_user_created (usuario_id, creado_en),
        KEY idx_password_reset_expiration (expira_en),
        CONSTRAINT fk_password_reset_user
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("Tabla password_reset_tokens lista.");
  } catch (e) {
    console.error("No se pudo preparar la recuperación de contraseñas:", e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
