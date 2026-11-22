 "use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Ban, CalendarX, Star } from "lucide-react"
import { cn } from "@/lib/utils"

type BookingStatus = "pending" | "confirmed" | "cancelled"
type PaymentStatus = "paid" | "unpaid"

type Booking = {
          id: string
          equipmentId: string
          title: string
          image: string
          startDate: string
          endDate: string
          quantity: number
          delivery: string
          total: number
          status: BookingStatus
          payment: PaymentStatus
}

// Eta API theke ana data diye replace korben (e.g. fetch("/api/bookings")).
const initialBookings: Booking[] = [
          {
                    id: "6b025e6c6a534d975219032d",
                    equipmentId: "canon-dslr",
                    title: "Canon DSLR Camera",
                    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=70",
                    startDate: "2026-11-24",
                    endDate: "2026-11-25",
                    quantity: 1,
                    delivery: "Optio doloribus exc",
                    total: 100,
                    status: "confirmed",
                    payment: "paid",
          },
          {
                    id: "6b01fe59e97f9ba0dd242c75",
                    equipmentId: "generator-5kw",
                    title: "Generator 5kW",
                    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&q=70",
                    startDate: "2026-11-24",
                    endDate: "2026-11-25",
                    quantity: 1,
                    delivery: "Commodo non aliquip",
                    total: 160,
                    status: "pending",
                    payment: "unpaid",
          },
          {
                    id: "6b01fb2437978f9daffebfc4",
                    equipmentId: "atque-nam",
                    title: "Atque Nam voluptas s",
                    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&q=70",
                    startDate: "2026-11-28",
                    endDate: "2026-11-30",
                    quantity: 6,
                    delivery: "Dolores id deserunt",
                    total: 198,
                    status: "confirmed",
                    payment: "paid",
          },
]

const FILTERS = ["all", "pending", "confirmed", "cancelled"] as const
type Filter = (typeof FILTERS)[number]

const statusStyles: Record<BookingStatus, string> = {
          pending: "border-amber-200 bg-amber-50 text-amber-700",
          confirmed: "border-sky-200 bg-sky-50 text-sky-700",
          cancelled: "border-red-200 bg-red-50 text-red-700",
}

const fmt = (iso: string) =>
          new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
          })

function durationLabel(start: string, end: string) {
          const days =
                    Math.round(
                              (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000
                    ) + 1
          if (days >= 7 && days % 7 === 0) return `${days / 7} week${days > 7 ? "s" : ""}`
          if (days >= 3 && days < 7) return "1 week" // design-er moto: Nov 28–30 = 1 week
          return `${days} day${days > 1 ? "s" : ""}`
}

function BookingImage({ src, alt }: { src: string; alt: string }) {
          const [failed, setFailed] = useState(false)
          return (
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-neutral-200 sm:size-[72px]">
                              {failed ? (
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

const MyBookingPage = () => {
          const [bookings, setBookings] = useState<Booking[]>(initialBookings)
          const [filter, setFilter] = useState<Filter>("all")
          const [payingId, setPayingId] = useState<string | null>(null)

          const visible = useMemo(
                    () => (filter === "all" ? bookings : bookings.filter((b) => b.status === filter)),
                    [bookings, filter]
          )

          const cancelBooking = (id: string) => {
                    if (!confirm("Cancel this booking?")) return
                    // TODO: await fetch(`/api/bookings/${id}/cancel`, { method: "PATCH" })
                    setBookings((prev) =>
                              prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
                    )
          }

          const payWithStripe = async (id: string) => {
                    try {
                              setPayingId(id)
                              // TODO: server-e Stripe Checkout session baniye redirect korben:
                              // const res = await fetch("/api/checkout", { method: "POST", body: JSON.stringify({ bookingId: id }) })
                              // const { url } = await res.json()
                              // window.location.href = url
                    } finally {
                              setPayingId(null)
                    }
          }

          return (
                    <div className="mx-auto w-full max-w-5xl space-y-4">
                              {/* Header + filters */}
                              <section className="flex flex-col gap-4 rounded-2xl border border-[#eadfd3] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                                  <h1 className="text-xl font-extrabold text-[#2a1810]">
                                                            Rental Bookings History
                                                  </h1>
                                                  <p className="text-xs text-neutral-600">
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
                                                                                "rounded-full border px-4 py-1 text-xs font-semibold capitalize transition",
                                                                                filter === f
                                                                                          ? "border-brand bg-brand text-white"
                                                                                          : "border-[#eadfd3] bg-[#faf6f1] text-neutral-700 hover:border-brand/50"
                                                                      )}
                                                            >
                                                                      {f}
                                                            </button>
                                                  ))}
                                        </div>
                              </section>

                              {/* Booking cards */}
                              {visible.length === 0 ? (
                                        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#eadfd3] bg-white py-16 text-center">
                                                  <CalendarX className="size-8 text-neutral-400" />
                                                  <p className="font-semibold text-neutral-800">No {filter} bookings</p>
                                                  <p className="text-sm text-neutral-500">
                                                            Bookings with this status will show up here.
                                                  </p>
                                        </div>
                              ) : (
                                        visible.map((b) => (
                                                  <article
                                                            key={b.id}
                                                            className="flex flex-col gap-4 rounded-2xl border border-[#eadfd3] bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                                                  >
                                                            <div className="flex min-w-0 flex-1 gap-4">
                                                                      <BookingImage src={b.image} alt={b.title} />

                                                                      <div className="min-w-0 space-y-1">
                                                                                <div className="flex flex-wrap items-center gap-2">
                                                                                          <h2 className="font-bold text-[#2a1810]">{b.title}</h2>
                                                                                          <span
                                                                                                    className={cn(
                                                                                                              "rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                                                                                                              statusStyles[b.status]
                                                                                                    )}
                                                                                          >
                                                                                                    {b.status}
                                                                                          </span>
                                                                                          <span
                                                                                                    className={cn(
                                                                                                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                                                                                              b.payment === "paid"
                                                                                                                        ? "bg-emerald-50 text-emerald-700"
                                                                                                                        : "bg-neutral-100 text-neutral-600"
                                                                                                    )}
                                                                                          >
                                                                                                    Payment: {b.payment}
                                                                                          </span>
                                                                                </div>

                                                                                <p className="text-xs text-neutral-700">
                                                                                          <span className="font-semibold text-neutral-900">Dates:</span>{" "}
                                                                                          {fmt(b.startDate)} – {fmt(b.endDate)} (
                                                                                          {durationLabel(b.startDate, b.endDate)})
                                                                                </p>
                                                                                <p className="text-xs text-neutral-700">
                                                                                          <span className="font-semibold text-neutral-900">Quantity:</span>{" "}
                                                                                          {b.quantity} units •{" "}
                                                                                          <span className="font-semibold text-neutral-900">Delivery:</span>{" "}
                                                                                          {b.delivery}
                                                                                </p>
                                                                                <p className="break-all text-[10px] text-neutral-500">
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
                                                                                <p className="text-xl font-extrabold text-brand">৳{b.total}</p>
                                                                      </div>

                                                                      <div className="flex flex-wrap items-center gap-2">
                                                                                <Link
                                                                                          href={`/equipment/${b.equipmentId}`}
                                                                                          className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-semibold text-neutral-900 transition hover:bg-neutral-50"
                                                                                >
                                                                                          View Item
                                                                                </Link>

                                                                                {b.status === "confirmed" && b.payment === "paid" && (
                                                                                          <Link
                                                                                                    href={`/equipment/${b.equipmentId}#reviews`}
                                                                                                    className="inline-flex items-center gap-1 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-hover"
                                                                                          >
                                                                                                    <Star className="size-3 fill-current" />
                                                                                                    Write Review
                                                                                          </Link>
                                                                                )}

                                                                                {b.status === "pending" && b.payment === "unpaid" && (
                                                                                          <>
                                                                                                    <button
                                                                                                              type="button"
                                                                                                              disabled={payingId === b.id}
                                                                                                              onClick={() => payWithStripe(b.id)}
                                                                                                              className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-hover disabled:opacity-60"
                                                                                                    >
                                                                                                              {payingId === b.id ? "Redirecting..." : "Pay with Stripe"}
                                                                                                    </button>
                                                                                                    <button
                                                                                                              type="button"
                                                                                                              onClick={() => cancelBooking(b.id)}
                                                                                                              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-red-600 hover:underline"
                                                                                                    >
                                                                                                              <Ban className="size-3.5" />
                                                                                                              Cancel
                                                                                                    </button>
                                                                                          </>
                                                                                )}
                                                                      </div>
                                                            </div>
                                                  </article>
                                        ))
                              )}
                    </div>
          )
}

export default MyBookingPage