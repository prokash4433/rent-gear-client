"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Ban,
  CalendarX,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Flag,
  Info,
  Star,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import { cancelMyBooking } from "@/lib/actions/rentals"
import type { BookingStatus, MyBooking } from "@/lib/types"
import { cn } from "@/lib/utils"

const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"] as const
type Filter = (typeof FILTERS)[number]

const statusStyles: Record<BookingStatus, string> = {
  unpaid: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  confirmed: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  cancelled: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
}

const statusIcons: Record<BookingStatus, React.ElementType> = {
  unpaid: Clock,
  pending: Clock,
  confirmed: CheckCircle2,
  completed: Flag,
  cancelled: XCircle,
}

/** Pill button used by every card action. */
const actionPill =
  "inline-flex cursor-pointer items-center gap-1 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0"

const fmt = (iso: string) => {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso)
  const date = new Date(dateOnly ? `${iso}T00:00:00` : iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function durationLabel(start: string, end: string) {
  const days =
    Math.round(
      (new Date(end + "T00:00:00").getTime() -
        new Date(start + "T00:00:00").getTime()) /
      86_400_000
    ) + 1
  if (days < 1) return "—"
  if (days >= 7 && days % 7 === 0) return `${days / 7} week${days > 7 ? "s" : ""}`
  return `${days} day${days > 1 ? "s" : ""}`
}

function BookingImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-neutral-200 transition-transform duration-300 group-hover:scale-105 sm:size-[72px]">
      {!src || failed ? (
        <div className="flex size-full items-center justify-center text-xs text-neutral-500">
          No image
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}

function StatusChip({ status }: { status: BookingStatus }) {
  const Icon = statusIcons[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
        statusStyles[status]
      )}
    >
      <Icon className="size-3" />
      {status}
    </span>
  )
}

type Props = {
  bookings: MyBooking[]
  /** True when Stripe sent the user back from a cancelled checkout. */
  cancelled: boolean
  /** "success" or "failed" when redirected from /payment/success. */
  paymentResult?: string
}

const MyBookingsList = ({ bookings, cancelled, paymentResult }: Props) => {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>("all")
  const [payingId, setPayingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [details, setDetails] = useState<MyBooking | null>(null)
  const [cancelTarget, setCancelTarget] = useState<MyBooking | null>(null)
  const [showCancelledNotice, setShowCancelledNotice] = useState(cancelled)
  const [paymentToastShown, setPaymentToastShown] = useState(false)

  // Show payment success/failure toast when redirected from /payment/success
  useEffect(() => {
    if (paymentToastShown || !paymentResult) return
    setPaymentToastShown(true)
    if (paymentResult === "success") {
      toast.add({
        type: "success",
        title: "Payment successful!",
        description:
          "Your booking is confirmed. The equipment owner has been notified.",
      })
    } else if (paymentResult === "failed") {
      toast.add({
        type: "error",
        title: "Payment could not be verified",
        description:
          "Something went wrong while verifying your payment. Please contact support if you were charged.",
        timeout: 10000,
      })
    }
  }, [paymentResult, paymentToastShown])

  const visible = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((b) => b.status === filter)),
    [bookings, filter]
  )

  const payWithStripe = async (id: string) => {
    try {
      setPayingId(id)
      const res = await fetch("/api/pay-booking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookingId: id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        toast.add({
          type: "error",
          title: "Could not start payment",
          description: data.error || "Please try again in a moment.",
          timeout: 7000,
        })
        return
      }
      window.location.assign(data.url)
    } catch {
      toast.add({
        type: "error",
        title: "Something went wrong",
        description: "Could not reach the server. Please try again.",
        timeout: 7000,
      })
    } finally {
      setPayingId(null)
    }
  }

  // Called when user confirms inside the custom dialog
  const confirmCancel = async () => {
    if (!cancelTarget) return
    const booking = cancelTarget

    try {
      setCancellingId(booking.id)
      const res = await cancelMyBooking(booking.id)
      if (res.success) {
        toast.add({
          type: "success",
          title: "Booking cancelled",
          description: `${booking.equipmentName} has been cancelled. No payment was taken.`,
        })
        setCancelTarget(null)
        router.refresh()
      } else {
        toast.add({
          type: "error",
          title: "Could not cancel booking",
          description: res.error || "Please try again.",
          timeout: 7000,
        })
      }
    } catch {
      toast.add({
        type: "error",
        title: "Something went wrong",
        description: "Could not reach the server. Please try again.",
        timeout: 7000,
      })
    } finally {
      setCancellingId(null)
    }
  }

  const isCancelling = cancellingId !== null

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      {/* Stripe cancelled-payment notice */}
      {showCancelledNotice && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <Info className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-sm font-bold">Payment cancelled</p>
              <p className="text-xs opacity-80">
                You left the Stripe checkout page — no money was taken. Use
                &quot;Pay with Stripe&quot; on any unpaid booking whenever you&apos;re
                ready.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setShowCancelledNotice(false)}
            className="cursor-pointer rounded-full p-1 transition-colors hover:bg-amber-200/60 dark:hover:bg-amber-500/20"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Header + filters */}
      <section className="flex flex-col gap-4 rounded-2xl border border-[#eadfd3] bg-white p-5 shadow-sm transition-colors hover:border-brand/50 dark:border-neutral-700 dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#2a1810] dark:text-neutral-100">
            Rental Bookings History
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Track, manage, and review all your equipment rental reservations
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-1 text-xs font-semibold capitalize transition-all hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0",
                filter === f
                  ? "border-brand bg-brand text-neutral-900"
                  : "border-[#eadfd3] bg-[#faf6f1] text-neutral-700 hover:border-brand/60 hover:bg-brand/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Booking cards */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#eadfd3] bg-white py-16 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <CalendarX className="size-8 text-neutral-400" />
          <p className="font-semibold text-neutral-800 dark:text-neutral-200">
            No {filter} bookings
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Bookings with this status will show up here.
          </p>
        </div>
      ) : (
        visible.map((b) => {
          const canPay =
            b.paymentStatus === "unpaid" &&
            b.status !== "cancelled" &&
            b.status !== "completed"
          const canCancel =
            b.paymentStatus === "unpaid" &&
            b.status !== "cancelled" &&
            b.status !== "completed"
          const canReview = b.status === "confirmed" && b.paymentStatus === "paid"

          return (
            <article
              key={b.id}
              className="group flex flex-col gap-4 rounded-2xl border border-[#eadfd3] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 gap-4">
                <BookingImage src={b.equipmentImage} alt={b.equipmentName} />

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-[#2a1810] dark:text-neutral-100">
                      {b.equipmentName}
                    </h2>
                    <StatusChip status={b.status} />
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        b.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                      )}
                    >
                      Payment: {b.paymentStatus}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 dark:text-neutral-300">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Dates:
                    </span>{" "}
                    {fmt(b.startDate)} – {fmt(b.endDate)} (
                    {durationLabel(b.startDate, b.endDate)})
                  </p>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Quantity:
                    </span>{" "}
                    {b.quantity} units •{" "}
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Delivery:
                    </span>{" "}
                    {b.deliveryAddress || "—"}
                  </p>
                  <p className="break-all text-[10px] text-neutral-500 dark:text-neutral-400">
                    Booking ID: {b.id}
                  </p>
                </div>
              </div>

              {/* Amount + actions */}
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <div className="sm:text-right">
                  <p className="text-[10px] font-semibold uppercase text-neutral-500">
                    Total amount
                  </p>
                  <p className="text-xl font-extrabold text-brand">৳{b.totalAmount}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/browse-equipments/${b.equipmentId}`}
                    className={cn(
                      actionPill,
                      "border-neutral-300 bg-white text-neutral-900 hover:border-brand hover:bg-brand/10 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                    )}
                  >
                    <Eye className="size-3.5" />
                    View Item
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDetails(b)}
                    className={cn(
                      actionPill,
                      "border-neutral-300 bg-white text-neutral-900 hover:border-brand hover:bg-brand/10 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                    )}
                  >
                    <Info className="size-3.5" />
                    View Details
                  </button>

                  {canReview && (
                    <Link
                      href={`/browse-equipments/${b.equipmentId}`}
                      className={cn(
                        actionPill,
                        "border-transparent bg-brand text-neutral-900 hover:bg-brand-hover"
                      )}
                    >
                      <Star className="size-3.5 fill-current" />
                      Write Review
                    </Link>
                  )}

                  {canPay && (
                    <button
                      type="button"
                      disabled={payingId === b.id}
                      onClick={() => payWithStripe(b.id)}
                      className={cn(
                        actionPill,
                        "border-transparent bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      )}
                    >
                      <CreditCard className="size-3.5" />
                      {payingId === b.id ? "Redirecting..." : "Pay with Stripe"}
                    </button>
                  )}

                  {canCancel && (
                    <button
                      type="button"
                      disabled={cancellingId === b.id}
                      onClick={() => setCancelTarget(b)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-50 hover:underline disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <Ban className="size-3.5" />
                      {cancellingId === b.id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })
      )}

      {/* ---------- Cancel confirmation dialog ---------- */}
      <Dialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isCancelling) setCancelTarget(null)
        }}
      >
        {cancelTarget && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TriangleAlert className="size-5 text-red-600 dark:text-red-400" />
                Cancel this booking?
              </DialogTitle>
              <DialogDescription>
                <span className="font-semibold">{cancelTarget.equipmentName}</span>{" "}
                ({fmt(cancelTarget.startDate)} – {fmt(cancelTarget.endDate)}) will be
                cancelled. This cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isCancelling}
                onClick={() => setCancelTarget(null)}
                className="cursor-pointer"
              >
                Keep Booking
              </Button>
              <Button
                type="button"
                disabled={isCancelling}
                onClick={confirmCancel}
                className="cursor-pointer bg-red-600 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ---------- Booking details preview ---------- */}
      <Dialog open={details !== null} onOpenChange={(open) => !open && setDetails(null)}>
        {details && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="size-5 text-brand" />
                Booking Details
              </DialogTitle>
              <DialogDescription>
                Full record for booking #{details.id.slice(-8)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-1 text-sm">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-[#eadfd3] bg-[#faf6f1] p-3 dark:border-neutral-700 dark:bg-neutral-800">
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#2a1810] dark:text-neutral-100">
                    {details.equipmentName}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {details.rentalType} rental • {details.periods} period(s)
                  </p>
                </div>
                <span className="text-lg font-extrabold text-brand">
                  ৳{details.totalAmount}
                </span>
              </div>

              <dl className="flex flex-col gap-2 rounded-xl border border-[#eadfd3] bg-white p-3 text-xs dark:border-neutral-700 dark:bg-neutral-900">
                {[
                  ["Status", details.status],
                  ["Payment", details.paymentStatus],
                  ["Dates", `${fmt(details.startDate)} – ${fmt(details.endDate)} (${durationLabel(details.startDate, details.endDate)})`],
                  ["Quantity", `${details.quantity} unit(s)`],
                  ["Contact", details.contactNumber || "—"],
                  ["Delivery", details.deliveryAddress || "—"],
                  ["Notes", details.notes || "—"],
                  ["Booked on", fmt(details.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="shrink-0 text-neutral-500 dark:text-neutral-400">
                      {label}
                    </dt>
                    <dd className="break-words text-right font-semibold text-neutral-900 dark:text-neutral-100">
                      {value}
                    </dd>
                  </div>
                ))}
                <div className="flex justify-between gap-3 border-t border-dashed border-neutral-200 pt-2 dark:border-neutral-700">
                  <dt className="text-neutral-500 dark:text-neutral-400">Booking ID</dt>
                  <dd className="break-all text-right font-mono text-[10px] text-neutral-600 dark:text-neutral-300">
                    {details.id}
                  </dd>
                </div>
              </dl>
            </div>

            <DialogFooter>
              <DialogClose
                render={<Button variant="outline" className="cursor-pointer">Close</Button>}
              />
              <Button
                render={<Link href={`/browse-equipments/${details.equipmentId}`} />}
                className="cursor-pointer bg-brand font-semibold text-neutral-900 hover:bg-brand-hover"
              >
                View Item
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

export default MyBookingsList