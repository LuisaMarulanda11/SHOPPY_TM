import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost, assetUrl, formatMoney } from "../api/client";
import { Alert, AppHeader, PageShell, inputClass } from "../components/ui";

export default function Admin() {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState(0);

  const cargar = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError("");
    try {
      const q = new URLSearchParams();
      if (filtros.busqueda) q.set("busqueda", filtros.busqueda);
      if (filtros.estado) q.set("estado", filtros.estado);
      const data = await apiGet(`/admin/publicaciones${q.toString() ? `?${q}` : ""}`);
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

  function onBuscar(e) {
    e.preventDefault();
    cargar({ busqueda: busqueda.trim(), estado });
  }

  async function eliminar(p) {
    const aviso = p.es_propia
      ? `¿Eliminar tu publicación "${p.titulo}"?`
      : `🛡️ ACCIÓN ADMINISTRATIVA\n\nVas a eliminar la publicación "${p.titulo}" de ${p.vendedor}.\nTambién se eliminarán sus fotos, favoritos y mensajes asociados.\n\nEsta acción no se puede deshacer. ¿Continuar?`;
    if (!window.confirm(aviso)) return;
    setEliminando(p.id);
    setError("");
    setMensaje("");
    try {
      await apiPost("/publicaciones/delete", { id: p.id });
      setItems((prev) => prev.filter((x) => x.id !== p.id));
      setMensaje(`Publicación "${p.titulo}" eliminada.`);
    } catch (err) {
      setError(err.message || "No se pudo eliminar");
    } finally {
      setEliminando(0);
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <PageShell>
        <div className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 md:p-5">
          <h1 className="text-2xl font-bold text-amber-300">🛡️ Panel de administración</h1>
          <p className="mt-1 text-sm text-amber-100/80">
            Estás en modo administrador. Desde aquí puedes revisar todas las publicaciones de
            SHOPPY T&amp;M y eliminar las que incumplan las reglas.
          </p>
        </div>

        <form
          onSubmit={onBuscar}
          className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-shoppy-border bg-shoppy-card p-4 sm:grid-cols-[1fr_auto_auto]"
        >
          <input
            className={inputClass}
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título, vendedor o correo..."
          />
          <select className={inputClass} value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="activo">Activas</option>
            <option value="vendido">Vendidas</option>
          </select>
          <button type="submit" className="btn-gradient rounded-xl px-5 py-3 font-bold">
            Buscar
          </button>
        </form>

        {mensaje && <Alert type="success">{mensaje}</Alert>}
        {error && <Alert>{error}</Alert>}
        {loading && <p className="text-shoppy-muted">Cargando...</p>}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-shoppy-border p-10 text-center text-shoppy-muted">
            No hay publicaciones con estos filtros.
          </div>
        )}

        {!loading && items.length > 0 && (
          <p className="mb-3 text-sm text-shoppy-muted">{items.length} publicaciones</p>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((p) => {
            const img = assetUrl(p.foto);
            return (
              <div
                key={p.id}
                className="flex gap-3 rounded-2xl border border-shoppy-border bg-shoppy-card p-3"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0a1220]">
                  {img ? (
                    <img src={img} alt={p.titulo} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-2xl">🛍️</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 font-semibold">{p.titulo}</div>
                  <div className="text-sm font-bold text-shoppy-cyan">{formatMoney(p.precio)}</div>
                  <div className="line-clamp-1 text-xs text-shoppy-muted">
                    👤 {p.vendedor} · {p.vendedor_email}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold ${
                        p.estado === "vendido"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {p.estado === "vendido" ? "Vendido" : "Activo"}
                    </span>
                    {p.categoria && <span className="text-shoppy-muted">{p.categoria}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                      to={`/producto/${p.id}`}
                      className="rounded-lg border border-shoppy-border px-3 py-1.5 text-xs"
                    >
                      Ver
                    </Link>
                    <Link
                      to={`/editar-publicacion/${p.id}`}
                      className="rounded-lg border border-amber-400/50 px-3 py-1.5 text-xs text-amber-200"
                    >
                      ✏️ Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => eliminar(p)}
                      disabled={eliminando === p.id}
                      className="rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-bold disabled:opacity-60"
                    >
                      {eliminando === p.id ? "Eliminando..." : "🗑️ Eliminar"}
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
