const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const { ok, fail, mapProduct } = require("../utils/response");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const usuarioId = req.session.usuarioId;
    const busqueda = String(req.query.busqueda || "").trim();
    const categoria = Number(req.query.categoria || 0);
    const condicion = String(req.query.condicion || "").trim();
    const precioMin = String(req.query.precio_min || "").trim();
    const precioMax = String(req.query.precio_max || "").trim();
    const ubicacion = String(req.query.ubicacion || "").trim();
    let orden = String(req.query.orden || "recientes");

    let sql = `
      SELECT p.id, p.titulo, p.descripcion, p.precio, p.foto, p.condicion,
             p.ubicacion, p.fecha_publicacion, c.nombre AS categoria, u.nombre AS vendedor
      FROM publicaciones p
      INNER JOIN categorias c ON p.categoria_id = c.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.estado = 'activo'`;
    const params = [];

    if (busqueda) {
      sql += ` AND (p.titulo LIKE ? OR p.descripcion LIKE ? OR c.nombre LIKE ? OR p.ubicacion LIKE ?)`;
      const t = `%${busqueda}%`;
      params.push(t, t, t, t);
    }
    if (categoria > 0) {
      sql += ` AND p.categoria_id = ?`;
      params.push(categoria);
    }
    if (condicion) {
      sql += ` AND p.condicion = ?`;
      params.push(condicion);
    }
    if (precioMin !== "" && !Number.isNaN(Number(precioMin))) {
      sql += ` AND p.precio >= ?`;
      params.push(Number(precioMin));
    }
    if (precioMax !== "" && !Number.isNaN(Number(precioMax))) {
      sql += ` AND p.precio <= ?`;
      params.push(Number(precioMax));
    }
    if (ubicacion) {
      sql += ` AND p.ubicacion LIKE ?`;
      params.push(`%${ubicacion}%`);
    }

    switch (orden) {
      case "precio_menor":
        sql += " ORDER BY p.precio ASC";
        break;
      case "precio_mayor":
        sql += " ORDER BY p.precio DESC";
        break;
      case "nombre":
        sql += " ORDER BY p.titulo ASC";
        break;
      default:
        orden = "recientes";
        sql += " ORDER BY p.fecha_publicacion DESC";
    }

    const [productos] = await pool.query(sql, params);
    const [categorias] = await pool.query(
      "SELECT id, nombre FROM categorias ORDER BY nombre ASC"
    );
    const [[{ total: publicaciones }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM publicaciones WHERE estado = 'activo'"
    );
    const [[{ total: usuarios }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM usuarios WHERE activo = 1"
    );
    const [[{ total: mensajes_nuevos }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM mensajes WHERE destinatario_id = ? AND leido = 0",
      [usuarioId]
    );

    const [userRows] = await pool.query(
      "SELECT id, nombre, email FROM usuarios WHERE id = ? LIMIT 1",
      [usuarioId]
    );

    return ok(res, {
      usuario: userRows[0],
      productos: productos.map(mapProduct),
      categorias,
      filtros: {
        busqueda,
        categoria,
        condicion,
        precio_min: precioMin,
        precio_max: precioMax,
        ubicacion,
        orden,
      },
      stats: {
        publicaciones,
        usuarios,
        categorias: categorias.length,
        mensajes_nuevos,
      },
    });
  } catch (e) {
    console.error(e);
    return fail(res, "Error al cargar catálogo", 500);
  }
});

module.exports = router;
