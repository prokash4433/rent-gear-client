"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Bell,
  CheckCircle2,
  Clock,
  DollarSign,
  Moon,
  Search,
  Sun,
  UserCheck,
  Check,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useSession } from "@/lib/auth-client"
import { UserAvatar } from "./User-Avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </button>
  )
}

const STATIC_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "10 Equipment Pending Review",
    desc: "New machinery submissions require admin verification.",
    time: "15m ago",
    icon: Clock,
    color: "text-amber-500 bg-amber-500/10",
    href: "/dashboard/admin/all-equipments",
  },
  {
    id: "notif-2",
    title: "New Booking Confirmed (৳100)",
    desc: "Canon DSLR Camera rented by Sabid Ahmed.",
    time: "1h ago",
    icon: CheckCircle2,
    color: "text-emerald-500 bg-emerald-500/10",
    href: "/dashboard/admin/all-rentals",
  },
  {
    id: "notif-3",
    title: "New Owner Registered",
    desc: "duxisic@mailinator.com registered as Equipment Owner.",
    time: "3h ago",
    icon: UserCheck,
    color: "text-purple-500 bg-purple-500/10",
    href: "/dashboard/admin/all-users",
  },
  {
    id: "notif-4",
    title: "Platform Revenue Payout",
    desc: "৳1,683 payout settled for Atque Nam voluptas s.",
    time: "5h ago",
    icon: DollarSign,
    color: "text-brand bg-brand/10",
    href: "/dashboard/admin/analytics",
  },
]

export function DashboardTopbar() {
  const { data: session } = useSession()
  const [query, setQuery] = useState("")
  const [hasUnread, setHasUnread] = useState(true)

  // Each role keeps its own profile page; customers land on Profile Settings.
  const role = (session?.user?.role as string) ?? "customer"
  const profileHref =
    role === "admin"
      ? "/dashboard/admin/profile"
      : role === "owner"
        ? "/dashboard/owner/profile"
        : "/dashboard/customer/profile-setting"

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      {/* Equipment Search Input */}
      <form action="/browse-equipments" className="relative w-full max-w-sm" role="search">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search equipment..."
          className="h-9 w-full rounded-lg border border-input bg-muted/30 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:bg-muted/20"
        />
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-3 cursor-pointer">
        {/* <Link
          href="/dashboard/customer/my-booking"
          className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          My Bookings
        </Link> */}

        {/* Theme Mode Switcher */}
        <ThemeToggle />

        {/* Functional Notification Bell with Relevant Static Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Notifications"
                className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <Bell className="size-4" />
                {hasUnread && (
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-brand ring-2 ring-background" />
                )}
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-80 p-2 sm:w-96">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm font-bold text-foreground">Notifications</span>
              {hasUnread && (
                <button
                  type="button"
                  onClick={() => setHasUnread(false)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-brand-hover hover:underline"
                >
                  <Check className="size-3" />
                  Mark all as read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />

            <div className="flex flex-col gap-1 py-1">
              {STATIC_NOTIFICATIONS.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  render={<Link href={n.href} onClick={() => setHasUnread(false)} />}
                  className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/60"
                >
                  <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${n.color}`}>
                    <n.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-foreground">{n.title}</p>
                    <p className="line-clamp-2 text-[11px] text-muted-foreground">{n.desc}</p>
                    <span className="mt-1 block text-[10px] text-muted-foreground/70">{n.time}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator />
            <div className="p-1 text-center">
              <Link
                href="/dashboard/admin/all-equipments"
                className="text-xs font-semibold text-brand-hover hover:underline"
              >
                View Pending Review Queue →
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar linking to the signed-in user's profile */}
        <Link href={profileHref} title="Profile Settings">
          <UserAvatar
            src={session?.user?.image}
            name={session?.user?.name}
            className="size-9 ring-1 ring-border transition-transform hover:scale-105"
          />
        </Link>
      </div>
    </header>
  )
}