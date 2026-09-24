import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiGet, apiPost, assetUrl } from "../api/client";
import { Alert, AppHeader, PageShell, inputClass } from "../components/ui";

function formatFecha(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Mensajes() {
  const [searchParams] = useSearchParams();
  const productoParam = searchParams.get("producto") || "";
  const usuarioParam = searchParams.get("usuario") || "";

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [texto, setTexto] = useState("");
  const chatEndRef = useRef(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const q = new URLSearchParams();
      if (productoParam) q.set("producto", productoParam);
      if (usuarioParam) q.set("usuario", usuarioParam);
      const res = await apiGet(`/mensajes${q.toString() ? `?${q}` : ""}`);
      setData(res);
    } catch (err) {
      setError(err.message || "Error al cargar mensajes");
    } finally {
      setLoading(false);
    }
  }, [productoParam, usuarioParam]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.mensajes]);

  const producto = data?.producto;
  const otro = data?.otro_usuario;
  const mensajes = data?.mensajes || [];
  const conversaciones = data?.conversaciones || [];
  const usuarioId = Number(data?.usuario_id || 0);

  let destinatarioId = otro ? Number(otro.id) : Number(producto?.vendedor_id || 0);
  if (destinatarioId === usuarioId) destinatarioId = 0;

  const puedeEnviar = Number(productoParam) > 0 && destinatarioId > 0;

  async function onSubmit(e) {
    e.preventDefault();
    const mensaje = texto.trim();
    if (!mensaje || !puedeEnviar) return;
    setSending(true);
    setError("");
    try {
      await apiPost("/mensajes", {
        producto_id: Number(productoParam),
        destinatario_id: destinatarioId,
        mensaje,
      });
      setTexto("");
      await cargar();
    } catch (err) {
      setError(err.message || "No se pudo enviar el mensaje");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <PageShell>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">💬 Mensajes</h1>
          <p className="text-shoppy-muted">
            Tus conversaciones sobre productos en SHOPPY T&amp;M.
          </p>
        </div>

        {error && <Alert>{error}</Alert>}
        {loading && !data && <p className="text-shoppy-muted">Cargando...</p>}

        {productoParam && data && (
          <section className="panel-shoppy mb-8 overflow-hidden rounded-3xl">
            <div className="flex items-center gap-3 border-b border-white/10 p-4">
              {assetUrl(producto?.foto) ? (
                <img
                  src={assetUrl(producto.foto)}
                  alt=""
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0a1220] text-2xl">
                  🛍️
                </div>
              )}
              <div>
                <h2 className="font-semibold">{producto?.titulo || "Conversación"}</h2>
                <p className="text-sm text-shoppy-muted">
                  {otro
                    ? `Chat con ${otro.nombre}`
                    : "Inicia la conversación con el vendedor"}
                </p>
                {producto && (
                  <Link
                    to={`/producto/${producto.id}`}
                    className="text-sm text-shoppy-cyan"
                  >
                    Ver producto
                  </Link>
                )}
              </div>
            </div>

            <div className="flex max-h-[420px] min-h-[240px] flex-col gap-3 overflow-y-auto p-4">
              {mensajes.length === 0 ? (
                <p className="text-center text-sm text-shoppy-muted">
                  Aún no hay mensajes. ¡Saluda!
                </p>
              ) : (
                mensajes.map((m) => {
                  const propio = Number(m.remitente_id) === usuarioId;
                  return (
                    <div
                      key={m.id}
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        propio
                          ? "ml-auto bg-shoppy-violet/40"
                          : "mr-auto bg-shoppy-card border border-shoppy-border"
                      }`}
                    >
                      <strong className="block text-xs text-shoppy-cyan-soft">
                        {m.remitente}
                      </strong>
                      <p className="mt-1 whitespace-pre-wrap">{m.mensaje}</p>
                      <small className="mt-1 block text-shoppy-muted">
                        {formatFecha(m.fecha)}
                      </small>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {puedeEnviar ? (
              <form
                onSubmit={onSubmit}
                className="flex gap-2 border-t border-white/10 p-4"
              >
                <input
                  className={inputClass}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  required
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-gradient shrink-0 rounded-xl px-5 py-3 font-bold disabled:opacity-60"
                >
                  {sending ? "..." : "Enviar"}
                </button>
              </form>
            ) : (
              <div className="border-t border-white/10 p-4 text-center text-sm text-shoppy-muted">
                Selecciona o inicia una conversación para enviar mensajes.
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="mb-4 text-xl font-semibold">Conversaciones</h2>
          {conversaciones.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-shoppy-border p-10 text-center">
              <div className="text-4xl">💬</div>
              <p className="mt-3 text-shoppy-muted">No tienes conversaciones todavía.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {conversaciones.map((c) => {
                const img = assetUrl(c.foto);
                const active =
                  String(c.publicacion_id) === String(productoParam) &&
                  String(c.otro_usuario_id) === String(usuarioParam || c.otro_usuario_id);
                return (
                  <Link
                    key={`${c.publicacion_id}-${c.otro_usuario_id}`}
                    to={`/mensajes?producto=${c.publicacion_id}&usuario=${c.otro_usuario_id}`}
                    className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                      active
                        ? "border-shoppy-cyan bg-shoppy-cyan/10"
                        : "border-shoppy-border bg-shoppy-card hover:border-shoppy-cyan-soft/40"
                    }`}
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0a1220]">
                      {img ? (
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      ) : (
                        "🛍️"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{c.titulo || "Producto"}</h3>
                      <p className="text-sm text-shoppy-muted">
                        Con {c.otro_nombre || "Usuario"}
                      </p>
                      <div className="text-xs text-shoppy-muted">
                        {formatFecha(c.ultima_fecha)}
                      </div>
                    </div>
                    <span className="text-shoppy-muted">›</span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </PageShell>
    </div>
  );
}
