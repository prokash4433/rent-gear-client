"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Search } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"
import { UserAvatar } from "./User-Avatar"
 

export function DashboardTopbar() {
          const { data: session } = useSession()
          const [query, setQuery] = useState("")
          const hasUnread = true // TODO: notification data-r sathe connect korben

          return (
                    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#eadfd3] bg-white px-4 sm:px-6">
                              {/* Mobile-e sidebar kholar button */}
                              <SidebarTrigger className="md:hidden" />

                              {/* Search */}
                              <form action="/equipment" className="relative w-full max-w-sm" role="search">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                                        <input
                                                  name="search"
                                                  value={query}
                                                  onChange={(e) => setQuery(e.target.value)}
                                                  placeholder="Search equipment..."
                                                  className="h-10 w-full rounded-lg border border-[#eadfd3] bg-[#faf6f1] pl-9 pr-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                                        />
                              </form>

                              <div className="ml-auto flex items-center gap-2 sm:gap-4">
                                        <Link
                                                  href="/dashboard/customer/my-booking"
                                                  className="hidden text-sm font-semibold text-neutral-700 hover:text-brand sm:block"
                                        >
                                                  My Bookings
                                        </Link>

                                        <button
                                                  type="button"
                                                  aria-label="Notifications"
                                                  className="relative flex size-10 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100"
                                        >
                                                  <Bell className="size-5" />
                                                  {hasUnread && (
                                                            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand ring-2 ring-white" />
                                                  )}
                                        </button>

                                        <UserAvatar
                                                  src={session?.user?.image}
                                                  name={session?.user?.name}
                                                  className="size-9"
                                        />
                              </div>
                    </header>
          )
}