"use client"

import { Heart, MapPin, Package } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { EquipmentListItem } from "@/lib/types"

/** Category key -> label. Same list as the Add Equipment form. */
export const categoryLabels: Record<string, string> = {
          agriculture: "Agriculture Equipment",
          cleaning: "Cleaning Equipment",
          construction: "Construction Equipment",
          electronics: "Electronics",
          events: "Event Equipment",
          photography: "Photography Equipment",
          vehicles: "Vehicles & Transportation",
}

/** 100 -> "100", invalid -> the raw value. */
export function formatPrice(price: string) {
          const value = Number(price)
          return Number.isNaN(value) ? price : value.toLocaleString("en-US")
}

/** The image is stored as an array or as one plain string. */
export function firstImageFrom(
          urls: EquipmentListItem["imageUrls"] | string[] | undefined
): string {
          if (Array.isArray(urls)) return urls[0] ?? ""
          return urls ?? ""
}

/** The image is stored as an array or as one plain string. */
function firstImage(item: EquipmentListItem): string {
          return firstImageFrom(item.imageUrls)
}

type EquipmentCardProps = {
          item: EquipmentListItem
          isFavourite: boolean
          onToggleFavourite: (item: EquipmentListItem) => void
          onView: (item: EquipmentListItem) => void
}

export function EquipmentCard({
          item,
          isFavourite,
          onToggleFavourite,
          onView,
}: EquipmentCardProps) {
          const image = firstImage(item)
          const available = Number(item.quantity) > 0

          return (
                    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
                              {/* ---------- Image + badges ---------- */}
                              <div className="relative aspect-[4/3] bg-muted">
                                        {image ? (
                                                  // Remote URLs come from users, so a plain img is used.
                                                  // eslint-disable-next-line @next/next/no-img-element
                                                  <img
                                                            src={image}
                                                            alt={item.name}
                                                            className="size-full object-cover"
                                                  />
                                        ) : (
                                                  <span className="flex size-full items-center justify-center text-muted-foreground">
                                                            <Package className="size-10" />
                                                  </span>
                                        )}

                                        <Badge
                                                  variant="outline"
                                                  className={
                                                            available
                                                                      ? "absolute left-2 top-2 border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                                                                      : "absolute left-2 top-2 border-transparent bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
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
                                                  onClick={() => onToggleFavourite(item)}
                                                  className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow ring-1 ring-black/5 transition-colors hover:text-red-500 dark:bg-neutral-900/90 dark:text-neutral-300"
                                        >
                                                  <Heart
                                                            className={
                                                                      isFavourite
                                                                                ? "size-4 fill-red-500 text-red-500"
                                                                                : "size-4"
                                                            }
                                                  />
                                        </button>
                              </div>

                              {/* ---------- Details ---------- */}
                              <div className="flex flex-1 flex-col gap-3 p-4">
                                        <div className="flex flex-col gap-1.5">
                                                  <h3 className="line-clamp-1 font-semibold">
                                                            {item.name}
                                                  </h3>
                                                  <Badge variant="secondary" className="w-fit">
                                                            {categoryLabels[item.category] ?? item.category}
                                                  </Badge>
                                        </div>

                                        <p className="text-lg font-bold text-brand-hover">
                                                  ৳{formatPrice(item.rentalPrice)}
                                                  <span className="text-sm font-normal text-muted-foreground">
                                                            {" "}
                                                            / {item.rentalType}
                                                  </span>
                                        </p>

                                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                  <MapPin className="size-4 shrink-0" />
                                                  <span className="truncate">{item.location}</span>
                                        </p>

                                        <Button
                                                  variant="outline"
                                                  className="mt-auto w-full"
                                                  onClick={() => onView(item)}
                                        >
                                                  View Details
                                        </Button>
                              </div>
                    </div>
          )
}
