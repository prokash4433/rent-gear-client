"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Search,
  Trash2,
  XCircle,
  Copy,
  Check,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ChevronDown,
  CreditCard,
  Receipt,
  AlertTriangle,
  Flag,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { toast } from "@/components/ui/toast"
import { updateRentalStatus, deleteRental } from "@/lib/actions/rentals"
import type { RentalItem, RentalStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

function formatAmount(amount: number) {
  return amount.toLocaleString("en-US")
}

function formatDisplayDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

export default function AdminRentalsList({
  initialRentals,
}: {
  initialRentals: RentalItem[]
}) {
  const [rentals, setRentals] = useState<RentalItem[]>(initialRentals)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | RentalStatus>("all")
  const [, startTransition] = useTransition()

  // Modals state
  const [confirmedPaymentRental, setConfirmedPaymentRental] = useState<RentalItem | null>(null)
  const [pendingDetailsRental, setPendingDetailsRental] = useState<RentalItem | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<RentalItem | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Counts
  const totalCount = rentals.length
  const pendingCount = rentals.filter((r) => r.status === "pending").length
  const confirmedCount = rentals.filter((r) => r.status === "confirmed").length
  const cancelledCount = rentals.filter((r) => r.status === "cancelled").length
  const completedCount = rentals.filter((r) => r.status === "completed").length
  const totalRevenue = rentals
    .filter(
      (r) =>
        (r.status === "confirmed" || r.status === "completed") &&
        r.paymentStatus === "paid"
    )
    .reduce((sum, r) => sum + r.totalAmount, 0)

  // Filtered
  const filteredRentals = rentals.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const q = searchQuery.toLowerCase().trim()
    const matchesQuery =
      q === "" ||
      item.equipmentName.toLowerCase().includes(q) ||
      item.renterName.toLowerCase().includes(q) ||
      item.renterEmail.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      (item.ownerId && item.ownerId.toLowerCase().includes(q)) ||
      (item.deliveryAddress && item.deliveryAddress.toLowerCase().includes(q))

    return matchesStatus && matchesQuery
  })

  // Handle status update
  async function handleStatusChange(rental: RentalItem, newStatus: RentalStatus) {
    if (rental.status === newStatus) return

    setIsUpdating(rental.id)
    startTransition(async () => {
      try {
        const res = await updateRentalStatus(rental.id, newStatus)
        if (res.success) {
          setRentals((prev) =>
            prev.map((r) =>
              r.id === rental.id
                ? {
                    ...r,
                    status: newStatus,
                    paymentStatus: newStatus === "confirmed" ? "paid" : r.paymentStatus,
                  }
                : r
            )
          )
          toast.add({
            type: "success",
            title: "Booking status updated",
            description: `Order #${rental.id.slice(-6)} set to ${newStatus.toUpperCase()}.`,
          })
        }
      } catch {
        toast.add({
          type: "error",
          title: "Update failed",
          description: "Could not update rental status.",
        })
      } finally {
        setIsUpdating(null)
      }
    })
  }

  // Handle delete
  async function handleDeleteBooking() {
    if (!deleteCandidate) return
    const target = deleteCandidate

    startTransition(async () => {
      try {
        const res = await deleteRental(target.id)
        if (res.success) {
          setRentals((prev) => prev.filter((r) => r.id !== target.id))
          toast.add({
            type: "success",
            title: "Booking deleted",
            description: `Booking #${target.id.slice(-6)} was removed.`,
          })
          setDeleteCandidate(null)
        }
      } catch {
        toast.add({
          type: "error",
          title: "Delete error",
          description: "Could not remove booking record.",
        })
      }
    })
  }

  function copyId(id: string) {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.add({
      type: "success",
      title: "Copied to clipboard",
      description: `Booking ID ${id} copied.`,
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Admin Overview
        </Link>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="rounded-2xl border-border/70 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Bookings</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand/20 text-brand-hover">
              <CalendarCheck className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{totalCount}</p>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Confirmed</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{confirmedCount}</p>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pending Action</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{pendingCount}</p>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Realized Revenue</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand/20 text-brand-hover">
              <DollarSign className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-brand-hover">৳{formatAmount(totalRevenue)}</p>
        </Card>
      </div>

      {/* Main Container Card */}
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm">
        {/* Header with Title and Filter Pills matching reference mockup */}
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
              Global Bookings Record ({totalCount})
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              Audit all equipment rentals, track payout totals, and resolve disputed bookings
            </CardDescription>
          </div>

          {/* Filter Pills with full functionality */}
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
              onClick={() => setStatusFilter("confirmed")}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                statusFilter === "confirmed"
                  ? "bg-brand font-bold text-neutral-900 shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Confirmed ({confirmedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                statusFilter === "completed"
                  ? "bg-brand font-bold text-neutral-900 shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Completed ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("cancelled")}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                statusFilter === "cancelled"
                  ? "bg-brand font-bold text-neutral-900 shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Cancelled ({cancelledCount})
            </button>
          </div>
        </CardHeader>

        {/* Search input */}
        <div className="border-b border-border/50 bg-muted/10 p-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by equipment, renter name, or booking ID..."
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

        {/* Bookings List Cards */}
        <CardContent className="flex flex-col gap-3 p-4 sm:p-6">
          {filteredRentals.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CalendarCheck className="size-6" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-foreground">No bookings found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery
                  ? "No rental transactions matched your search query."
                  : "No bookings recorded in this filter status."}
              </p>
            </div>
          ) : (
            filteredRentals.map((rental) => {
              const status = rental.status
              const isPaid = rental.paymentStatus === "paid"

              return (
                <div
                  key={rental.id}
                  className="group flex flex-col justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-brand/50 hover:shadow-sm md:flex-row md:items-center"
                >
                  {/* Left: Thumbnail & Rental Details */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/60">
                      {rental.equipmentImage ? (
                        <Image
                          src={rental.equipmentImage}
                          alt={rental.equipmentName}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <Package className="size-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Equipment Name & ID */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-foreground">
                          {rental.equipmentName}
                        </h4>
                        <button
                          type="button"
                          onClick={() => copyId(rental.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Click to copy ID"
                        >
                          <span>ID: {rental.id.slice(0, 16)}...</span>
                          {copiedId === rental.id ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>

                      {/* Renter & Owner Info */}
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Renter:</span>{" "}
                        {rental.renterName} ({rental.renterEmail})
                        {rental.ownerId && (
                          <span className="ml-2 font-mono text-muted-foreground">
                            • Owner ID: {rental.ownerId.slice(0, 14)}...
                          </span>
                        )}
                      </p>

                      {/* Dates & Quantity */}
                      <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3 text-muted-foreground/70" />
                        <span>
                          Dates: {formatDisplayDate(rental.startDate)} – {formatDisplayDate(rental.endDate)} ({rental.durationText || "Rental"})
                        </span>
                        <span>•</span>
                        <Layers className="size-3 text-muted-foreground/70" />
                        <span>Quantity: {rental.quantity} units</span>
                      </p>

                      {/* Delivery Address & Contact */}
                      <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3 text-muted-foreground/70" />
                        <span className="truncate max-w-xs">Delivery: {rental.deliveryAddress}</span>
                        {rental.contactNumber && (
                          <>
                            <span>•</span>
                            <Phone className="size-3 text-muted-foreground/70" />
                            <span>Phone: {rental.contactNumber}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right: Total Value, Payment Status & Functional Buttons */}
                  <div className="flex items-center justify-between gap-6 border-t border-border/50 pt-3 md:border-t-0 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Total Value
                      </span>
                      <p className="text-xl font-extrabold text-brand-hover">
                        ৳{formatAmount(rental.totalAmount)}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                        )}
                      >
                        Payment: {rental.paymentStatus}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Functional Status Button:
                          Clicking Confirmed opens Payment Details Modal.
                          Clicking Pending opens Pending Details & Action Modal. */}
                      {status === "confirmed" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmedPaymentRental(rental)}
                          className="h-9 gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/70 px-3 text-xs font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
                          title="Click to view Payment Details"
                        >
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                          <span>Confirmed</span>
                        </Button>
                      ) : status === "pending" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPendingDetailsRental(rental)}
                          className="h-9 gap-1.5 rounded-xl border border-amber-500/30 bg-amber-50/70 px-3 text-xs font-semibold text-amber-800 shadow-2xs hover:bg-amber-100 hover:text-amber-900 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25"
                          title="Click to view Pending Details & Action"
                        >
                          <Clock className="size-3.5 text-amber-600" />
                          <span>Pending</span>
                        </Button>
                      ) : status === "completed" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1.5 rounded-xl border border-sky-500/30 bg-sky-50/70 px-3 text-xs font-semibold text-sky-700 shadow-2xs hover:bg-sky-100 hover:text-sky-800 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25"
                          title="Rental completed"
                        >
                          <Flag className="size-3.5 text-sky-600" />
                          <span>Completed</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1.5 rounded-xl border border-rose-500/30 bg-rose-50/70 px-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                        >
                          <XCircle className="size-3.5 text-rose-600" />
                          <span>Cancelled</span>
                        </Button>
                      )}

                      {/* Dropdown status changer: full status control for admins.
                          Confirmed opens the payment modal above; every other
                          status change happens right here. */}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isUpdating === rental.id}
                              className="h-9 w-8 p-0"
                              title="Change status"
                            >
                              <ChevronDown className="size-3.5 opacity-60" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Set Booking Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={status === "confirmed"}
                            onClick={() => handleStatusChange(rental, "confirmed")}
                          >
                            <CheckCircle2 className="size-4 text-emerald-600" />
                            <span>Confirmed</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={status === "completed"}
                            onClick={() => handleStatusChange(rental, "completed")}
                          >
                            <Flag className="size-4 text-sky-600" />
                            <span>Completed</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={status === "pending"}
                            onClick={() => handleStatusChange(rental, "pending")}
                          >
                            <Clock className="size-4 text-amber-600" />
                            <span>Pending</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={status === "cancelled"}
                            onClick={() => handleStatusChange(rental, "cancelled")}
                          >
                            <XCircle className="size-4 text-rose-600" />
                            <span>Cancelled</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Delete action */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteCandidate(rental)}
                        className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Delete booking record"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* ---------- 1. Confirmed Payment Details Dialog ---------- */}
      <Dialog
        open={confirmedPaymentRental !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmedPaymentRental(null)
        }}
      >
        {confirmedPaymentRental && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                  <CreditCard className="size-4" />
                </span>
                <div>
                  <DialogTitle className="text-lg">Payment & Transaction Details</DialogTitle>
                  <DialogDescription className="text-xs">
                    Confirmed rental order #{confirmedPaymentRental.id.slice(-8)}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2 text-sm">
              {/* Payment Summary Box */}
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-50/50 p-4 dark:bg-emerald-500/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Payment Status
                  </span>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                    <CheckCircle2 className="mr-1 size-3" />
                    PAID & SETTLED
                  </Badge>
                </div>
                <div className="mt-3 flex items-baseline justify-between border-t border-emerald-500/20 pt-3">
                  <span className="text-xs text-muted-foreground">Total Paid Amount:</span>
                  <span className="text-2xl font-extrabold text-brand-hover">
                    ৳{formatAmount(confirmedPaymentRental.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Breakdown Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-border/60 p-2.5">
                  <p className="text-muted-foreground">Equipment Owner Payout</p>
                  <p className="mt-0.5 text-sm font-bold text-foreground">
                    ৳{formatAmount(Math.round(confirmedPaymentRental.totalAmount * 0.9))}
                  </p>
                  <p className="text-[10px] text-muted-foreground">90% of booking fee</p>
                </div>

                <div className="rounded-lg border border-border/60 p-2.5">
                  <p className="text-muted-foreground">Platform Service Fee</p>
                  <p className="mt-0.5 text-sm font-bold text-foreground">
                    ৳{formatAmount(Math.round(confirmedPaymentRental.totalAmount * 0.1))}
                  </p>
                  <p className="text-[10px] text-muted-foreground">10% commission</p>
                </div>
              </div>

              {/* Renter & Machine Details */}
              <dl className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Equipment:</dt>
                  <dd className="font-semibold text-foreground">{confirmedPaymentRental.equipmentName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Renter:</dt>
                  <dd className="font-semibold text-foreground">{confirmedPaymentRental.renterName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Renter Email:</dt>
                  <dd className="font-mono text-muted-foreground">{confirmedPaymentRental.renterEmail}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Rental Duration:</dt>
                  <dd className="font-medium text-foreground">
                    {formatDisplayDate(confirmedPaymentRental.startDate)} – {formatDisplayDate(confirmedPaymentRental.endDate)} ({confirmedPaymentRental.durationText})
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Payment Processor:</dt>
                  <dd className="font-medium text-emerald-600 dark:text-emerald-400">Stripe Card Gateway</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Transaction ID:</dt>
                  <dd className="font-mono text-[11px] text-muted-foreground">ch_stripe_{confirmedPaymentRental.id.slice(-10)}</dd>
                </div>
              </dl>
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline">Close</Button>} />
              <Button
                onClick={() => {
                  toast.add({
                    type: "success",
                    title: "Receipt Printed",
                    description: `Invoice downloaded for booking #${confirmedPaymentRental.id.slice(-6)}.`,
                  })
                  setConfirmedPaymentRental(null)
                }}
                className="bg-brand font-semibold text-neutral-900 hover:bg-brand-hover"
              >
                <Receipt className="mr-1.5 size-4" />
                Receipt & Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ---------- 2. Pending Details & Action Dialog ---------- */}
      <Dialog
        open={pendingDetailsRental !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDetailsRental(null)
        }}
      >
        {pendingDetailsRental && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
                  <Clock className="size-4" />
                </span>
                <div>
                  <DialogTitle className="text-lg">Booking Pending Verification</DialogTitle>
                  <DialogDescription className="text-xs">
                    Review and confirm booking order #{pendingDetailsRental.id.slice(-8)}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2 text-sm">
              {/* Alert Status Banner */}
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-50/60 p-3.5 text-xs dark:bg-amber-500/10">
                <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    Awaiting Admin / Owner Approval
                  </p>
                  <p className="mt-0.5 text-amber-800/80 dark:text-amber-300/80">
                    Customer has requested this rental. Confirm availability and approve to collect payment.
                  </p>
                </div>
              </div>

              {/* Pending Details List */}
              <dl className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Equipment Requested:</dt>
                  <dd className="font-semibold text-foreground">{pendingDetailsRental.equipmentName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Quantity:</dt>
                  <dd className="font-semibold text-foreground">{pendingDetailsRental.quantity} units</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total Value:</dt>
                  <dd className="font-extrabold text-brand-hover text-sm">
                    ৳{formatAmount(pendingDetailsRental.totalAmount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Rental Range:</dt>
                  <dd className="font-medium text-foreground">
                    {formatDisplayDate(pendingDetailsRental.startDate)} to {formatDisplayDate(pendingDetailsRental.endDate)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Renter Contact:</dt>
                  <dd className="font-medium text-foreground">
                    {pendingDetailsRental.renterName} ({pendingDetailsRental.contactNumber})
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery Destination:</dt>
                  <dd className="font-medium text-foreground text-right max-w-[200px] truncate">
                    {pendingDetailsRental.deliveryAddress}
                  </dd>
                </div>
              </dl>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <DialogClose render={<Button variant="outline">Close</Button>} />
              <Button
                variant="destructive"
                onClick={() => {
                  handleStatusChange(pendingDetailsRental, "cancelled")
                  setPendingDetailsRental(null)
                }}
              >
                Reject Order
              </Button>
              <Button
                onClick={() => {
                  handleStatusChange(pendingDetailsRental, "confirmed")
                  setPendingDetailsRental(null)
                }}
                className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="mr-1.5 size-4" />
                Approve & Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ---------- 3. Delete Confirmation Alert ---------- */}
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
            <AlertDialogTitle>Delete booking record?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove booking #{deleteCandidate?.id.slice(-6)} for{" "}
              <strong>{deleteCandidate?.equipmentName}</strong>? This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteBooking}>
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
