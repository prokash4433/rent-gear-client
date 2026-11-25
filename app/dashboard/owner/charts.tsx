"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { CalendarRange, PieChartIcon, TrendingUp, Trophy } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { StatusSlice } from "@/lib/data/owner"

type MonthlyValue = { month: string; value: number }

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid var(--color-border, #e5e7eb)",
  fontSize: 12,
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
} as const

/** 1200 -> "৳1.2k", 500 -> "৳500" — keeps the Y axis short. */
function compactTaka(value: number) {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `৳${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) {
    const thousands = value / 1_000
    return `৳${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`
  }
  return `৳${value}`
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function ChartHeader({
  icon: Icon,
  title,
  description,
  tone = "bg-brand/20 text-brand-hover",
}: {
  icon: React.ElementType
  title: string
  description: string
  tone?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tone}`}
      >
        <Icon className="size-4" />
      </span>
      <div>
        <CardTitle className="text-base font-bold text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </div>
    </div>
  )
}

function RangeBadge({ label = "Last 6 months" }: { label?: string }) {
  return (
    <CardAction>
      <span className="rounded-md border border-border bg-muted/30 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
        {label}
      </span>
    </CardAction>
  )
}

/** Paid earnings per month as vertical bars. */
export function EarningsChart({
  data,
  title = "Monthly Earnings",
  description = "Paid bookings over the last 6 months",
  height = "h-72",
}: {
  data: MonthlyValue[]
  title?: string
  description?: string
  height?: string
}) {
  const hasData = data.some((entry) => entry.value > 0)

  return (
    <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
      <CardHeader className="grid-cols-[1fr_auto] items-center">
        <ChartHeader
          icon={TrendingUp}
          title={title}
          description={description}
          tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
        <RangeBadge />
      </CardHeader>
      <CardContent className={`${height} pt-2`}>
        {!hasData ? (
          <ChartEmptyState message="No earnings yet. Earnings appear here as soon as your bookings are paid." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border/40"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
                className="text-xs text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
                className="text-xs text-muted-foreground"
                tickFormatter={compactTaka}
              />
              <Tooltip
                cursor={{ fill: "rgba(240, 181, 1, 0.08)" }}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ fontWeight: 700 }}
                formatter={(value) => [
                  `৳${Number(value).toLocaleString("en-US")}`,
                  "Earnings",
                ]}
              />
              <Bar
                dataKey="value"
                fill="#e65100"
                radius={[6, 6, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

/** Bookings created per month as a filled area chart. */
export function BookingsChart({
  data,
  title = "Booking Activity",
  description = "Bookings created over the last 6 months",
}: {
  data: MonthlyValue[]
  title?: string
  description?: string
}) {
  const hasData = data.some((entry) => entry.value > 0)

  return (
    <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
      <CardHeader className="grid-cols-[1fr_auto] items-center">
        <ChartHeader
          icon={CalendarRange}
          title={title}
          description={description}
        />
        <RangeBadge />
      </CardHeader>
      <CardContent className="h-64 pt-2">
        {!hasData ? (
          <ChartEmptyState message="No bookings yet. New bookings show up here." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 6, right: 8, left: -22, bottom: 0 }}
            >
              <defs>
                <linearGradient id="brandFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f0b501" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f0b501" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border/40"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
              />
              <Tooltip
                cursor={{ stroke: "#f0b501", strokeWidth: 1 }}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ fontWeight: 700 }}
                formatter={(value) => [String(value), "Bookings"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#e0a500"
                strokeWidth={2.5}
                fill="url(#brandFill)"
                activeDot={{ r: 5, fill: "#e0a500", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

/** Pending / confirmed / completed / cancelled bookings as a donut chart. */
export function BookingStatusChart({ data }: { data: StatusSlice[] }) {
  const slices = data.filter((slice) => slice.value > 0)
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
      <CardHeader className="grid-cols-[1fr_auto] items-center">
        <ChartHeader
          icon={PieChartIcon}
          title="Booking Status"
          description="How your bookings are doing"
          tone="bg-brand/20 text-brand-hover"
        />
        <RangeBadge label="All time" />
      </CardHeader>
      <CardContent className="pt-2">
        {total === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No bookings yet.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={70}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {slices.map((slice) => (
                      <Cell key={slice.name} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value, name) =>
                      `${String(name)}: ${String(value)}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-foreground">
                  {total}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Bookings
                </span>
              </div>
            </div>

            <ul className="w-full space-y-1.5">
              {data.map((slice) => {
                const pct = Math.round((slice.value / total) * 100)
                return (
                  <li
                    key={slice.name}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-muted/60"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: slice.color }}
                      />
                      {slice.name}
                    </span>
                    <span className="font-semibold text-foreground">
                      {slice.value}{" "}
                      <span className="font-normal text-muted-foreground">
                        ({pct}%)
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/** The listings that earned the most, as horizontal bars. */
export function TopEquipmentChart({
  data,
}: {
  data: { name: string; earnings: number }[]
}) {
  const hasData = data.some((entry) => entry.earnings > 0)

  return (
    <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
      <CardHeader className="grid-cols-[1fr_auto] items-center">
        <ChartHeader
          icon={Trophy}
          title="Top Earning Equipment"
          description="Your best performing listings"
          tone="bg-violet-500/15 text-violet-600 dark:text-violet-400"
        />
        <RangeBadge label="All time" />
      </CardHeader>
      <CardContent className="h-72 pt-2">
        {!hasData ? (
          <ChartEmptyState message="No paid bookings yet. Your best listings show up here." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                className="stroke-border/40"
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
                className="text-xs text-muted-foreground"
                tickFormatter={compactTaka}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={132}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
                className="text-xs text-muted-foreground"
                tickFormatter={(value: string) =>
                  value.length > 18 ? `${value.slice(0, 17)}…` : value
                }
              />
              <Tooltip
                cursor={{ fill: "rgba(240, 181, 1, 0.08)" }}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ fontWeight: 700 }}
                formatter={(value) => [
                  `৳${Number(value).toLocaleString("en-US")}`,
                  "Earned",
                ]}
              />
              <Bar dataKey="earnings" fill="#e65100" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
