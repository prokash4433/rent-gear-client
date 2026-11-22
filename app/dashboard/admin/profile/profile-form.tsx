"use client"

import { useState } from "react"
import Image from "next/image"
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
import { useSession } from "@/lib/auth-client"

export default function AdminProfileForm() {
  const { data: session } = useSession()

  const [formValues, setFormValues] = useState({
    name: session?.user?.name || "Admin",
    email: session?.user?.email || "admin@gmail.com",
    phone: "+880 1711 000000",
    avatar:
      session?.user?.image ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    address: "House 42, Road 11, Sector 4, Uttara, Dhaka",
  })

  const [isSaving, setIsSaving] = useState(false)

  function handleChange(field: keyof typeof formValues, value: string) {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    // Simulate saving
    await new Promise((r) => setTimeout(r, 600))
    setIsSaving(false)

    toast.add({
      type: "success",
      title: "Profile updated",
      description: "Admin account settings have been saved successfully.",
    })
  }

  function handleImageUploadSimulate(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const tempUrl = URL.createObjectURL(file)
      handleChange("avatar", tempUrl)
      toast.add({
        type: "success",
        title: "Avatar selected",
        description: "New profile photo preview ready. Click Save to apply.",
      })
    }
  }

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
            <div className="group relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-brand/80 shadow-md">
              <Image
                src={formValues.avatar}
                alt={formValues.name}
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Upload className="size-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadSimulate}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">{formValues.name}</h2>
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
                  className="h-11 rounded-xl pl-10 text-sm shadow-2xs"
                />
              </div>
            </div>

            {/* Email Address */}
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
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="admin@gmail.com"
                  className="h-11 rounded-xl pl-10 text-sm shadow-2xs"
                />
              </div>
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
                  placeholder="https://images.unsplash.com/..."
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
              disabled={isSaving}
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
