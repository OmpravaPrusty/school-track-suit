
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, School, BookOpen, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ProgramOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalSMEs: 0,
    activeSessions: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        // Fetch all stats in parallel
        const [schoolsCount, studentsCount, teachersCount, smesCount, sessionsCount] = await Promise.all([
          supabase.from('schools').select('*', { count: 'exact', head: true }),
          supabase.from('students').select('*', { count: 'exact', head: true }),
          supabase.from('teachers').select('*', { count: 'exact', head: true }),
          supabase.from('smes').select('*', { count: 'exact', head: true }),
          supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
        ]);

        setStats({
          totalSchools: schoolsCount.count || 0,
          totalStudents: studentsCount.count || 0,
          totalTeachers: teachersCount.count || 0,
          totalSMEs: smesCount.count || 0,
          activeSessions: sessionsCount.count || 0,
        });

      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const programs = [
    {
      id: "sankalp90",
      title: "Sankalp 90",
      description: "90-day skill development program for students",
      icon: GraduationCap,
      color: "bg-primary",
      route: "/admin/attendance", // Route to existing workflow
      status: "Active",
      participants: stats.totalStudents,
    },
    {
      id: "teacher-cpd",
      title: "Teacher CPD",
      description: "Continuous Professional Development for Teachers",
      icon: BookOpen,
      color: "bg-secondary",
      route: "/admin/programs/teacher-cpd",
      status: "Coming Soon",
      participants: stats.totalTeachers,
    },
    {
      id: "caci",
      title: "CACI",
      description: "Community and Civic Initiatives Program",
      icon: Users,
      color: "bg-accent",
      route: "/admin/programs/caci",
      status: "Coming Soon",
      participants: 0,
    }
  ];

  const kpiCards = [
    {
      title: "Total Schools",
      value: stats.totalSchools,
      icon: School,
      color: "text-primary",
      description: "Registered schools"
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-secondary",
      description: "Enrolled students"
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      icon: BookOpen,
      color: "text-accent",
      description: "Active teachers"
    },
    {
      title: "Subject Experts",
      value: stats.totalSMEs,
      icon: GraduationCap,
      color: "text-success",
      description: "SMEs available"
    },
    {
      title: "Active Sessions",
      value: stats.activeSessions,
      icon: Calendar,
      color: "text-warning",
      description: "Scheduled sessions"
    },
    {
      title: "Engagement Rate",
      value: "87%",
      icon: TrendingUp,
      color: "text-info",
      description: "Overall participation"
    }
  ];

  const handleProgramSelect = (program: typeof programs[0]) => {
    if (program.status === "Coming Soon") {
      // Could add a toast notification here
      return;
    }
    navigate(program.route);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Program Dashboard</h1>
          <p className="text-muted-foreground">Select a program to manage and view analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Programs Section */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Programs</h2>
            <div className="grid gap-4">
              {programs.map((program) => {
                const IconComponent = program.icon;
                return (
                  <Card 
                    key={program.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 ${
                      program.status === "Coming Soon" ? "opacity-60" : ""
                    }`}
                    onClick={() => handleProgramSelect(program)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${program.color} text-white shadow-md`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{program.title}</CardTitle>
                            <CardDescription className="mt-1">{program.description}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            program.status === "Active" 
                              ? "bg-success/20 text-success" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {program.status}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {program.participants} participants
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant={program.status === "Active" ? "default" : "secondary"} 
                        className="w-full"
                        disabled={program.status === "Coming Soon"}
                      >
                        {program.status === "Active" ? "Manage Program" : "Coming Soon"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* KPIs Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
            <div className="space-y-4">
              {kpiCards.map((kpi, index) => {
                const IconComponent = kpi.icon;
                return (
                  <Card key={index} className="bg-card-soft border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-background ${kpi.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-muted-foreground">{kpi.title}</div>
                          <div className="text-2xl font-bold text-foreground">
                            {loadingStats ? "..." : kpi.value}
                          </div>
                          <div className="text-xs text-muted-foreground">{kpi.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramOverview;
