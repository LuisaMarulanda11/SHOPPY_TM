import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiPost } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Alert, AuthCard, Field, buttonClass, inputClass } from "../components/ui";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUsuario } = useAuth();
  const from = location.state?.from;
  const destino =
    from?.pathname && from.pathname.startsWith("/") && !from.pathname.startsWith("//")
      ? `${from.pathname}${from.search || ""}${from.hash || ""}`
      : "/inicio";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.target);
    try {
      const data = await apiPost("/auth/login", {
        email: fd.get("email"),
        password: fd.get("password"),
      });
      setUsuario(data.usuario);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Iniciar sesión"
      footer={
        <p className="mt-6 text-center text-shoppy-muted">
          ¿No tienes una cuenta?{" "}
          <Link className="text-shoppy-cyan" to="/registro" state={from ? { from } : undefined}>
            Crear cuenta
          </Link>
        </p>
      }
    >
      {error && <Alert>{error}</Alert>}
      <form onSubmit={onSubmit}>
        <Field label="Correo electrónico">
          <input className={inputClass} type="email" name="email" required autoComplete="email" placeholder="correo@ejemplo.com" />
        </Field>
        <Field label="Contraseña">
          <input className={inputClass} type="password" name="password" required autoComplete="current-password" placeholder="Tu contraseña" />
        </Field>
        <button className={buttonClass} disabled={loading}>
          {loading ? "Entrando..." : "Iniciar sesión"}
        </button>
      </form>
    </AuthCard>
  );
}
