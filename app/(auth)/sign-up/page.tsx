 
// import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/AuthShell"
import { SignUpForm } from "@/components/auth/SignUpForm"
 

// export const metadata: Metadata = {
//   title: "Sign Up | Rent Gear",
//   description: "Create a Rent Gear account to start renting equipment.",
// }

export default function SignUpPage() {
  // const handleSignUp = async ()=>{
  //   const { data, error } = await authClient.signUp.email({
  //     name: "John Doe",  
  //     email: "john.doe@example.com",  
  //     password: "password1234",  
  //     image: "https://example.com/image.png",  
  //     callbackURL: "https://example.com/callback",  
  //   });
  // }
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Rent Gear to rent equipment from trusted suppliers."
    >
      <SignUpForm    />
    </AuthShell>
  )
}
