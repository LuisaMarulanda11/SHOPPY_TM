/**
 * Publica los productos de ejemplo de cada integrante de src/config/equipo.js.
 * - Usa la cuenta indicada en usuario_id (el integrante debe estar registrado).
 * - Si su cuenta no tiene foto de perfil, le asigna la del equipo.
 * - No duplica: si ya existe una publicación con el mismo título para ese usuario, la omite.
 * Uso: npm run publicar:equipo
 */
require("dotenv").config();
const mysql = require("mysql2/promise");
const EQUIPO = require("../src/config/equipo");

const PRODUCTOS = {
  "Luisa": [
    {
      titulo: "Bolso bandolera de cuero café",
      descripcion:
        "Bolso tipo bandolera en cuero sintético color café, con correa ajustable y cierre de broche. Muy poco uso, ideal para el día a día.",
      precio: 65000,
      categoria_id: 3,
      condicion: "Como nuevo",
      foto: "/assets/productos/producto-luisa-bolso.jpg",
    },
    {
      titulo: "Tenis blancos talla 37",
      descripcion:
        "Tenis blancos de cuero sintético, talla 37. Usados pocas veces, limpios y sin daños. Combinan con todo.",
      precio: 70000,
      categoria_id: 3,
      condicion: "Como nuevo",
      foto: "/assets/productos/producto-luisa-tenis.jpg",
    },
    {
      titulo: "Lámpara LED de escritorio",
      descripcion:
        "Lámpara LED blanca con brazo ajustable y tres niveles de luz. Perfecta para estudiar. Funciona perfecto.",
      precio: 45000,
      categoria_id: 2,
      condicion: "Buen estado",
      foto: "/assets/productos/producto-luisa-lampara.jpg",
    },
  ],
  "Mateo": [
    {
      titulo: "Bicicleta de montaña rin 29",
      descripcion:
        "Bicicleta todoterreno negra con rojo, frenos de disco, suspensión delantera y llantas en buen estado. Lista para rodar.",
      precio: 850000,
      categoria_id: 4,
      condicion: "Buen estado",
      foto: "/assets/productos/producto-mateo-bicicleta.jpg",
    },
    {
      titulo: "Patineta completa",
      descripcion:
        "Patineta de madera con lija nueva, ejes y ruedas en buen estado. Ideal para empezar o para el parche.",
      precio: 110000,
      categoria_id: 4,
      condicion: "Usado",
      foto: "/assets/productos/producto-mateo-patineta.jpg",
    },
    {
      titulo: "Colección de 8 cómics y mangas",
      descripcion:
        "Lote de 8 tomos entre cómics y mangas, bien cuidados, sin páginas rotas. Se venden juntos.",
      precio: 90000,
      categoria_id: 7,
      condicion: "Buen estado",
      foto: "/assets/productos/producto-mateo-comics.jpg",
    },
  ],
  "Juan David": [
    {
      titulo: "Audífonos inalámbricos Bluetooth",
      descripcion:
        "Audífonos over-ear inalámbricos, buena batería y sonido. Incluyen cable de carga. Poco uso.",
      precio: 120000,
      categoria_id: 1,
      condicion: "Como nuevo",
      foto: "/assets/productos/producto-juan-david-audifonos.jpg",
    },
    {
      titulo: "Celular con estuche y cargador",
      descripcion:
        "Celular en buen estado, batería al 85 %, con estuche transparente y cable de carga. Liberado para cualquier operador.",
      precio: 650000,
      categoria_id: 1,
      condicion: "Buen estado",
      foto: "/assets/productos/producto-juan-david-celular.jpg",
    },
    {
      titulo: "Teclado mecánico gamer + mouse",
      descripcion:
        "Combo de teclado mecánico con luces RGB y mouse gamer. Todas las teclas funcionan. Ideal para jugar o estudiar.",
      precio: 180000,
      categoria_id: 1,
      condicion: "Como nuevo",
      foto: "/assets/productos/producto-juan-david-teclado.jpg",
    },
  ],
  "Camilo": [
    {
      titulo: "Consola de videojuegos con 2 controles",
      descripcion:
        "Consola en buen estado con dos controles inalámbricos y cables. Funciona perfectamente, se entrega lista para jugar.",
      precio: 1200000,
      categoria_id: 6,
      condicion: "Buen estado",
      foto: "/assets/productos/producto-camilo-consola.jpg",
    },
    {
      titulo: "Casco de moto integral negro mate",
      descripcion:
        "Casco integral talla M, negro mate, visor transparente sin rayones. Certificado, nunca ha tenido golpes.",
      precio: 220000,
      categoria_id: 5,
      condicion: "Como nuevo",
      foto: "/assets/productos/producto-camilo-casco.jpg",
    },
    {
      titulo: "Juego de mesa familiar completo",
      descripcion:
        "Juego de mesa con tablero, fichas, dados y todas las cartas. Perfecto para jugar en familia o con amigos.",
      precio: 75000,
      categoria_id: 6,
      condicion: "Como nuevo",
      foto: "/assets/productos/producto-camilo-juego-mesa.jpg",
    },
  ],
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
      const productos = PRODUCTOS[m.nombre] || [];
      if (!productos.length || !m.usuario_id) {
        console.log(`- ${m.nombre}: sin usuario_id o sin productos configurados, se omite.`);
        continue;
      }

      const [rows] = await conn.query("SELECT id, foto FROM usuarios WHERE id = ? LIMIT 1", [
        m.usuario_id,
      ]);
      if (!rows.length) {
        console.log(`- ${m.nombre}: no existe el usuario ${m.usuario_id}, se omite.`);
        continue;
      }
      const usuarioId = rows[0].id;
      if (!rows[0].foto) {
        await conn.query("UPDATE usuarios SET foto = ? WHERE id = ?", [m.foto, usuarioId]);
      }

      for (const producto of productos) {
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
    }
  } finally {
    await conn.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
