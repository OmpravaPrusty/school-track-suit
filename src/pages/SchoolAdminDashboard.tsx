import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Users, Video, Clock, CheckCircle, School, GraduationCap } from "lucide-react";

const SchoolAdminDashboard = () => {
  const userEmail = localStorage.getItem("userEmail");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">School Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {userEmail}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Logout
          </Button>
        </div>

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
                  <h4 className="font-medium">Engineering College</h4>
                  <p className="text-sm text-muted-foreground">Tech University</p>
                  <p className="text-sm text-muted-foreground">Established: 1985</p>
                </div>
                <Badge>Active</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Departments</h4>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">Active departments</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Batches</h4>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">2023, 2024, 2025</p>
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
                  <p className="text-sm text-muted-foreground">Dr. Sarah Johnson joined Physics Dept</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <Clock className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">Attendance Report Generated</h4>
                  <p className="text-sm text-muted-foreground">Monthly report for Batch 2024</p>
                  <p className="text-sm text-muted-foreground">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <Clock className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">Session Completed</h4>
                  <p className="text-sm text-muted-foreground">Machine Learning Workshop</p>
                  <p className="text-sm text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Attendance and performance by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">Computer Science</h4>
                <p className="text-sm text-muted-foreground">Students: 320</p>
                <p className="text-sm text-muted-foreground">Teachers: 18</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm">Attendance:</span>
                  <Badge>89%</Badge>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">Electrical Engineering</h4>
                <p className="text-sm text-muted-foreground">Students: 280</p>
                <p className="text-sm text-muted-foreground">Teachers: 15</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm">Attendance:</span>
                  <Badge>85%</Badge>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">Mechanical Engineering</h4>
                <p className="text-sm text-muted-foreground">Students: 350</p>
                <p className="text-sm text-muted-foreground">Teachers: 20</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm">Attendance:</span>
                  <Badge>87%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;