// app/dashboard/owner/my-equipment/equipment-list.tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, Boxes, Eye, Package, Pencil, Plus } from "lucide-react"

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
          DialogClose,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
          Table,
          TableBody,
          TableCell,
          TableHead,
          TableHeader,
          TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import type { EquipmentListItem, EquipmentStatus } from "@/lib/types"
import { DeleteEquipmentDialog } from "@/app/_components/DeleteEquipmentDialog"
import UpdateEquipmentDialog from "@/app/_components/UpdateEquipmentDialog"

const categoryLabels: Record<string, string> = {
          agriculture: "Agriculture Equipment",
          cleaning: "Cleaning Equipment",
          construction: "Construction Equipment",
          electronics: "Electronics",
          events: "Event Equipment",
          photography: "Photography Equipment",
          vehicles: "Vehicles & Transportation",
}

const statusLabels: Record<EquipmentStatus, string> = {
          pending: "Pending",
          approved: "Approved",
          rejected: "Rejected",
}

const statusStyles: Record<EquipmentStatus, string> = {
          pending: "border-transparent bg-brand text-neutral-900",
          approved:
                    "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
          rejected: "border-transparent bg-destructive/10 text-destructive",
}

const brandButtonClass =
          "bg-brand text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"

// API theke `id` na ele `_id` ashte pare, tai duto-i handle kora hoyeche.
export type RawEquipment = EquipmentListItem & { _id?: string }

/**
 * Server theke asha data ke thik kore nei:
 * - id: _id -> index (kokhono undefined hobe na)
 * - rentalPrice / quantity: string e convert (API number dile o kaj korbe)
 */
function normalizeItems(raw: RawEquipment[]): EquipmentListItem[] {
          return raw.map((item, index) => ({
                    ...item,
                    id: String(item._id ?? `equipment-${index}`),
                    rentalPrice: String(item.rentalPrice ?? ""),
                    quantity: String(item.quantity ?? "0"),
          })) as EquipmentListItem[]
}

function getStatus(item: EquipmentListItem): EquipmentStatus {
          return item.status ?? "pending"
}

function formatPrice(price: string) {
          const value = Number(price)
          return Number.isNaN(value) ? price : value.toLocaleString("en-US")
}

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

export default function EquipmentList({
          initialItems,
}: {
          initialItems: EquipmentListItem[]
}) {
          const [items, setItems] = useState<EquipmentListItem[]>(() =>
                    normalizeItems(initialItems as RawEquipment[])
          )

          // router.refresh() er por server theke notun data ashle table sync hobe
          useEffect(() => {
                    setItems(normalizeItems(initialItems as RawEquipment[]))
          }, [initialItems])

          const [editItem, setEditItem] = useState<EquipmentListItem | null>(null)
          const [editValues, setEditValues] = useState({ rentalPrice: "", quantity: "" })
          const [editErrors, setEditErrors] = useState<{
                    rentalPrice?: string
                    quantity?: string
          }>({})

          const [viewItem, setViewItem] = useState<EquipmentListItem | null>(null)

          function openEdit(item: EquipmentListItem) {
                    setEditItem(item)
                    setEditValues({ rentalPrice: item.rentalPrice, quantity: item.quantity })
                    setEditErrors({})
          }

          function saveEdit(event: React.FormEvent) {
                    event.preventDefault()
                    if (!editItem) return

                    const nextErrors: { rentalPrice?: string; quantity?: string } = {}

                    if (
                              editValues.rentalPrice.trim() === "" ||
                              Number.isNaN(Number(editValues.rentalPrice)) ||
                              Number(editValues.rentalPrice) < 0
                    ) {
                              nextErrors.rentalPrice = "Enter a valid rental price"
                    }

                    if (
                              editValues.quantity.trim() === "" ||
                              !Number.isInteger(Number(editValues.quantity)) ||
                              Number(editValues.quantity) < 0
                    ) {
                              nextErrors.quantity = "Enter a whole number of units"
                    }

                    setEditErrors(nextErrors)
                    if (Object.keys(nextErrors).length > 0) return

                    setItems(
                              items.map((row) =>
                                        row.id === editItem.id
                                                  ? {
                                                            ...row,
                                                            rentalPrice: editValues.rentalPrice.trim(),
                                                            quantity: editValues.quantity.trim(),
                                                  }
                                                  : row
                              )
                    )

                    toast.add({
                              type: "success",
                              title: "Listing updated",
                              description: `Price and stock saved for ${editItem.name}.`,
                    })
                    setEditItem(null)
          }

          return (
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 sm:p-6">
                              <Link
                                        href="/dashboard/owner"
                                        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                              >
                                        <ArrowLeft className="size-4" />
                                        Back to My Equipment
                              </Link>

                              <Card className="rounded-2xl">
                                        <CardHeader>
                                                  <CardTitle className="flex items-center gap-2 text-lg">
                                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/20">
                                                                      <Boxes className="size-4 text-brand-hover" />
                                                            </span>
                                                            Your Equipment Listings ({items.length})
                                                  </CardTitle>
                                                  <CardDescription>
                                                            Update rental prices, stock inventory, and review admin approval
                                                            status.
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
                                                                                          Publish your first listing and it will appear here for admin
                                                                                          review.
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
                                                            <Table className="min-w-[860px]">
                                                                      <TableHeader>
                                                                                <TableRow>
                                                                                          <TableHead>Equipment Name</TableHead>
                                                                                          <TableHead>Category</TableHead>
                                                                                          <TableHead>Rental Price</TableHead>
                                                                                          <TableHead>Available Quantity</TableHead>
                                                                                          <TableHead>Status</TableHead>
                                                                                          <TableHead className="text-right">Actions</TableHead>
                                                                                </TableRow>
                                                                      </TableHeader>
                                                                      <TableBody>
                                                                                {items.map((item) => {
                                                                                          const status = getStatus(item)

                                                                                          return (
                                                                                                    <TableRow key={item.id}>
                                                                                                              <TableCell>
                                                                                                                        <div className="flex items-center gap-3">
                                                                                                                                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/20">
                                                                                                                                            <Package className="size-4 text-brand-hover" />
                                                                                                                                  </span>
                                                                                                                                  <div className="min-w-0">
                                                                                                                                            <p className="font-medium">{item.name}</p>
                                                                                                                                            <p className="max-w-[240px] truncate text-xs text-muted-foreground">
                                                                                                                                                      {item.location}
                                                                                                                                                      {item.brand ? ` · ${item.brand} ${item.model}` : ""}
                                                                                                                                            </p>
                                                                                                                                  </div>
                                                                                                                        </div>
                                                                                                              </TableCell>

                                                                                                              <TableCell>
                                                                                                                        <Badge variant="secondary">
                                                                                                                                  {categoryLabels[item.category] ?? item.category}
                                                                                                                        </Badge>
                                                                                                              </TableCell>

                                                                                                              <TableCell>
                                                                                                                        <span className="font-semibold text-brand-hover">
                                                                                                                                  ৳{formatPrice(item.rentalPrice)}
                                                                                                                        </span>
                                                                                                                        <span className="text-muted-foreground">
                                                                                                                                  {" "}
                                                                                                                                  / {item.rentalType}
                                                                                                                        </span>
                                                                                                              </TableCell>

                                                                                                              <TableCell
                                                                                                                        className={
                                                                                                                                  item.quantity === "0"
                                                                                                                                            ? "font-medium text-destructive"
                                                                                                                                            : undefined
                                                                                                                        }
                                                                                                              >
                                                                                                                        {item.quantity} units
                                                                                                              </TableCell>

                                                                                                              <TableCell>
                                                                                                                        <Badge variant="outline" className={statusStyles[status]}>
                                                                                                                                  {statusLabels[status]}
                                                                                                                        </Badge>
                                                                                                              </TableCell>

                                                                                                              <TableCell className="text-right">
                                                                                                                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                                                                                                               
                                                                                                                        <UpdateEquipmentDialog equipment={item} />

<DeleteEquipmentDialog equipment={item} />
                                                                                                                                  <Button
                                                                                                                                            variant="outline"
                                                                                                                                            size="sm"
                                                                                                                                            onClick={() => setViewItem(item)}
                                                                                                                                  >
                                                                                                                                            <Eye />
                                                                                                                                            View Details
                                                                                                                                  </Button>
                                                                                                                        </div>
                                                                                                              </TableCell>
                                                                                                    </TableRow>
                                                                                          )
                                                                                })}
                                                                      </TableBody>
                                                            </Table>
                                                  )}
                                        </CardContent>
                              </Card>

                              {/* ---------- Update dialog ---------- */}
                              <Dialog
                                        open={editItem !== null}
                                        onOpenChange={(open) => {
                                                  if (!open) setEditItem(null)
                                        }}
                              >
                                        {editItem && (
                                                  <DialogContent className="sm:max-w-md">
                                                            <DialogHeader>
                                                                      <DialogTitle>Update listing</DialogTitle>
                                                                      <DialogDescription>
                                                                                Change the rental price or the available stock for{" "}
                                                                                {editItem.name}.
                                                                      </DialogDescription>
                                                            </DialogHeader>

                                                            <form onSubmit={saveEdit} className="flex flex-col gap-4">
                                                                      <div className="flex flex-col gap-1.5">
                                                                                <Label htmlFor="edit-rental-price">Rental Price (৳)</Label>
                                                                                <Input
                                                                                          id="edit-rental-price"
                                                                                          inputMode="decimal"
                                                                                          value={editValues.rentalPrice}
                                                                                          onChange={(event) => {
                                                                                                    setEditValues({
                                                                                                              ...editValues,
                                                                                                              rentalPrice: event.target.value,
                                                                                                    })
                                                                                                    setEditErrors({ ...editErrors, rentalPrice: undefined })
                                                                                          }}
                                                                                />
                                                                                {editErrors.rentalPrice && (
                                                                                          <p className="text-xs text-destructive">
                                                                                                    {editErrors.rentalPrice}
                                                                                          </p>
                                                                                )}
                                                                      </div>

                                                                      <div className="flex flex-col gap-1.5">
                                                                                <Label htmlFor="edit-quantity">Available Quantity</Label>
                                                                                <Input
                                                                                          id="edit-quantity"
                                                                                          inputMode="numeric"
                                                                                          value={editValues.quantity}
                                                                                          onChange={(event) => {
                                                                                                    setEditValues({ ...editValues, quantity: event.target.value })
                                                                                                    setEditErrors({ ...editErrors, quantity: undefined })
                                                                                          }}
                                                                                />
                                                                                {editErrors.quantity && (
                                                                                          <p className="text-xs text-destructive">{editErrors.quantity}</p>
                                                                                )}
                                                                      </div>

{/* <DialogFooter>
<DialogClose render={<Button variant="outline" type="button" />}>
Cancel
</DialogClose>
<Button type="submit" className={brandButtonClass}>
Save changes
 </Button>
</DialogFooter> */}
                                                            </form>
</DialogContent>
                                        )}
                              </Dialog>

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
                                                                                {categoryLabels[viewItem.category] ?? viewItem.category} ·
                                                                                Listed by {viewItem.ownerEmail}
                                                                      </DialogDescription>
                                                            </DialogHeader>

                                                            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                                                      <DetailRow
                                                                                label="Status"
                                                                                value={
                                                                                          <Badge
                                                                                                    variant="outline"
                                                                                                    className={statusStyles[getStatus(viewItem)]}
                                                                                          >
                                                                                                    {statusLabels[getStatus(viewItem)]}
                                                                                          </Badge>
                                                                                }
                                                                      />
                                                                      <DetailRow
                                                                                label="Category"
                                                                                value={categoryLabels[viewItem.category] ?? viewItem.category}
                                                                      />
                                                                      <DetailRow
                                                                                label="Rental Price"
                                                                                value={
                                                                                          <>
                                                                                                    <span className="font-semibold text-brand-hover">
                                                                                                              ৳{formatPrice(viewItem.rentalPrice)}
                                                                                                    </span>
                                                                                                    <span className="text-muted-foreground">
                                                                                                              {" "}
                                                                                                              / {viewItem.rentalType}
                                                                                                    </span>
                                                                                          </>
                                                                                }
                                                                      />
                                                                      <DetailRow
                                                                                label="Available Quantity"
                                                                                value={
                                                                                          <span
                                                                                                    className={
                                                                                                              viewItem.quantity === "0"
                                                                                                                        ? "font-medium text-destructive"
                                                                                                                        : undefined
                                                                                                    }
                                                                                          >
                                                                                                    {viewItem.quantity} units
                                                                                          </span>
                                                                                }
                                                                      />
                                                                      <DetailRow label="Brand" value={viewItem.brand || "—"} />
                                                                      <DetailRow label="Model" value={viewItem.model || "—"} />
                                                                      <DetailRow label="Condition" value={viewItem.condition} />
                                                                      <DetailRow label="Location" value={viewItem.location} />
                                                                      <DetailRow
                                                                                label="Owner Email"
                                                                                value={viewItem.ownerEmail}
                                                                                className="sm:col-span-2"
                                                                      />
                                                                      <DetailRow
                                                                                label="Description"
                                                                                value={viewItem.description || "—"}
                                                                                className="sm:col-span-2"
                                                                      />
                                                                      <DetailRow
                                                                                label="Rental Terms"
                                                                                value={viewItem.terms || "—"}
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