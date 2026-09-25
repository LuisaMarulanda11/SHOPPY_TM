import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiPost } from "../api/client";
import { Alert, AuthCard, Field, buttonClass, inputClass } from "../components/ui";

export default function Registro() {
  const from = useLocation().state?.from;
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setLoading(true);
    const fd = new FormData(e.target);
    try {
      const data = await apiPost("/auth/registro", {
        nombre: fd.get("nombre"),
        email: fd.get("email"),
        password: fd.get("password"),
        confirmar_password: fd.get("confirmar_password"),
      });
      setMensaje(data.mensaje);
      e.target.reset();
    } catch (err) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Crear cuenta"
      footer={
        <p className="mt-6 text-center text-shoppy-muted">
          ¿Ya tienes una cuenta?{" "}
          <Link className="text-shoppy-cyan" to="/login" state={from ? { from } : undefined}>
            Iniciar sesión
          </Link>
        </p>
      }
    >
      {mensaje && <Alert type="success">{mensaje}</Alert>}
      {error && <Alert>{error}</Alert>}
      <form onSubmit={onSubmit}>
        <Field label="Nombre completo">
          <input className={inputClass} name="nombre" required placeholder="Tu nombre" />
        </Field>
        <Field label="Correo electrónico">
          <input className={inputClass} type="email" name="email" required placeholder="correo@ejemplo.com" />
        </Field>
        <Field label="Contraseña">
          <input className={inputClass} type="password" name="password" required placeholder="Mínimo 8 caracteres" />
        </Field>
        <Field label="Confirmar contraseña">
          <input className={inputClass} type="password" name="confirmar_password" required placeholder="Repite tu contraseña" />
        </Field>
        <button className={buttonClass} disabled={loading}>
          {loading ? "Creando..." : "Crear mi cuenta"}
        </button>
      </form>
    </AuthCard>
  );
}
