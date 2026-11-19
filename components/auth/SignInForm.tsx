"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"
import { FormField } from "@/components/auth/FormField"
import { GoogleButton } from "@/components/auth/GoogleButton"
import type { FormErrors, SignInFormValues } from "@/lib/types"
import { validateSignIn } from "@/lib/validation"

export function SignInForm() {
  const [values, setValues] = useState<SignInFormValues>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<FormErrors<SignInFormValues>>({})

  // Update one field and clear its error while the user types.
  function setField(field: keyof SignInFormValues, value: string) {
    setValues({ ...values, [field]: value })
    setErrors({ ...errors, [field]: undefined })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateSignIn(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      toast.add({
        type: "error",
        title: "Check the form",
        description: "Please fix the highlighted fields and try again.",
      })
      return
    }

    // Authentication will be added later — for now we only collect the data.
    console.log("Sign in form data:", values)

    toast.add({
      type: "success",
      title: "Sign in successful",
      description: "Welcome back to Rent Gear!",
    })
  }

  function handleGoogle() {
    // Google sign-in will be connected when authentication is added.
    toast.add({
      type: "info",
      title: "Google sign-in",
      description: "This will be connected when authentication is added.",
    })
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
        className="h-10 w-full bg-brand text-neutral-900 hover:-translate-y-0.5 hover:bg-brand-hover"
      >
        Sign In
      </Button>

      <div className="flex items-center gap-3 text-xs text-neutral-400">
        <Separator className="flex-1 bg-white/15" />
        or
        <Separator className="flex-1 bg-white/15" />
      </div>

      <GoogleButton onClick={handleGoogle} />

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