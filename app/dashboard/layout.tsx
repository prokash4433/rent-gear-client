import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { requireSession } from "@/lib/auth-guard"
import { DashboardSidebar } from "../_components/DashboardSidebar"
import { DashboardTopbar } from "../_components/dashboard/topbar";

/**
 * Dashboard content is per-user, so it is always rendered per request —
 * never prerendered at build time (a static shell would carry a stale
 * session answer). Applies to every page below this layout.
 */
export const dynamic = "force-dynamic"

/**
 * Every dashboard page is private: an unsigned-in visitor is redirected
 * to /sign-in before the shell (or any data) renders. Role scoping lives
 * in the per-role layouts below this one.
 */
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
          await requireSession()

          return (
            
          <SidebarProvider>
          
        <DashboardSidebar />
          <main className="flex-1 min-w-0">
          <SidebarTrigger />
        <DashboardTopbar />
          {children}
          </main>
          </SidebarProvider>
          );
};

export default DashboardLayout;