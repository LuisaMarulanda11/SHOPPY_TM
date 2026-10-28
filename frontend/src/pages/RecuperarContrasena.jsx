import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiPost } from "../api/client";
import { Alert, AuthCard, Field, buttonClass, inputClass } from "../components/ui";

export default function RecuperarContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMensaje("");
    setError("");
    setLoading(true);
    const form = new FormData(e.target);

    try {
      if (token) {
        await apiPost("/auth/reset-password", {
          token,
          password: form.get("password"),
          confirmar_password: form.get("confirmar_password"),
        });
        setMensaje("Tu contraseña quedó actualizada. Ya puedes iniciar sesión.");
        e.target.reset();
      } else {
        const data = await apiPost("/auth/forgot-password", {
          email: form.get("email"),
        });
        setMensaje(data.mensaje);
        e.target.reset();
      }
    } catch (err) {
      setError(err.message || "No fue posible procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title={token ? "Crear contraseña nueva" : "Recuperar contraseña"}
      footer={
        <p className="mt-6 text-center text-sm text-shoppy-muted">
          <Link className="text-shoppy-cyan hover:underline" to="/login">
            Volver a iniciar sesión
          </Link>
        </p>
      }
    >
      <p className="mb-5 text-sm text-shoppy-muted">
        {token
          ? "Elige una contraseña de al menos 8 caracteres."
          : "Escribe el correo de tu cuenta y te enviaremos un enlace para cambiarla."}
      </p>
      {error && <Alert>{error}</Alert>}
      {mensaje && <Alert type="success">{mensaje}</Alert>}
      <form onSubmit={onSubmit}>
        {token ? (
          <>
            <Field label="Nueva contraseña">
              <input
                className={inputClass}
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
              />
            </Field>
            <Field label="Confirmar contraseña">
              <input
                className={inputClass}
                type="password"
                name="confirmar_password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
              />
            </Field>
          </>
        ) : (
          <Field label="Correo electrónico">
            <input
              className={inputClass}
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="correo@ejemplo.com"
            />
          </Field>
        )}
        <button className={buttonClass} disabled={loading}>
          {loading
            ? "Procesando..."
            : token
              ? "Guardar contraseña nueva"
              : "Enviar enlace de recuperación"}
        </button>
      </form>
    </AuthCard>
  );
}
