const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const { ok, fail, publicUrl, mapProduct } = require("../utils/response");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const id = Number(req.query.id || 0);
    const usuarioId = req.session.usuarioId;
    if (id <= 0) return fail(res, "Producto no válido.", 404);

    const [rows] = await pool.query(
      `SELECT p.id, p.titulo, p.descripcion, p.precio, p.foto, p.condicion,
              p.ubicacion, p.estado, p.fecha_publicacion,
              c.id AS categoria_id, c.nombre AS categoria,
              u.id AS vendedor_id, u.nombre AS vendedor, u.email AS vendedor_email
       FROM publicaciones p
       INNER JOIN categorias c ON p.categoria_id = c.id
       INNER JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.id = ? LIMIT 1`,
      [id]
    );
    if (!rows.length) return fail(res, "Producto no encontrado.", 404);

    const producto = mapProduct(rows[0]);

    let [fotos] = await pool.query(
      "SELECT id, foto FROM fotos_publicacion WHERE publicacion_id = ? ORDER BY id ASC",
      [id]
    );
    fotos = fotos.map((f) => ({ ...f, foto: publicUrl(f.foto) }));
    if (!fotos.length && producto.foto) {
      fotos = [{ id: 0, foto: producto.foto }];
    }
    if (!fotos.length) fotos = [{ id: 0, foto: "" }];

    const [fav] = await pool.query(
      "SELECT id FROM favoritos WHERE usuario_id = ? AND publicacion_id = ? LIMIT 1",
      [usuarioId, id]
    );

    const fecha = producto.fecha_publicacion
      ? new Date(producto.fecha_publicacion).toLocaleDateString("es-CO")
      : "";

    const [relacionados] = await pool.query(
      `SELECT p.id, p.titulo, p.precio, p.foto, p.ubicacion, p.condicion, c.nombre AS categoria
       FROM publicaciones p
       INNER JOIN categorias c ON p.categoria_id = c.id
       WHERE p.categoria_id = ? AND p.id <> ? AND p.estado = 'activo'
       ORDER BY p.fecha_publicacion DESC LIMIT 6`,
      [producto.categoria_id, id]
    );

    return ok(res, {
      producto,
      fotos,
      favorito: fav.length > 0,
      fecha_publicacion: fecha,
      relacionados: relacionados.map(mapProduct),
      usuario_id: usuarioId,
    });
  } catch (e) {
    console.error(e);
    return fail(res, "Error al cargar producto", 500);
  }
});

module.exports = router;
