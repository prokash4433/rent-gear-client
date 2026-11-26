/**
 * Authenticated fetch wrapper for the Express API (NEXT_PUBLIC_API_BASE_URL).
 *
 * Every request carries `Authorization: Bearer <jwt>`:
 * - in the browser the JWT is fetched once from `GET /api/auth/token` and
 *   cached until it is close to expiry (the better-auth session cookie is
 *   sent automatically by the browser);
 * - on the server the caller mints the JWT itself with
 *   `getServerAccessToken()` (`lib/server-token.ts`) and passes it as the
 *   `token` option — server-only modules are never imported from here, so no
 *   `next/headers` code leaks into the client bundle.
 *
 * A 401 refreshes the token once and retries, so an expired token never
 * surfaces as a broken page.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

type CachedToken = { token: string; expiresAt: number }

let cachedToken: CachedToken | null = null

/** Reads `exp` from a JWT payload (cache bookkeeping only — never trusted). */
function readExpiry(token: string): number | null {
  try {
    const payloadPart = token.split(".")[1]
    if (!payloadPart) return null
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(base64))
    return typeof payload.exp === "number" ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

/** Drops the cached browser token (sign-out or an expired/invalid token). */
export function clearAccessToken() {
  cachedToken = null
}

/** Browser-only: fetch (then cache) the JWT for the signed-in session. */
async function getBrowserToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token
  }
  try {
    const res = await fetch("/api/auth/token", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
    if (!res.ok) {
      cachedToken = null
      return null
    }
    const data = (await res.json()) as { token?: string }
    if (!data.token) return null
    cachedToken = {
      token: data.token,
      expiresAt: readExpiry(data.token) ?? Date.now() + 60_000,
    }
    return data.token
  } catch {
    return null
  }
}

export type ApiFetchOptions = {
  /**
   * Pre-resolved JWT. Server callers MUST pass one (from
   * `getServerAccessToken()`); browser callers normally omit it.
   */
  token?: string | null
  /** Set to false to disable the single 401 refresh + retry. */
  retry?: boolean
}

/**
 * `fetch` against the Express API with the bearer token attached.
 * Returns the raw Response — callers keep their own error handling.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
  options: ApiFetchOptions = {}
): Promise<Response> {
  const headers = new Headers(init.headers)
  const token =
    options.token ??
    (typeof window === "undefined" ? null : await getBrowserToken())
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  // Expired/rotated token: refresh once and try again.
  if (res.status === 401 && options.retry !== false) {
    clearAccessToken()
    return apiFetch(path, init, { ...options, retry: false })
  }

  return res
}
