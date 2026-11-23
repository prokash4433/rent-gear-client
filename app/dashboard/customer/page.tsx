import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Eye,
  Heart,
  Package,
  Settings,
  Star,
  Wallet,
  XCircle,
  CheckCircle2,
  Flag,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { getCustomerDashboard } from "@/lib/data/customer"
import type { BookingStatus, MyBooking } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CustomerCharts } from "./customer-charts"

export const metadata = {
  title: "Customer Dashboard - RentalHub",
  description:
    "Overview of your rentals, favourites, spending and recent bookings.",
}

function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-US")}`
}

/** Formats "2026-11-24" or an ISO timestamp as Nov 24, 2026. */
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

const STATUS_STYLES: Record<BookingStatus, string> = {
  unpaid: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  completed: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
}

const STATUS_ICONS: Record<BookingStatus, React.ElementType> = {
  unpaid: Clock,
  pending: Clock,
  confirmed: CheckCircle2,
  completed: Flag,
  cancelled: XCircle,
}

function StatusChip({ status }: { status: BookingStatus }) {
  const Icon = STATUS_ICONS[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        STATUS_STYLES[status]
      )}
    >
      <Icon className="size-3" />
      {status}
    </span>
  )
}

/** Small stat card under the welcome banner. */
function StatCard({
  label,
  value,
  tag,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  tag: string
  icon: React.ElementType
  tone: string
}) {
  return (
    <Card className="rounded-2xl border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <span className={cn("flex size-8 items-center justify-center rounded-lg", tone)}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {tag}
        </span>
      </div>
    </Card>
  )
}

const QUICK_ACTIONS = [
  {
    label: "Browse Equipment",
    description: "Find machines to rent",
    href: "/browse-equipments",
    icon: Package,
  },
  {
    label: "My Bookings",
    description: "Track and pay for rentals",
    href: "/dashboard/customer/my-booking",
    icon: CalendarCheck,
  },
  {
    label: "My Favorites",
    description: "Your saved equipment",
    href: "/dashboard/customer/my-favorites",
    icon: Heart,
  },
  {
    label: "Profile Settings",
    description: "Update your details",
    href: "/dashboard/customer/profile-setting",
    icon: Settings,
  },
]

const CustomerDashboardPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const data = await getCustomerDashboard(session.user.email)
  const { stats, monthly, statusBreakdown, recent } = data
  const firstName = (session.user.name ?? "there").split(" ")[0]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 sm:p-6">
      {/* ---------- Welcome banner ---------- */}
      <section className="relative overflow-hidden rounded-2xl bg-neutral-900 p-6 text-white shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 size-40 rounded-full bg-brand/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              Welcome back
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Hi, {firstName} 👋
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-neutral-300">
              Here&apos;s what&apos;s happening with your rentals — bookings,
              favourites and spending, all in one place.
            </p>
          </div>
          <Button
            render={<Link href="/browse-equipments" />}
            className="shrink-0 cursor-pointer bg-brand font-bold text-neutral-900 hover:bg-brand-hover"
          >
            Explore Equipment
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      {/* ---------- Stat cards ---------- */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={String(stats.totalBookings)}
          tag="All time"
          icon={CalendarCheck}
          tone="bg-brand/20 text-brand-hover"
        />
        <StatCard
          label="Favorite Items"
          value={String(stats.favoriteItems)}
          tag="Saved"
          icon={Heart}
          tone="bg-rose-500/15 text-rose-600 dark:text-rose-400"
        />
        <StatCard
          label="Total Spent"
          value={formatTaka(stats.totalSpent)}
          tag="Paid"
          icon={Wallet}
          tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Your Reviews"
          value={String(stats.reviews)}
          tag="Feedback"
          icon={Star}
          tone="bg-violet-500/15 text-violet-600 dark:text-violet-400"
        />
      </section>

      {/* ---------- Status chips ---------- */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["Pending", stats.pending, "bg-amber-500/15 text-amber-700 dark:text-amber-300", Clock],
            ["Confirmed", stats.confirmed, "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", CheckCircle2],
            ["Completed", stats.completed, "bg-sky-500/15 text-sky-700 dark:text-sky-300", Flag],
            ["Cancelled", stats.cancelled, "bg-rose-500/15 text-rose-700 dark:text-rose-300", XCircle],
          ] as const
        ).map(([label, count, tone, Icon]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm transition-colors hover:border-brand/40"
          >
            <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className={cn("flex size-7 items-center justify-center rounded-lg", tone)}>
                <Icon className="size-3.5" />
              </span>
              {label}
            </span>
            <span className="text-lg font-extrabold text-foreground">{count}</span>
          </div>
        ))}
      </section>

      {/* ---------- Charts ---------- */}
      <CustomerCharts monthly={monthly} statusBreakdown={statusBreakdown} />

      {/* ---------- Recent bookings + quick actions ---------- */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/70 bg-card shadow-sm lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Recent Bookings
              </CardTitle>
              <CardDescription className="text-xs">
                Your five newest rental requests
              </CardDescription>
            </div>
            <Link
              href="/dashboard/customer/my-booking"
              className="cursor-pointer text-xs font-bold text-brand-hover transition-colors hover:underline"
            >
              View All →
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
                <Package className="size-7 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">No bookings yet</p>
                <p className="text-xs text-muted-foreground">
                  Book some equipment and it will show up here.
                </p>
                <Button
                  render={<Link href="/browse-equipments" />}
                  size="sm"
                  className="mt-1 cursor-pointer bg-brand font-semibold text-neutral-900 hover:bg-brand-hover"
                >
                  Explore Equipment
                </Button>
              </div>
            ) : (
              recent.map((booking: MyBooking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/70 p-3 transition-all hover:border-brand/50 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-foreground">
                        {booking.equipmentName}
                      </p>
                      <StatusChip status={booking.status} />
                      {booking.paymentStatus === "unpaid" && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          Unpaid
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(booking.startDate)} – {formatDate(booking.endDate)} •{" "}
                      {booking.quantity} unit{booking.quantity > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-sm font-extrabold text-brand-hover">
                      {formatTaka(booking.totalAmount)}
                    </span>
                    <Link
                      href={`/browse-equipments/${booking.equipmentId}`}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-foreground transition-all hover:border-brand hover:bg-brand/10"
                    >
                      <Eye className="size-3" />
                      View Item
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-xs">
              Jump straight to what you need
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2.5">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 p-3 transition-all hover:-translate-y-0.5 hover:border-brand/60 hover:bg-brand/5 hover:shadow-sm"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand-hover transition-colors group-hover:bg-brand group-hover:text-neutral-900">
                  <action.icon className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-foreground">
                    {action.label}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {action.description}
                  </span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-hover" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* ---------- Bottom CTA ---------- */}
      <section className="flex flex-col items-center gap-4 rounded-2xl bg-brand px-6 py-7 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-neutral-900 sm:text-xl">
            Need equipment for your next project?
          </h2>
          <p className="mt-1 text-sm text-neutral-800">
            Browse hundreds of machines and tools available for rent near you.
          </p>
        </div>
        <Button
          render={<Link href="/browse-equipments" />}
          className="shrink-0 cursor-pointer bg-neutral-900 font-bold text-white hover:bg-neutral-800"
        >
          <Star className="size-4" />
          Start Renting
        </Button>
      </section>
    </div>
  )
}

export default CustomerDashboardPage
