import { NextResponse, type NextRequest } from "next/server"

/**
 * Optimistic route guard (Next 16 `proxy.ts` — `middleware.ts` is deprecated).
 *
 * This only checks for the better-auth session *cookie* so signed-out
 * visitors never see a private shell flash before the server redirect.
 * It is NOT the security boundary: every private page/layout also calls
 * `requireSession()` / `requireRole()` from `lib/auth-guard.ts`, which
 * validates the session against the database before rendering any data.
 */

const SESSION_COOKIE = "better-auth.session_token"

/**
 * Signed-out visitors are bounced off these before anything renders:
 * - every `/dashboard*` page (role scoping happens in the layouts);
 * - the equipment *details* page (`/browse-equipments/[id]`) — the list
 *   itself (`/browse-equipments`) is public and needs no cookie.
 */
function isPrivatePath(pathname: string): boolean {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return true
  if (pathname.startsWith("/browse-equipments/")) return true
  return false
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isPrivatePath(pathname)) return NextResponse.next()

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value)
  if (hasSession) return NextResponse.next()

  const signInUrl = new URL("/sign-in", request.url)
  // Remember where the user wanted to go so sign-in can send them back.
  signInUrl.searchParams.set("next", pathname)
  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: [
    /*
     * Everything except API routes, Next internals and static assets.
     * Auth/api routes must keep working for signed-out users.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
