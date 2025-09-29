import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Users, GraduationCap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const AttendanceOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSMEs: 0,
    todayStudentAttendance: 0,
    todaySmeAttendance: 0,
    hasStudentAttendanceData: false,
    hasSmeAttendanceData: false,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        // Fetch total students
        const { count: studentCount, error: studentError } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true });

        if (studentError) throw studentError;

        // Fetch total SMEs
        const { count: smeCount, error: smeError } = await supabase
          .from("smes")
          .select("*", { count: "exact", head: true });

        if (smeError) throw smeError;

        // Fetch today's attendance
        const today = format(new Date(), "yyyy-MM-dd");
        console.log("Fetching student attendance for date:", today);

        const { data: studentAttendanceData, error: studentAttendanceError } =
          await supabase
            .from("student_attendance")
            .select("status, student_id")
            .eq("attendance_date", today);

        if (studentAttendanceError) {
          console.error("Student attendance error:", studentAttendanceError);
          throw studentAttendanceError;
        }

        console.log("Student attendance data:", studentAttendanceData);
        console.log(
          "Number of student attendance records found:",
          studentAttendanceData?.length || 0
        );

        // Debug: Check if there are ANY student attendance records
        const { data: allStudentRecords, error: allStudentError } =
          await supabase
            .from("student_attendance")
            .select("attendance_date, status", { count: "exact" })
            .limit(5);

        if (!allStudentError) {
          console.log(
            "Sample student attendance records (any date):",
            allStudentRecords
          );
        }

        // if (attendanceError) throw attendanceError;
        const studentPresentCount = studentAttendanceData.filter(
          (a) => a.status === "present"
        ).length;
        const studentTotalToday = studentAttendanceData.length;
        const studentAttendancePercentage =
          studentTotalToday > 0
            ? (studentPresentCount / studentTotalToday) * 100
            : 0;

        console.log("Student attendance calculation:", {
          totalRecords: studentTotalToday,
          presentCount: studentPresentCount,
          percentage: studentAttendancePercentage,
        });

        // const presentCount = attendanceData.filter(a => a.status === 'present').length;
        // const totalToday = attendanceData.length;
        // const attendancePercentage = totalToday > 0 ? (presentCount / totalToday) * 100 : 0;

        const { data: smeAttendanceData, error: smeAttendanceError } =
          await supabase
            .from("sme_attendance")
            .select("status, sme_id")
            .eq("attendance_date", today);

        if (smeAttendanceError) throw smeAttendanceError;

        console.log("SME attendance data:", smeAttendanceData);
        console.log(
          "Number of SME attendance records found:",
          smeAttendanceData?.length || 0
        );

        const smePresentCount = smeAttendanceData.filter(
          (a) => a.status === "present"
        ).length;
        const smeTotalToday = smeAttendanceData.length;
        const smeAttendancePercentage =
          smeTotalToday > 0 ? (smePresentCount / smeTotalToday) * 100 : 0;

        setStats({
          totalStudents: studentCount || 0,
          totalSMEs: smeCount || 0,
          todayStudentAttendance: studentAttendancePercentage,
          todaySmeAttendance: smeAttendancePercentage,
          hasStudentAttendanceData: studentTotalToday > 0,
          hasSmeAttendanceData: smeTotalToday > 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const attendanceCategories = [
    {
      id: "students",
      title: "Student Attendance",
      description:
        "Manage attendance for all students across different batches",
      icon: Users,
      color: "bg-primary",
      route: "/admin/attendance/students",
    },
    {
      id: "sme",
      title: "SME Attendance",
      description: "Track attendance for Subject Matter Experts and faculty",
      icon: GraduationCap,
      color: "bg-secondary",
      route: "/admin/attendance/sme",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <FolderOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            SANKALP 90 Attendance Management
          </h1>
          <p className="text-muted-foreground">
            Select a category to manage attendance records
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {attendanceCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card
              key={category.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 border-border/50"
              onClick={() => navigate(category.route)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-lg ${category.color} text-white shadow-[var(--shadow-card)]`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full transition-[var(--transition-smooth)] hover:bg-accent"
                >
                  Manage Attendance
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Card className="bg-card-soft border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-primary">
                {stats.totalStudents}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Across all batches</p>
          </CardContent>
        </Card>

        <Card className="bg-card-soft border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active SMEs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-secondary">
                {stats.totalSMEs}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Subject Matter Experts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card-soft border-border/50">
          <CardHeader className="pb-3">
            {/* <CardTitle className="text-sm font-medium text-muted-foreground">Today's Attendance</CardTitle> */}
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Student Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-success">
                {!stats.hasStudentAttendanceData
                  ? "No data"
                  : `${stats.todayStudentAttendance.toFixed(1)}%`}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Student attendance rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card-soft border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's SME Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* {loadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold text-success">{stats.todayAttendance.toFixed(1)}%</div>}
            <p className="text-xs text-muted-foreground">Overall attendance rate</p> */}
            {loadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-warning">
                {!stats.hasSmeAttendanceData
                  ? "No data"
                  : `${stats.todaySmeAttendance.toFixed(1)}%`}
              </div>
            )}
            <p className="text-xs text-muted-foreground">SME attendance rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceOverview;
