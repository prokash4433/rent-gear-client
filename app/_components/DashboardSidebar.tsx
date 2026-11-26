"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { toast } from "@/components/ui/toast"
import { clearAccessToken } from "@/lib/api-client"
import { signOut, useSession } from "@/lib/auth-client"
import { usePathname, useRouter } from "next/navigation"
import {
  BoxIcon,
  CalendarCheck,
  ChartColumn,
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  Settings,
  User,
  Users,
  Wrench,
} from "lucide-react"

import type { MenuItemsByRole } from "@/lib/types"
import Link from "next/link"
import { UserAvatar } from "./dashboard/User-Avatar"

const menuItemsByRole: MenuItemsByRole = {
  customer: [
    { name: "Dashboard", url: "/dashboard/customer", icon: LayoutDashboard },
    { name: "My Bookings", url: "/dashboard/customer/my-booking", icon: CalendarCheck },
    { name: "My Favorites", url: "/dashboard/customer/my-favorites", icon: Heart },
    { name: "Profile Settings", url: "/dashboard/customer/profile-setting", icon: Settings },
  ],
  owner: [
    { name: "Overview", url: "/dashboard/owner", icon: LayoutDashboard },
    { name: "Add Equipment", url: "/dashboard/owner/add-equipment", icon: Plus },
    { name: "My Equipment", url: "/dashboard/owner/my-equipment", icon: BoxIcon },
    { name: "My Rentals", url: "/dashboard/owner/my-rentals", icon: CalendarCheck },
    { name: "Analytics", url: "/dashboard/owner/analytics", icon: ChartColumn },
    { name: "Profile", url: "/dashboard/owner/profile", icon: User },
  ],
  admin: [
    { name: "Overview", url: "/dashboard/admin", icon: LayoutDashboard },
    { name: "All Users", url: "/dashboard/admin/all-users", icon: Users },
    { name: "All Equipment", url: "/dashboard/admin/all-equipments", icon: Package },
    { name: "All Rentals", url: "/dashboard/admin/all-rentals", icon: CalendarCheck },
    { name: "Analytics", url: "/dashboard/admin/analytics", icon: ChartColumn },
    { name: "Profile", url: "/dashboard/admin/profile", icon: User },
  ],
}

export function DashboardSidebar() {
  const { data: session, isPending } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const role = (session?.user?.role as keyof MenuItemsByRole) ?? "customer"
  const menuItems = isPending ? [] : menuItemsByRole[role] ?? menuItemsByRole.customer

  // Check active index, matching both /all-user and /all-users, /all-equipment and /all-equipments
  const activeIndex = menuItems.findIndex((item) => {
    if (item.url === pathname) return true
    if (item.url === "/dashboard/admin/all-users" && pathname === "/dashboard/admin/all-user") return true
    if (item.url === "/dashboard/admin/all-equipments" && (pathname === "/dashboard/admin/all-equipment" || pathname === "/dashboard/admin/all-requipment")) return true
    if (item.url === "/dashboard/admin/all-rentals" && pathname === "/dashboard/all-rentals") return true
    return false
  })

  const handleLogout = async () => {
    try {
      const { error } = await signOut()

      if (error) {
        toast.add({
          type: "error",
          title: "Logout failed",
          description: error.message ?? "Could not log you out. Please try again.",
          timeout: 7000,
        })
        return
      }

      // Drop the cached API JWT so no request can reuse it after sign-out.
      clearAccessToken()

      toast.add({
        type: "success",
        title: "Logged out",
        description: "You have been signed out. See you soon!",
        timeout: 6000,
      })

      router.push("/sign-in")
      router.refresh()
    } catch {
      toast.add({
        type: "error",
        title: "Something went wrong",
        description: "Could not reach the server. Please try again.",
        timeout: 7000,
      })
    }
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <SidebarHeader className="px-5 pt-5 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-neutral-900 shadow-xs">
            <Wrench className="size-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-sidebar-foreground">
            Rental<span className="text-brand">Hub</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* User profile */}
        <SidebarGroup className="items-center gap-2 border-b border-sidebar-border px-4 pb-5 pt-4 text-center">
          <UserAvatar
            src={session?.user?.image}
            name={session?.user?.name}
            className="size-16 ring-2 ring-brand"
          />
          <div className="min-w-0 max-w-full">
            <p className="truncate text-sm font-bold text-sidebar-foreground">
              {session?.user?.name ?? "User"}
            </p>
            <p className="text-xs font-medium capitalize text-muted-foreground">{role}</p>
          </div>
        </SidebarGroup>

        {/* Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarMenu className="gap-1">
            {menuItems.map((item, index) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  render={<Link href={item.url} />}
                  isActive={index === activeIndex}
                  className="h-10 rounded-lg px-3 text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-brand data-active:font-semibold data-active:text-neutral-900 data-active:hover:bg-brand-hover"
                >
                  <item.icon className="size-4.5" />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Logout */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors md:inline-flex"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border">
                <LogOut className="size-4 text-[#e60023]" strokeWidth={2} />
              </span>
              <span className="text-sm font-bold text-[#e60023]">Logout</span>
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}