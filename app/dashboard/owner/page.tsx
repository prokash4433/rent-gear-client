import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  Boxes,
  CalendarCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Plus,
  Settings,
  XCircle,
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
import { getOwnerDashboard } from "@/lib/data/owner"
import { cn } from "@/lib/utils"
import { BookingStatusChart, EarningsChart } from "./charts"

export const metadata = {
  title: "Owner Dashboard - RentalHub",
  description:
    "Manage your equipment listings, review rental bookings, and track your monthly earnings.",
}

function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-US")}`
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
  approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  rejected:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
}

function StatusChip({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        STATUS_STYLES[status] ?? STATUS_STYLES.pending
      )}
    >
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
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            tone
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-2xl font-extrabold tracking-tight text-foreground">
          {value}
        </p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {tag}
        </span>
      </div>
    </Card>
  )
}

export default async function OwnerDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const data = await getOwnerDashboard(session.user.email)
  const { stats, monthlyRevenue, statusBreakdown, recentBookings, topEquipment } =
    data
  const firstName = (session.user.name ?? "there").split(" ")[0]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 sm:p-6">
      {/* ---------- Welcome banner ---------- */}
      <section className="relative overflow-hidden rounded-2xl bg-[#38261e] p-6 text-white shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 size-40 rounded-full bg-brand/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              Owner Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back, {firstName} 👋
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-neutral-300">
              Monitor listings, review rental bookings, and track your monthly
              earnings.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              render={<Link href="/dashboard/owner/add-equipment" />}
              className="cursor-pointer bg-white/10 font-bold text-white ring-1 ring-white/20 hover:bg-white/20"
            >
              <Plus className="size-4" />
              Add Equipment
            </Button>
            <Button
              render={<Link href="/dashboard/owner/my-equipment" />}
              className="cursor-pointer bg-brand font-bold text-neutral-900 hover:bg-brand-hover"
            >
              Manage Equipment
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ---------- Stat cards ---------- */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Listed Equipment"
          value={String(stats.listedEquipment)}
          tag={`${stats.approvedListings} Approved`}
          icon={Boxes}
          tone="bg-brand/20 text-brand-hover"
        />
        <StatCard
          label="Completed Rentals"
          value={String(stats.completedRentals)}
          tag="Fulfilled"
          icon={CalendarCheck}
          tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Total Earnings"
          value={formatTaka(stats.totalEarnings)}
          tag="Paid out"
          icon={DollarSign}
          tone="bg-sky-500/15 text-sky-600 dark:text-sky-400"
        />
        <StatCard
          label="Total Bookings"
          value={String(stats.totalBookings)}
          tag={`${stats.pendingBookings} Pending`}
          icon={Package}
          tone="bg-violet-500/15 text-violet-600 dark:text-violet-400"
        />
      </section>

      {/* ---------- Status pills ---------- */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            [
              "Approved Listings",
              stats.approvedListings,
              "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
              CheckCircle2,
            ],
            [
              "Pending Approvals",
              stats.pendingApprovals,
              "bg-amber-500/15 text-amber-700 dark:text-amber-300",
              Clock,
            ],
            [
              "Rejected Listings",
              stats.rejectedListings,
              "bg-rose-500/15 text-rose-700 dark:text-rose-300",
              XCircle,
            ],
            [
              "Units Available",
              stats.inStockAvailable,
              "bg-sky-500/15 text-sky-700 dark:text-sky-300",
              Package,
            ],
          ] as const
        ).map(([label, count, tone, Icon]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm transition-colors hover:border-brand/40"
          >
            <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg",
                  tone
                )}
              >
                <Icon className="size-3.5" />
              </span>
              {label}
            </span>
            <span className="text-lg font-extrabold text-foreground">
              {count}
            </span>
          </div>
        ))}
      </section>

      {/* ---------- Charts (live server data) ---------- */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EarningsChart
            data={monthlyRevenue.map((entry) => ({
              month: entry.month,
              value: entry.earnings,
            }))}
          />
        </div>
        <BookingStatusChart data={statusBreakdown} />
      </section>

      {/* ---------- Recent bookings + listed equipment ---------- */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Booking Requests */}
        <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Recent Booking Requests
              </CardTitle>
              <CardDescription className="text-xs">
                Your latest rental reservations
              </CardDescription>
            </div>
            <Link
              href="/dashboard/owner/my-rentals"
              className="cursor-pointer text-xs font-bold text-brand-hover transition-colors hover:underline"
            >
              Manage Rentals →
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {recentBookings.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
                <Package className="size-7 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">
                  No bookings yet
                </p>
                <p className="text-xs text-muted-foreground">
                  When customers rent your equipment, bookings appear here.
                </p>
              </div>
            ) : (
              recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 p-3 transition-all hover:border-brand/50 hover:bg-muted/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {b.equipmentImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.equipmentImage}
                          alt={b.equipmentName}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center">
                          <Package className="size-4 text-muted-foreground/60" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-sm font-bold text-foreground">
                          {b.equipmentName}
                        </p>
                        <StatusChip status={b.status} />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {b.renterName} • {formatDate(b.startDate)} –{" "}
                        {formatDate(b.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-extrabold text-brand-hover">
                      {formatTaka(b.totalAmount)}
                    </p>
                    <p
                      className={cn(
                        "text-[10px] font-bold uppercase",
                        b.paymentStatus === "paid"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {b.paymentStatus}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Your Listed Equipment */}
        <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Your Listed Equipment
              </CardTitle>
              <CardDescription className="text-xs">
                Quick look at your top listings
              </CardDescription>
            </div>
            <Link
              href="/dashboard/owner/my-equipment"
              className="cursor-pointer text-xs font-bold text-brand-hover transition-colors hover:underline"
            >
              Manage Equipment →
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {topEquipment.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
                <Boxes className="size-7 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">
                  No equipment listed
                </p>
                <p className="text-xs text-muted-foreground">
                  Add your first equipment listing to get started.
                </p>
                <Button
                  render={<Link href="/dashboard/owner/add-equipment" />}
                  size="sm"
                  className="mt-1 cursor-pointer bg-brand font-semibold text-neutral-900 hover:bg-brand-hover"
                >
                  Add Equipment
                </Button>
              </div>
            ) : (
              topEquipment.map((eq) => (
                <div
                  key={eq.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 p-3 transition-all hover:border-brand/50 hover:bg-muted/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {eq.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={eq.image}
                          alt={eq.name}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center">
                          <Package className="size-4 text-muted-foreground/60" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">
                        {eq.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        ৳{Number(eq.rentalPrice || 0).toLocaleString("en-US")} /{" "}
                        {eq.rentalType} • Stock: {eq.quantity}
                      </p>
                    </div>
                  </div>
                  <StatusChip status={eq.status ?? "pending"} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {/* ---------- Bottom CTA ---------- */}
      <section className="flex flex-col items-center gap-4 rounded-2xl border border-border/70 bg-[#faf6f1] px-6 py-7 text-center dark:bg-neutral-900 sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
            Need to manage your listings or add new machinery?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update pricing, available quantities, or rental conditions
            seamlessly.
          </p>
        </div>
        <Button
          render={<Link href="/dashboard/owner/my-equipment" />}
          className="shrink-0 cursor-pointer bg-neutral-900 font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <Settings className="size-4" />
          Manage Equipment →
        </Button>
      </section>
    </div>
  )
}
