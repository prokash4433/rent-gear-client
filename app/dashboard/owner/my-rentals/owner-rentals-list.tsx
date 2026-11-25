"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Info,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { OwnerRental } from "@/lib/data/owner"
import { cn } from "@/lib/utils"

const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"] as const
type Filter = (typeof FILTERS)[number]

const STATUS_STYLES: Record<string, string> = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  unpaid:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  confirmed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  completed:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  cancelled:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  unpaid: Clock,
  confirmed: CheckCircle2,
  completed: Flag,
  cancelled: XCircle,
}

function StatusChip({ status }: { status: string }) {
  const Icon = STATUS_ICONS[status] ?? Clock
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize",
        STATUS_STYLES[status] ?? STATUS_STYLES.pending
      )}
    >
      <Icon className="size-3" />
      {status}
    </span>
  )
}

function RentalImage({ src, alt }: { src?: string; alt: string }) {
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

function formatDate(value: string) {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  const date = new Date(dateOnly ? `${value}T00:00:00` : value)
  if (Number.isNaN(date.getTime())) return value
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
  if (days >= 7 && days % 7 === 0)
    return `${days / 7} week${days > 7 ? "s" : ""}`
  return `${days} day${days > 1 ? "s" : ""}`
}

export default function OwnerRentalsList({
  rentals,
}: {
  rentals: OwnerRental[]
}) {
  const [filter, setFilter] = useState<Filter>("all")
  const [details, setDetails] = useState<OwnerRental | null>(null)

  const visible = useMemo(
    () =>
      filter === "all"
        ? rentals
        : rentals.filter((r) => r.status === filter),
    [rentals, filter]
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-6">
      <Link
        href="/dashboard/owner"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      {/* Header + filters */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            My Rental Bookings
          </h1>
          <p className="text-xs text-muted-foreground">
            All bookings made for your listed equipment
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
                  : "border-border bg-card text-muted-foreground hover:border-brand/60 hover:bg-brand/10"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Rental cards */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <CalendarX className="size-8 text-neutral-400" />
          <p className="font-semibold text-foreground">No {filter} rentals</p>
          <p className="text-sm text-muted-foreground">
            Rentals with this status will show up here.
          </p>
        </div>
      ) : (
        visible.map((r) => (
          <article
            key={r.id}
            className="group flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-md sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 gap-4">
              <RentalImage src={r.equipmentImage} alt={r.equipmentName} />

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-foreground">
                    {r.equipmentName}
                  </h2>
                  <StatusChip status={r.status} />
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      r.paymentStatus === "paid"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    )}
                  >
                    {r.paymentStatus}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Renter:</span>{" "}
                  {r.renterName} ({r.renterEmail})
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Dates:</span>{" "}
                  {formatDate(r.startDate)} – {formatDate(r.endDate)} (
                  {durationLabel(r.startDate, r.endDate)})
                </p>
              </div>
            </div>

            {/* Amount + actions */}
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="sm:text-right">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Total amount
                </p>
                <p className="text-xl font-extrabold text-brand-hover">
                  ৳{r.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetails(r)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-4 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-brand hover:bg-brand/10 hover:shadow-sm active:translate-y-0"
                >
                  <Info className="size-3.5" />
                  Details
                </button>
                {r.equipmentId && (
                  <Link
                    href={`/browse-equipments/${r.equipmentId}`}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-4 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-brand hover:bg-brand/10 hover:shadow-sm active:translate-y-0"
                  >
                    <Eye className="size-3.5" />
                    View Item
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))
      )}

      {/* ---------- Rental details dialog ---------- */}
      <Dialog
        open={details !== null}
        onOpenChange={(open) => !open && setDetails(null)}
      >
        {details && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarCheck className="size-5 text-brand" />
                Rental Details
              </DialogTitle>
              <DialogDescription>
                Booking from {details.renterName}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-1 text-sm">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/40 p-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">
                    {details.equipmentName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {details.quantity} unit(s) •{" "}
                    {durationLabel(details.startDate, details.endDate)}
                  </p>
                </div>
                <span className="text-lg font-extrabold text-brand-hover">
                  ৳{details.totalAmount.toLocaleString()}
                </span>
              </div>

              <dl className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-3 text-xs">
                {[
                  ["Status", details.status],
                  ["Payment", details.paymentStatus],
                  [
                    "Dates",
                    `${formatDate(details.startDate)} – ${formatDate(details.endDate)}`,
                  ],
                  ["Renter", `${details.renterName} (${details.renterEmail})`],
                  ["Booked on", formatDate(details.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="shrink-0 text-muted-foreground">{label}</dt>
                    <dd className="break-words text-right font-semibold capitalize text-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setDetails(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
