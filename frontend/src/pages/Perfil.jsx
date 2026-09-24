import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, assetUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Alert, AppHeader, PageShell } from "../components/ui";

export default function Perfil() {
  const { logout } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGet("/perfil")
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
  }, []);

  const usuario = data?.usuario;
  const foto = assetUrl(usuario?.foto);
  let fecha = "—";
  if (usuario?.fecha_registro) {
    fecha = new Date(usuario.fecha_registro).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const links = [
    { to: "/editar-perfil", label: "✏️ Editar perfil", primary: true },
    { to: "/publicar", label: "➕ Publicar producto" },
    { to: "/favoritos", label: "❤️ Mis favoritos" },
    { to: "/mis-publicaciones", label: "📦 Mis publicaciones" },
    { to: "/inicio", label: "🏠 Ir al inicio" },
  ];

  return (
    <div className="min-h-screen">
      <AppHeader />
      <PageShell className="max-w-2xl">
        {error && <Alert>{error}</Alert>}
        {loading && <p className="text-shoppy-muted">Cargando perfil...</p>}

        {!loading && usuario && (
          <div className="panel-shoppy rounded-3xl p-6 md:p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#0a1220] text-3xl">
                {foto ? (
                  <img src={foto} alt="" className="h-full w-full object-cover" />
                ) : (
                  "👤"
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{usuario.nombre}</h1>
                <p className="text-shoppy-muted">Mi perfil en SHOPPY T&amp;M</p>
              </div>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-shoppy-border bg-shoppy-card p-3">
                <strong className="block text-sm text-shoppy-muted">📧 Correo</strong>
                <span>{usuario.email}</span>
              </div>
              <div className="rounded-xl border border-shoppy-border bg-shoppy-card p-3">
                <strong className="block text-sm text-shoppy-muted">📍 Ubicación</strong>
                <span>{usuario.ubicacion || "Sin especificar"}</span>
              </div>
              <div className="rounded-xl border border-shoppy-border bg-shoppy-card p-3">
                <strong className="block text-sm text-shoppy-muted">📅 Miembro desde</strong>
                <span>{fecha}</span>
              </div>
              <div className="rounded-xl border border-shoppy-border bg-shoppy-card p-3">
                <strong className="block text-sm text-shoppy-muted">👤 Usuario</strong>
                <span>{usuario.nombre}</span>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-shoppy-border bg-shoppy-card p-4 text-center">
                <div className="text-2xl font-bold text-shoppy-cyan">
                  {data.total_publicaciones ?? 0}
                </div>
                <div className="text-sm text-shoppy-muted">Publicaciones</div>
              </div>
              <div className="rounded-2xl border border-shoppy-border bg-shoppy-card p-4 text-center">
                <div className="text-2xl font-bold text-shoppy-pink">
                  {data.total_favoritos ?? 0}
                </div>
                <div className="text-sm text-shoppy-muted">Favoritos</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={
                    l.primary
                      ? "btn-gradient rounded-xl px-4 py-3 text-center font-bold"
                      : "rounded-xl border border-shoppy-border bg-shoppy-card px-4 py-3 text-center font-medium"
                  }
                >
                  {l.label}
                </Link>
              ))}
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-transparent px-4 py-3 font-medium text-shoppy-muted"
                onClick={async () => {
                  await logout();
                  window.location.href = "/login";
                }}
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </PageShell>
    </div>
  );
}
