import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthShell } from "@/components/auth/AuthShell"
import { SignInForm } from "@/components/auth/SignInForm"
import { getSession } from "@/lib/auth-guard"
import { dashboardPathFor } from "@/lib/role-paths"

export const metadata: Metadata = {
  title: "Sign In | Rent Gear",
  description: "Sign in to your Rent Gear account.",
}

/** Per-request: the answer depends on the caller's session. */
export const dynamic = "force-dynamic"

export default async function SignInPage() {
  // Already signed in? Skip the form and go straight to that user's
  // dashboard — no second login. The session is validated against the
  // database first, so a stale cookie simply shows the form instead
  // (which is what keeps this from ever looping).
  const session = await getSession()
  if (session) redirect(dashboardPathFor(session.user.role))

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue renting and buying equipment."
    >
      <SignInForm />
    </AuthShell>
  )
}
