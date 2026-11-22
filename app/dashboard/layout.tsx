import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
 
import { DashboardSidebar } from "../_components/DashboardSidebar"
import { DashboardTopbar } from "../_components/dashboard/topbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
          return (
          <SidebarProvider>
          <DashboardSidebar/>
          {/* flex-1 + min-w-0: main fills the space next to the sidebar and
              can shrink below its content, so wide content (like the All
              Equipment table) scrolls inside its own container instead of
              pushing the whole page sideways. */}
          <main className="flex-1 min-w-0">
          <SidebarTrigger />
        <DashboardTopbar />
          {children}
          </main>
          </SidebarProvider>
          );
};

export default DashboardLayout;