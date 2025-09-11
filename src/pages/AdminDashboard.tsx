
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { Outlet } from "react-router-dom";

const AdminLayoutContent = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Sidebar (fixed inside AdminSidebar) */}
      <div className="fixed left-0 top-0 h-screen z-20">
        <AdminSidebar />
      </div>

      {/* Content area pushed by sidebar width */}
      <div
        className={`flex flex-col transition-all duration-200 ease-in-out ${
          collapsed
            ? "ml-[var(--sidebar-width-icon)]"
            : "ml-[var(--sidebar-width)]"
        } min-h-screen`}
      >
        <AdminHeader />
        <main className="flex-1 p-6 overflow-x-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AdminLayout = () => (
  <SidebarProvider>
    <AdminLayoutContent />
  </SidebarProvider>
);

export default AdminLayout;
