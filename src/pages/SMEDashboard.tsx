import { Routes, Route, Navigate } from "react-router-dom";
import { SMESidebar } from "@/components/SMESidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import SMEDashboardHome from "./sme/SMEDashboardHome";
import SMESessions from "./sme/SMESessions";
import SMEStudents from "./sme/SMEStudents";
import SMENotifications from "./sme/SMENotifications";
import SMEAssignCourses from "./sme/SMEAssignCourses";
import SMEMyAttendancePage from "./sme/MyAttendancePage";

const SMEDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SMESidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="SME Dashboard" subtitle="Subject Matter Expert Portal" />
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route index element={<SMEDashboardHome />} />
                <Route path="sessions" element={<SMESessions />} />
                <Route path="students" element={<SMEStudents />} />
                <Route path="notifications" element={<SMENotifications />} />
                <Route path="assign-courses" element={<SMEAssignCourses />} />
                <Route path="attendance" element={<SMEMyAttendancePage />} />
                <Route path="*" element={<Navigate to="/sme" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SMEDashboard;