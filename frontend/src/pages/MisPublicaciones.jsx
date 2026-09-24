import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost, assetUrl, formatMoney } from "../api/client";
import CopyProductLink from "../components/CopyProductLink";
import { Alert, AppHeader, PageShell } from "../components/ui";

export default function MisPublicaciones() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/publicaciones");
      setItems(data.publicaciones || []);
    } catch (err) {
      setError(err.message || "Error al cargar publicaciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function marcarVendido(id) {
    if (!window.confirm("¿Marcar esta publicación como vendida?")) return;
    try {
      await apiPost("/publicaciones/vendido", { id });
      await cargar();
    } catch (err) {
      setError(err.message || "No se pudo marcar como vendida");
    }
  }

  async function eliminar(id) {
    if (!window.confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      await apiPost("/publicaciones/delete", { id });
      await cargar();
    } catch (err) {
      setError(err.message || "No se pudo eliminar");
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <PageShell>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">📦 Mis publicaciones</h1>
            <p className="text-shoppy-muted">
              Administra tus productos publicados en SHOPPY T&amp;M.
            </p>
          </div>
          <Link
            to="/publicar"
            className="btn-gradient rounded-xl px-4 py-2.5 font-bold"
          >
            ➕ Nueva publicación
          </Link>
        </div>

        {error && <Alert>{error}</Alert>}
        {loading && <p className="text-shoppy-muted">Cargando...</p>}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-shoppy-border p-10 text-center">
            <div className="text-4xl">📦</div>
            <p className="mt-3 text-shoppy-muted">Aún no has publicado productos.</p>
            <Link to="/publicar" className="mt-4 inline-block text-shoppy-cyan">
              Publicar ahora
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((p) => {
            const img = assetUrl(p.foto);
            const vendido = p.estado === "vendido";
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-shoppy-border bg-shoppy-card"
              >
                <div className="flex h-40 items-center justify-center bg-[#0a1220]">
                  {img ? (
                    <img
                      src={img}
                      alt={p.titulo}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-4xl">🛍️</span>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{p.titulo}</h2>
                  <div className="mt-1 text-xl font-bold text-shoppy-cyan">
                    {formatMoney(p.precio)}
                  </div>
                  <div className="mt-2 space-y-0.5 text-sm text-shoppy-muted">
                    <div>📂 {p.categoria || "—"}</div>
                    <div>📦 {p.condicion || "—"}</div>
                    <div>📍 {p.ubicacion || "—"}</div>
                  </div>
                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      vendido
                        ? "bg-red-500/20 text-red-300"
                        : "bg-green-500/20 text-green-300"
                    }`}
                  >
                    {vendido ? "Vendido" : "Activo"}
                  </span>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={`/producto/${p.id}`}
                      className="rounded-lg border border-shoppy-border px-3 py-2 text-sm"
                    >
                      Ver
                    </Link>
                    <CopyProductLink
                      productId={p.id}
                      label="Copiar enlace"
                      className="rounded-lg border border-shoppy-border px-3 py-2 text-sm font-medium transition hover:border-shoppy-cyan-soft/50"
                    />
                    <Link
                      to={`/editar-publicacion/${p.id}`}
                      className="rounded-lg border border-shoppy-border px-3 py-2 text-sm"
                    >
                      Editar
                    </Link>
                    {!vendido && (
                      <button
                        type="button"
                        onClick={() => marcarVendido(p.id)}
                        className="rounded-lg border border-shoppy-violet/40 px-3 py-2 text-sm text-shoppy-cyan-soft"
                      >
                        Marcar vendido
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => eliminar(p.id)}
                      className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PageShell>
    </div>
  );
}
