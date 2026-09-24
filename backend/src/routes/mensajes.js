const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const { ok, fail, publicUrl, mapProduct } = require("../utils/response");

const router = express.Router();

router.get("/nuevos", requireAuth, async (req, res) => {
  try {
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM mensajes WHERE destinatario_id = ? AND leido = 0",
      [req.session.usuarioId]
    );
    return ok(res, { total });
  } catch (e) {
    return fail(res, "Error", 500);
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const usuarioId = req.session.usuarioId;
    const productoId = Number(req.body.producto_id || 0);
    const destinatarioId = Number(req.body.destinatario_id || 0);
    const mensaje = String(req.body.mensaje || "").trim();

    if (productoId <= 0 || destinatarioId <= 0 || !mensaje || destinatarioId === usuarioId) {
      return fail(res, "Datos de mensaje inválidos.");
    }

    const [prod] = await pool.query(
      "SELECT id, usuario_id FROM publicaciones WHERE id = ? LIMIT 1",
      [productoId]
    );
    if (!prod.length) return fail(res, "Producto no encontrado.", 404);

    const vendedorId = prod[0].usuario_id;
    let valido = destinatarioId === vendedorId;

    if (!valido) {
      const [conv] = await pool.query(
        `SELECT id FROM mensajes
         WHERE publicacion_id = ?
         AND ((remitente_id = ? AND destinatario_id = ?)
           OR (remitente_id = ? AND destinatario_id = ?))
         LIMIT 1`,
        [productoId, usuarioId, destinatarioId, destinatarioId, usuarioId]
      );
      valido = conv.length > 0;
    }

    if (!valido) return fail(res, "No puedes enviar mensajes a este usuario.");

    await pool.query(
      `INSERT INTO mensajes (remitente_id, destinatario_id, publicacion_id, mensaje, fecha, leido)
       VALUES (?, ?, ?, ?, NOW(), 0)`,
      [usuarioId, destinatarioId, productoId, mensaje]
    );

    return ok(res, {
      mensaje: "Enviado",
      producto_id: productoId,
      destinatario_id: destinatarioId,
    });
  } catch (e) {
    console.error(e);
    return fail(res, "Error al enviar mensaje", 500);
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const usuarioId = req.session.usuarioId;
    let productoId = Number(req.query.producto || 0);
    let otroUsuarioId = Number(req.query.usuario || 0);

    const [userRows] = await pool.query(
      "SELECT nombre FROM usuarios WHERE id = ? LIMIT 1",
      [usuarioId]
    );
    const nombre_usuario = userRows[0]?.nombre || "Usuario";

    let producto = null;
    let mensajes = [];
    let otro_usuario = null;

    if (productoId > 0) {
      const [prows] = await pool.query(
        `SELECT p.id, p.titulo, p.foto, p.usuario_id AS vendedor_id, u.nombre AS vendedor
         FROM publicaciones p
         INNER JOIN usuarios u ON p.usuario_id = u.id
         WHERE p.id = ? LIMIT 1`,
        [productoId]
      );
      if (!prows.length) return fail(res, "Producto no encontrado.", 404);
      producto = mapProduct(prows[0]);

      if (otroUsuarioId === usuarioId) otroUsuarioId = 0;

      if (otroUsuarioId === 0) {
        if (Number(producto.vendedor_id) !== usuarioId) {
          otroUsuarioId = Number(producto.vendedor_id);
        } else {
          const [ultimo] = await pool.query(
            `SELECT CASE WHEN remitente_id = ? THEN destinatario_id ELSE remitente_id END AS otro_usuario_id
             FROM mensajes
             WHERE publicacion_id = ? AND (remitente_id = ? OR destinatario_id = ?)
             ORDER BY fecha DESC LIMIT 1`,
            [usuarioId, productoId, usuarioId, usuarioId]
          );
          if (ultimo.length) otroUsuarioId = Number(ultimo[0].otro_usuario_id);
        }
      }

      if (otroUsuarioId > 0) {
        const [otros] = await pool.query(
          "SELECT id, nombre FROM usuarios WHERE id = ? LIMIT 1",
          [otroUsuarioId]
        );
        otro_usuario = otros[0] || null;

        await pool.query(
          `UPDATE mensajes SET leido = 1
           WHERE publicacion_id = ? AND remitente_id = ? AND destinatario_id = ? AND leido = 0`,
          [productoId, otroUsuarioId, usuarioId]
        );

        const [chat] = await pool.query(
          `SELECT m.id, m.mensaje, m.fecha, m.remitente_id, u.nombre AS remitente
           FROM mensajes m
           INNER JOIN usuarios u ON m.remitente_id = u.id
           WHERE m.publicacion_id = ?
           AND ((m.remitente_id = ? AND m.destinatario_id = ?)
             OR (m.remitente_id = ? AND m.destinatario_id = ?))
           ORDER BY m.fecha ASC`,
          [productoId, usuarioId, otroUsuarioId, otroUsuarioId, usuarioId]
        );
        mensajes = chat;
      }
    }

    const [convs] = await pool.query(
      `SELECT m.publicacion_id, MAX(m.fecha) AS ultima_fecha, p.titulo, p.foto,
              CASE WHEN m.remitente_id = ? THEN m.destinatario_id ELSE m.remitente_id END AS otro_usuario_id
       FROM mensajes m
       INNER JOIN publicaciones p ON m.publicacion_id = p.id
       WHERE m.remitente_id = ? OR m.destinatario_id = ?
       GROUP BY m.publicacion_id, otro_usuario_id
       ORDER BY ultima_fecha DESC`,
      [usuarioId, usuarioId, usuarioId]
    );

    const conversaciones = [];
    for (const c of convs) {
      const [otro] = await pool.query(
        "SELECT nombre, foto FROM usuarios WHERE id = ? LIMIT 1",
        [c.otro_usuario_id]
      );
      conversaciones.push({
        ...c,
        foto: publicUrl(c.foto),
        otro_nombre: otro[0]?.nombre || "Usuario",
        otro_foto: publicUrl(otro[0]?.foto || ""),
      });
    }

    return ok(res, {
      usuario_id: usuarioId,
      nombre_usuario,
      producto,
      otro_usuario,
      mensajes,
      conversaciones,
    });
  } catch (e) {
    console.error(e);
    return fail(res, "Error al cargar mensajes", 500);
  }
});

module.exports = router;
