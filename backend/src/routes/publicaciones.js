const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { guardarFotos, eliminarFoto } = require("../utils/storage");
const { ok, fail, publicUrl, mapProduct } = require("../utils/response");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const usuarioId = req.session.usuarioId;
    const id = Number(req.query.id || 0);
    const [categorias] = await pool.query(
      "SELECT id, nombre FROM categorias ORDER BY nombre ASC"
    );

    if (id > 0) {
      const [rows] = await pool.query(
        `SELECT id, titulo, descripcion, precio, foto, condicion, ubicacion,
                categoria_id, estado, fecha_publicacion
         FROM publicaciones WHERE id = ? AND usuario_id = ? LIMIT 1`,
        [id, usuarioId]
      );
      if (!rows.length) return fail(res, "Publicación no encontrada.", 404);

      let [fotos] = await pool.query(
        "SELECT id, foto FROM fotos_publicacion WHERE publicacion_id = ? ORDER BY id ASC",
        [id]
      );
      fotos = fotos.map((f) => ({ ...f, foto: publicUrl(f.foto) }));
      if (!fotos.length && rows[0].foto) {
        fotos = [{ id: 0, foto: publicUrl(rows[0].foto) }];
      }

      return ok(res, {
        publicacion: mapProduct(rows[0]),
        fotos,
        categorias,
      });
    }

    const [items] = await pool.query(
      `SELECT p.id, p.titulo, p.descripcion, p.precio, p.foto, p.condicion,
              p.ubicacion, p.estado, p.fecha_publicacion, c.nombre AS categoria
       FROM publicaciones p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.usuario_id = ?
       ORDER BY p.fecha_publicacion DESC`,
      [usuarioId]
    );

    return ok(res, {
      publicaciones: items.map(mapProduct),
      categorias,
    });
  } catch (e) {
    console.error(e);
    return fail(res, "Error al listar publicaciones", 500);
  }
});

router.post("/", requireAuth, upload.array("fotos", 10), async (req, res) => {
  try {
    const usuarioId = req.session.usuarioId;
    const titulo = String(req.body.titulo || "").trim();
    const descripcion = String(req.body.descripcion || "").trim();
    const precio = req.body.precio;
    const categoria_id = Number(req.body.categoria_id || 0);
    const condicion = String(req.body.condicion || "").trim();
    const ubicacion = String(req.body.ubicacion || "").trim();

    if (!titulo || !descripcion || !precio || !categoria_id || !condicion || !ubicacion) {
      return fail(res, "Por favor completa todos los campos.");
    }
    if (Number.isNaN(Number(precio)) || Number(precio) < 0) {
      return fail(res, "Ingresa un precio válido.");
    }

    const rutas = await guardarFotos(req.files || []);
    const fotoPrincipal = rutas[0] || "";

    const [result] = await pool.query(
      `INSERT INTO publicaciones
       (usuario_id, categoria_id, titulo, descripcion, precio, foto, condicion, ubicacion, estado, fecha_publicacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activo', NOW())`,
      [usuarioId, categoria_id, titulo, descripcion, Number(precio), fotoPrincipal, condicion, ubicacion]
    );

    const publicacionId = result.insertId;
    for (const ruta of rutas) {
      await pool.query(
        "INSERT INTO fotos_publicacion (publicacion_id, foto, fecha) VALUES (?, ?, NOW())",
        [publicacionId, ruta]
      );
    }

    return ok(res, {
      mensaje: "¡Producto publicado correctamente!",
      id: publicacionId,
    });
  } catch (e) {
    console.error(e);
    return fail(res, "No fue posible publicar el producto.", 500);
  }
});

router.post("/update", requireAuth, upload.array("fotos", 10), async (req, res) => {
  try {
    const usuarioId = req.session.usuarioId;
    const id = Number(req.body.id || req.query.id || 0);
    if (id <= 0) return fail(res, "ID inválido.");

    const [rows] = await pool.query(
      "SELECT id, foto FROM publicaciones WHERE id = ? AND usuario_id = ? LIMIT 1",
      [id, usuarioId]
    );
    if (!rows.length) return fail(res, "Publicación no encontrada.", 404);

    const titulo = String(req.body.titulo || "").trim();
    const descripcion = String(req.body.descripcion || "").trim();
    const precio = req.body.precio;
    const condicion = String(req.body.condicion || "").trim();
    const ubicacion = String(req.body.ubicacion || "").trim();
    const categoria_id = Number(req.body.categoria_id || 0);

    if (!titulo || !descripcion || !precio || !condicion || !ubicacion || !categoria_id) {
      return fail(res, "Completa todos los campos.");
    }

    const nuevas = await guardarFotos(req.files || []);
    let fotoPrincipal = rows[0].foto;
    if (!fotoPrincipal && nuevas.length) fotoPrincipal = nuevas[0];

    await pool.query(
      `UPDATE publicaciones
       SET titulo=?, descripcion=?, precio=?, foto=?, condicion=?, ubicacion=?, categoria_id=?
       WHERE id=? AND usuario_id=?`,
      [titulo, descripcion, Number(precio), fotoPrincipal, condicion, ubicacion, categoria_id, id, usuarioId]
    );

    for (const ruta of nuevas) {
      await pool.query(
        "INSERT INTO fotos_publicacion (publicacion_id, foto, fecha) VALUES (?, ?, NOW())",
        [id, ruta]
      );
    }

    return ok(res, { mensaje: "Publicación actualizada correctamente.", id });
  } catch (e) {
    console.error(e);
    return fail(res, "No fue posible actualizar la publicación.", 500);
  }
});

router.post("/delete", requireAuth, async (req, res) => {
  try {
    const usuarioId = req.session.usuarioId;
    const id = Number(req.body.id || req.query.id || 0);
    if (id <= 0) return fail(res, "ID inválido.");

    const [rows] = await pool.query(
      "SELECT id, foto FROM publicaciones WHERE id = ? AND usuario_id = ? LIMIT 1",
      [id, usuarioId]
    );
    if (!rows.length) return fail(res, "Publicación no encontrada.", 404);

    const [fotos] = await pool.query(
      "SELECT foto FROM fotos_publicacion WHERE publicacion_id = ?",
      [id]
    );

    await pool.query("DELETE FROM favoritos WHERE publicacion_id = ?", [id]);
    await pool.query("DELETE FROM mensajes WHERE publicacion_id = ?", [id]);
    await pool.query("DELETE FROM fotos_publicacion WHERE publicacion_id = ?", [id]);
    await pool.query("DELETE FROM publicaciones WHERE id = ? AND usuario_id = ?", [id, usuarioId]);

    const rutasFotos = new Set([...fotos.map((f) => f.foto), rows[0].foto].filter(Boolean));
    for (const ruta of rutasFotos) await eliminarFoto(ruta);

    return ok(res, { mensaje: "Publicación eliminada." });
  } catch (e) {
    console.error(e);
    return fail(res, "Error al eliminar", 500);
  }
});

router.post("/vendido", requireAuth, async (req, res) => {
  try {
    const usuarioId = req.session.usuarioId;
    const id = Number(req.body.id || req.query.id || 0);
    if (id <= 0) return fail(res, "ID inválido.");

    const [r] = await pool.query(
      "UPDATE publicaciones SET estado = 'vendido' WHERE id = ? AND usuario_id = ?",
      [id, usuarioId]
    );
    if (!r.affectedRows) return fail(res, "Publicación no encontrada.", 404);
    return ok(res, { mensaje: "Marcada como vendida.", id });
  } catch (e) {
    return fail(res, "Error", 500);
  }
});

router.post("/eliminar-foto", requireAuth, async (req, res) => {
  try {
    const usuarioId = req.session.usuarioId;
    const fotoId = Number(req.body.id || req.query.id || 0);
    if (fotoId <= 0) return fail(res, "ID de foto inválido.");

    const [rows] = await pool.query(
      `SELECT fp.id, fp.foto, fp.publicacion_id
       FROM fotos_publicacion fp
       INNER JOIN publicaciones p ON fp.publicacion_id = p.id
       WHERE fp.id = ? AND p.usuario_id = ? LIMIT 1`,
      [fotoId, usuarioId]
    );
    if (!rows.length) return fail(res, "Foto no encontrada.", 404);

    const { publicacion_id, foto } = rows[0];
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM fotos_publicacion WHERE publicacion_id = ?",
      [publicacion_id]
    );
    if (total <= 1) {
      return fail(res, "No puedes eliminar la última foto.", 400, {
        publicacion_id,
      });
    }

    await pool.query(
      "DELETE FROM fotos_publicacion WHERE id = ? AND publicacion_id = ?",
      [fotoId, publicacion_id]
    );
    await eliminarFoto(foto);

    const [next] = await pool.query(
      "SELECT foto FROM fotos_publicacion WHERE publicacion_id = ? ORDER BY id ASC LIMIT 1",
      [publicacion_id]
    );
    if (next.length) {
      await pool.query(
        "UPDATE publicaciones SET foto = ? WHERE id = ? AND usuario_id = ?",
        [next[0].foto, publicacion_id, usuarioId]
      );
    }

    return ok(res, { mensaje: "Foto eliminada.", publicacion_id });
  } catch (e) {
    console.error(e);
    return fail(res, "Error al eliminar foto", 500);
  }
});

module.exports = router;
