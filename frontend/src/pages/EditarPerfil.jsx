import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiForm, apiGet, assetUrl } from "../api/client";
import { comprimirImagen } from "../utils/comprimirImagen";
import { useAuth } from "../context/AuthContext";
import {
  Alert,
  AppHeader,
  Field,
  PageShell,
  buttonClass,
  inputClass,
} from "../components/ui";

export default function EditarPerfil() {
  const navigate = useNavigate();
  const { setUsuario } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet("/perfil")
      .then((data) => {
        if (!cancelled) setPerfil(data.usuario);
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

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setSaving(true);
    const fd = new FormData(e.target);
    try {
      const archivo = fd.get("foto");
      if (archivo instanceof File && archivo.size > 0) {
        const comprimida = await comprimirImagen(archivo);
        fd.set("foto", comprimida, comprimida.name);
      }
      const data = await apiForm("/perfil", fd);
      setMensaje(data.mensaje || "Perfil actualizado.");
      if (data.usuario) {
        setPerfil((prev) => ({ ...prev, ...data.usuario }));
        setUsuario((prev) =>
          prev
            ? {
                ...prev,
                nombre: data.usuario.nombre,
                foto: data.usuario.foto,
              }
            : prev
        );
      }
      setTimeout(() => navigate("/perfil"), 800);
    } catch (err) {
      setError(err.message || "No fue posible actualizar el perfil");
    } finally {
      setSaving(false);
    }
  }

  const foto = assetUrl(perfil?.foto);

  return (
    <div className="min-h-screen">
      <AppHeader showNav={false} />
      <PageShell className="max-w-xl">
        <Link to="/perfil" className="mb-4 inline-block text-sm text-shoppy-cyan-soft">
          ← Volver al perfil
        </Link>

        <div className="panel-shoppy rounded-3xl p-6 md:p-8">
          <h1 className="text-2xl font-bold">✏️ Editar perfil</h1>
          <p className="mt-1 text-shoppy-muted">
            Actualiza tu nombre, ubicación y foto de perfil.
          </p>

          {mensaje && <Alert type="success">{mensaje}</Alert>}
          {error && <Alert>{error}</Alert>}
          {loading && <p className="mt-4 text-shoppy-muted">Cargando...</p>}

          {!loading && perfil && (
            <>
              <div className="my-6 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#0a1220] text-4xl">
                  {foto ? (
                    <img src={foto} alt="" className="h-full w-full object-cover" />
                  ) : (
                    "👤"
                  )}
                </div>
              </div>

              <form onSubmit={onSubmit}>
                <Field label="Nombre">
                  <input
                    className={inputClass}
                    name="nombre"
                    required
                    defaultValue={perfil.nombre || ""}
                  />
                </Field>
                <Field label="Correo electrónico">
                  <input
                    className={`${inputClass} opacity-60`}
                    type="email"
                    value={perfil.email || ""}
                    disabled
                    readOnly
                  />
                </Field>
                <Field label="Ubicación">
                  <input
                    className={inputClass}
                    name="ubicacion"
                    defaultValue={perfil.ubicacion || ""}
                    placeholder="Ciudad o municipio"
                  />
                </Field>
                <Field label="Foto de perfil">
                  <input
                    className={inputClass}
                    type="file"
                    name="foto"
                    accept=".jpg,.jpeg,.png,.webp"
                  />
                </Field>
                <button className={buttonClass} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
                <Link
                  to="/perfil"
                  className="mt-3 block rounded-xl border border-shoppy-border bg-shoppy-card px-4 py-3.5 text-center font-medium"
                >
                  Cancelar
                </Link>
              </form>
            </>
          )}
        </div>
      </PageShell>
    </div>
  );
}
