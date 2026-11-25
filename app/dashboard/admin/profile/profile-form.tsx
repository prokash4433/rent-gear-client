"use client"

import { useState } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Shield,
  Upload,
  Loader2,
} from "lucide-react"

import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { UserAvatar } from "@/app/_components/dashboard/User-Avatar"
import { authClient, useSession } from "@/lib/auth-client"
import { uploadToImageBB } from "@/lib/imagebb"

/** Editable fields — kept separate from the session so cleared inputs stay cleared. */
type ProfileDraft = Partial<{
  name: string
  phone: string
  avatar: string
  address: string
}>

export default function AdminProfileForm() {
  const { data: session, refetch } = useSession()

  // Local edits layered over the session user: the form fills itself in
  // as soon as the session arrives, without an effect.
  const [draft, setDraft] = useState<ProfileDraft>({})

  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const user = session?.user
  const formValues = {
    name: draft.name ?? user?.name ?? "",
    email: user?.email ?? "",
    phone: draft.phone ?? user?.phone ?? "",
    avatar: draft.avatar ?? user?.image ?? "",
    address: draft.address ?? user?.address ?? "",
  }

  function handleChange(field: keyof ProfileDraft, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  // Device theke photo niye ImgBB te (FormData + POST) upload kore public URL pay.
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setIsUploading(true)
    try {
      const url = await uploadToImageBB(file)
      handleChange("avatar", url)
      toast.add({
        type: "success",
        title: "Photo uploaded",
        description: "Hosted on ImgBB. Click Save Profile Changes to apply it.",
      })
    } catch (err) {
      toast.add({
        type: "error",
        title: "Upload failed",
        description:
          err instanceof Error
            ? err.message
            : "Could not upload the photo. Please try again.",
        timeout: 7000,
      })
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    const { error } = await authClient.updateUser({
      name: formValues.name.trim(),
      image: formValues.avatar.trim(),
      phone: formValues.phone.trim(),
      address: formValues.address.trim(),
    })

    setIsSaving(false)

    if (error) {
      toast.add({
        type: "error",
        title: "Could not save profile",
        description: error.message || "Something went wrong. Please try again.",
        timeout: 7000,
      })
      return
    }

    // Session e notun data ene navbar/sidebar avabe dekhay.
    await refetch()

    toast.add({
      type: "success",
      title: "Profile updated",
      description: "Admin account settings have been saved successfully.",
    })
  }

  const displayName = formValues.name || "Admin"

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
      {/* Top Header Card matching Reference Image 2 */}
      <Card className="rounded-3xl border-border/80 bg-card p-6 shadow-sm sm:p-8">
        <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Account & Profile Settings
        </CardTitle>
        <CardDescription className="mt-1 text-sm text-muted-foreground sm:text-base">
          Manage your personal information, delivery details, and avatar via ImgBB
        </CardDescription>
      </Card>

      {/* Main Profile Form Card */}
      <Card className="rounded-3xl border-border/80 bg-card p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSave} className="flex flex-col gap-8">
          {/* Header Profile Identity block */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Avatar Preview */}
            <div className="group relative size-24 shrink-0">
              <UserAvatar
                src={formValues.avatar || null}
                name={displayName}
                className="size-24 text-xl ring-4 ring-brand/80 shadow-md"
              />
              <label
                className={
                  isUploading
                    ? "absolute inset-0 flex cursor-wait items-center justify-center bg-black/60"
                    : "absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100"
                }
                aria-label="Upload profile photo"
              >
                {isUploading ? (
                  <Loader2 className="size-5 animate-spin text-white" />
                ) : (
                  <Upload className="size-5 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{formValues.email}</p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-brand-hover">
                  <Shield className="size-3" />
                  Admin Account
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="admin-full-name" className="text-xs font-bold text-foreground">
                Full Name
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-full-name"
                  value={formValues.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Admin"
                  required
                  className="h-11 rounded-xl pl-10 text-sm shadow-2xs"
                />
              </div>
            </div>

            {/* Email Address (login identity, tai read-only) */}
            <div className="space-y-2">
              <Label htmlFor="admin-email-address" className="text-xs font-bold text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-email-address"
                  type="email"
                  value={formValues.email}
                  readOnly
                  placeholder="admin@gmail.com"
                  className="h-11 rounded-xl bg-muted/40 pl-10 text-sm shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                This is your login email and cannot be changed here.
              </p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="admin-phone-number" className="text-xs font-bold text-foreground">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-phone-number"
                  type="tel"
                  value={formValues.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+880 1711 000000"
                  className="h-11 rounded-xl pl-10 text-sm shadow-2xs"
                />
              </div>
            </div>

            {/* Avatar Hosted URL */}
            <div className="space-y-2">
              <Label htmlFor="admin-avatar-url" className="text-xs font-bold text-foreground">
                Avatar Hosted URL
              </Label>
              <div className="relative">
                <LinkIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-avatar-url"
                  value={formValues.avatar}
                  onChange={(e) => handleChange("avatar", e.target.value)}
                  placeholder="https://i.ibb.co/…"
                  className="h-11 rounded-xl pl-10 text-sm shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Hosted automatically via ImgBB upon uploading above.
              </p>
            </div>

            {/* Delivery / Physical Address (Spans 2 columns) */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="admin-delivery-address" className="text-xs font-bold text-foreground">
                Delivery / Physical Address
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-delivery-address"
                  value={formValues.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Road, Area, District"
                  className="h-11 rounded-xl pl-10 text-sm shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving || isUploading}
              className="h-11 rounded-xl bg-brand px-6 text-sm font-bold text-neutral-900 shadow-md transition-all hover:bg-brand-hover hover:scale-105 active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
