/**
 * Publica un producto de ejemplo por cada integrante de src/config/equipo.js.
 * - Si el integrante no tiene cuenta, la crea con EQUIPO_PASSWORD_INICIAL (variable en backend/.env).
 * - Si su cuenta no tiene foto de perfil, le asigna la del equipo.
 * - No duplica: si ya existe una publicación con el mismo título para ese usuario, la omite.
 * Uso: npm run publicar:equipo
 */
require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const EQUIPO = require("../src/config/equipo");

const PASSWORD_INICIAL = process.env.EQUIPO_PASSWORD_INICIAL;

const PRODUCTOS = {
  "Luisa": {
    titulo: "Bolso bandolera de cuero café",
    descripcion:
      "Bolso tipo bandolera en cuero sintético color café, con correa ajustable y cierre de broche. Muy poco uso, ideal para el día a día.",
    precio: 65000,
    categoria_id: 3,
    condicion: "Como nuevo",
    foto: "/assets/productos/producto-luisa-bolso.jpg",
  },
  "Mateo": {
    titulo: "Bicicleta de montaña rin 29",
    descripcion:
      "Bicicleta todoterreno negra con rojo, frenos de disco, suspensión delantera y llantas en buen estado. Lista para rodar.",
    precio: 850000,
    categoria_id: 4,
    condicion: "Buen estado",
    foto: "/assets/productos/producto-mateo-bicicleta.jpg",
  },
  "Juan David": {
    titulo: "Audífonos inalámbricos Bluetooth",
    descripcion:
      "Audífonos over-ear inalámbricos, buena batería y sonido. Incluyen cable de carga. Poco uso.",
    precio: 120000,
    categoria_id: 1,
    condicion: "Como nuevo",
    foto: "/assets/productos/producto-juan-david-audifonos.jpg",
  },
  "Camilo": {
    titulo: "Consola de videojuegos con 2 controles",
    descripcion:
      "Consola en buen estado con dos controles inalámbricos y cables. Funciona perfectamente, se entrega lista para jugar.",
    precio: 1200000,
    categoria_id: 6,
    condicion: "Buen estado",
    foto: "/assets/productos/producto-camilo-consola.jpg",
  },
};

const UBICACION = "Medellín";

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
  });

  try {
    for (const m of EQUIPO) {
      const producto = PRODUCTOS[m.nombre];
      const email = String(m.email || "").trim().toLowerCase();
      if (!producto || !email) {
        console.log(`- ${m.nombre}: sin correo o sin producto configurado, se omite.`);
        continue;
      }

      let [rows] = await conn.query(
        "SELECT id, foto FROM usuarios WHERE LOWER(email) = ? LIMIT 1",
        [email]
      );
      let usuarioId;
      if (rows.length) {
        usuarioId = rows[0].id;
        if (!rows[0].foto) {
          await conn.query("UPDATE usuarios SET foto = ? WHERE id = ?", [m.foto, usuarioId]);
        }
      } else {
        if (!PASSWORD_INICIAL) {
          console.log(`- ${m.nombre}: no tiene cuenta y falta EQUIPO_PASSWORD_INICIAL en .env, se omite.`);
          continue;
        }
        const hash = await bcrypt.hash(PASSWORD_INICIAL, 10);
        const [res] = await conn.query(
          `INSERT INTO usuarios (nombre, email, password, foto, ubicacion, fecha_registro, activo)
           VALUES (?, ?, ?, ?, ?, NOW(), 1)`,
          [m.nombre, email, hash, m.foto, UBICACION]
        );
        usuarioId = res.insertId;
        console.log(`+ Cuenta creada para ${m.nombre} (${email})`);
      }

      const [existe] = await conn.query(
        "SELECT id FROM publicaciones WHERE usuario_id = ? AND titulo = ? LIMIT 1",
        [usuarioId, producto.titulo]
      );
      if (existe.length) {
        console.log(`= ${m.nombre}: "${producto.titulo}" ya estaba publicado (id ${existe[0].id}).`);
        continue;
      }

      const [pub] = await conn.query(
        `INSERT INTO publicaciones
         (usuario_id, categoria_id, titulo, descripcion, precio, foto, condicion, ubicacion, estado, fecha_publicacion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activo', NOW())`,
        [
          usuarioId,
          producto.categoria_id,
          producto.titulo,
          producto.descripcion,
          producto.precio,
          producto.foto,
          producto.condicion,
          UBICACION,
        ]
      );
      await conn.query(
        "INSERT INTO fotos_publicacion (publicacion_id, foto, fecha) VALUES (?, ?, NOW())",
        [pub.insertId, producto.foto]
      );
      console.log(`✓ ${m.nombre}: publicado "${producto.titulo}" (id ${pub.insertId}).`);
    }
  } finally {
    await conn.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
