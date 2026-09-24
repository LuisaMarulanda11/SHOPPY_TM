import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiForm, apiGet, apiPost, assetUrl } from "../api/client";
import {
  Alert,
  AppHeader,
  Field,
  PageShell,
  buttonClass,
  inputClass,
} from "../components/ui";

const CONDICIONES = [
  { value: "Nuevo", label: "Nuevo" },
  { value: "Como nuevo", label: "Como nuevo" },
  { value: "Buen estado", label: "Buen estado" },
  { value: "Usado", label: "Usado" },
];

export default function EditarPublicacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publicacion, setPublicacion] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet(`/publicaciones?id=${id}`);
      setPublicacion(data.publicacion);
      setFotos(data.fotos || []);
      setCategorias(data.categorias || []);
    } catch (err) {
      setError(err.message || "Error al cargar publicación");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function eliminarFoto(fotoId) {
    if (!fotoId || fotoId <= 0) {
      setError("Esta foto no se puede eliminar por separado.");
      return;
    }
    if (!window.confirm("¿Eliminar esta foto?")) return;
    try {
      const data = await apiPost("/publicaciones/eliminar-foto", { id: fotoId });
      setMensaje(data.mensaje || "Foto eliminada.");
      await cargar();
    } catch (err) {
      setError(err.message || "No se pudo eliminar la foto");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setSaving(true);
    const form = e.target;
    const fd = new FormData(form);
    fd.set("id", String(id));
    const files = form.fotos?.files;
    fd.delete("fotos");
    if (files) {
      for (const file of files) {
        fd.append("fotos", file);
      }
    }
    try {
      const data = await apiForm("/publicaciones/update", fd);
      setMensaje(data.mensaje || "Publicación actualizada.");
      setTimeout(() => navigate("/mis-publicaciones"), 700);
    } catch (err) {
      setError(err.message || "No fue posible actualizar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader showNav={false} />
      <PageShell className="max-w-xl">
        <Link
          to="/mis-publicaciones"
          className="mb-4 inline-block text-sm text-shoppy-cyan-soft"
        >
          ← Mis publicaciones
        </Link>

        <div className="panel-shoppy rounded-3xl p-6 md:p-8">
          <h1 className="text-2xl font-bold">✏️ Editar publicación</h1>
          <p className="mt-1 text-shoppy-muted">
            Actualiza la información o las fotos de tu producto.
          </p>

          {mensaje && <Alert type="success">{mensaje}</Alert>}
          {error && <Alert>{error}</Alert>}
          {loading && <p className="mt-4 text-shoppy-muted">Cargando...</p>}

          {!loading && publicacion && (
            <>
              <div className="my-5">
                <div className="mb-2 text-sm font-medium text-shoppy-muted">
                  Fotografías actuales
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {fotos.map((f, i) => {
                    const url = assetUrl(f.foto);
                    return (
                      <div
                        key={f.id || i}
                        className="relative overflow-hidden rounded-xl border border-shoppy-border bg-[#0a1220]"
                      >
                        {url ? (
                          <img
                            src={url}
                            alt=""
                            className="aspect-square w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-square items-center justify-center text-2xl">
                            🛍️
                          </div>
                        )}
                        {f.id > 0 && (
                          <button
                            type="button"
                            onClick={() => eliminarFoto(f.id)}
                            className="absolute bottom-1 right-1 rounded-lg bg-red-600/90 px-2 py-1 text-[10px] font-bold"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {fotos.length === 0 && (
                    <p className="col-span-full text-sm text-shoppy-muted">
                      Sin fotografías.
                    </p>
                  )}
                </div>
              </div>

              <form onSubmit={onSubmit}>
                <Field label="Título">
                  <input
                    className={inputClass}
                    name="titulo"
                    required
                    defaultValue={publicacion.titulo || ""}
                  />
                </Field>
                <Field label="Categoría">
                  <select
                    className={inputClass}
                    name="categoria_id"
                    required
                    defaultValue={publicacion.categoria_id || ""}
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Precio">
                  <input
                    className={inputClass}
                    type="number"
                    name="precio"
                    min="0"
                    step="1"
                    required
                    defaultValue={publicacion.precio ?? ""}
                  />
                </Field>
                <Field label="Estado del producto">
                  <select
                    className={inputClass}
                    name="condicion"
                    required
                    defaultValue={publicacion.condicion || "Buen estado"}
                  >
                    {CONDICIONES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Ubicación">
                  <input
                    className={inputClass}
                    name="ubicacion"
                    required
                    defaultValue={publicacion.ubicacion || ""}
                  />
                </Field>
                <Field label="Descripción">
                  <textarea
                    className={`${inputClass} min-h-28`}
                    name="descripcion"
                    required
                    defaultValue={publicacion.descripcion || ""}
                  />
                </Field>
                <Field label="Agregar fotografías">
                  <input
                    className={inputClass}
                    type="file"
                    name="fotos"
                    accept=".jpg,.jpeg,.png,.webp"
                    multiple
                  />
                  <p className="mt-2 text-xs text-shoppy-muted">
                    Las fotos nuevas se agregarán a la galería existente.
                  </p>
                </Field>
                <button className={buttonClass} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
                <Link
                  to="/mis-publicaciones"
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
