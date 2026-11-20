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
import { useSession } from "@/lib/auth-client"
import { usePathname } from "next/navigation"
import {
  BoxIcon,
   
          CalendarCheck,
          ChartColumn,
          Heart,
          LayoutDashboard,
          Package,
          Plus,
          Settings,
          User,
          Users,
} from "lucide-react"

import type { MenuItemsByRole } from "@/lib/types"
import Link from "next/link"

// Menu items for each role. "Dashboard" / "Overview" open the role's main
// page; every other item has its own dedicated sub-page.
const menuItemsByRole: MenuItemsByRole = {
          customer: [
                    { name: "Dashboard", url: "/dashboard/customer", icon: LayoutDashboard },
                    { name: "My Booking", url: "/dashboard/customer/my-booking", icon: CalendarCheck },
                    { name: "My Favorites", url: "/dashboard/customer/my-favorites", icon: Heart },
                    { name: "Profile Setting", url: "/dashboard/customer/profile-setting", icon: Settings },
          ],
          owner: [
                    { name: "Overview", url: "/dashboard/owner", icon: LayoutDashboard },
                    { name: "Add Equipment", url: "/dashboard/owner/add-equipment", icon: Plus },
                   { name: "My Equipment", url: "/dashboard/owner/my-equipment", icon: BoxIcon},
                    { name: "My Rentals", url: "/dashboard/owner/my-rentals", icon: CalendarCheck },
                    { name: "Analytics", url: "/dashboard/owner/analytics", icon: ChartColumn },
                    { name: "Profile", url: "/dashboard/owner/profile", icon: User },
          ],
          admin: [
                    { name: "Overview", url: "/dashboard/admin", icon: LayoutDashboard },
                    {  name: "All User", url: "/dashboard/admin/all-user", icon: Users },
                    { name: "All Equipment", url: "/dashboard/admin/all-equipment", icon: Package },
                    { name: "All Rentals", url: "/dashboard/admin/all-rentals", icon: CalendarCheck },
                    { name: "Analytics", url: "/dashboard/admin/analytics", icon: ChartColumn },
                    { name: "Profile", url: "/dashboard/admin/profile", icon: User },
          ],
}

export function DashboardSidebar() {
          const { data: session, isPending } = useSession()
          const pathname = usePathname()

          // Until the session loads (or if the role is unknown) show the customer menu.
          const menuItems = isPending
                    ? []
                    : menuItemsByRole[session?.user?.role as keyof MenuItemsByRole] ??
                      menuItemsByRole.customer

          // Highlight the first item that points at the current page.
          const activeIndex = menuItems.findIndex((item) => item.url === pathname)

          return (
                    <Sidebar>
                              <SidebarHeader />
                              <SidebarContent>
                                        <SidebarGroup />
                                        <SidebarGroup />

                                        <SidebarGroup>
                                                  <SidebarMenu>
                                                            {menuItems.map((item, index) => (
                                                                      <SidebarMenuItem key={item.name}>
                                                                                <SidebarMenuButton
                                                                                          render={<Link href={item.url} />}
                                                                                          isActive={index === activeIndex}
                                                                                          className="data-active:bg-brand data-active:text-neutral-900 data-active:hover:bg-brand-hover data-active:active:bg-brand-hover"
                                                                                >
                                                                                          <item.icon />
                                                                                          <span>{item.name}</span>
                                                                                </SidebarMenuButton>
                                                                      </SidebarMenuItem>
                                                            ))}
                                                  </SidebarMenu>
                                        </SidebarGroup>
                              </SidebarContent>
                              <SidebarFooter />
                    </Sidebar>
          )
}
