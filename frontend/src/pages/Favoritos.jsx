import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, assetUrl, formatMoney } from "../api/client";
import CopyProductLink from "../components/CopyProductLink";
import { Alert, AppHeader, PageShell } from "../components/ui";

export default function Favoritos() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGet("/favoritos")
      .then((data) => {
        if (!cancelled) setItems(data.favoritos || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Error al cargar favoritos");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <PageShell>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">❤️ Mis favoritos</h1>
          <p className="text-shoppy-muted">Productos que guardaste para más tarde.</p>
        </div>

        {error && <Alert>{error}</Alert>}
        {loading && <p className="text-shoppy-muted">Cargando...</p>}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-shoppy-border p-10 text-center">
            <p className="text-shoppy-muted">Aún no tienes productos en favoritos.</p>
            <Link to="/inicio" className="mt-4 inline-block text-shoppy-cyan">
              Explorar productos
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => {
            const img = assetUrl(p.foto);
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-shoppy-border bg-shoppy-card transition hover:border-shoppy-cyan-soft/50"
              >
                <Link to={`/producto/${p.id}`} className="block">
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
                  <div className="p-4 pb-2">
                    <span className="text-xs text-shoppy-cyan-soft">{p.categoria}</span>
                    <h2 className="mt-1 font-semibold">{p.titulo}</h2>
                    <div className="mt-2 text-lg font-bold text-shoppy-cyan">
                      {formatMoney(p.precio)}
                    </div>
                    <div className="mt-2 text-sm text-shoppy-muted">
                      <div>📦 {p.condicion || "—"}</div>
                      <div>📍 {p.ubicacion || "—"}</div>
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <CopyProductLink
                    productId={p.id}
                    stopPropagation
                    label="Copiar enlace"
                    className="w-full rounded-lg border border-shoppy-border bg-[#0a1220] px-3 py-2 text-sm font-medium transition hover:border-shoppy-cyan-soft/50"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </PageShell>
    </div>
  );
}
