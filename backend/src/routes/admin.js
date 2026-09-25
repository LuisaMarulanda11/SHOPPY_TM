const express = require("express");
const pool = require("../db");
const { requireAuth, cargarUsuario, requireAdmin } = require("../middleware/auth");
const { ok, fail, mapProduct } = require("../utils/response");

const router = express.Router();

router.use(requireAuth, cargarUsuario, requireAdmin);

router.get("/publicaciones", async (req, res) => {
  try {
    const busqueda = String(req.query.busqueda || "").trim();
    const estado = String(req.query.estado || "").trim();

    let sql = `
      SELECT p.id, p.titulo, p.precio, p.foto, p.estado, p.fecha_publicacion,
             c.nombre AS categoria, u.id AS vendedor_id, u.nombre AS vendedor, u.email AS vendedor_email
      FROM publicaciones p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE 1 = 1`;
    const params = [];

    if (busqueda) {
      sql += " AND (p.titulo LIKE ? OR u.nombre LIKE ? OR u.email LIKE ?)";
      const t = `%${busqueda}%`;
      params.push(t, t, t);
    }
    if (estado === "activo" || estado === "vendido") {
      sql += " AND p.estado = ?";
      params.push(estado);
    }
    sql += " ORDER BY p.fecha_publicacion DESC LIMIT 300";

    const [rows] = await pool.query(sql, params);
    return ok(res, {
      publicaciones: rows.map((r) => ({ ...mapProduct(r), es_propia: r.vendedor_id === req.usuario.id })),
    });
  } catch (e) {
    console.error(e);
    return fail(res, "Error al cargar publicaciones", 500);
  }
});

module.exports = router;
