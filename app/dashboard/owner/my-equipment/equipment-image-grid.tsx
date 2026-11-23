"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Boxes, Eye, Plus } from "lucide-react"

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
import type { EquipmentStatus } from "@/lib/types"

type RawEquipment = {
  _id?: string
  id?: string
  name?: string
  category?: string
  rentalPrice?: string | number
  rentalType?: string
  quantity?: string | number
  status?: EquipmentStatus
  ownerEmail?: string
  imageUrls?: string[] | string
  brand?: string
  model?: string
  condition?: string
  location?: string
  description?: string
}

type Equipment = {
  id: string
  name: string
  category: string
  rentalPrice: number
  rentalType: string
  quantity: number
  status: string
  image?: string
  brand: string
  model: string
  condition: string
  location: string
  description: string
}

function firstImage(imageUrls: unknown): string | undefined {
  if (Array.isArray(imageUrls) && typeof imageUrls[0] === "string") {
    return imageUrls[0]
  }
  if (typeof imageUrls === "string" && imageUrls.trim()) {
    return imageUrls.split("\n")[0].trim()
  }
  return undefined
}

function normalize(raw: RawEquipment[]): Equipment[] {
  return raw.map((item, i) => ({
    id: String(item._id ?? item.id ?? `eq-${i}`),
    name: String(item.name ?? "Untitled"),
    category: String(item.category ?? ""),
    rentalPrice: Number(item.rentalPrice ?? 0),
    rentalType: String(item.rentalType ?? "daily"),
    quantity: Number(item.quantity ?? 0),
    status: String(item.status ?? "pending"),
    image: firstImage(item.imageUrls),
    brand: String(item.brand ?? ""),
    model: String(item.model ?? ""),
    condition: String(item.condition ?? ""),
    location: String(item.location ?? ""),
    description: String(item.description ?? ""),
  }))
}

const statusStyles: Record<string, string> = {
  pending: "border-transparent bg-brand text-neutral-900",
  approved:
    "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  rejected: "border-transparent bg-destructive/10 text-destructive",
}

const brandButtonClass =
  "bg-brand text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"

export default function EquipmentImageGrid({
  equipments,
}: {
  equipments: RawEquipment[]
}) {
  const items = normalize(equipments)
  const [viewItem, setViewItem] = useState<Equipment | null>(null)

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
            My Equipment ({items.length})
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
          {items.length === 0 ? (
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
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setViewItem(item)}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand/60 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-sm text-neutral-500">
                        No Image
                      </div>
                    )}
                    {/* Status badge overlay */}
                    <div className="absolute right-2 top-2">
                      <Badge
                        variant="outline"
                        className={
                          statusStyles[item.status] ?? statusStyles.pending
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="truncate text-sm font-bold text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      ৳{item.rentalPrice.toLocaleString()} / {item.rentalType} •
                      Stock: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
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
                {viewItem.category} • {viewItem.location || "No location"}
              </DialogDescription>
            </DialogHeader>

            {viewItem.image && (
              <div className="overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={viewItem.image}
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
                    className={
                      statusStyles[viewItem.status] ?? statusStyles.pending
                    }
                  >
                    {viewItem.status}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Price</dt>
                <dd className="font-semibold text-brand-hover">
                  ৳{viewItem.rentalPrice.toLocaleString()} / {viewItem.rentalType}
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
