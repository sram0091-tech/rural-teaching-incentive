/**
 * API base URL from Vite env (`.env.local`, `.env.production`, etc.).
 *
 * This is built from `import.meta.env.VITE_API_BASE_URL` (trimmed, no trailing slash).
 *
 * Build URLs like:
 *   fetch(`${API_BASE}/api/explorer/filters`)
 *
 * - If `VITE_API_BASE_URL` is set → full URL to your backend (e.g. Render).
 * - If empty / unset → `${API_BASE}/api/...` is `/api/...` (relative) → Vite dev proxy → local FastAPI.
 */
export const API_BASE = String(import.meta.env.VITE_API_BASE_URL ?? '')
  .trim()
  .replace(/\/$/, '')

/**
 * Same as `${API_BASE}${path}` with a leading slash on `path`.
 * For GETs without query string you can use `fetch(\`${API_BASE}/api/explorer/hero-top\`)` directly.
 */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}

/**
 * For URLs with query params. Uses `window.location.origin` when the URL is relative (`API_BASE` empty).
 */
export function apiUrlObject(path) {
  const full = apiUrl(path)
  if (full.startsWith('http://') || full.startsWith('https://')) {
    return new URL(full)
  }
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'http://localhost:5173'
  return new URL(full, origin)
}
