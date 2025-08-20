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
            <Route path="students" element={<StudentManagement />} />
            <Route path="sme" element={<SMEManagement />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
