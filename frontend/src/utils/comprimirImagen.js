const MAX_LADO = 1600;
const MAX_BYTES = 400 * 1024;
const CALIDADES = [0.82, 0.7, 0.58, 0.46];

/** Vercel rechaza peticiones de más de 4.5 MB. */
export const LIMITE_ENVIO = 4.3 * 1024 * 1024;

async function cargarImagen(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Continúa con <img>.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasABlob(canvas, calidad) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", calidad));
}

export async function comprimirImagen(file) {
  if (!file || !file.size || !file.type.startsWith("image/")) return file;

  try {
    const img = await cargarImagen(file);
    const ancho = img.width;
    const alto = img.height;
    const escala = Math.min(1, MAX_LADO / Math.max(ancho, alto));

    if (escala === 1 && file.size <= MAX_BYTES) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(ancho * escala);
    canvas.height = Math.round(alto * escala);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (typeof img.close === "function") img.close();

    let blob = null;
    for (const calidad of CALIDADES) {
      blob = await canvasABlob(canvas, calidad);
      if (blob && blob.size <= MAX_BYTES) break;
    }
    if (!blob || blob.size >= file.size) return file;

    const nombre = `${file.name.replace(/\.[^.]+$/, "") || "foto"}.jpg`;
    return new File([blob], nombre, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}

export async function comprimirImagenes(files) {
  const lista = Array.from(files || []).filter((f) => f && f.size > 0);
  const resultado = [];
  for (const file of lista) {
    resultado.push(await comprimirImagen(file));
  }
  return resultado;
}

export function tamanoTotal(files) {
  return files.reduce((total, f) => total + (f?.size || 0), 0);
}
