"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Boxes, MapPin, Package, Pencil, Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import UpdateEquipmentDialog from "@/app/_components/UpdateEquipmentDialog"
import { DeleteEquipmentDialog } from "@/app/_components/DeleteEquipmentDialog"
import {
  categoryLabels,
  formatPrice,
  firstImageFrom,
} from "@/app/browse-equipments/equipment-card"
import type { OwnerEquipment } from "@/lib/data/owner"

const brandButtonClass =
  "bg-brand text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"

const statusStyles: Record<string, string> = {
  pending: "border-transparent bg-brand text-neutral-900",
  approved:
    "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  rejected: "border-transparent bg-destructive/10 text-destructive",
}

/** Round icon button styling shared by the card actions. */
const cardIconButtonClass =
  "absolute right-2 top-2 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow ring-1 ring-black/5 transition-all duration-200 hover:scale-110 dark:bg-neutral-900/90 dark:text-neutral-300"

export default function EquipmentImageGrid({
  equipments,
}: {
  equipments: OwnerEquipment[]
}) {
  const [viewItem, setViewItem] = useState<OwnerEquipment | null>(null)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 sm:p-6">
      <Link
        href="/dashboard/owner"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/20">
              <Boxes className="size-4 text-brand-hover" />
            </span>
            My Equipment ({equipments.length})
          </CardTitle>
          <CardDescription>
            Browse your listed equipment at a glance.
          </CardDescription>
          <CardAction>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/owner/add-equipment" />}
              className={`gap-2 ${brandButtonClass}`}
            >
              <Plus />
              Add Equipment
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          {equipments.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No equipment yet</EmptyTitle>
                <EmptyDescription>
                  Publish your first listing and it will appear here.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  nativeButton={false}
                  render={<Link href="/dashboard/owner/add-equipment" />}
                  className={`gap-2 ${brandButtonClass}`}
                >
                  <Plus />
                  Add Equipment
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {equipments.map((item) => {
                const image = firstImageFrom(item.imageUrls)
                const available = Number(item.quantity) > 0

                return (
                  <div
                    key={item.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 ease-out hover:z-10 hover:scale-[1.03] hover:border-brand hover:shadow-xl"
                  >
                    {/* ---------- Image + badges ---------- */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {image ? (
                        // Remote URLs come from users, so a plain img is used.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={item.name}
                          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
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

                      <Badge
                        variant="outline"
                        className={`absolute bottom-2 left-2 capitalize ${statusStyles[item.status ?? "pending"] ?? statusStyles.pending}`}
                      >
                        {item.status}
                      </Badge>

                      {/* Owner actions */}
                      <UpdateEquipmentDialog
                        equipment={item}
                        trigger={
                          <button
                            type="button"
                            aria-label={`Update ${item.name}`}
                            className={`${cardIconButtonClass} hover:text-blue-500`}
                          >
                            <Pencil className="size-4" />
                          </button>
                        }
                      />
                      <DeleteEquipmentDialog
                        equipment={item}
                        trigger={
                          <button
                            type="button"
                            aria-label={`Delete ${item.name}`}
                            className={`${cardIconButtonClass} right-11 hover:text-red-500`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        }
                      />
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
                        className="mt-auto w-full cursor-pointer"
                        onClick={() => setViewItem(item)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

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
              <DialogTitle>{viewItem.name}</DialogTitle>
              <DialogDescription>
                {categoryLabels[viewItem.category] ?? viewItem.category} •{" "}
                {viewItem.location || "No location"}
              </DialogDescription>
            </DialogHeader>

            {firstImageFrom(viewItem.imageUrls) && (
              <div className="overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={firstImageFrom(viewItem.imageUrls)}
                  alt={viewItem.name}
                  className="w-full object-cover"
                />
              </div>
            )}

            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd>
                  <Badge
                    variant="outline"
                    className={`capitalize ${statusStyles[viewItem.status ?? "pending"] ?? statusStyles.pending}`}
                  >
                    {viewItem.status}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Price</dt>
                <dd className="font-semibold text-brand-hover">
                  ৳{formatPrice(viewItem.rentalPrice)} / {viewItem.rentalType}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Stock</dt>
                <dd>{viewItem.quantity} units</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Condition</dt>
                <dd>{viewItem.condition || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Brand</dt>
                <dd>{viewItem.brand || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Model</dt>
                <dd>{viewItem.model || "—"}</dd>
              </div>
              {viewItem.description && (
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Description</dt>
                  <dd className="text-xs">{viewItem.description}</dd>
                </div>
              )}
            </dl>

            <DialogFooter showCloseButton />
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
