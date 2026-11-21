"use client"

import { useEffect, useState } from "react"
import {
          Clock,
          Heart,
          MapPin,
          Package,
          ShieldCheck,
          User,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
          Card,
          CardContent,
          CardHeader,
          CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { addFavourite, removeFavourite } from "@/lib/api/favourites"
import type { EquipmentDocument } from "@/lib/types"
import {
          categoryLabels,
          firstImageFrom,
          formatPrice,
} from "@/app/browse-equipments/equipment-card"

type EquipmentInfoProps = {
          equipment: EquipmentDocument
          /** The signed-in viewer, used to save/unsave the favourite. */
          userEmail: string
}

/** One label + value block in the specs grid. */
function Spec({ label, value }: { label: string; value: string }) {
          return (
                    <div className="rounded-xl border bg-muted/40 p-3">
                              <p className="text-xs text-muted-foreground">{label}</p>
                              <p className="mt-0.5 text-sm font-medium">{value || "—"}</p>
                    </div>
          )
}

export function EquipmentInfo({ equipment, userEmail }: EquipmentInfoProps) {
          const id = String(equipment._id)
          const image = firstImageFrom(equipment.imageUrls)
          const quantity = Number(equipment.quantity) || 0
          const available = quantity > 0

          const [isFavourite, setIsFavourite] = useState(false)
          const [busy, setBusy] = useState(false)

          // Start out with the heart filled when this equipment is already saved.
          useEffect(() => {
                    if (!userEmail) return
                    let cancelled = false
                    fetch(
                              `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/favourites?userEmail=${encodeURIComponent(userEmail)}`,
                              { cache: "no-store" }
                    )
                              .then((res) => (res.ok ? res.json() : []))
                              .then((list: { equipmentId: string }[]) => {
                                        if (!cancelled && list.some((f) => f.equipmentId === id)) {
                                                  setIsFavourite(true)
                                        }
                              })
                              .catch(() => {})
                    return () => {
                              cancelled = true
                    }
          }, [id, userEmail])

          async function toggleFavourite() {
                    if (busy) return
                    setBusy(true)
                    try {
                              if (isFavourite) {
                                        await removeFavourite(id, userEmail)
                                        setIsFavourite(false)
                                        toast.add({
                                                  type: "success",
                                                  title: "Removed from favourites",
                                                  description: `${equipment.name} was removed from your favourites.`,
                                        })
                              } else {
                                        await addFavourite(id, userEmail)
                                        setIsFavourite(true)
                                        toast.add({
                                                  type: "success",
                                                  title: "Added to favourites",
                                                  description: `${equipment.name} was saved to your favourites.`,
                                        })
                              }
                    } catch {
                              toast.add({
                                        type: "error",
                                        title: "Could not update favourites",
                                        description: "Something went wrong. Please try again.",
                              })
                    } finally {
                              setBusy(false)
                    }
          }

          return (
                    <Card className="rounded-2xl">
                              {/* ---------- Image + heart ---------- */}
                              <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl bg-muted">
                                        {image ? (
                                                  // Remote URLs come from users, so a plain img is used.
                                                  // eslint-disable-next-line @next/next/no-img-element
                                                  <img
                                                            src={image}
                                                            alt={equipment.name || "Equipment"}
                                                            className="size-full object-cover"
                                                  />
                                        ) : (
                                                  <span className="flex size-full items-center justify-center text-muted-foreground">
                                                            <Package className="size-12" />
                                                  </span>
                                        )}

                                        <Badge
                                                  variant="outline"
                                                  className={
                                                            available
                                                                      ? "absolute left-3 top-3 border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                                                                      : "absolute left-3 top-3 border-transparent bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                                                  }
                                        >
                                                  {available ? "Available" : "Unavailable"}
                                        </Badge>

                                        <button
                                                  type="button"
                                                  aria-label={
                                                            isFavourite
                                                                      ? "Remove from favourites"
                                                                      : "Add to favourites"
                                                  }
                                                  aria-pressed={isFavourite}
                                                  disabled={busy}
                                                  onClick={toggleFavourite}
                                                  className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow ring-1 ring-black/5 transition-colors hover:text-red-500 disabled:opacity-60 dark:bg-neutral-900/90 dark:text-neutral-300"
                                        >
                                                  <Heart
                                                            className={
                                                                      isFavourite
                                                                                ? "size-5 fill-red-500 text-red-500"
                                                                                : "size-5"
                                                            }
                                                  />
                                        </button>
                              </div>

                              <CardHeader>
                                        <div className="flex flex-wrap items-center gap-2">
                                                  <Badge variant="secondary">
                                                            {categoryLabels[equipment.category ?? ""] ??
                                                                      equipment.category ??
                                                                      "Uncategorised"}
                                                  </Badge>
                                                  <Badge variant="outline">
                                                            <Clock className="size-3" />
                                                            {equipment.rentalType || "Daily"}
                                                  </Badge>
                                        </div>

                                        <CardTitle className="text-xl sm:text-2xl">
                                                  {equipment.name}
                                        </CardTitle>

                                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                  <MapPin className="size-4 shrink-0" />
                                                  {equipment.location || "Location not set"}
                                        </p>

                                        <p className="text-2xl font-bold text-brand-hover">
                                                  ৳{formatPrice(String(equipment.rentalPrice ?? ""))}
                                                  <span className="text-sm font-normal text-muted-foreground">
                                                            {" "}
                                                            / {equipment.rentalType || "Daily"}
                                                  </span>
                                        </p>
                              </CardHeader>

                              <CardContent className="flex flex-col gap-5">
                                        {/* ---------- Description ---------- */}
                                        <div className="flex flex-col gap-1.5">
                                                  <h3 className="text-sm font-semibold">Description</h3>
                                                  <p className="text-sm leading-relaxed text-muted-foreground">
                                                            {equipment.description ||
                                                                      "No description provided."}
                                                  </p>
                                        </div>

                                        {/* ---------- Specs ---------- */}
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                  <Spec
                                                            label="Rental Price"
                                                            value={`৳${formatPrice(
                                                                      String(equipment.rentalPrice ?? "")
                                                            )}`}
                                                  />
                                                  <Spec
                                                            label="Rental Type"
                                                            value={equipment.rentalType || "Daily"}
                                                  />
                                                  <Spec
                                                            label="Available Quantity"
                                                            value={`${quantity} unit(s)`}
                                                  />
                                                  <Spec label="Brand" value={equipment.brand || ""} />
                                                  <Spec label="Model" value={equipment.model || ""} />
                                                  <Spec
                                                            label="Condition"
                                                            value={equipment.condition || ""}
                                                  />
                                        </div>

                                        {/* ---------- Owner ---------- */}
                                        <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-4">
                                                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/20">
                                                            <User className="size-5 text-brand-hover" />
                                                  </span>
                                                  <div className="min-w-0">
                                                            <p className="text-xs text-muted-foreground">
                                                                      Listed by
                                                            </p>
                                                            <p className="truncate text-sm font-medium">
                                                                      {(equipment as { ownerName?: string })
                                                                                .ownerName ||
                                                                      equipment.ownerEmail ||
                                                                      "Unknown owner"}
                                                            </p>
                                                  </div>
                                        </div>

                                        {/* ---------- Terms ---------- */}
                                        <div className="flex flex-col gap-1.5 rounded-xl border border-brand/40 bg-brand/5 p-4">
                                                  <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                                                            <ShieldCheck className="size-4 text-brand-hover" />
                                                            Rental Terms &amp; Conditions
                                                  </h3>
                                                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                                                            {equipment.terms ||
                                                                      "Standard rental terms apply. A valid ID and contact number are required at pickup. Damage or late returns may incur extra charges."}
                                                  </p>
                                        </div>
                              </CardContent>
                    </Card>
          )
}
