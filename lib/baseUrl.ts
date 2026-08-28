// The base URL that gets baked into every QR code, e.g.
// "https://qr-links-orcin.vercel.app" → QR encodes ".../r/<code>".
//
// Chosen by the user and stored per-browser in localStorage. When unset it
// falls back to the domain they're actually viewing (window.location.origin),
// so a fresh deploy never shows localhost — it shows the real site.
const KEY = "qr_base_url";

function normalize(value: string): string {
  // Trim, drop trailing slashes, and add https:// if they omitted the scheme.
  let v = value.trim().replace(/\/+$/, "");
  if (v && !/^https?:\/\//i.test(v)) v = `https://${v}`;
  return v;
}

export function readStoredBaseUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function storeBaseUrl(value: string) {
  try {
    const v = normalize(value);
    if (v) localStorage.setItem(KEY, v);
    else localStorage.removeItem(KEY);
  } catch {
    // Ignore storage errors (private mode, etc.) — non-critical.
  }
}

// The effective base URL: the stored custom value, else the current origin.
export function resolveBaseUrl(stored: string): string {
  if (stored) return normalize(stored);
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function shortUrlFor(baseUrl: string, code: string): string {
  return `${baseUrl}/r/${code}`;
}
