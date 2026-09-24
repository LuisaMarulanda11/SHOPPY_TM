const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const { ok, fail, mapProduct } = require("../utils/response");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT p.id, p.titulo, p.precio, p.foto, p.condicion, p.ubicacion, c.nombre AS categoria
       FROM favoritos f
       INNER JOIN publicaciones p ON f.publicacion_id = p.id
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE f.usuario_id = ? AND p.estado = 'activo'
       ORDER BY f.fecha DESC`,
      [req.session.usuarioId]
    );
    return ok(res, { favoritos: items.map(mapProduct) });
  } catch (e) {
    return fail(res, "Error al cargar favoritos", 500);
  }
});

router.post("/toggle", requireAuth, async (req, res) => {
  try {
    const usuarioId = req.session.usuarioId;
    const publicacionId = Number(req.body.id || req.query.id || 0);
    if (publicacionId <= 0) return fail(res, "ID de publicación inválido.");

    const [exists] = await pool.query(
      "SELECT id FROM favoritos WHERE usuario_id = ? AND publicacion_id = ? LIMIT 1",
      [usuarioId, publicacionId]
    );

    if (exists.length) {
      await pool.query("DELETE FROM favoritos WHERE id = ?", [exists[0].id]);
      return ok(res, { favorito: false, publicacion_id: publicacionId });
    }

    await pool.query(
      "INSERT INTO favoritos (usuario_id, publicacion_id, fecha) VALUES (?, ?, NOW())",
      [usuarioId, publicacionId]
    );
    return ok(res, { favorito: true, publicacion_id: publicacionId });
  } catch (e) {
    return fail(res, "Error al actualizar favorito", 500);
  }
});

module.exports = router;
