const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { ok, fail, publicUrl, mapProduct } = require("../utils/response");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const usuarioId = req.session.usuarioId;
    const [rows] = await pool.query(
      `SELECT id, nombre, email, foto, ubicacion, fecha_registro
       FROM usuarios WHERE id = ? LIMIT 1`,
      [usuarioId]
    );
    if (!rows.length) return fail(res, "Usuario no encontrado.", 401);

    const usuario = {
      ...rows[0],
      foto: publicUrl(rows[0].foto),
    };

    const [[{ total: total_publicaciones }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM publicaciones WHERE usuario_id = ?",
      [usuarioId]
    );
    const [[{ total: total_favoritos }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM favoritos WHERE usuario_id = ?",
      [usuarioId]
    );

    return ok(res, { usuario, total_publicaciones, total_favoritos });
  } catch (e) {
    return fail(res, "Error al cargar perfil", 500);
  }
});

router.post("/", requireAuth, upload.single("foto"), async (req, res) => {
  try {
    const usuarioId = req.session.usuarioId;
    const [rows] = await pool.query(
      "SELECT nombre, email, foto, ubicacion FROM usuarios WHERE id = ? LIMIT 1",
      [usuarioId]
    );
    if (!rows.length) return fail(res, "Usuario no encontrado.", 401);

    const nombre = String(req.body.nombre || "").trim();
    const ubicacion = String(req.body.ubicacion || "").trim();
    if (!nombre) return fail(res, "El nombre es obligatorio.");

    let foto = rows[0].foto;
    if (req.file) {
      foto = `uploads/${req.file.filename}`;
    }

    await pool.query(
      "UPDATE usuarios SET nombre = ?, foto = ?, ubicacion = ? WHERE id = ?",
      [nombre, foto, ubicacion, usuarioId]
    );
    req.session.nombre = nombre;

    return ok(res, {
      mensaje: "Perfil actualizado correctamente.",
      usuario: {
        nombre,
        foto: publicUrl(foto),
        ubicacion,
        email: rows[0].email,
      },
    });
  } catch (e) {
    console.error(e);
    return fail(res, "No fue posible actualizar el perfil.", 500);
  }
});

router.get("/usuario/:id", requireAuth, async (req, res) => {
  try {
    const usuarioId = Number(req.params.id || 0);
    if (usuarioId <= 0) return fail(res, "Usuario no válido.", 404);

    const [rows] = await pool.query(
      `SELECT id, nombre, email, foto, ubicacion, fecha_registro
       FROM usuarios WHERE id = ? LIMIT 1`,
      [usuarioId]
    );
    if (!rows.length) return fail(res, "Usuario no encontrado.", 404);

    const usuario = { ...rows[0], foto: publicUrl(rows[0].foto) };

    const [[{ total: total_publicaciones }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM publicaciones WHERE usuario_id = ? AND estado = 'activo'",
      [usuarioId]
    );

    const [publicaciones] = await pool.query(
      `SELECT p.id, p.titulo, p.descripcion, p.precio, p.foto, p.condicion,
              p.ubicacion, p.fecha_publicacion, c.nombre AS categoria
       FROM publicaciones p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.usuario_id = ? AND p.estado = 'activo'
       ORDER BY p.fecha_publicacion DESC`,
      [usuarioId]
    );

    let fecha_registro = "";
    if (usuario.fecha_registro) {
      fecha_registro = new Date(usuario.fecha_registro).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    return ok(res, {
      usuario,
      fecha_registro,
      total_publicaciones,
      publicaciones: publicaciones.map(mapProduct),
    });
  } catch (e) {
    return fail(res, "Error al cargar perfil de usuario", 500);
  }
});

module.exports = router;
