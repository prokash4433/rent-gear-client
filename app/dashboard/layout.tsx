import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
 
import { DashboardSidebar } from "../_components/DashboardSidebar"
import { DashboardTopbar } from "../_components/dashboard/topbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
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