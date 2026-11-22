"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
          User,
          Mail,
          Phone,
          MapPin,
          Link as LinkIcon,
          Upload,
          Loader2,
} from "lucide-react"

import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { useSession } from "@/lib/auth-client"

const DEFAULT_AVATAR =
          "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80"

export default function CustomerProfileForm() {
          const { data: session } = useSession()

          const [formValues, setFormValues] = useState({
                    name: "",
                    email: "",
                    phone: "",
                    avatar: DEFAULT_AVATAR,
                    address: "",
          })

          const [isSaving, setIsSaving] = useState(false)

          // Session load hoye gele real user data form e boshiye dey
          useEffect(() => {
                    if (!session?.user) return
                    setFormValues((prev) => ({
                              ...prev,
                              name: session.user.name || prev.name,
                              email: session.user.email || prev.email,
                              avatar: session.user.image || prev.avatar,
                    }))
          }, [session])

          function handleChange(field: keyof typeof formValues, value: string) {
                    setFormValues((prev) => ({ ...prev, [field]: value }))
          }

          async function handleSave(e: React.FormEvent) {
                    e.preventDefault()
                    setIsSaving(true)

                    // TODO: ekhane real API call (update profile) boshao
                    await new Promise((r) => setTimeout(r, 600))
                    setIsSaving(false)

                    toast.add({
                              type: "success",
                              title: "Profile updated",
                              description: "Your profile and delivery details have been saved.",
                    })
          }

          function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
                    const file = e.target.files?.[0]
                    if (file) {
                              const tempUrl = URL.createObjectURL(file)
                              handleChange("avatar", tempUrl)
                              toast.add({
                                        type: "success",
                                        title: "Photo selected",
                                        description: "Preview ready. Click Save to apply.",
                              })
                    }
          }

          const displayName = formValues.name || "Your name"

          return (
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
                              {/* Header Card */}
                              <Card className="rounded-3xl border-border/80 bg-card p-6 shadow-sm sm:p-8">
                                        <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                                                  My Profile
                                        </CardTitle>
                                        <CardDescription className="mt-1 text-sm text-muted-foreground sm:text-base">
                                                  Update your personal information, delivery address, and profile photo
                                        </CardDescription>
                              </Card>

                              {/* Main Profile Form Card */}
                              <Card className="rounded-3xl border-border/80 bg-card p-6 shadow-sm sm:p-8">
                                        <form onSubmit={handleSave} className="flex flex-col gap-8">
                                                  {/* Profile identity block */}
                                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                                            <div className="group relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-brand/80 shadow-md">
                                                                      <Image
                                                                                src={formValues.avatar || DEFAULT_AVATAR}
                                                                                alt={displayName}
                                                                                fill
                                                                                sizes="96px"
                                                                                className="object-cover"
                                                                                unoptimized
                                                                      />
                                                                      <label
                                                                                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100"
                                                                                aria-label="Upload profile photo"
                                                                      >
                                                                                <Upload className="size-5 text-white" />
                                                                                <input
                                                                                          type="file"
                                                                                          accept="image/*"
                                                                                          onChange={handleImageUpload}
                                                                                          className="sr-only"
                                                                                />
                                                                      </label>
                                                            </div>

                                                            <div className="space-y-1">
                                                                      <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
                                                                      <p className="text-sm text-muted-foreground">{formValues.email}</p>
                                                                      <div className="pt-1">
                                                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-3 py-0.5 text-xs font-bold text-brand-hover">
                                                                                          <User className="size-3" />
                                                                                          Customer
                                                                                </span>
                                                                      </div>
                                                            </div>
                                                  </div>

                                                  {/* Form Fields Grid */}
                                                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                            {/* Full Name */}
                                                            <div className="space-y-2">
                                                                      <Label htmlFor="customer-full-name" className="text-xs font-bold text-foreground">
                                                                                Full Name
                                                                      </Label>
                                                                      <div className="relative">
                                                                                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                                                <Input
                                                                                          id="customer-full-name"
                                                                                          value={formValues.name}
                                                                                          onChange={(e) => handleChange("name", e.target.value)}
                                                                                          placeholder="Your full name"
                                                                                          required
                                                                                          className="h-11 rounded-xl pl-10 text-sm shadow-2xs"
                                                                                />
                                                                      </div>
                                                            </div>

                                                            {/* Email (login identity, tai read-only) */}
                                                            <div className="space-y-2">
                                                                      <Label htmlFor="customer-email-address" className="text-xs font-bold text-foreground">
                                                                                Email Address
                                                                      </Label>
                                                                      <div className="relative">
                                                                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                                                <Input
                                                                                          id="customer-email-address"
                                                                                          type="email"
                                                                                          value={formValues.email}
                                                                                          readOnly
                                                                                          className="h-11 rounded-xl bg-muted/40 pl-10 text-sm shadow-2xs"
                                                                                />
                                                                      </div>
                                                                      <p className="text-[11px] text-muted-foreground">
                                                                                This is your login email and can't be changed here.
                                                                      </p>
                                                            </div>

                                                            {/* Phone Number */}
                                                            <div className="space-y-2">
                                                                      <Label htmlFor="customer-phone-number" className="text-xs font-bold text-foreground">
                                                                                Phone Number
                                                                      </Label>
                                                                      <div className="relative">
                                                                                <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                                                <Input
                                                                                          id="customer-phone-number"
                                                                                          type="tel"
                                                                                          value={formValues.phone}
                                                                                          onChange={(e) => handleChange("phone", e.target.value)}
                                                                                          placeholder="+880 1XXX XXXXXX"
                                                                                          className="h-11 rounded-xl pl-10 text-sm shadow-2xs"
                                                                                />
                                                                      </div>
                                                                      <p className="text-[11px] text-muted-foreground">
                                                                                Our delivery partner may call this number.
                                                                      </p>
                                                            </div>

                                                            {/* Avatar URL */}
                                                            <div className="space-y-2">
                                                                      <Label htmlFor="customer-avatar-url" className="text-xs font-bold text-foreground">
                                                                                Profile Photo URL
                                                                      </Label>
                                                                      <div className="relative">
                                                                                <LinkIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                                                <Input
                                                                                          id="customer-avatar-url"
                                                                                          value={formValues.avatar}
                                                                                          onChange={(e) => handleChange("avatar", e.target.value)}
                                                                                          placeholder="https://..."
                                                                                          className="h-11 rounded-xl pl-10 text-sm shadow-2xs"
                                                                                />
                                                                      </div>
                                                                      <p className="text-[11px] text-muted-foreground">
                                                                                Upload a photo above and the link is filled in for you.
                                                                      </p>
                                                            </div>

                                                            {/* Delivery Address (spans 2 columns) */}
                                                            <div className="space-y-2 md:col-span-2">
                                                                      <Label htmlFor="customer-delivery-address" className="text-xs font-bold text-foreground">
                                                                                Delivery Address
                                                                      </Label>
                                                                      <div className="relative">
                                                                                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                                                <Input
                                                                                          id="customer-delivery-address"
                                                                                          value={formValues.address}
                                                                                          onChange={(e) => handleChange("address", e.target.value)}
                                                                                          placeholder="House, Road, Area, District"
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
                                                                                          Saving...
                                                                                </>
                                                                      ) : (
                                                                                "Save Changes"
                                                                      )}
                                                            </Button>
                                                  </div>
                                        </form>
                              </Card>
                    </div>
          )
}