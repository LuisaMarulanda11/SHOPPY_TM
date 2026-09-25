export function productShareUrl(id) {
  const origin = window.location.origin;
  return `${origin}/producto/${id}`;
}

export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Continúa con el método alternativo.
    }
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.top = "0";
  input.style.left = "0";
  input.style.opacity = "0";
  input.style.fontSize = "16px";
  document.body.appendChild(input);
  input.focus();
  input.select();
  input.setSelectionRange(0, text.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  document.body.removeChild(input);
  return copied;
}

export function canNativeShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}
