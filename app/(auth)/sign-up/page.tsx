

import { AuthShell } from "@/components/auth/AuthShell"
import { SignUpForm } from "@/components/auth/SignUpForm"
 



export default function SignUpPage() {
 
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Rent Gear to rent equipment from trusted suppliers."
    >
      <SignUpForm    />
    </AuthShell>
  )
}
