import { Routes, Route, Navigate } from "react-router-dom";
import { StudentSidebar } from "@/components/StudentSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import StudentMyAttendancePage from "./student/MyAttendancePage";
import StudentSessions from "./student/StudentSessions";
import StudentCourses from "./student/StudentCourses";
import StudentNotifications from "./student/StudentNotifications";
import StudentDashboardHome from "./student/StudentDashboardHome";

const StudentDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Student Dashboard" subtitle="Your learning overview" />
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route index element={<StudentDashboardHome />} />
                <Route path="attendance" element={<StudentMyAttendancePage />} />
                <Route path="sessions" element={<StudentSessions />} />
                <Route path="courses" element={<StudentCourses />} />
                <Route path="notifications" element={<StudentNotifications />} />
                <Route path="*" element={<Navigate to="/student" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StudentDashboard;