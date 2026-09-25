const pool = require("../db");
const { fail } = require("../utils/response");

function requireAuth(req, res, next) {
  if (!req.session?.usuarioId) {
    return fail(res, "No autenticado", 401);
  }
  next();
}

/** Lee el usuario y su rol desde la BD; nunca desde datos enviados por el cliente. */
async function obtenerUsuario(usuarioId) {
  try {
    const [rows] = await pool.query(
      "SELECT id, rol FROM usuarios WHERE id = ? AND activo = 1 LIMIT 1",
      [usuarioId]
    );
    if (!rows.length) return null;
    return { id: rows[0].id, rol: rows[0].rol === "admin" ? "admin" : "usuario" };
  } catch (e) {
    // Antes de ejecutar scripts/agregar-rol-admin.js la columna rol no existe.
    if (e.code !== "ER_BAD_FIELD_ERROR") throw e;
    const [rows] = await pool.query(
      "SELECT id FROM usuarios WHERE id = ? AND activo = 1 LIMIT 1",
      [usuarioId]
    );
    return rows.length ? { id: rows[0].id, rol: "usuario" } : null;
  }
}

async function cargarUsuario(req, res, next) {
  if (!req.session?.usuarioId) {
    return fail(res, "No autenticado", 401);
  }
  try {
    const usuario = await obtenerUsuario(req.session.usuarioId);
    if (!usuario) {
      req.session = null;
      return fail(res, "Sesión inválida", 401);
    }
    req.usuario = usuario;
    next();
  } catch (e) {
    console.error(e);
    return fail(res, "Error al validar la sesión", 500);
  }
}

function requireAdmin(req, res, next) {
  if (req.usuario?.rol !== "admin") {
    return fail(res, "No tienes permisos de administrador.", 403);
  }
  next();
}

module.exports = { requireAuth, cargarUsuario, requireAdmin, obtenerUsuario };
