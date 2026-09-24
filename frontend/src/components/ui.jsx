import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AppHeader({
  showNav = true,
  mensajesNuevos = 0,
  nombre,
}) {
  const { usuario, logout } = useAuth();
  const displayName = nombre || usuario?.nombre || "";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07101d]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:gap-4 md:px-6">
        <Link to="/inicio" className="flex items-center gap-3">
          <img
            src="/assets/logo/logo.jpeg"
            alt="SHOPPY T&M"
            className="h-10 w-10 rounded-xl object-cover md:h-12 md:w-12"
          />
          <div className="text-lg font-bold tracking-wide md:text-xl">
            SHOPPY <span className="text-shoppy-cyan-soft">T&M</span>
          </div>
        </Link>

        {showNav && (
          <>
            {displayName && (
              <div className="order-3 w-full text-sm text-shoppy-muted md:order-none md:ml-auto md:w-auto">
                Hola, <strong className="text-white">{displayName}</strong>
              </div>
            )}
            <nav className="ml-auto flex flex-wrap items-center gap-2 text-sm">
              <NavLink
                className={({ isActive }) => `nav-chip${isActive ? " is-active" : ""}`}
                to="/favoritos"
              >
                ❤️ Favoritos
              </NavLink>
              <NavLink
                className={({ isActive }) => `nav-chip${isActive ? " is-active" : ""}`}
                to="/mis-publicaciones"
              >
                📦 Mis publicaciones
              </NavLink>
              <NavLink
                className={({ isActive }) => `nav-chip relative${isActive ? " is-active" : ""}`}
                to="/mensajes"
              >
                💬 Mensajes
                {mensajesNuevos > 0 && (
                  <span className="ml-1 rounded-full bg-shoppy-pink px-1.5 py-0.5 text-[10px] font-bold">
                    {mensajesNuevos}
                  </span>
                )}
              </NavLink>
              <NavLink
                className={({ isActive }) => `nav-chip${isActive ? " is-active" : ""}`}
                to="/perfil"
              >
                👤 Perfil
              </NavLink>
              <button
                type="button"
                className="nav-chip border border-white/10 bg-transparent"
                onClick={async () => {
                  await logout();
                  window.location.href = "/login";
                }}
              >
                Salir
              </button>
            </nav>
          </>
        )}
      </div>
      <style>{`
        .nav-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          border-radius: 999px;
          padding: 0.45rem 0.85rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(88, 214, 255, 0.12);
          color: white;
          transition: 0.2s ease;
        }
        .nav-chip:hover { border-color: rgba(88, 214, 255, 0.45); }
        .nav-chip.is-active { background: rgba(0, 217, 255, 0.12); border-color: #58d6ff; }
      `}</style>
    </header>
  );
}

export default AppHeader;

export function PageShell({ children, className = "" }) {
  return (
    <main className={`mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 ${className}`}>
      {children}
    </main>
  );
}

export function AuthCard({ title, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="panel-shoppy w-full max-w-[450px] rounded-3xl p-8 md:p-10">
        <div className="mb-7 text-center">
          <h1 className="text-gradient-shoppy text-4xl font-bold">SHOPPY T&M</h1>
          <p className="mt-2 text-shoppy-muted">Una segunda vida.</p>
        </div>
        <h2 className="mb-6 text-2xl font-semibold">{title}</h2>
        {children}
        {footer}
      </div>
    </div>
  );
}

export function Alert({ type = "error", children }) {
  const styles =
    type === "success"
      ? "bg-green-500/15 text-green-300"
      : "bg-red-500/15 text-red-300";
  return (
    <div className={`mb-5 rounded-xl px-3 py-3 text-sm ${styles}`}>{children}</div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-shoppy-border bg-shoppy-card px-4 py-3.5 text-white outline-none focus:border-shoppy-cyan";

export const buttonClass =
  "btn-gradient mt-2 w-full rounded-xl px-4 py-3.5 font-bold text-white transition hover:opacity-90 disabled:opacity-60";
