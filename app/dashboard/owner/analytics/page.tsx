import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  ArrowLeft,
  Boxes,
  CalendarCheck,
  DollarSign,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { getOwnerAnalytics } from "@/lib/data/owner"
import { cn } from "@/lib/utils"
import { AnalyticsEarningsChart } from "./analytics-earnings-chart"

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
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            tone
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="text-sm font-semibold text-foreground">{label}</span>
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 sm:p-6">
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
          <p className="text-sm text-muted-foreground">
            Comprehensive breakdown of payouts, confirmed rentals, and monthly
            equipment utilization
          </p>
        </CardHeader>
      </Card>

      {/* Stat cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Earnings"
          value={formatTaka(data.totalEarnings)}
          tag="All-time fulfilled orders"
          icon={DollarSign}
          tone="bg-sky-500/15 text-sky-600 dark:text-sky-400"
        />
        <StatCard
          label="Completed Rentals"
          value={String(data.completedRentals)}
          tag="Fulfilled successfully"
          icon={CalendarCheck}
          tone="bg-brand/20 text-brand-hover"
        />
        <StatCard
          label="Active Fleet Listings"
          value={String(data.activeListings)}
          tag="Listed in platform catalog"
          icon={Boxes}
          tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
      </section>

      {/* Earnings chart */}
      <AnalyticsEarningsChart monthlyEarnings={data.monthlyEarnings} />
    </div>
  )
}
