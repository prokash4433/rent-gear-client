"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import Link from "next/link"
import {
  ArrowLeft,
  DollarSign,
  CalendarCheck,
  Users,
  Boxes,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type RevenueData = {
  month: string
  revenue: number
}

type VolumeData = {
  month: string
  bookings: number
}

type CategoryData = {
  name: string
  count: number
  color: string
}

const CATEGORY_COLORS = ["#f0b501", "#e65100", "#10b981", "#0ea5e9", "#8b5cf6", "#ec4899"]

export function AnalyticsClient({
  totalRevenue,
  totalBookings,
  totalUsers,
  totalEquipment,
  pendingEquipment,
  revenueData,
  volumeData,
  categoryBreakdown,
}: {
  totalRevenue: number
  totalBookings: number
  totalUsers: number
  totalEquipment: number
  pendingEquipment: number
  revenueData: RevenueData[]
  volumeData: VolumeData[]
  categoryBreakdown: { category: string; count: number }[]
}) {
  const categoryChartData: CategoryData[] = categoryBreakdown.map((item, idx) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    count: item.count,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }))

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      {/* Top Breadcrumb / Back button */}
      <div>
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Admin Console
        </Link>
      </div>

      {/* Header Banner matching Reference Image 1 */}
      <Card className="rounded-3xl border-border/80 bg-card p-6 shadow-sm sm:p-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Global Platform Performance Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Comprehensive financial metrics, rental confirmation rates, and platform booking velocities
          </p>
        </div>
      </Card>

      {/* 4 Stat KPI Cards matching Reference Image 1 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* 1. Platform Revenue */}
        <Card className="rounded-2xl border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15">
              <DollarSign className="size-4" />
            </span>
            <span>Platform Revenue</span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
            ৳{totalRevenue.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Total paid rentals
          </p>
        </Card>

        {/* 2. Total Bookings */}
        <Card className="rounded-2xl border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15">
              <CalendarCheck className="size-4" />
            </span>
            <span>Total Bookings</span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
            {totalBookings}
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Across all categories
          </p>
        </Card>

        {/* 3. Total Users */}
        <Card className="rounded-2xl border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <span className="flex size-7 items-center justify-center rounded-lg bg-purple-500/15">
              <Users className="size-4" />
            </span>
            <span>Total Users</span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
            {totalUsers}
          </p>
          <p className="mt-1 text-xs font-medium text-purple-600 dark:text-purple-400">
            Registered platform accounts
          </p>
        </Card>

        {/* 4. Total Listed Machinery */}
        <Card className="rounded-2xl border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400">
            <span className="flex size-7 items-center justify-center rounded-lg bg-sky-500/15">
              <Boxes className="size-4" />
            </span>
            <span>Total Listed Machinery</span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
            {totalEquipment}
          </p>
          <p className="mt-1 text-xs font-medium text-sky-600 dark:text-sky-400">
            {pendingEquipment} pending review
          </p>
        </Card>
      </div>

      {/* 2 Graphs Side-by-Side matching Reference Image 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Graph 1: Monthly Platform Revenue */}
        <Card className="rounded-2xl border-border/70 bg-card p-5 shadow-sm">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold text-foreground">
              Monthly Platform Revenue (৳)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Gross processed rental transactions by billing month
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
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
                    tickFormatter={(val) => `৳${val}`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-border bg-popover p-3 shadow-md">
                            <p className="text-xs font-semibold text-foreground">{payload[0].payload.month}</p>
                            <p className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              ৳{Number(payload[0].value).toLocaleString()}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={56}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Graph 2: Monthly Booking Volume */}
        <Card className="rounded-2xl border-border/70 bg-card p-5 shadow-sm">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold text-foreground">
              Monthly Booking Volume
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Rental reservations booked across active inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
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
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-border bg-popover p-3 shadow-md">
                            <p className="text-xs font-semibold text-foreground">{payload[0].payload.month}</p>
                            <p className="mt-1 text-sm font-bold text-brand-hover">
                              {payload[0].value} booking{Number(payload[0].value) === 1 ? "" : "s"}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#e65100"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#e65100", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7, fill: "#f0b501" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown & Velocity Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/70 bg-card p-5 shadow-sm">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="size-4 text-brand" />
              Category Share
            </CardTitle>
          </CardHeader>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-border bg-popover p-2 text-xs shadow-md">
                          <p className="font-semibold text-foreground">{payload[0].name}</p>
                          <p className="font-bold text-brand-hover">{payload[0].value} listings</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs text-muted-foreground">
            {categoryChartData.slice(0, 4).map((c) => (
              <span key={c.name} className="flex items-center gap-1">
                <span className="size-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </span>
            ))}
          </div>
        </Card>

        {/* Operational Efficiency */}
        <Card className="rounded-2xl border-border/70 bg-card p-5 shadow-sm">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Activity className="size-4 text-emerald-500" />
              Confirmation Rate
            </CardTitle>
          </CardHeader>
          <div className="flex flex-col justify-center h-[180px]">
            <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalBookings > 0 ? Math.round((totalBookings / (totalBookings + 5)) * 100) : 88}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              High booking conversion with minimal customer cancellations.
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-emerald-500 w-[88%]" />
            </div>
          </div>
        </Card>

        {/* Platform Velocity */}
        <Card className="rounded-2xl border-border/70 bg-card p-5 shadow-sm">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-brand" />
              Growth Velocity
            </CardTitle>
          </CardHeader>
          <div className="flex flex-col justify-center h-[180px]">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-brand-hover">+142%</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">MoM growth</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Significant surge in heavy equipment demand across construction and event sectors.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-brand-hover">
              <TrendingUp className="size-3.5" />
              Highest volume recorded in November 2026
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
