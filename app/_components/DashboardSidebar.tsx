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
    { name: "All Users", url: "/dashboard/admin/all-user", icon: Users },
    { name: "All Equipment", url: "/dashboard/admin/all-equipment", icon: Package },
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
  const activeIndex = menuItems.findIndex((item) => item.url === pathname)

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <Sidebar className="border-r-0">
      {/* Logo */}
      <SidebarHeader className="px-5 pt-5 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-white">
            <Wrench className="size-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Rental<span className="text-brand">Hub</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* User profile */}
        <SidebarGroup className="items-center gap-2 border-b border-white/10 px-4 pb-5 pt-4 text-center">
          <UserAvatar
            src={session?.user?.image}
            name={session?.user?.name}
            className="size-16 ring-2 ring-brand/70"
          />
          <div className="min-w-0 max-w-full">
            <p className="truncate text-sm font-bold text-white">
              {session?.user?.name ?? "Loading..."}
            </p>
            <p className="text-xs capitalize text-white/60">{role}</p>
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
                  className="h-10 rounded-lg px-3 text-white/80 hover:bg-white/10 hover:text-white data-active:bg-brand data-active:font-semibold data-active:text-white data-active:hover:bg-brand-hover data-active:active:bg-brand-hover"
                >
                  <item.icon />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Logout */}
      <SidebarFooter className="border-t border-white/10 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="h-10 rounded-lg px-3 text-white/80 hover:bg-red-500/15 hover:text-red-300"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}