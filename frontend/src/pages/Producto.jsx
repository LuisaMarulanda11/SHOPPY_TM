import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet, apiPost, assetUrl, formatMoney } from "../api/client";
import CopyProductLink from "../components/CopyProductLink";
import { Alert, AppHeader, PageShell } from "../components/ui";

export default function Producto() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [indice, setIndice] = useState(0);
  const [favorito, setFavorito] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setIndice(0);
    apiGet(`/producto?id=${id}`)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setFavorito(!!res.favorito);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Error al cargar producto");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function toggleFavorito() {
    setFavLoading(true);
    try {
      const res = await apiPost("/favoritos/toggle", { id: Number(id) });
      setFavorito(!!res.favorito);
    } catch (err) {
      setError(err.message || "No se pudo actualizar el favorito");
    } finally {
      setFavLoading(false);
    }
  }

  const producto = data?.producto;
  const fotos = data?.fotos || [];
  const relacionados = data?.relacionados || [];
  const multi = fotos.length > 1;
  const fotoActual = fotos[indice];
  const imgUrl = assetUrl(fotoActual?.foto);
  const esMio = producto && Number(producto.vendedor_id) === Number(data?.usuario_id);
  const esVendido = producto?.estado === "vendido";

  function prev() {
    setIndice((i) => (i - 1 + fotos.length) % fotos.length);
  }
  function next() {
    setIndice((i) => (i + 1) % fotos.length);
  }

  return (
    <div className="min-h-screen">
      <AppHeader showNav={false} />
      <PageShell>
        <Link to="/inicio" className="mb-4 inline-block text-sm text-shoppy-cyan-soft">
          ← Volver al marketplace
        </Link>

        {error && <Alert>{error}</Alert>}
        {loading && <p className="text-shoppy-muted">Cargando producto...</p>}

        {!loading && producto && (
          <>
            <div className="mb-3 text-sm text-shoppy-muted">
              <Link to="/inicio" className="hover:text-shoppy-cyan-soft">
                Inicio
              </Link>
              {" / "}
              <span>{producto.categoria}</span>
              {" / "}
              <span className="text-white">{producto.titulo}</span>
            </div>

            <section className="panel-shoppy grid gap-6 rounded-3xl p-4 md:grid-cols-2 md:p-6">
              <div>
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[#0a1220]">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={producto.titulo}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">🛍️</span>
                  )}
                  {multi && (
                    <>
                      <button
                        type="button"
                        onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-xl"
                        aria-label="Anterior"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-xl"
                        aria-label="Siguiente"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs">
                        {indice + 1} / {fotos.length}
                      </div>
                    </>
                  )}
                </div>
                {multi && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {fotos.map((f, i) => {
                      const u = assetUrl(f.foto);
                      if (!u) return null;
                      return (
                        <button
                          key={f.id || i}
                          type="button"
                          onClick={() => setIndice(i)}
                          className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${
                            i === indice
                              ? "border-shoppy-cyan"
                              : "border-transparent opacity-70"
                          }`}
                        >
                          <img src={u} alt="" className="h-full w-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs uppercase tracking-wide text-shoppy-cyan-soft">
                  {producto.categoria}
                </span>
                <h1 className="mt-1 text-2xl font-bold md:text-3xl">{producto.titulo}</h1>
                <div className="mt-3 text-3xl font-bold text-shoppy-cyan">
                  {formatMoney(producto.precio)}
                </div>
                {esVendido && (
                  <div className="mt-3 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-300">
                    🔴 Este producto ya fue vendido
                  </div>
                )}
                <p className="mt-4 whitespace-pre-wrap text-shoppy-muted">
                  {producto.descripcion}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-shoppy-border bg-shoppy-card p-3">
                    <div className="text-xs text-shoppy-muted">Condición</div>
                    <div className="font-medium">{producto.condicion || "—"}</div>
                  </div>
                  <div className="rounded-xl border border-shoppy-border bg-shoppy-card p-3">
                    <div className="text-xs text-shoppy-muted">Ubicación</div>
                    <div className="font-medium">{producto.ubicacion || "—"}</div>
                  </div>
                </div>

                <Link
                  to={`/usuario/${producto.vendedor_id}`}
                  className="mt-5 flex items-center gap-3 rounded-2xl border border-shoppy-border bg-shoppy-card p-3 transition hover:border-shoppy-cyan-soft/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0a1220] text-xl">
                    👤
                  </div>
                  <div>
                    <div className="text-xs text-shoppy-muted">Vendedor</div>
                    <div className="font-semibold">{producto.vendedor}</div>
                    <div className="text-sm text-shoppy-muted">{producto.vendedor_email}</div>
                  </div>
                </Link>

                <div className="mt-5 flex flex-wrap gap-3">
                  {esVendido ? null : esMio ? (
                    <>
                      <Link
                        to={`/editar-publicacion/${producto.id}`}
                        className="btn-gradient rounded-xl px-5 py-3 font-bold"
                      >
                        ✏️ Editar publicación
                      </Link>
                      <Link
                        to="/mis-publicaciones"
                        className="rounded-xl border border-shoppy-border bg-shoppy-card px-5 py-3 font-semibold"
                      >
                        📦 Mis publicaciones
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to={`/mensajes?producto=${producto.id}`}
                        className="btn-gradient rounded-xl px-5 py-3 font-bold"
                      >
                        💬 Contactar vendedor
                      </Link>
                      <button
                        type="button"
                        disabled={favLoading}
                        onClick={toggleFavorito}
                        className={`rounded-xl border px-5 py-3 font-semibold ${
                          favorito
                            ? "border-shoppy-pink bg-shoppy-pink/20 text-shoppy-pink"
                            : "border-shoppy-border bg-shoppy-card"
                        }`}
                      >
                        {favorito ? "❤️ En favoritos" : "♡ Agregar a favoritos"}
                      </button>
                    </>
                  )}
                  <CopyProductLink productId={producto.id} />
                </div>

                {data.fecha_publicacion && (
                  <p className="mt-4 text-sm text-shoppy-muted">
                    Publicado el {data.fecha_publicacion}
                  </p>
                )}
              </div>
            </section>

            <section className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  i: "🔒",
                  t: "Compra segura",
                  d: "Coordina la entrega y verifica el producto antes de pagar.",
                },
                {
                  i: "💬",
                  t: "Contacto directo",
                  d: "Habla con el vendedor desde el chat de SHOPPY T&M.",
                },
                {
                  i: "📍",
                  t: "Cerca de ti",
                  d: "Encuentra productos en tu zona y ahorra en envíos.",
                },
              ].map((c) => (
                <div
                  key={c.t}
                  className="rounded-2xl border border-shoppy-border bg-shoppy-card p-4"
                >
                  <div className="text-2xl">{c.i}</div>
                  <h3 className="mt-2 font-semibold">{c.t}</h3>
                  <p className="mt-1 text-sm text-shoppy-muted">{c.d}</p>
                </div>
              ))}
            </section>

            {relacionados.length > 0 && (
              <section className="mt-10">
                <div className="mb-4">
                  <div className="text-xs tracking-wide text-shoppy-cyan-soft">
                    SHOPPY recomienda
                  </div>
                  <h2 className="text-xl font-semibold">También podría interesarte</h2>
                  <p className="text-sm text-shoppy-muted">
                    Productos similares de la misma categoría.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relacionados.map((p) => {
                    const img = assetUrl(p.foto);
                    return (
                      <Link
                        key={p.id}
                        to={`/producto/${p.id}`}
                        className="overflow-hidden rounded-2xl border border-shoppy-border bg-shoppy-card transition hover:border-shoppy-cyan-soft/50"
                      >
                        <div className="flex h-36 items-center justify-center bg-[#0a1220]">
                          {img ? (
                            <img
                              src={img}
                              alt={p.titulo}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">🛍️</span>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="line-clamp-1 font-medium">{p.titulo}</div>
                          <div className="mt-1 font-bold text-shoppy-cyan">
                            {formatMoney(p.precio)}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </PageShell>
    </div>
  );
}
