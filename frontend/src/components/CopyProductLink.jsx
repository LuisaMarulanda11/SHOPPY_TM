import { useState } from "react";

export function productShareUrl(id) {
  const origin = window.location.origin;
  return `${origin}/producto/${id}`;
}

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

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
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
