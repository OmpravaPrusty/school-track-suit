import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, Users, Video, Clock, CheckCircle, School, GraduationCap } from "lucide-react";
import { SchoolAdminSidebar } from "@/components/SchoolAdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

const SchoolAdminDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SchoolAdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="School Admin Dashboard" subtitle="School Management Portal" />
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250</div>
              <p className="text-xs text-muted-foreground">Active students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85</div>
              <p className="text-xs text-muted-foreground">Teaching staff</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>School Overview</CardTitle>
              <CardDescription>Key information about your school</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <School className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">Malanada Higher Secondary School</h4>
                  <p className="text-sm text-muted-foreground">Kollam District, Kerala</p>
                  <p className="text-sm text-muted-foreground">Established: 1965</p>
                </div>
                <Badge>Active</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Classes</h4>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Std 1 to 12</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Sections</h4>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">A & B sections</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates and activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <Clock className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">New Teacher Added</h4>
                  <p className="text-sm text-muted-foreground">Priya Nair joined Mathematics Department</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <Clock className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">Attendance Report Generated</h4>
                  <p className="text-sm text-muted-foreground">Monthly report for Class 10-A</p>
                  <p className="text-sm text-muted-foreground">1 day ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <Clock className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">Session Completed</h4>
                  <p className="text-sm text-muted-foreground">Science Exhibition Workshop</p>
                  <p className="text-sm text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

          <Card>
            <CardHeader>
              <CardTitle>Class Performance</CardTitle>
              <CardDescription>Attendance and performance by class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Class 10</h4>
                  <p className="text-sm text-muted-foreground">Students: 120</p>
                  <p className="text-sm text-muted-foreground">Teachers: 8</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm">Attendance:</span>
                    <Badge>89%</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Class 11</h4>
                  <p className="text-sm text-muted-foreground">Students: 95</p>
                  <p className="text-sm text-muted-foreground">Teachers: 10</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm">Attendance:</span>
                    <Badge>85%</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Class 12</h4>
                  <p className="text-sm text-muted-foreground">Students: 88</p>
                  <p className="text-sm text-muted-foreground">Teachers: 12</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm">Attendance:</span>
                    <Badge>87%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SchoolAdminDashboard;