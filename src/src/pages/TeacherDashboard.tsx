import { Routes, Route, Navigate } from "react-router-dom";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import TeacherDashboardHome from "./teacher/TeacherDashboardHome";
import TeacherCourses from "./teacher/TeacherCourses";
import TeacherSessions from "./teacher/TeacherSessions";
import TeacherStudents from "./teacher/TeacherStudents";
import TeacherNotifications from "./teacher/TeacherNotifications";

const TeacherDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TeacherSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Teacher Dashboard" subtitle="Education Management Portal" />
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route index element={<TeacherDashboardHome />} />
                <Route path="courses" element={<TeacherCourses />} />
                <Route path="sessions" element={<TeacherSessions />} />
                <Route path="students" element={<TeacherStudents />} />
                <Route path="notifications" element={<TeacherNotifications />} />
                <Route path="*" element={<Navigate to="/teacher" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TeacherDashboard;