"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"
import { FormField } from "@/components/auth/FormField"
import { GoogleButton } from "@/components/auth/GoogleButton"
import type { FormErrors, SignInFormValues } from "@/lib/types"
import { validateSignIn } from "@/lib/validation"
import { authClient } from "@/lib/auth-client"

// Toast duration in milliseconds (default was 5000).
const SUCCESS_TIMEOUT = 6000
const ERROR_TIMEOUT = 7000

export function SignInForm() {
  const router = useRouter()
  const [values, setValues] = useState<SignInFormValues>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<FormErrors<SignInFormValues>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update one field and clear its error while the user types.
  function setField(field: keyof SignInFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  // Where to go after signing in: the ?next= added by the route guard
  // (open-redirect safe — only same-site paths are honoured), else home.
  function nextDestination() {
    const next = new URLSearchParams(window.location.search).get("next")
    if (next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")) {
      return next
    }
    return "/"
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validateSignIn(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      toast.add({
        type: "error",
        title: "Check the form",
        description: "Please fix the highlighted fields and try again.",
        timeout: ERROR_TIMEOUT,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: true,
        callbackURL: "/",
      })
      if (error) {
        toast.add({
          type: "error",
          title: "Sign in failed",
          description: error.message ?? "Invalid email or password.",
          timeout: ERROR_TIMEOUT,
        })
        return
      }

      console.log("Sign in form data:", data)

      toast.add({
        type: "success",
        title: "Sign in successful",
        description: "Welcome back to Rent Gear!",
        timeout: SUCCESS_TIMEOUT,
      })

      // Continue to the page that sent us here (or home).
      router.push(nextDestination())
    } catch {
      toast.add({
        type: "error",
        title: "Something went wrong",
        description: "Could not reach the server. Please try again.",
        timeout: ERROR_TIMEOUT,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: nextDestination(),
      })

      if (error) {
        toast.add({
          type: "error",
          title: "Google sign in failed",
          description: error.message ?? "Please try again.",
          timeout: ERROR_TIMEOUT,
        })
      }
    } catch {
      toast.add({
        type: "error",
        title: "Google sign in failed",
        description: "Something went wrong. Please try again.",
        timeout: ERROR_TIMEOUT,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField
        id="sign-in-email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        onChange={(value) => setField("email", value)}
      />

      <FormField
        id="sign-in-password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        value={values.password}
        error={errors.password}
        onChange={(value) => setField("password", value)}
      />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-10 w-full bg-brand text-neutral-900 hover:-translate-y-0.5 hover:bg-brand-hover cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>

      <div className="flex items-center gap-3 text-xs text-neutral-400">
        <Separator className="flex-1 bg-white/15" />
        or
        <Separator className="flex-1 bg-white/15" />
      </div>

      <GoogleButton onClick={handleGoogleSignIn} />

      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-neutral-400">
        Don’t have an account?
        <Link
          href="/sign-up"
          className="inline-flex items-center rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-neutral-900 transition duration-200 hover:scale-105 hover:bg-brand-hover"
        >
          Sign Up
        </Link>
      </div>
    </form>
  )
}