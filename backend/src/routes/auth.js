const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { ok, fail } = require("../utils/response");

const router = express.Router();

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

    return ok(res, {
      usuario: { id: u.id, nombre: u.nombre, email: u.email },
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
    return ok(res, { usuario: rows[0] });
  } catch (e) {
    return fail(res, "Error", 500);
  }
});

module.exports = router;
