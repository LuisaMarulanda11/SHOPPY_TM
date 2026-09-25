const path = require("path");
const fs = require("fs");
const { put, del } = require("@vercel/blob");
const { uploadsDir } = require("../middleware/upload");

const BLOB_HOST = /\.blob\.vercel-storage\.com$/i;

function usarBlob() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

if (process.env.VERCEL && !usarBlob()) {
  console.warn(
    "BLOB_READ_WRITE_TOKEN no está configurado: las fotos se guardarán en /tmp y no serán persistentes."
  );
}

function nombreArchivo(file) {
  const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
  const base = file.fieldname === "foto" ? "usuario" : "producto";
  return `${base}_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`;
}

/** Guarda la foto y devuelve el valor que se almacena en la BD (URL pública o uploads/<archivo>). */
async function guardarFoto(file) {
  const nombre = nombreArchivo(file);

  if (usarBlob()) {
    const blob = await put(`shoppy/${nombre}`, file.buffer, {
      access: "public",
      contentType: file.mimetype,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  await fs.promises.writeFile(path.join(uploadsDir, nombre), file.buffer);
  return `uploads/${nombre}`;
}

async function guardarFotos(files = []) {
  const rutas = [];
  for (const file of files) {
    rutas.push(await guardarFoto(file));
  }
  return rutas;
}

async function eliminarFoto(ruta) {
  if (!ruta) return;
  const s = String(ruta);

  try {
    if (/^https?:\/\//i.test(s)) {
      if (usarBlob() && BLOB_HOST.test(new URL(s).hostname)) {
        await del(s);
      }
      return;
    }

    const nombre = s.split(/[/\\]/).pop();
    const abs = path.join(uploadsDir, nombre);
    if (fs.existsSync(abs)) await fs.promises.unlink(abs);
  } catch (e) {
    console.error("No se pudo eliminar la foto:", s, e.message);
  }
}

module.exports = { guardarFoto, guardarFotos, eliminarFoto, usarBlob };
