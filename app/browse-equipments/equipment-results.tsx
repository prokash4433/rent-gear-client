"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
          Dialog,
          DialogContent,
          DialogDescription,
          DialogFooter,
          DialogHeader,
          DialogTitle,
} from "@/components/ui/dialog"
import {
          Empty,
          EmptyContent,
          EmptyDescription,
          EmptyHeader,
          EmptyTitle,
} from "@/components/ui/empty"
import { toast } from "@/components/ui/toast"
import { addFavourite, getFavourites, removeFavourite } from "@/lib/api/favourites"
import { useSession } from "@/lib/auth-client"
import type { EquipmentListItem } from "@/lib/types"
import { categoryLabels, EquipmentCard, formatPrice } from "./equipment-card"

/** How many cards one page shows (matches "Showing 1-9 of 11"). */
const pageSize = 9

function DetailRow({
          label,
          value,
          className,
}: {
          label: string
          value: React.ReactNode
          className?: string
}) {
          return (
                    <div className={className}>
                              <dt className="text-xs text-muted-foreground">{label}</dt>
                              <dd className="text-sm">{value}</dd>
                    </div>
          )
}

export function EquipmentResults({
          items,
          onFavouriteRemoved,
}: {
          items: EquipmentListItem[]
          /** Called after a heart is toggled off (used by My Favorites). */
          onFavouriteRemoved?: (equipmentId: string) => void
}) {
          const router = useRouter()
          const { data: session } = useSession()
          const email = session?.user?.email ?? ""

          const [page, setPage] = useState(1)
          const [favouriteIds, setFavouriteIds] = useState<string[]>([])
          const [viewItem, setViewItem] = useState<EquipmentListItem | null>(null)

          // The signed-in user's favourites, so the hearts start out filled.
          useEffect(() => {
                    if (!email) return
                    let cancelled = false
                    getFavourites(email)
                              .then((list) => {
                                        if (!cancelled) {
                                                  setFavouriteIds(list.map((f) => f.equipmentId))
                                        }
                              })
                              .catch(() => {})
                    return () => {
                              cancelled = true
                    }
          }, [email])

          const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
          // Keep the page inside the range when the result count shrinks.
          const currentPage = Math.min(page, totalPages)
          const start = items.length === 0 ? 0 : (currentPage - 1) * pageSize
          const visible = items.slice(start, start + pageSize)

          async function toggleFavourite(item: EquipmentListItem) {
                    if (!email) {
                              toast.add({
                                        type: "error",
                                        title: "Sign in required",
                                        description:
                                                  "Please sign in to save equipment to your favourites.",
                              })
                              return
                    }

                    const isFavourite = favouriteIds.includes(item.id)
                    try {
                              if (isFavourite) {
                                        await removeFavourite(item.id, email)
                                        setFavouriteIds((ids) => ids.filter((id) => id !== item.id))
                                        onFavouriteRemoved?.(item.id)
                                        toast.add({
                                                  type: "success",
                                                  title: "Removed from favourites",
                                                  description: `${item.name} was removed from your favourites.`,
                                        })
                              } else {
                                        await addFavourite(item.id, email)
                                        setFavouriteIds((ids) => [...ids, item.id])
                                        toast.add({
                                                  type: "success",
                                                  title: "Added to favourites",
                                                  description: `${item.name} was saved to your favourites.`,
                                        })
                              }
                    } catch {
                              toast.add({
                                        type: "error",
                                        title: "Could not update favourites",
                                        description: "Something went wrong. Please try again.",
                              })
                    }
          }

          if (items.length === 0) {
                    return (
                              <Empty>
                                        <EmptyHeader>
                                                  <EmptyTitle>No equipment found</EmptyTitle>
                                                  <EmptyDescription>
                                                            Try changing your search or filters to
                                                            find what you need.
                                                  </EmptyDescription>
                                        </EmptyHeader>
                                        <EmptyContent>
                                                  <Button
                                                            onClick={() =>
                                                                      router.replace(
                                                                                "/browse-equipments"
                                                                      )
                                                            }
                                                            className="bg-brand text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"
                                                  >
                                                            Clear all filters
                                                  </Button>
                                        </EmptyContent>
                              </Empty>
                    )
          }

          return (
                    <div className="flex flex-col gap-4">
                              <p className="text-sm text-muted-foreground">
                                        Showing {start + 1}-{start + visible.length} of{" "}
                                        {items.length} equipment
                              </p>

                              {/* ---------- Card grid ---------- */}
                              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                        {visible.map((item) => (
                                                  <EquipmentCard
                                                            key={item.id}
                                                            item={item}
                                                            isFavourite={favouriteIds.includes(
                                                                      item.id
                                                            )}
                                                            onToggleFavourite={toggleFavourite}
                                                            onView={setViewItem}
                                                  />
                                        ))}
                              </div>

                              {/* ---------- Pagination ---------- */}
                              {totalPages > 1 && (
                                        <nav
                                                  aria-label="Pagination"
                                                  className="flex items-center justify-center gap-1"
                                        >
                                                  <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={currentPage === 1}
                                                            onClick={() =>
                                                                      setPage(currentPage - 1)
                                                            }
                                                  >
                                                            <ChevronLeft className="size-4" />
                                                            Prev
                                                  </Button>

                                                  {Array.from(
                                                            { length: totalPages },
                                                            (_, index) => index + 1
                                                  ).map((pageNumber) => (
                                                            <Button
                                                                      key={pageNumber}
                                                                      size="sm"
                                                                      variant={
                                                                                pageNumber ===
                                                                                currentPage
                                                                                          ? "default"
                                                                                          : "outline"
                                                                      }
                                                                      className={
                                                                                pageNumber ===
                                                                                currentPage
                                                                                          ? "bg-brand text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"
                                                                                          : undefined
                                                                      }
                                                                      onClick={() =>
                                                                                setPage(
                                                                                          pageNumber
                                                                                )
                                                                      }
                                                            >
                                                                      {pageNumber}
                                                            </Button>
                                                  ))}

                                                  <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={currentPage === totalPages}
                                                            onClick={() =>
                                                                      setPage(currentPage + 1)
                                                            }
                                                  >
                                                            Next
                                                            <ChevronRight className="size-4" />
                                                  </Button>
                                        </nav>
                              )}

                              {/* ---------- View Details dialog ---------- */}
                              <Dialog
                                        open={viewItem !== null}
                                        onOpenChange={(open) => {
                                                  if (!open) setViewItem(null)
                                        }}
                              >
                                        {viewItem && (
                                                  <DialogContent className="sm:max-w-lg">
                                                            <DialogHeader>
                                                                      <DialogTitle>
                                                                                {viewItem.name}
                                                                      </DialogTitle>
                                                                      <DialogDescription>
                                                                                {categoryLabels[
                                                                                          viewItem
                                                                                                    .category
                                                                                ] ??
                                                                                          viewItem.category}{" "}
                                                                                ·{" "}
                                                                                {viewItem.location}
                                                                      </DialogDescription>
                                                            </DialogHeader>

                                                            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                                                      <DetailRow
                                                                                label="Rental Price"
                                                                                value={
                                                                                          <>
                                                                                                    <span className="font-semibold text-brand-hover">
                                                                                                              ৳
                                                                                                              {formatPrice(
                                                                                                                        viewItem.rentalPrice
                                                                                                              )}
                                                                                                    </span>
                                                                                                    <span className="text-muted-foreground">
                                                                                                              {" "}
                                                                                                              /{" "}
                                                                                                              {viewItem.rentalType}
                                                                                                    </span>
                                                                                          </>
                                                                                }
                                                                      />
                                                                      <DetailRow
                                                                                label="Availability"
                                                                                value={
                                                                                          Number(
                                                                                                    viewItem.quantity
                                                                                          ) > 0 ? (
                                                                                                    <span className="text-emerald-600 dark:text-emerald-400">
                                                                                                              Available
                                                                                                    </span>
                                                                                          ) : (
                                                                                                    <span className="text-destructive">
                                                                                                              Unavailable
                                                                                                    </span>
                                                                                          )
                                                                                }
                                                                      />
                                                                      <DetailRow
                                                                                label="Location"
                                                                                value={
                                                                                          viewItem.location
                                                                                }
                                                                      />
                                                                      <DetailRow
                                                                                label="Category"
                                                                                value={
                                                                                          categoryLabels[
                                                                                                    viewItem
                                                                                                              .category
                                                                                          ] ??
                                                                                          viewItem.category
                                                                                }
                                                                      />
                                                                      <DetailRow
                                                                                label="Brand"
                                                                                value={
                                                                                          viewItem.brand ||
                                                                                          "—"
                                                                                }
                                                                      />
                                                                      <DetailRow
                                                                                label="Model"
                                                                                value={
                                                                                          viewItem.model ||
                                                                                          "—"
                                                                                }
                                                                      />
                                                                      <DetailRow
                                                                                label="Condition"
                                                                                value={
                                                                                          viewItem.condition ||
                                                                                          "—"
                                                                                }
                                                                      />
                                                                      <DetailRow
                                                                                label="Available Quantity"
                                                                                value={`${viewItem.quantity} units`}
                                                                      />
                                                                      <DetailRow
                                                                                label="Description"
                                                                                value={
                                                                                          viewItem.description ||
                                                                                          "—"
                                                                                }
                                                                                className="sm:col-span-2"
                                                                      />
                                                                      <DetailRow
                                                                                label="Rental Terms"
                                                                                value={
                                                                                          viewItem.terms ||
                                                                                          "—"
                                                                                }
                                                                                className="sm:col-span-2"
                                                                      />
                                                            </dl>

                                                            <DialogFooter showCloseButton />
                                                  </DialogContent>
                                        )}
                              </Dialog>
                    </div>
          )
}
