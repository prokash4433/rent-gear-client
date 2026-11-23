"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type MonthlyData = { month: string; earnings: number }

export function AnalyticsEarningsChart({
  monthlyEarnings,
}: {
  monthlyEarnings: MonthlyData[]
}) {
  const hasData = monthlyEarnings.some((d) => d.earnings > 0)

  return (
    <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-foreground">
          Monthly Earnings Trends (৳)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80 pt-2">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No earnings data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyEarnings}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                tickFormatter={(val) => `৳${val}`}
              />
              <Tooltip
                cursor={{ fill: "rgba(230, 81, 0, 0.08)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-border bg-popover p-3 shadow-md">
                        <p className="text-xs font-semibold text-foreground">
                          {payload[0].payload.month}
                        </p>
                        <p className="mt-1 text-sm font-bold text-brand-hover">
                          ৳{Number(payload[0].value).toLocaleString()}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="earnings"
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
