const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../db");
const { obtenerUsuario } = require("../middleware/auth");
const { ok, fail } = require("../utils/response");
const { enviarCorreoRecuperacion, correoConfigurado } = require("../utils/email");

const router = express.Router();
let passwordResetTableReady;

async function asegurarTablaRecuperacion() {
  if (!passwordResetTableReady) {
    passwordResetTableReady = pool.query(`
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
    `).catch((e) => {
      passwordResetTableReady = null;
      throw e;
    });
  }
  await passwordResetTableReady;
}

router.post("/forgot-password", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(res, "Ingresa un correo electrónico válido.");
    }
    if (!correoConfigurado()) {
      return fail(res, "La recuperación por correo todavía no está configurada.", 503);
    }

    await asegurarTablaRecuperacion();
    const [users] = await pool.query(
      "SELECT id, nombre, email FROM usuarios WHERE email = ? AND activo = 1 LIMIT 1",
      [email]
    );
    if (!users.length) {
      return ok(res, {
        mensaje: "Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña.",
      });
    }

    const usuario = users[0];
    const [recentRequests] = await pool.query(
      "SELECT id FROM password_reset_tokens WHERE usuario_id = ? AND creado_en > DATE_SUB(NOW(), INTERVAL 1 MINUTE) LIMIT 1",
      [usuario.id]
    );
    if (recentRequests.length) {
      return ok(res, {
        mensaje: "Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await pool.query("DELETE FROM password_reset_tokens WHERE usuario_id = ?", [usuario.id]);
    await pool.query(
      "INSERT INTO password_reset_tokens (usuario_id, token_hash, expira_en) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))",
      [usuario.id, tokenHash]
    );

    try {
      await enviarCorreoRecuperacion(usuario, token);
    } catch (e) {
      await pool.query("DELETE FROM password_reset_tokens WHERE token_hash = ?", [tokenHash]);
      console.error("No se pudo enviar el correo de recuperación:", e.message);
      return fail(res, "No fue posible enviar el correo. Inténtalo más tarde.", 503);
    }

    return ok(res, {
      mensaje: "Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña.",
    });
  } catch (e) {
    console.error(e);
    return fail(res, "No fue posible procesar la solicitud.", 500);
  }
});

router.post("/reset-password", async (req, res) => {
  const token = String(req.body.token || "");
  const password = String(req.body.password || "");
  const confirmar = String(req.body.confirmar_password || "");

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return fail(res, "El enlace no es válido o ya venció.", 400);
  }
  if (password.length < 8) {
    return fail(res, "La contraseña debe tener mínimo 8 caracteres.");
  }
  if (password !== confirmar) {
    return fail(res, "Las contraseñas no coinciden.");
  }

  let connection;
  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const hash = await bcrypt.hash(password, 10);
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [tokens] = await connection.query(
      "SELECT usuario_id FROM password_reset_tokens WHERE token_hash = ? AND expira_en > NOW() LIMIT 1 FOR UPDATE",
      [tokenHash]
    );
    if (!tokens.length) {
      await connection.rollback();
      return fail(res, "El enlace no es válido o ya venció.", 400);
    }

    const usuarioId = tokens[0].usuario_id;
    const [result] = await connection.query(
      "UPDATE usuarios SET password = ? WHERE id = ? AND activo = 1",
      [hash, usuarioId]
    );
    if (!result.affectedRows) {
      await connection.rollback();
      return fail(res, "El enlace no es válido o ya venció.", 400);
    }
    await connection.query(
      "DELETE FROM password_reset_tokens WHERE usuario_id = ?",
      [usuarioId]
    );
    await connection.commit();
    return ok(res, { mensaje: "Contraseña actualizada correctamente." });
  } catch (e) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("No se pudo revertir el cambio de contraseña:", rollbackError.message);
      }
    }
    console.error(e);
    return fail(res, "No fue posible actualizar la contraseña.", 500);
  } finally {
    if (connection) connection.release();
  }
});

router.post("/login", async (req, res) => {
  try {
    if (req.session.usuarioId) {
      return ok(res, { redirect: "inicio" });
    }

    const email = String(req.body.email || "").trim();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return fail(res, "Ingresa tu correo y contraseña.");
    }

    const [rows] = await pool.query(
      `SELECT id, nombre, email, password
       FROM usuarios WHERE email = ? AND activo = 1 LIMIT 1`,
      [email]
    );

    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return fail(res, "El correo o la contraseña son incorrectos.");
    }

    const u = rows[0];
    req.session.usuarioId = u.id;
    req.session.nombre = u.nombre;
    req.session.email = u.email;

    const { rol } = (await obtenerUsuario(u.id)) || { rol: "usuario" };
    return ok(res, {
      usuario: { id: u.id, nombre: u.nombre, email: u.email, rol },
    });
  } catch (e) {
    console.error(e);
    return fail(res, "Error al iniciar sesión", 500);
  }
});

router.post("/registro", async (req, res) => {
  try {
    const nombre = String(req.body.nombre || "").trim();
    const email = String(req.body.email || "").trim();
    const password = String(req.body.password || "");
    const confirmar = String(req.body.confirmar_password || "");

    if (!nombre || !email || !password || !confirmar) {
      return fail(res, "Todos los campos son obligatorios.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(res, "Ingresa un correo electrónico válido.");
    }
    if (password !== confirmar) {
      return fail(res, "Las contraseñas no coinciden.");
    }
    if (password.length < 8) {
      return fail(res, "La contraseña debe tener mínimo 8 caracteres.");
    }

    const [exists] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );
    if (exists.length) {
      return fail(res, "Ya existe una cuenta registrada con ese correo.");
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, password, fecha_registro, activo)
       VALUES (?, ?, ?, NOW(), 1)`,
      [nombre, email, hash]
    );

    return ok(res, {
      mensaje: "¡Cuenta creada correctamente! Ya puedes iniciar sesión.",
    });
  } catch (e) {
    console.error(e);
    return fail(res, "No fue posible crear la cuenta.", 500);
  }
});

router.post("/logout", (req, res) => {
  req.session = null;
  res.clearCookie("shoppy.sid");
  return ok(res, { mensaje: "Sesión cerrada" });
});

router.get("/me", async (req, res) => {
  if (!req.session?.usuarioId) {
    return fail(res, "No autenticado", 401);
  }
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, email, foto, ubicacion, fecha_registro
       FROM usuarios WHERE id = ? AND activo = 1 LIMIT 1`,
      [req.session.usuarioId]
    );
    if (!rows.length) {
      req.session = null;
      return fail(res, "Sesión inválida", 401);
    }
    const { rol } = (await obtenerUsuario(rows[0].id)) || { rol: "usuario" };
    return ok(res, { usuario: { ...rows[0], rol } });
  } catch (e) {
    return fail(res, "Error", 500);
  }
});

module.exports = router;
