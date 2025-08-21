import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AttendanceOverview from "./pages/admin/AttendanceOverview";
import StudentAttendance from "./pages/admin/StudentAttendance";
import SMEAttendance from "./pages/admin/SMEAttendance";
import StudentManagement from "./pages/admin/StudentManagement";
import SMEManagement from "./pages/admin/SMEManagement";
import BatchManagement from "./pages/admin/BatchManagement";
import TeacherManagement from "./pages/admin/TeacherManagement";
import SchoolManagement from "./pages/admin/SchoolManagement";
import OrganizationManagement from "./pages/admin/OrganizationManagement";
import SessionManagement from "./pages/admin/SessionManagement";
import ReportGeneration from "./pages/admin/ReportGeneration";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import SMEDashboard from "./pages/SMEDashboard";
import SchoolAdminDashboard from "./pages/SchoolAdminDashboard";
import SchoolAdminTeachers from "./pages/school-admin/SchoolAdminTeachers";
import SchoolAdminStudents from "./pages/school-admin/SchoolAdminStudents";
import SchoolAdminUpload from "./pages/school-admin/SchoolAdminUpload";
import SchoolAdminSessions from "./pages/school-admin/SchoolAdminSessions";
import SchoolAdminNotifications from "./pages/school-admin/SchoolAdminNotifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AttendanceOverview />} />
            <Route path="attendance" element={<AttendanceOverview />} />
            <Route path="attendance/students" element={<StudentAttendance />} />
            <Route path="attendance/sme" element={<SMEAttendance />} />
            <Route path="batches" element={<BatchManagement />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="sme" element={<SMEManagement />} />
            <Route path="schools" element={<SchoolManagement />} />
            <Route path="organizations" element={<OrganizationManagement />} />
            <Route path="sessions" element={<SessionManagement />} />
            <Route path="reports" element={<ReportGeneration />} />
          </Route>
          <Route path="/student/*" element={<StudentDashboard />} />
          <Route path="/teacher/*" element={<TeacherDashboard />} />
          <Route path="/sme/*" element={<SMEDashboard />} />
          <Route path="/school-admin" element={<SchoolAdminDashboard />} />
          <Route path="/school-admin/teachers" element={<SchoolAdminTeachers />} />
          <Route path="/school-admin/students" element={<SchoolAdminStudents />} />
          <Route path="/school-admin/upload" element={<SchoolAdminUpload />} />
          <Route path="/school-admin/sessions" element={<SchoolAdminSessions />} />
          <Route path="/school-admin/notifications" element={<SchoolAdminNotifications />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
