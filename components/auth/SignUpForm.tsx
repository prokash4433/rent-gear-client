"use client"

import { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Check, Circle, Loader2, Store, Trash2, Upload, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"
import { FormField } from "@/components/auth/FormField"
import { GoogleButton } from "@/components/auth/GoogleButton"
import { authClient } from "@/lib/auth-client"
import { uploadToImageBB } from "@/lib/imagebb"
import { cn } from "@/lib/utils"
import type { FormErrors, SignUpFormValues, UserRole } from "@/lib/types"
import { checkPassword, validateSignUp } from "@/lib/validation"

/** The two account types the user can pick when signing up. */
const roleOptions: { value: UserRole; label: string; icon: LucideIcon }[] = [
  { value: "customer", label: "Customer", icon: User },
  { value: "owner", label: "Owner", icon: Store },
]

export function SignUpForm() {
  const router = useRouter()

  const [values, setValues] = useState<SignUpFormValues>({
    name: "",
    email: "",
    photo: "",
    password: "",
  })
  const [errors, setErrors] = useState<FormErrors<SignUpFormValues>>({})

  // The picked photo is uploaded to ImgBB before the account is created.
  const [photoUploading, setPhotoUploading] = useState(false)

  // The account type picked with the Customer / Owner buttons.
  const [role, setRole] = useState<UserRole>("customer")

  // Update one field and clear its error while the user types.
  function setField(field: keyof SignUpFormValues, value: string) {
    setValues({ ...values, [field]: value })
    setErrors({ ...errors, [field]: undefined })
  }

  // Reads a file straight from the device, uploads it to ImgBB
  // (FormData + method: "POST") and stores the hosted URL in `photo`.
  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setErrors((prev) => ({ ...prev, photo: undefined }))
    setPhotoUploading(true)

    try {
      const url = await uploadToImageBB(file)
      setValues((prev) => ({ ...prev, photo: url }))
      toast.add({
        type: "success",
        title: "Photo uploaded",
        description: "Your profile photo is hosted on ImgBB.",
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not upload the photo. Please try again."
      setErrors((prev) => ({ ...prev, photo: message }))
      toast.add({
        type: "error",
        title: "Photo upload failed",
        description: message,
        timeout: 7000,
      })
    } finally {
      setPhotoUploading(false)
    }
  }

  function handlePhotoRemove() {
    setValues((prev) => ({ ...prev, photo: "" }))
    setErrors((prev) => ({ ...prev, photo: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (photoUploading) {
      toast.add({
        type: "error",
        title: "Photo is still uploading",
        description: "Hang on a moment while your profile photo finishes uploading.",
      })
      return
    }

    const nextErrors = validateSignUp(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      toast.add({
        type: "error",
        title: "Check the form",
        description: "Please fix the highlighted fields and try again.",
      })
      return
    }

    // Send the whole form to better-auth, including the chosen role.
    const { error } = await authClient.signUp.email({
      name: values.name as string,
      email: values.email,
      password: values.password,
      image: values.photo,
      callbackURL: "/",
      role,
    })

    if (error) {
      toast.add({
        type: "error",
        title: "Sign up failed",
        description: error.message || "Something went wrong. Please try again.",
      })
      return
    }

    toast.add({
      type: "success",
      title: "Account created",
      description: "Welcome to Rent Gear!",
    })

    router.push("/")
    router.refresh()
  }

  const handleGoogleSignIn = async () => {
    const data = await authClient.signIn.social({
      provider: 'google',
    });
    console.log(data)
  }

  // Live checklist for the three password rules.
  const passwordCheck = checkPassword(values.password)
  const passwordRules = [
    { label: "Uppercase letter", passed: passwordCheck.hasUppercase },
    { label: "Lowercase letter", passed: passwordCheck.hasLowercase },
    { label: "At least 6 characters", passed: passwordCheck.hasMinLength },
  ]

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Account type: customer (rents gear) or owner (lists gear). */}
      <div className="flex flex-col gap-1.5" role="group" aria-label="Sign up as">
        <Label className="text-xs font-bold text-white">Sign up as</Label>
        <div className="grid grid-cols-2 gap-2">
          {roleOptions.map((option) => {
            const selected = role === option.value
            const Icon = option.icon
            return (
              <Button
                key={option.value}
                type="button"
                variant="outline"
                aria-pressed={selected}
                onClick={() => setRole(option.value)}
                className={cn(
                  "h-10 gap-2 border-white/10 bg-[#44342d] text-white hover:bg-[#54423a] hover:text-white dark:border-white/10 dark:bg-[#44342d] dark:hover:bg-[#54423a]",
                  selected &&
                  "border-brand bg-brand text-neutral-900 hover:bg-brand-hover hover:text-neutral-900 dark:border-brand dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"
                )}
              >
                <Icon className="size-4" />
                {option.label}
              </Button>
            )
          })}
        </div>
        <p className="text-xs text-neutral-400">
          Customers rent equipment, owners list their own equipment.
        </p>
      </div>

      <FormField
        id="sign-up-name"
        label="Name"
        placeholder="Your full name"
        autoComplete="name"
        value={values.name}
        error={errors.name}
        onChange={(value) => setField("name", value)}
      />

      <FormField
        id="sign-up-email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        onChange={(value) => setField("email", value)}
      />

      {/* Profile photo: picked from the device and hosted on ImgBB */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sign-up-photo" className="text-xs font-bold text-white">
          Profile Photo
        </Label>

        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#44342d] p-2.5">
          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black/30 text-sm font-bold text-white ring-1 ring-white/10">
            {values.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.photo}
                alt="Profile photo preview"
                className="size-full object-cover"
              />
            ) : (
              <User className="size-5 text-neutral-400" />
            )}
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <label
              htmlFor="sign-up-photo"
              className={cn(
                "inline-flex w-fit cursor-pointer items-center gap-1.5 text-sm font-semibold text-brand hover:underline",
                photoUploading && "pointer-events-none opacity-60"
              )}
            >
              {photoUploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {photoUploading
                ? "Uploading…"
                : values.photo
                  ? "Change photo"
                  : "Choose a photo"}
            </label>
            <p className="truncate text-[11px] text-neutral-400">
              {values.photo
                ? "Hosted on ImgBB"
                : "JPG, PNG or WEBP · up to 10 MB, picked from your device"}
            </p>
          </div>

          {values.photo && !photoUploading ? (
            <button
              type="button"
              onClick={handlePhotoRemove}
              aria-label="Remove profile photo"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 text-neutral-400 transition hover:border-red-400/40 hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </button>
          ) : null}
        </div>

        <input
          id="sign-up-photo"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          disabled={photoUploading}
          className="sr-only"
        />

        {errors.photo && !photoUploading ? (
          <p className="text-xs text-red-400">{errors.photo}</p>
        ) : null}
      </div>

      <FormField
        id="sign-up-password"
        label="Password"
        type="password"
        placeholder="Create a password"
        autoComplete="new-password"
        value={values.password}
        error={errors.password}
        onChange={(value) => setField("password", value)}
        hint={
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {passwordRules.map((rule) => (
              <span
                key={rule.label}
                className={cn(
                  "flex items-center gap-1",
                  rule.passed ? "text-green-500" : "text-neutral-300"
                )}
              >
                {rule.passed ? (
                  <Check className="size-3 shrink-0" />
                ) : (
                  <Circle className="size-3 shrink-0" />
                )}
                {rule.label}
              </span>
            ))}
          </div>
        }
      />

      <Button
        type="submit"
        className="h-10 w-full bg-brand text-neutral-900 hover:-translate-y-0.5 hover:bg-brand-hover cursor-pointer"
      >
        Create Account
      </Button>

      <div className="flex items-center gap-3 text-xs text-neutral-400">
        <Separator className="flex-1 bg-white/15" />
        or
        <Separator className="flex-1 bg-white/15" />
      </div>

      <GoogleButton onClick={handleGoogleSignIn} />

      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-neutral-400">
        Already have an account?
        <Link
          href="/sign-in"
          className="inline-flex items-center rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-neutral-900 transition duration-200 hover:scale-105 hover:bg-brand-hover"
        >
          Sign In
        </Link>
      </div>
    </form>
  )
}