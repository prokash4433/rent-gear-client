"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Boxes,
  Check,
  Eye,
  MapPin,
  Pencil,
  Search,
  Trash2,
  X,
  PackageCheck,
  PackageX,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import {
  updateEquipmentStatus,
  deleteEquipment,
  updateEquipment,
} from "@/lib/actions/equipments"
import type { EquipmentListItem, EquipmentStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

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

const statusBadgeClasses: Record<EquipmentStatus, string> = {
  pending:
    "border-amber-500/25 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  approved:
    "border-emerald-500/25 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
  rejected:
    "border-rose-500/25 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30",
}

function formatPrice(price: string) {
  const value = Number(price)
  return Number.isNaN(value) ? price : value.toLocaleString("en-US")
}

function getFirstImageUrl(imageUrls?: string | string[]): string | null {
  if (!imageUrls) return null
  if (Array.isArray(imageUrls)) {
    return imageUrls[0] ?? null
  }
  const lines = imageUrls.split("\n").map((l) => l.trim()).filter(Boolean)
  return lines[0] ?? null
}

export default function AdminEquipmentsTable({
  initialItems,
}: {
  initialItems: EquipmentListItem[]
}) {
  const [items, setItems] = useState<EquipmentListItem[]>(initialItems)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | EquipmentStatus>("all")
  const [, startTransition] = useTransition()

  // Modals state
  const [viewItem, setViewItem] = useState<EquipmentListItem | null>(null)
  const [editItem, setEditItem] = useState<EquipmentListItem | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    rentalPrice: "",
    quantity: "",
    location: "",
    condition: "",
  })
  const [deleteCandidate, setDeleteCandidate] = useState<EquipmentListItem | null>(null)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  // Status counts
  const totalCount = items.length
  const pendingCount = items.filter((i) => (i.status ?? "pending") === "pending").length
  const approvedCount = items.filter((i) => i.status === "approved").length
  const rejectedCount = items.filter((i) => i.status === "rejected").length

  // Filtered equipment list
  const filteredItems = items.filter((item) => {
    const itemStatus = item.status ?? "pending"
    const matchesStatus = statusFilter === "all" || itemStatus === statusFilter
    const q = searchQuery.toLowerCase().trim()
    const matchesQuery =
      q === "" ||
      item.name.toLowerCase().includes(q) ||
      (categoryLabels[item.category] ?? item.category).toLowerCase().includes(q) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.brand && item.brand.toLowerCase().includes(q)) ||
      (item.model && item.model.toLowerCase().includes(q)) ||
      (item.ownerEmail && item.ownerEmail.toLowerCase().includes(q))

    return matchesStatus && matchesQuery
  })

  // Action: Approve or Reject
  async function handleStatusChange(item: EquipmentListItem, newStatus: EquipmentStatus) {
    setActionInProgress(item.id)
    startTransition(async () => {
      try {
        const res = await updateEquipmentStatus(item.id, newStatus)
        if (res.success) {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
          )
          toast.add({
            type: "success",
            title: `Listing ${newStatus}`,
            description: `${item.name} has been marked as ${newStatus}.`,
          })
        } else {
          toast.add({
            type: "error",
            title: "Update failed",
            description: "Could not update status. Please try again.",
          })
        }
      } catch {
        toast.add({
          type: "error",
          title: "Error",
          description: "An unexpected error occurred.",
        })
      } finally {
        setActionInProgress(null)
      }
    })
  }

  // Action: Delete
  async function handleDelete() {
    if (!deleteCandidate) return
    const target = deleteCandidate

    setActionInProgress(target.id)
    startTransition(async () => {
      try {
        const res = await deleteEquipment(target.id)
        if (res.acknowledged) {
          setItems((prev) => prev.filter((i) => i.id !== target.id))
          toast.add({
            type: "success",
            title: "Equipment removed",
            description: `${target.name} was permanently deleted.`,
          })
          setDeleteCandidate(null)
        }
      } catch {
        toast.add({
          type: "error",
          title: "Delete failed",
          description: "Could not delete this equipment listing.",
        })
      } finally {
        setActionInProgress(null)
      }
    })
  }

  // Action: Open Edit Modal
  function openEditModal(item: EquipmentListItem) {
    setEditItem(item)
    setEditForm({
      name: item.name,
      rentalPrice: item.rentalPrice,
      quantity: item.quantity,
      location: item.location || "",
      condition: item.condition || "Good",
    })
  }

  // Action: Save Edit
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editItem) return

    if (!editForm.name.trim()) {
      toast.add({ type: "error", title: "Name required", description: "Equipment name cannot be empty." })
      return
    }
    if (
      editForm.rentalPrice.trim() === "" ||
      Number.isNaN(Number(editForm.rentalPrice)) ||
      Number(editForm.rentalPrice) < 0
    ) {
      toast.add({ type: "error", title: "Invalid price", description: "Please enter a valid rental price." })
      return
    }
    if (
      editForm.quantity.trim() === "" ||
      !Number.isInteger(Number(editForm.quantity)) ||
      Number(editForm.quantity) < 0
    ) {
      toast.add({ type: "error", title: "Invalid quantity", description: "Please enter a whole number of units." })
      return
    }

    setActionInProgress(editItem.id)
    startTransition(async () => {
      try {
        await updateEquipment(editItem.id, {
          name: editForm.name.trim(),
          rentalPrice: editForm.rentalPrice.trim(),
          quantity: editForm.quantity.trim(),
          location: editForm.location.trim(),
          condition: editForm.condition,
        })

        setItems((prev) =>
          prev.map((i) =>
            i.id === editItem.id
              ? {
                  ...i,
                  name: editForm.name.trim(),
                  rentalPrice: editForm.rentalPrice.trim(),
                  quantity: editForm.quantity.trim(),
                  location: editForm.location.trim(),
                  condition: editForm.condition,
                }
              : i
          )
        )

        toast.add({
          type: "success",
          title: "Equipment updated",
          description: `Modifications saved for ${editForm.name}.`,
        })
        setEditItem(null)
      } catch {
        toast.add({
          type: "error",
          title: "Update failed",
          description: "Could not save changes.",
        })
      } finally {
        setActionInProgress(null)
      }
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      {/* Top back link */}
      <div>
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Admin Overview
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="rounded-2xl border-border/70 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Listings</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand/20 text-brand-hover">
              <Boxes className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{totalCount}</p>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pending Review</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{pendingCount}</p>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Approved</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <PackageCheck className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{approvedCount}</p>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Rejected</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <PackageX className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{rejectedCount}</p>
        </Card>
      </div>

      {/* Main Catalog Card */}
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm">
        {/* Header with Title and Filter Tabs */}
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <span>Platform Equipment Catalog ({totalCount})</span>
              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Sparkles className="size-3" />
                  {pendingCount} Pending
                </span>
              )}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              Review owner submissions, grant public approval, or reject invalid machinery listings
            </CardDescription>
          </div>

          {/* Filter Pills matching the reference image */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                statusFilter === "all"
                  ? "bg-brand font-bold text-neutral-900 shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                statusFilter === "pending"
                  ? "bg-brand font-bold text-neutral-900 shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("approved")}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                statusFilter === "approved"
                  ? "bg-brand font-bold text-neutral-900 shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Approved ({approvedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("rejected")}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                statusFilter === "rejected"
                  ? "bg-brand font-bold text-neutral-900 shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Rejected ({rejectedCount})
            </button>
          </div>
        </CardHeader>

        {/* Search bar matching reference mockup */}
        <div className="border-b border-border/50 bg-muted/10 p-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by equipment name, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-xl pl-10 text-sm shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Equipment Table */}
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Boxes className="size-6" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-foreground">No equipment listings found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery
                  ? "No machinery matched your search criteria."
                  : "No listings under this approval status."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[980px]">
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-[300px]">Equipment</TableHead>
                    <TableHead className="w-[170px]">Category</TableHead>
                    <TableHead className="w-[180px]">Owner</TableHead>
                    <TableHead className="w-[150px]">Rental Rate</TableHead>
                    <TableHead className="w-[100px]">Stock</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[280px] text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const status = item.status ?? "pending"
                    const imageUrl = getFirstImageUrl(item.imageUrls)
                    const isRowBusy = actionInProgress === item.id

                    return (
                      <TableRow key={item.id} className="transition-colors hover:bg-muted/40">
                        {/* Equipment Info with Thumbnail */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted/60">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={item.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center text-muted-foreground">
                                  <Boxes className="size-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-foreground">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                {item.location && (
                                  <span className="truncate flex items-center gap-1">
                                    <MapPin className="size-3 text-muted-foreground/70" />
                                    {item.location}
                                  </span>
                                )}
                                {item.brand && (
                                  <span className="truncate">
                                    · {item.brand} {item.model}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Category */}
                        <TableCell>
                          <Badge variant="secondary" className="font-medium text-xs">
                            {categoryLabels[item.category] ?? item.category}
                          </Badge>
                        </TableCell>

                        {/* Owner Email */}
                        <TableCell>
                          <p className="truncate text-xs font-mono text-muted-foreground" title={item.ownerEmail}>
                            {item.ownerEmail || "N/A"}
                          </p>
                        </TableCell>

                        {/* Rental Rate */}
                        <TableCell>
                          <span className="font-bold text-brand-hover">
                            ৳{formatPrice(item.rentalPrice)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {" "}/ {item.rentalType}
                          </span>
                        </TableCell>

                        {/* Available Stock */}
                        <TableCell>
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              Number(item.quantity) === 0
                                ? "text-destructive"
                                : "text-foreground"
                            )}
                          >
                            {item.quantity} units
                          </span>
                        </TableCell>

                        {/* Status Badge */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("font-semibold capitalize text-xs", statusBadgeClasses[status])}
                          >
                            {statusLabels[status]}
                          </Badge>
                        </TableCell>

                        {/* Actions: Approve, Reject, Update, Delete, View - All in ONE single horizontal line */}
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex flex-nowrap items-center justify-end gap-1.5 whitespace-nowrap">
                            {/* Approve Button */}
                            {status !== "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isRowBusy}
                                onClick={() => handleStatusChange(item, "approved")}
                                className="h-8 shrink-0 border-emerald-500/30 bg-emerald-50/70 px-2.5 text-xs font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
                                title="Approve listing"
                              >
                                <Check className="size-3.5" />
                                <span>Approve</span>
                              </Button>
                            )}

                            {/* Reject Button */}
                            {status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isRowBusy}
                                onClick={() => handleStatusChange(item, "rejected")}
                                className="h-8 shrink-0 border-rose-500/30 bg-rose-50/70 px-2.5 text-xs font-semibold text-rose-700 shadow-2xs hover:bg-rose-100 hover:text-rose-800 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
                                title="Reject listing"
                              >
                                <X className="size-3.5" />
                                <span>Reject</span>
                              </Button>
                            )}

                            {/* Update Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isRowBusy}
                              onClick={() => openEditModal(item)}
                              className="h-8 shrink-0 rounded-lg px-2.5 text-xs font-medium transition-colors hover:border-brand hover:text-brand-hover"
                              title="Update equipment"
                            >
                              <Pencil className="size-3.5" />
                              <span>Update</span>
                            </Button>

                            {/* View Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isRowBusy}
                              onClick={() => setViewItem(item)}
                              className="h-8 shrink-0 rounded-lg px-2.5 text-xs font-medium"
                              title="View details"
                            >
                              <Eye className="size-3.5" />
                              <span>View</span>
                            </Button>

                            {/* Delete Button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isRowBusy}
                              onClick={() => setDeleteCandidate(item)}
                              className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Delete listing"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- Edit / Update Dialog ---------- */}
      <Dialog
        open={editItem !== null}
        onOpenChange={(open) => {
          if (!open) setEditItem(null)
        }}
      >
        {editItem && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="size-4 text-brand-hover" />
                Update Equipment Listing
              </DialogTitle>
              <DialogDescription>
                Modify details, rental pricing, and stock count for <strong>{editItem.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="equipments-edit-name" className="text-xs font-semibold">Equipment Name</Label>
                <Input
                  id="equipments-edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Equipment name"
                  className="h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="equipments-edit-price" className="text-xs font-semibold">Rental Price (৳)</Label>
                  <Input
                    id="equipments-edit-price"
                    type="number"
                    min="0"
                    value={editForm.rentalPrice}
                    onChange={(e) => setEditForm({ ...editForm, rentalPrice: e.target.value })}
                    className="h-9"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="equipments-edit-quantity" className="text-xs font-semibold">Available Units</Label>
                  <Input
                    id="equipments-edit-quantity"
                    type="number"
                    min="0"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="equipments-edit-location" className="text-xs font-semibold">Location</Label>
                  <Input
                    id="equipments-edit-location"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="e.g. Dhaka, Bangladesh"
                    className="h-9"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="equipments-edit-condition" className="text-xs font-semibold">Condition</Label>
                  <select
                    id="equipments-edit-condition"
                    value={editForm.condition}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                    className="h-9 rounded-lg border border-border bg-background px-3 text-sm transition-colors focus:border-brand focus:outline-none"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="mt-2">
                <DialogClose render={<Button variant="outline" type="button">Cancel</Button>} />
                <Button
                  type="submit"
                  disabled={actionInProgress === editItem.id}
                  className="bg-brand font-semibold text-neutral-900 hover:bg-brand-hover"
                >
                  {actionInProgress === editItem.id ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>

      {/* ---------- View Details Dialog ---------- */}
      <Dialog
        open={viewItem !== null}
        onOpenChange={(open) => {
          if (!open) setViewItem(null)
        }}
      >
        {viewItem && (
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{viewItem.name}</DialogTitle>
              <DialogDescription>
                {categoryLabels[viewItem.category] ?? viewItem.category} · Listed by{" "}
                {viewItem.ownerEmail}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              {getFirstImageUrl(viewItem.imageUrls) && (
                <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-muted">
                  <Image
                    src={getFirstImageUrl(viewItem.imageUrls)!}
                    alt={viewItem.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border/60 p-3">
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <Badge variant="outline" className={statusBadgeClasses[viewItem.status ?? "pending"]}>
                      {statusLabels[viewItem.status ?? "pending"]}
                    </Badge>
                  </dd>
                </div>

                <div className="rounded-lg border border-border/60 p-3">
                  <dt className="text-xs text-muted-foreground">Rental Rate</dt>
                  <dd className="mt-1 font-bold text-brand-hover">
                    ৳{formatPrice(viewItem.rentalPrice)} / {viewItem.rentalType}
                  </dd>
                </div>

                <div className="rounded-lg border border-border/60 p-3">
                  <dt className="text-xs text-muted-foreground">Available Stock</dt>
                  <dd className="mt-1 font-semibold">{viewItem.quantity} units</dd>
                </div>

                <div className="rounded-lg border border-border/60 p-3">
                  <dt className="text-xs text-muted-foreground">Condition</dt>
                  <dd className="mt-1 font-medium">{viewItem.condition || "Good"}</dd>
                </div>

                <div className="rounded-lg border border-border/60 p-3">
                  <dt className="text-xs text-muted-foreground">Brand / Model</dt>
                  <dd className="mt-1 font-medium">
                    {viewItem.brand ? `${viewItem.brand} ${viewItem.model}` : "—"}
                  </dd>
                </div>

                <div className="rounded-lg border border-border/60 p-3">
                  <dt className="text-xs text-muted-foreground">Location</dt>
                  <dd className="mt-1 font-medium">{viewItem.location || "—"}</dd>
                </div>

                <div className="col-span-2 rounded-lg border border-border/60 p-3">
                  <dt className="text-xs text-muted-foreground">Description</dt>
                  <dd className="mt-1 text-xs leading-relaxed text-foreground">
                    {viewItem.description || "No description provided."}
                  </dd>
                </div>

                {viewItem.terms && (
                  <div className="col-span-2 rounded-lg border border-border/60 p-3">
                    <dt className="text-xs text-muted-foreground">Rental Terms</dt>
                    <dd className="mt-1 text-xs leading-relaxed text-foreground">
                      {viewItem.terms}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <DialogFooter className="flex flex-wrap gap-2">
              <DialogClose render={<Button variant="outline">Close</Button>} />
              {viewItem.status !== "approved" && (
                <Button
                  onClick={() => {
                    handleStatusChange(viewItem, "approved")
                    setViewItem(null)
                  }}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Check className="mr-1.5 size-4" />
                  Approve Listing
                </Button>
              )}
              {viewItem.status !== "rejected" && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleStatusChange(viewItem, "rejected")
                    setViewItem(null)
                  }}
                >
                  <X className="mr-1.5 size-4" />
                  Reject Listing
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ---------- Delete Confirmation Dialog ---------- */}
      <AlertDialog
        open={deleteCandidate !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteCandidate(null)
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
              <Trash2 className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete equipment listing?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{deleteCandidate?.name}</strong>?
              This listing will be removed from the platform catalog and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
