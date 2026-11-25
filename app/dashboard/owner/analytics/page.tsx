import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  ArrowLeft,
  Boxes,
  CalendarCheck,
  Clock,
  DollarSign,
  Package,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { getOwnerAnalytics } from "@/lib/data/owner"
import { cn } from "@/lib/utils"
import {
  BookingStatusChart,
  BookingsChart,
  EarningsChart,
  TopEquipmentChart,
} from "../charts"

export const metadata = {
  title: "Owner Analytics - RentalHub",
  description:
    "Comprehensive breakdown of payouts, confirmed rentals, and monthly equipment utilization.",
}

function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-US")}`
}

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
    <Card className="rounded-2xl border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            tone
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-brand-hover">{tag}</p>
    </Card>
  )
}

export default async function OwnerAnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const data = await getOwnerAnalytics(session.user.email)
  const { stats } = data

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 sm:p-6">
      <Link
        href="/dashboard/owner"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      {/* Title */}
      <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold text-foreground">
            Financial & Rental Volume Performance
          </CardTitle>
          <CardDescription className="text-sm">
            Comprehensive breakdown of payouts, confirmed rentals, and monthly
            equipment utilization
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stat cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Earnings"
          value={formatTaka(stats.totalEarnings)}
          tag="Paid bookings, all time"
          icon={DollarSign}
          tone="bg-sky-500/15 text-sky-600 dark:text-sky-400"
        />
        <StatCard
          label="Completed Rentals"
          value={String(stats.completedRentals)}
          tag="Confirmed or completed"
          icon={CalendarCheck}
          tone="bg-brand/20 text-brand-hover"
        />
        <StatCard
          label="Active Fleet Listings"
          value={String(stats.totalListings)}
          tag={`${stats.approvedListings} approved of ${stats.totalListings}`}
          icon={Boxes}
          tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Unpaid Earnings"
          value={formatTaka(stats.unpaidEarnings)}
          tag={`${stats.pendingBookings} bookings awaiting payment`}
          icon={Clock}
          tone="bg-amber-500/15 text-amber-600 dark:text-amber-400"
        />
      </section>

      {/* Earnings + bookings charts */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EarningsChart
          data={data.monthlyEarnings.map((entry) => ({
            month: entry.month,
            value: entry.earnings,
          }))}
          description="Paid bookings over the last 6 months"
        />
        <BookingsChart
          data={data.monthlyBookings.map((entry) => ({
            month: entry.month,
            value: entry.bookings,
          }))}
        />
      </section>

      {/* Status donut + top equipment */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BookingStatusChart data={data.statusBreakdown} />
        <TopEquipmentChart data={data.topEquipment} />
      </section>

      {/* Top listings table */}
      <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
              <Package className="size-4" />
            </span>
            Earnings by Listing
          </CardTitle>
          <CardDescription className="text-xs">
            Every listing that has received a booking, ranked by earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.topEquipment.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No bookings yet. Earnings per listing appear here once your
              equipment is rented.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4 font-semibold">Listing</th>
                    <th className="py-2 pr-4 font-semibold">Bookings</th>
                    <th className="py-2 text-right font-semibold">Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topEquipment.map((item) => (
                    <tr
                      key={item.name}
                      className="border-b border-border/40 last:border-0"
                    >
                      <td className="max-w-[240px] truncate py-3 pr-4 font-semibold text-foreground">
                        {item.name}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {item.bookings}
                      </td>
                      <td className="py-3 text-right font-bold text-brand-hover">
                        {formatTaka(item.earnings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
