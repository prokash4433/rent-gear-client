import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/AuthShell"
import { SignInForm } from "@/components/auth/SignInForm"

export const metadata: Metadata = {
  title: "Sign In | Rent Gear",
  description: "Sign in to your Rent Gear account.",
}

export default function SignInPage() {

  //  const handleSignIn = async()=>{
    
  // }
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue renting and buying equipment."
    >
      <SignInForm />
    </AuthShell>
  )
}
