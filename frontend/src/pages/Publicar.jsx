import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiForm, apiGet } from "../api/client";
import { LIMITE_ENVIO, comprimirImagenes, tamanoTotal } from "../utils/comprimirImagen";
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

export default function Publicar() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet("/publicaciones")
      .then((data) => {
        if (!cancelled) setCategorias(data.categorias || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Error al cargar categorías");
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
    const form = e.target;
    const fd = new FormData(form);
    fd.delete("fotos");
    try {
      const files = await comprimirImagenes(form.fotos?.files);
      if (tamanoTotal(files) > LIMITE_ENVIO) {
        throw new Error("Las fotos son demasiado pesadas. Selecciona menos fotografías.");
      }
      for (const file of files) {
        fd.append("fotos", file);
      }
      const data = await apiForm("/publicaciones", fd);
      setMensaje(data.mensaje || "¡Producto publicado!");
      setTimeout(() => {
        if (data.id) navigate(`/producto/${data.id}`);
        else navigate("/mis-publicaciones");
      }, 700);
    } catch (err) {
      setError(err.message || "No fue posible publicar el producto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader showNav={false} />
      <PageShell className="max-w-xl">
        <Link to="/inicio" className="mb-4 inline-block text-sm text-shoppy-cyan-soft">
          ← Volver al inicio
        </Link>

        <div className="panel-shoppy rounded-3xl p-6 md:p-8">
          <h1 className="text-2xl font-bold">➕ Publicar producto</h1>
          <p className="mt-1 text-shoppy-muted">
            Completa la información para publicar tu producto en el marketplace.
          </p>

          {mensaje && <Alert type="success">{mensaje}</Alert>}
          {error && <Alert>{error}</Alert>}
          {loading && <p className="mt-4 text-shoppy-muted">Cargando...</p>}

          {!loading && (
            <form onSubmit={onSubmit} className="mt-6">
              <Field label="Título">
                <input
                  className={inputClass}
                  name="titulo"
                  required
                  placeholder="Ejemplo: Bicicleta de montaña"
                />
              </Field>
              <Field label="Categoría">
                <select className={inputClass} name="categoria_id" required defaultValue="">
                  <option value="">Selecciona una categoría</option>
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
                  placeholder="0"
                />
              </Field>
              <Field label="Estado del producto">
                <select className={inputClass} name="condicion" required defaultValue="">
                  <option value="">Selecciona el estado</option>
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
                  placeholder="Ejemplo: El Carmen de Viboral"
                />
              </Field>
              <Field label="Descripción">
                <textarea
                  className={`${inputClass} min-h-28`}
                  name="descripcion"
                  required
                  placeholder="Describe las características del producto..."
                />
              </Field>
              <Field label="Fotografías del producto">
                <input
                  className={inputClass}
                  type="file"
                  name="fotos"
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple
                />
                <p className="mt-2 text-xs text-shoppy-muted">
                  Puedes seleccionar varias fotografías. Formatos: JPG, JPEG, PNG y WEBP.
                </p>
              </Field>
              <button className={buttonClass} disabled={saving}>
                {saving ? "Publicando..." : "🚀 Publicar producto"}
              </button>
              <Link
                to="/inicio"
                className="mt-3 block rounded-xl border border-shoppy-border bg-shoppy-card px-4 py-3.5 text-center font-medium"
              >
                Cancelar
              </Link>
            </form>
          )}
        </div>
      </PageShell>
    </div>
  );
}
