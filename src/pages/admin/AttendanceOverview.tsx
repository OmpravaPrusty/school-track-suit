import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Users, GraduationCap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

const AttendanceOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSMEs: 0,
    todayAttendance: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        // Fetch total students
        const { count: studentCount, error: studentError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        if (studentError) throw studentError;

        // Fetch total SMEs
        const { count: smeCount, error: smeError } = await supabase
          .from('smes')
          .select('*', { count: 'exact', head: true });

        if (smeError) throw smeError;

        // Fetch today's attendance
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('status')
          .eq('attendance_date', today);

        if (attendanceError) throw attendanceError;

        const presentCount = attendanceData.filter(a => a.status === 'present').length;
        const totalToday = attendanceData.length;
        const attendancePercentage = totalToday > 0 ? (presentCount / totalToday) * 100 : 0;

        setStats({
          totalStudents: studentCount || 0,
          totalSMEs: smeCount || 0,
          todayAttendance: attendancePercentage,
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
      description: "Manage attendance for all students across different batches",
      icon: Users,
      color: "bg-primary",
      route: "/admin/attendance/students"
    },
    {
      id: "sme",
      title: "SME Attendance", 
      description: "Track attendance for Subject Matter Experts and faculty",
      icon: GraduationCap,
      color: "bg-secondary",
      route: "/admin/attendance/sme"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <FolderOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">SANKALP 90 Attendance Management</h1>
          <p className="text-muted-foreground">Select a category to manage attendance records</p>
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
                  <div className={`p-3 rounded-lg ${category.color} text-white shadow-[var(--shadow-card)]`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription className="mt-1">{category.description}</CardDescription>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="bg-card-soft border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold text-primary">{stats.totalStudents}</div>}
            <p className="text-xs text-muted-foreground">Across all batches</p>
          </CardContent>
        </Card>

        <Card className="bg-card-soft border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active SMEs</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold text-secondary">{stats.totalSMEs}</div>}
            <p className="text-xs text-muted-foreground">Subject Matter Experts</p>
          </CardContent>
        </Card>

        <Card className="bg-card-soft border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold text-success">{stats.todayAttendance.toFixed(1)}%</div>}
            <p className="text-xs text-muted-foreground">Overall attendance rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceOverview;