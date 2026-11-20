import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
 
import { DashboardSidebar } from "../_components/DashboardSidebar"

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
          {children}
          </main>
          </SidebarProvider>
          );
};

export default DashboardLayout;