import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  apiGet,
  assetUrl,
  formatMoney,
  iconoCategoria,
} from "../api/client";
import ShareProduct from "../components/ShareProduct";
import {
  Alert,
  AppHeader,
  PageShell,
  inputClass,
  buttonClass,
} from "../components/ui";

const CONDICIONES = [
  { value: "", label: "Cualquier condición" },
  { value: "nuevo", label: "Nuevo" },
  { value: "como_nuevo", label: "Como nuevo" },
  { value: "buen_estado", label: "Buen estado" },
  { value: "aceptable", label: "Aceptable" },
];

const ORDENES = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio_menor", label: "Precio: menor" },
  { value: "precio_mayor", label: "Precio: mayor" },
  { value: "nombre", label: "Nombre" },
];

function ProductCard({ p }) {
  const img = assetUrl(p.foto);
  return (
    <div className="group overflow-hidden rounded-2xl border border-shoppy-border bg-shoppy-card transition hover:border-shoppy-cyan-soft/50">
      <Link to={`/producto/${p.id}`} className="block">
        <div className="flex h-44 items-center justify-center bg-[#0a1220]">
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
          <span className="text-xs uppercase tracking-wide text-shoppy-cyan-soft">
            {p.categoria || ""}
          </span>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold text-white group-hover:text-shoppy-cyan-soft">
            {p.titulo}
          </h3>
          <div className="mt-2 text-lg font-bold text-shoppy-cyan">{formatMoney(p.precio)}</div>
          <div className="mt-2 space-y-0.5 text-sm text-shoppy-muted">
            <div>📦 {p.condicion || "—"}</div>
            <div>📍 {p.ubicacion || "—"}</div>
            <div>👤 {p.vendedor || "—"}</div>
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
}

export default function Inicio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const filtros = data?.filtros || {
    busqueda: searchParams.get("busqueda") || "",
    categoria: searchParams.get("categoria") || "",
    condicion: searchParams.get("condicion") || "",
    precio_min: searchParams.get("precio_min") || "",
    precio_max: searchParams.get("precio_max") || "",
    ubicacion: searchParams.get("ubicacion") || "",
    orden: searchParams.get("orden") || "recientes",
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const q = searchParams.toString();
    apiGet(`/catalogo${q ? `?${q}` : ""}`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Error al cargar catálogo");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  function onSearch(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const next = new URLSearchParams();
    for (const [k, v] of fd.entries()) {
      if (String(v).trim() !== "") next.set(k, String(v).trim());
    }
    setSearchParams(next);
  }

  function filterByCategoria(id) {
    const next = new URLSearchParams(searchParams);
    next.set("categoria", String(id));
    setSearchParams(next);
  }

  const stats = data?.stats || {};
  const productos = data?.productos || [];
  const categorias = data?.categorias || [];

  return (
    <div className="min-h-screen">
      <AppHeader
        nombre={data?.usuario?.nombre}
        mensajesNuevos={stats.mensajes_nuevos || 0}
      />
      <PageShell>
        <section className="panel-shoppy mb-8 overflow-hidden rounded-3xl p-6 md:p-10">
          <div className="max-w-2xl">
            <div className="mb-3 text-xs font-semibold tracking-[0.2em] text-shoppy-cyan-soft">
              ✦ MARKETPLACE DE SEGUNDA MANO
            </div>
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              Lo que ya no necesitas...{" "}
              <span className="text-gradient-shoppy">puede tener una segunda vida.</span>
            </h1>
            <p className="mt-4 text-shoppy-muted">
              Compra, vende y descubre productos que todavía tienen mucho por ofrecer.
              SHOPPY T&amp;M conecta personas, productos y oportunidades en un solo lugar.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/publicar"
                className="btn-gradient rounded-xl px-5 py-3 font-bold text-white"
              >
                + Publicar producto
              </Link>
              <a
                href="#productos"
                className="rounded-xl border border-shoppy-border bg-shoppy-card px-5 py-3 font-semibold text-white"
              >
                Explorar productos ↓
              </a>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Categorías</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categorias.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => filterByCategoria(c.id)}
                className="rounded-2xl border border-shoppy-border bg-shoppy-card p-4 text-center transition hover:border-shoppy-cyan-soft/50"
              >
                <div className="text-2xl">{iconoCategoria(c.nombre)}</div>
                <div className="mt-2 text-sm font-medium">{c.nombre}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { n: stats.publicaciones ?? 0, t: "Publicaciones" },
            { n: stats.categorias ?? 0, t: "Categorías" },
          ].map((s) => (
            <div
              key={s.t}
              className="rounded-2xl border border-shoppy-border bg-shoppy-card px-5 py-4 text-center"
            >
              <div className="text-2xl font-bold text-shoppy-cyan">{s.n}</div>
              <div className="text-sm text-shoppy-muted">{s.t}</div>
            </div>
          ))}
        </section>

        {error && <Alert>{error}</Alert>}

        <form
          key={searchParams.toString()}
          onSubmit={onSearch}
          className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-shoppy-border bg-shoppy-card p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <input
            className={inputClass}
            type="search"
            name="busqueda"
            defaultValue={filtros.busqueda}
            placeholder="Buscar productos..."
          />
          <select
            className={inputClass}
            name="categoria"
            defaultValue={filtros.categoria || ""}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            name="condicion"
            defaultValue={filtros.condicion || ""}
          >
            {CONDICIONES.map((c) => (
              <option key={c.value || "all"} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            type="number"
            name="precio_min"
            min="0"
            defaultValue={filtros.precio_min}
            placeholder="Precio min"
          />
          <input
            className={inputClass}
            type="number"
            name="precio_max"
            min="0"
            defaultValue={filtros.precio_max}
            placeholder="Precio max"
          />
          <input
            className={inputClass}
            type="text"
            name="ubicacion"
            defaultValue={filtros.ubicacion}
            placeholder="Ubicación"
          />
          <select className={inputClass} name="orden" defaultValue={filtros.orden || "recientes"}>
            {ORDENES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button type="submit" className={`${buttonClass} mt-0`}>
            Buscar
          </button>
        </form>

        <section id="productos">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold">Publicaciones recientes</h2>
              <p className="text-sm text-shoppy-muted">
                Productos publicados por la comunidad de SHOPPY T&amp;M.
              </p>
            </div>
            <span className="text-sm text-shoppy-muted">
              {loading ? "..." : `${productos.length} resultados`}
            </span>
          </div>

          {loading ? (
            <p className="text-shoppy-muted">Cargando productos...</p>
          ) : productos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-shoppy-border p-10 text-center text-shoppy-muted">
              No hay productos con estos filtros.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productos.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>
      </PageShell>
    </div>
  );
}
