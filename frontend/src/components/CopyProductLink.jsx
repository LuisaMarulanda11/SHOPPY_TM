import { useState } from "react";
import { copyToClipboard, productShareUrl } from "../utils/compartir";

export default function CopyProductLink({
  productId,
  className = "",
  label = "Copiar enlace",
  stopPropagation = false,
}) {
  const [copied, setCopied] = useState(false);

  async function copy(e) {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }

    const url = productShareUrl(productId);

    if (await copyToClipboard(url)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      window.prompt("Copia este enlace:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={
        className ||
        "rounded-xl border border-shoppy-border bg-shoppy-card px-5 py-3 font-semibold transition hover:border-shoppy-cyan-soft/50"
      }
      title="Copiar enlace del producto"
    >
      {copied ? "✓ Enlace copiado" : `🔗 ${label}`}
    </button>
  );
}
