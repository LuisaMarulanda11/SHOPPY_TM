import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet, assetUrl, formatMoney } from "../api/client";
import ShareProduct from "../components/ShareProduct";
import { Alert, AppHeader, PageShell } from "../components/ui";

export default function PerfilUsuario() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    apiGet(`/perfil/usuario/${id}`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Error al cargar perfil");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const usuario = data?.usuario;
  const publicaciones = data?.publicaciones || [];
  const foto = assetUrl(usuario?.foto);

  return (
    <div className="min-h-screen">
      <AppHeader showNav={false} />
      <PageShell>
        <Link to="/inicio" className="mb-4 inline-block text-sm text-shoppy-cyan-soft">
          ← Inicio
        </Link>

        {error && <Alert>{error}</Alert>}
        {loading && <p className="text-shoppy-muted">Cargando perfil...</p>}

        {!loading && usuario && (
          <>
            <section className="panel-shoppy mb-6 flex flex-wrap items-center gap-4 rounded-3xl p-6">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#0a1220] text-4xl">
                {foto ? (
                  <img src={foto} alt="" className="h-full w-full object-cover" />
                ) : (
                  "👤"
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{usuario.nombre}</h1>
                <p className="text-shoppy-muted">Miembro de SHOPPY T&amp;M</p>
                {usuario.ubicacion && (
                  <p className="mt-1 text-sm text-shoppy-cyan-soft">
                    📍 {usuario.ubicacion}
                  </p>
                )}
              </div>
            </section>

            <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-shoppy-border bg-shoppy-card p-4 text-center">
                <div className="text-2xl font-bold text-shoppy-cyan">
                  {data.total_publicaciones ?? 0}
                </div>
                <div className="text-sm text-shoppy-muted">Publicaciones activas</div>
              </div>
              <div className="rounded-2xl border border-shoppy-border bg-shoppy-card p-4 text-center">
                <div className="text-lg font-semibold">{data.fecha_registro || "—"}</div>
                <div className="text-sm text-shoppy-muted">Miembro desde</div>
              </div>
              <div className="rounded-2xl border border-shoppy-border bg-shoppy-card p-4 text-center">
                <div className="text-2xl">🛍️</div>
                <div className="text-sm text-shoppy-muted">Vendedor en SHOPPY</div>
              </div>
            </section>

            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Publicaciones</h2>
                <p className="text-sm text-shoppy-muted">
                  Productos activos de este usuario.
                </p>
              </div>

              {publicaciones.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-shoppy-border p-10 text-center">
                  <div className="text-4xl">📦</div>
                  <p className="mt-3 text-shoppy-muted">
                    Este usuario no tiene publicaciones activas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {publicaciones.map((p) => {
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
                            <span className="text-xs text-shoppy-cyan-soft">
                              {p.categoria}
                            </span>
                            <h3 className="mt-1 font-semibold">{p.titulo}</h3>
                            <div className="mt-2 font-bold text-shoppy-cyan">
                              {formatMoney(p.precio)}
                            </div>
                            <div className="mt-2 text-sm text-shoppy-muted">
                              📦 {p.condicion || "—"}
                            </div>
                          </div>
                        </Link>
                        <div className="px-4 pb-4">
                          <ShareProduct
                            productId={p.id}
                            titulo={p.titulo}
                            stopPropagation
                            className="w-full rounded-lg border border-shoppy-border bg-[#0a1220] px-3 py-2 text-sm font-medium transition hover:border-shoppy-cyan-soft/50"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        <footer className="mt-12 pb-4 text-center text-sm text-shoppy-muted">
          SHOPPY T&amp;M — Una segunda vida.
        </footer>
      </PageShell>
    </div>
  );
}
