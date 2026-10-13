/**
 * Pruebas de humo contra un despliegue (mantenimiento mensual).
 * Crea, edita y elimina una publicación de prueba; no deja datos.
 * Uso:
 *   PRUEBA_EMAIL=... PRUEBA_PASSWORD=... npm run pruebas:humo
 *   PRUEBA_URL=http://localhost:5173 ...   (por defecto: producción)
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const BASE = (process.env.PRUEBA_URL || "https://shoppy-tm-1qwb.vercel.app").replace(/\/$/, "");
const EMAIL = process.env.PRUEBA_EMAIL;
const PASSWORD = process.env.PRUEBA_PASSWORD;

let cookies = "";
const resultados = [];

async function api(method, ruta, { body, form, cookie } = {}) {
  const headers = { Cookie: cookie ?? cookies };
  let payload;
  if (form) payload = form;
  else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const t0 = Date.now();
  const res = await fetch(`${BASE}/api${ruta}`, { method, headers, body: payload });
  const ms = Date.now() - t0;
  const setCookie = res.headers.getSetCookie?.() || [];
  if (setCookie.length && cookie === undefined) {
    cookies = setCookie.map((c) => c.split(";")[0]).join("; ");
  }
  let json = null;
  try {
    json = await res.json();
  } catch {
    // respuesta sin JSON
  }
  return { status: res.status, json, ms };
}

/** El frontend responde index.html (200) a rutas inexistentes: se exige content-type de imagen. */
async function esImagen(foto) {
  if (!foto) return false;
  const url = /^https?:/.test(foto) ? foto : `${BASE}${foto}`;
  const res = await fetch(url, { method: "HEAD" });
  return res.status === 200 && (res.headers.get("content-type") || "").startsWith("image/");
}

function check(nombre, cond, detalle = "") {
  resultados.push({ prueba: nombre, ok: cond ? "OK" : "FALLA", detalle });
}

/** Cookie de sesión firmada con el secreto por defecto del código: debe ser rechazada. */
function cookieFalsificada() {
  const valor = Buffer.from(JSON.stringify({ usuarioId: 1 })).toString("base64");
  const firma = crypto
    .createHmac("sha1", "shoppy_secret")
    .update(`shoppy.sid=${valor}`)
    .digest("base64")
    .replace(/\/|\+|=/g, (x) => ({ "/": "_", "+": "-", "=": "" })[x]);
  return `shoppy.sid=${valor}; shoppy.sid.sig=${firma}`;
}

async function main() {
  if (!EMAIL || !PASSWORD) throw new Error("Define PRUEBA_EMAIL y PRUEBA_PASSWORD.");

  let r = await api("GET", "/health", { cookie: "" });
  check("API disponible (/health)", r.status === 200, `${r.ms} ms`);

  r = await api("GET", "/catalogo", { cookie: "" });
  check("Catálogo exige sesión", r.status === 401, `HTTP ${r.status}`);

  r = await api("GET", "/perfil", { cookie: cookieFalsificada() });
  check("Rechaza cookie firmada con secreto por defecto", r.status === 401, `HTTP ${r.status}`);

  r = await api("POST", "/auth/login", { body: { email: EMAIL, password: "incorrecta" }, cookie: "" });
  check("Login con contraseña incorrecta falla", r.json?.ok === false, r.json?.error || "");

  r = await api("POST", "/auth/login", { body: { email: EMAIL, password: PASSWORD } });
  check("Login correcto", r.json?.ok === true, `${r.ms} ms`);
  const yo = r.json?.data?.usuario;

  r = await api("GET", "/auth/me");
  check("Sesión activa (/auth/me)", r.json?.data?.usuario?.email === EMAIL);

  r = await api("GET", "/catalogo");
  const productos = r.json?.data?.productos || [];
  check("Catálogo carga productos", productos.length > 0, `${productos.length} productos, ${r.ms} ms`);
  const sinFoto = productos.filter((p) => !p.foto).length;
  check("Todos los productos tienen foto", sinFoto === 0, `${sinFoto} sin foto`);

  let rotas = 0;
  for (const p of productos) {
    if (!(await esImagen(p.foto))) rotas += 1;
  }
  check("Imágenes del catálogo accesibles", rotas === 0, `${rotas} rotas de ${productos.length}`);

  r = await api("GET", "/catalogo?busqueda=bicicleta");
  check("Búsqueda por texto", (r.json?.data?.productos || []).length > 0, `${(r.json?.data?.productos || []).length} resultados`);

  r = await api("GET", "/catalogo?categoria=4&orden=precio_menor");
  const deportes = r.json?.data?.productos || [];
  check("Filtro por categoría y orden", deportes.length > 0 && deportes.every((p) => p.categoria === "Deportes"), `${deportes.length} resultados`);

  const algun = productos[0];
  r = await api("GET", `/producto?id=${algun.id}`);
  check("Detalle de producto", r.json?.ok === true, algun.titulo);

  r = await api("GET", "/perfil/equipo");
  const equipo = r.json?.data?.integrantes || [];
  check("Página de equipo", equipo.length === 4 && equipo.every((m) => m.publicaciones.length > 0), equipo.map((m) => `${m.nombre}:${m.publicaciones.length}`).join(" "));

  r = await api("POST", "/favoritos/toggle", { body: { id: algun.id } });
  const fav1 = r.json?.data?.favorito;
  r = await api("POST", "/favoritos/toggle", { body: { id: algun.id } });
  check("Favoritos agregar/quitar", fav1 !== undefined && r.json?.data?.favorito === !fav1);

  const form = new FormData();
  form.append("titulo", "PRUEBA MANTENIMIENTO - no comprar");
  form.append("descripcion", "Publicación temporal creada por las pruebas de mantenimiento.");
  form.append("precio", "1000");
  form.append("categoria_id", "8");
  form.append("condicion", "Usado");
  form.append("ubicacion", "Medellín");
  const imgPrueba = path.join(__dirname, "../../frontend/public/assets/icons/icon-192.png");
  form.append("fotos", new Blob([fs.readFileSync(imgPrueba)], { type: "image/png" }), "prueba.png");
  r = await api("POST", "/publicaciones", { form });
  const nuevoId = r.json?.data?.id;
  check("Crear publicación con foto", !!nuevoId, r.json?.error || `id ${nuevoId}`);

  if (nuevoId) {
    r = await api("GET", `/producto?id=${nuevoId}`);
    const foto = r.json?.data?.producto?.foto || r.json?.data?.foto || "";
    check("Foto subida es persistente (Blob)", /^https?:/.test(foto), foto || "sin foto");
    check("Foto subida accesible", await esImagen(foto), foto);

    const upd = new FormData();
    for (const [k, v] of Object.entries({
      id: nuevoId,
      titulo: "PRUEBA MANTENIMIENTO (editada)",
      descripcion: "Editada por pruebas.",
      precio: "2000",
      categoria_id: "8",
      condicion: "Usado",
      ubicacion: "Medellín",
    })) upd.append(k, v);
    r = await api("POST", "/publicaciones/update", { form: upd });
    check("Editar publicación", r.json?.ok === true, r.json?.error || "");

    r = await api("POST", "/publicaciones/delete", { body: { id: nuevoId } });
    check("Eliminar publicación", r.json?.ok === true, r.json?.error || "");
  }

  r = await api("POST", "/perfil/password", { body: { actual: "incorrecta", nueva: PASSWORD, confirmar: PASSWORD } });
  check("Cambio de contraseña rechaza clave actual incorrecta", r.json?.ok === false, r.json?.error || "");
  r = await api("POST", "/perfil/password", { body: { actual: PASSWORD, nueva: PASSWORD, confirmar: PASSWORD } });
  check("Cambio de contraseña", r.json?.ok === true, r.json?.error || "");

  r = await api("GET", "/admin/publicaciones");
  if (yo?.rol === "admin") check("Panel admin accesible (admin)", r.status === 200);
  else check("Panel admin bloqueado (no admin)", r.status === 403, `HTTP ${r.status}`);

  r = await api("POST", "/auth/logout");
  r = await api("GET", "/catalogo");
  check("Cierre de sesión", r.status === 401, `HTTP ${r.status}`);

  console.table(resultados);
  const fallas = resultados.filter((x) => x.ok === "FALLA").length;
  console.log(`${resultados.length - fallas}/${resultados.length} pruebas OK — ${BASE}`);
  process.exit(fallas ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
