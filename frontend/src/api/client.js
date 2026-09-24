const API = "/api";

async function request(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = { ok: false, error: "Respuesta inválida del servidor" };
  }

  if (res.status === 401) {
    const err = new Error(payload?.error || "No autenticado");
    err.status = 401;
    throw err;
  }

  if (!payload?.ok) {
    const err = new Error(payload?.error || "Error en la solicitud");
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload.data;
}

export const apiGet = (path) => request(path, { method: "GET" });
export const apiPost = (path, body) =>
  request(path, { method: "POST", body: JSON.stringify(body || {}) });
export const apiForm = (path, formData) =>
  request(path, { method: "POST", body: formData });

export function assetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return path;
  const name = String(path).split(/[/\\]/).pop();
  return name ? `/uploads/${name}` : "";
}

export function formatMoney(n) {
  return `$${Number(n || 0).toLocaleString("es-CO")}`;
}

export function iconoCategoria(nombre = "") {
  const n = String(nombre).toLowerCase();
  if (n.includes("tecnolog")) return "💻";
  if (n.includes("hogar")) return "🏠";
  if (n.includes("ropa") || n.includes("accesorio")) return "👕";
  if (n.includes("deporte")) return "⚽";
  if (n.includes("vehículo") || n.includes("vehiculo")) return "🚗";
  if (n.includes("entretenimiento")) return "🎮";
  if (n.includes("libro")) return "📚";
  return "📦";
}
