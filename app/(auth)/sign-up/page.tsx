import { redirect } from "next/navigation"

import { AuthShell } from "@/components/auth/AuthShell"
import { SignUpForm } from "@/components/auth/SignUpForm"
import { getSession } from "@/lib/auth-guard"
import { dashboardPathFor } from "@/lib/role-paths"

/** Per-request: the answer depends on the caller's session. */
export const dynamic = "force-dynamic"

export default async function SignUpPage() {
  // A signed-in visitor has no business on the sign-up form — send them
  // to their own dashboard instead (session checked against the DB, so a
  // stale cookie just renders the form; no redirect loop possible).
  const session = await getSession()
  if (session) redirect(dashboardPathFor(session.user.role))

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Rent Gear to rent equipment from trusted suppliers."
    >
      <SignUpForm />
    </AuthShell>
  )
}
