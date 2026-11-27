import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { ROLE_HOME } from "@/lib/role-paths"
import type { UserRole } from "@/lib/types"

/**
 * Secure, server-side route protection (the optimistic cookie check in
 * `proxy.ts` only hides pages from signed-out users — *this* is the real
 * gate, executed inside the page/layout before any data is read).
 *
 * Use `requireSession()` for private pages and `requireRole(...)` for
 * role-scoped dashboards. Both never return when access is denied: they
 * redirect (303) instead, so callers can simply `await` them at the top.
 */

/** Returns the better-auth session for this request, or null when signed out. */
export async function getSession() {
  try {
    return await auth.api.getSession({ headers: await headers() })
  } catch (error) {
    // `headers()` unavailable during a static prerender. Swallowing that error
    // would let Next bake a wrong "signed out" answer into a static page, so
    // rethrow it — Next turns it into "render this route per request".
    if (isDynamicUsageError(error)) throw error
    return null
  }
}

/** True for Next's "this render needs the request" errors (`headers`, etc.). */
function isDynamicUsageError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const digest = (error as Error & { digest?: unknown }).digest
  return (
    (typeof digest === "string" && digest.startsWith("DYNAMIC")) ||
    /dynamic server usage/i.test(error.message)
  )
}

/** Signed in? Returns the session, otherwise redirects to the sign-in page. */
export async function requireSession() {
  const session = await getSession()
  if (!session) redirect("/sign-in")
  return session
}

/**
 * Signed in *and* holding one of `roles`? Returns the session, otherwise
 * redirects: signed out -> /sign-in, wrong role -> that user's own dashboard.
 */
export async function requireRole(...roles: UserRole[]) {
  const session = await requireSession()
  const role = (session.user.role ?? "customer") as UserRole

  if (!roles.includes(role)) {
    redirect(ROLE_HOME[role] ?? "/")
  }
  return session
}

/**
 * Route-handler variant of the admin check (no redirect — a redirect makes
 * no sense for an XHR/API caller). Returns the admin session, or a 401/403
 * reason the caller can turn into a JSON response.
 */
export async function requireApiAdmin() {
  const session = await getSession()
  if (!session) {
    return { ok: false as const, status: 401 as const, error: "Sign in required" }
  }
  if (String(session.user.role ?? "customer") !== "admin") {
    return { ok: false as const, status: 403 as const, error: "Admins only" }
  }
  return { ok: true as const, session }
}
