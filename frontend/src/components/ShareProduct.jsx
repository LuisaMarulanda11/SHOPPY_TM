import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { canNativeShare as soportaShare, copyToClipboard, productShareUrl } from "../utils/compartir";

const optionClass =
  "flex w-full items-center gap-3 rounded-xl border border-shoppy-border bg-[#0a1220] px-4 py-3 text-left font-medium transition hover:border-shoppy-cyan-soft/50";

export default function ShareProduct({
  productId,
  titulo = "",
  className = "",
  label = "Compartir",
  stopPropagation = false,
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare] = useState(soportaShare);

  const url = productShareUrl(productId);
  const texto = titulo ? `Mira este producto en SHOPPY T&M: ${titulo}` : "Mira este producto en SHOPPY T&M";

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openMenu(e) {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCopied(false);
    setOpen(true);
  }

  async function copiar() {
    if (await copyToClipboard(url)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      window.prompt("Copia este enlace:", url);
    }
  }

  async function compartirNativo() {
    try {
      await navigator.share({ title: titulo || "SHOPPY T&M", text: texto, url });
      setOpen(false);
    } catch (err) {
      if (err?.name !== "AbortError") await copiar();
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`;

  const menu = open
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Compartir publicación"
            className="w-full max-w-sm rounded-t-3xl border border-shoppy-border bg-shoppy-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white shadow-2xl sm:rounded-3xl sm:pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Compartir publicación</h3>
              {titulo && <p className="line-clamp-1 text-sm text-shoppy-muted">{titulo}</p>}
              <p className="mt-2 truncate rounded-lg bg-[#0a1220] px-3 py-2 text-xs text-shoppy-cyan-soft">
                {url}
              </p>
            </div>

            <div className="space-y-2">
              <button type="button" onClick={copiar} className={optionClass}>
                <span className="text-xl">{copied ? "✓" : "🔗"}</span>
                {copied ? "Enlace copiado" : "Copiar enlace"}
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={optionClass}
              >
                <span className="text-xl">💬</span>
                Compartir por WhatsApp
              </a>
              {canNativeShare && (
                <button type="button" onClick={compartirNativo} className={optionClass}>
                  <span className="text-xl">📤</span>
                  Más opciones
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-xl px-4 py-2 text-sm text-shoppy-muted hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        type="button"
        onClick={openMenu}
        className={
          className ||
          "rounded-xl border border-shoppy-border bg-shoppy-card px-5 py-3 font-semibold transition hover:border-shoppy-cyan-soft/50"
        }
        title="Compartir publicación"
      >
        📤 {label}
      </button>
      {menu}
    </>
  );
}
