import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth-guard"
import { dashboardPathFor } from "@/lib/role-paths"

/** Per-request: the answer depends on the caller's session. */
export const dynamic = "force-dynamic"

/**
 * `/dashboard` has no content of its own — it is the landing pad for
 * post-auth redirects (the Google OAuth callback targets it, and it keeps
 * old links working). Send the visitor straight to their role's dashboard.
 *
 * The dashboard layout above this page has already validated the session;
 * this only picks the destination, so a missing session simply goes back
 * to sign-in (no loop: /sign-in itself only redirects *away* when the
 * session is genuinely valid).
 */
export default async function DashboardIndexPage() {
  const session = await getSession()
  if (!session) redirect("/sign-in?next=/dashboard")

  redirect(dashboardPathFor(session.user.role))
}
