import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, assetUrl, formatMoney } from "../api/client";
import { Alert, AppHeader, PageShell } from "../components/ui";

function iniciales(nombre) {
  return String(nombre || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function FotoIntegrante({ src, nombre }) {
  const [fallo, setFallo] = useState(false);
  return (
    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-shoppy-cyan-soft/40 bg-[#0a1220] text-3xl font-bold text-shoppy-cyan-soft">
      {src && !fallo ? (
        <img
          src={src}
          alt={nombre}
          className="h-full w-full object-cover"
          onError={() => setFallo(true)}
        />
      ) : (
        iniciales(nombre)
      )}
    </div>
  );
}

function MiniProducto({ p }) {
  const img = assetUrl(p.foto);
  return (
    <Link
      to={`/producto/${p.id}`}
      className="overflow-hidden rounded-xl border border-shoppy-border bg-[#0a1220] transition hover:border-shoppy-cyan-soft/50"
    >
      <div className="flex h-28 items-center justify-center">
        {img ? (
          <img src={img} alt={p.titulo} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="text-3xl">🛍️</span>
        )}
      </div>
      <div className="p-2">
        <div className="line-clamp-1 text-sm font-medium">{p.titulo}</div>
        <div className="text-sm font-bold text-shoppy-cyan">{formatMoney(p.precio)}</div>
      </div>
    </Link>
  );
}

export default function Equipo() {
  const [integrantes, setIntegrantes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGet("/perfil/equipo")
      .then((res) => {
        if (!cancelled) setIntegrantes(res.integrantes || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Error al cargar el equipo");
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
        <section className="panel-shoppy mb-8 rounded-3xl p-6 md:p-10">
          <div className="mb-3 text-xs font-semibold tracking-[0.2em] text-shoppy-cyan-soft">
            ✦ NUESTRO EQUIPO
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">
            Las personas detrás de{" "}
            <span className="text-gradient-shoppy">SHOPPY T&amp;M</span>
          </h1>
          <p className="mt-4 text-shoppy-muted">
            Conoce a los integrantes del grupo y los productos que cada uno tiene a la venta.
          </p>
        </section>

        {error && <Alert>{error}</Alert>}
        {loading && <p className="text-shoppy-muted">Cargando equipo...</p>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {integrantes.map((m) => (
            <section
              key={m.nombre}
              className="rounded-3xl border border-shoppy-border bg-shoppy-card p-6"
            >
              <div className="mb-5 flex items-center gap-4">
                <FotoIntegrante src={m.foto} nombre={m.nombre} />
                <div>
                  <h2 className="text-2xl font-bold">{m.nombre}</h2>
                  <p className="text-shoppy-muted">{m.rol}</p>
                  {m.usuario_id && (
                    <Link
                      to={`/usuario/${m.usuario_id}`}
                      className="mt-1 inline-block text-sm text-shoppy-cyan-soft"
                    >
                      Ver perfil →
                    </Link>
                  )}
                </div>
              </div>

              {m.publicaciones.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-shoppy-border p-6 text-center text-sm text-shoppy-muted">
                  {m.usuario_id
                    ? "Todavía no tiene productos a la venta."
                    : "Cuenta aún no vinculada."}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {m.publicaciones.map((p) => (
                    <MiniProducto key={p.id} p={p} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <footer className="mt-12 pb-4 text-center text-sm text-shoppy-muted">
          SHOPPY T&amp;M — Una segunda vida.
        </footer>
      </PageShell>
    </div>
  );
}
