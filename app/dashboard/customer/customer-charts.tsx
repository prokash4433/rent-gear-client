"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { CalendarRange, PieChartIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { CustomerDashboardData } from "@/lib/types"

type MonthlyData = CustomerDashboardData["monthly"][number]
type StatusSlice = CustomerDashboardData["statusBreakdown"][number]

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid var(--color-border, #e5e7eb)",
  fontSize: 12,
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
} as const

export function CustomerCharts({
  monthly,
  statusBreakdown,
}: {
  monthly: MonthlyData[]
  statusBreakdown: StatusSlice[]
}) {
  const totalStatus = statusBreakdown.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* ---------- Booking Overview (last 6 months) ---------- */}
      <Card className="rounded-2xl border-border/70 bg-card shadow-sm lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand/20 text-brand-hover">
              <CalendarRange className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Booking Overview
              </CardTitle>
              <CardDescription className="text-xs">
                Rentals you created over the last 6 months
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-64 pt-2">
          {monthly.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No booking history yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="brandFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f0b501" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f0b501" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/60" vertical={false} />
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
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
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

      {/* ---------- Booking Status donut ---------- */}
      <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand/20 text-brand-hover">
              <PieChartIcon className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Booking Status
              </CardTitle>
              <CardDescription className="text-xs">
                How your bookings are doing
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {totalStatus === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No bookings yet.
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <div className="relative h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown.filter((slice) => slice.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={70}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {statusBreakdown
                        .filter((slice) => slice.value > 0)
                        .map((slice) => (
                          <Cell key={slice.name} fill={slice.color} />
                        ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value, name) => `${String(name)}: ${String(value)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-foreground">
                    {totalStatus}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Bookings
                  </span>
                </div>
              </div>

              <ul className="w-full space-y-1.5">
                {statusBreakdown.map((slice) => {
                  const pct =
                    totalStatus === 0
                      ? 0
                      : Math.round((slice.value / totalStatus) * 100)
                  return (
                    <li
                      key={slice.name}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-muted/60"
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
                        <span className="font-normal text-muted-foreground">({pct}%)</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
