import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import SMEDashboard from "./pages/SMEDashboard";
import SchoolAdminDashboard from "./pages/SchoolAdminDashboard";
import NotFound from "./pages/NotFound";

// Admin pages
import ProgramOverview from "./pages/admin/ProgramOverview";
import AttendanceOverview from "./pages/admin/AttendanceOverview";
import StudentAttendance from "./pages/admin/StudentAttendance";
import SMEAttendance from "./pages/admin/SMEAttendance";
import BatchManagement from "./pages/admin/BatchManagement";
import StudentManagement from "./pages/admin/StudentManagement";
import TeacherManagement from "./pages/admin/TeacherManagement";
import SMEManagement from "./pages/admin/SMEManagement";
import SchoolManagement from "./pages/admin/SchoolManagement";
import OrganizationManagement from "./pages/admin/OrganizationManagement";
import SessionManagement from "./pages/admin/SessionManagement";
import ReportGeneration from "./pages/admin/ReportGeneration";
import TeacherCPD from "./pages/admin/TeacherCPD";
import CACI from "./pages/admin/CACI";

const queryClient = new QueryClient();

const App = () => (
  <QueryClient>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/programs" replace />} />
                <Route path="programs" element={<ProgramOverview />} />
                <Route path="programs/teacher-cpd" element={<TeacherCPD />} />
                <Route path="programs/caci" element={<CACI />} />
                <Route path="attendance" element={<AttendanceOverview />} />
                <Route path="attendance/students" element={<StudentAttendance />} />
                <Route path="attendance/sme" element={<SMEAttendance />} />
                <Route path="batches" element={<BatchManagement />} />
                <Route path="students" element={<StudentManagement />} />
                <Route path="teachers" element={<TeacherManagement />} />
                <Route path="sme" element={<SMEManagement />} />
                <Route path="schools" element={<SchoolManagement />} />
                <Route path="organizations" element={<OrganizationManagement />} />
                <Route path="sessions" element={<SessionManagement />} />
                <Route path="reports" element={<ReportGeneration />} />
              </Route>

              {/* Student Routes */}
              <Route path="/student" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
              </Route>

              {/* Teacher Routes */}
              <Route path="/teacher" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/teacher/dashboard" replace />} />
                <Route path="dashboard" element={<TeacherDashboard />} />
              </Route>

              {/* SME Routes */}
              <Route path="/sme" element={
                <ProtectedRoute allowedRoles={['sme']}>
                  <SMEDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/sme/dashboard" replace />} />
                <Route path="dashboard" element={<SMEDashboard />} />
              </Route>

              {/* School Admin Routes */}
              <Route path="/school-admin" element={
                <ProtectedRoute allowedRoles={['school-admin']}>
                  <SchoolAdminDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/school-admin/dashboard" replace />} />
                <Route path="dashboard" element={<SchoolAdminDashboard />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </QueryClient>
);

export default App;
