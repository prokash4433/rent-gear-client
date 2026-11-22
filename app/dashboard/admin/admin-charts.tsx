"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, PieChartIcon } from "lucide-react"

type MonthlyData = {
  month: string
  bookings: number
  revenue: number
}

type CategoryData = {
  name: string
  count: number
  color: string
}

const CATEGORY_COLORS = [
  "#f0b501", // brand
  "#e65100", // deep amber/orange
  "#10b981", // emerald
  "#0ea5e9", // sky
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#64748b", // slate
]

export function AdminCharts({
  monthlyData,
  categoryData,
}: {
  monthlyData: MonthlyData[]
  categoryData: { category: string; count: number }[]
}) {
  const [activeTab, setActiveTab] = useState<"velocity" | "revenue">("velocity")

  const formattedCategories: CategoryData[] = categoryData.map((cat, idx) => ({
    name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
    count: cat.count,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }))

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Chart 1: Monthly Platform Bookings & Velocity (Spans 2 columns) */}
      <Card className="rounded-2xl border-border/70 bg-card shadow-sm lg:col-span-2">
        <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <BarChart3 className="size-5 text-brand" />
              Monthly Platform Bookings & Velocity
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Tracking booking frequency, equipment utilization, and volume trends
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border/70 bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("velocity")}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  activeTab === "velocity"
                    ? "bg-brand font-bold text-neutral-900 shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Volume
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("revenue")}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  activeTab === "revenue"
                    ? "bg-brand font-bold text-neutral-900 shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Revenue (৳)
              </button>
            </div>
            <span className="hidden rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px] font-semibold text-muted-foreground sm:inline">
              2026 Overview
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "velocity" ? (
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    cursor={{ fill: "rgba(240, 181, 1, 0.08)" }}
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
                  <Bar
                    dataKey="bookings"
                    fill="#f0b501"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              ) : (
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f0b501" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f0b501" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
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
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-border bg-popover p-3 shadow-md">
                            <p className="text-xs font-semibold text-foreground">{payload[0].payload.month}</p>
                            <p className="mt-1 text-sm font-bold text-brand-hover">
                              ৳{Number(payload[0].value).toLocaleString()}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f0b501"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Inventory Category Distribution */}
      <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <PieChartIcon className="size-5 text-brand" />
            Category Distribution
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Equipment catalog share across categories
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedCategories}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {formattedCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-border bg-popover p-2.5 text-xs shadow-md">
                          <p className="font-semibold text-foreground">{payload[0].name}</p>
                          <p className="mt-0.5 font-bold text-brand-hover">
                            {payload[0].value} item{Number(payload[0].value) === 1 ? "" : "s"}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom compact legend */}
          <div className="mt-2 flex flex-wrap justify-center gap-2 max-h-24 overflow-y-auto pt-1">
            {formattedCategories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="truncate max-w-[120px]">{cat.name} ({cat.count})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
