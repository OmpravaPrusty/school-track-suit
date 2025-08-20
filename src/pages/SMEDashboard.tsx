import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, Users, Video, Clock, CheckCircle } from "lucide-react";
import { SMESidebar } from "@/components/SMESidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

const SMEDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SMESidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="SME Dashboard" subtitle="Subject Matter Expert Portal" />
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions Delivered</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students Reached</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">150</div>
              <p className="text-xs text-muted-foreground">Total participants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Specialization</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AI/ML</div>
              <p className="text-xs text-muted-foreground">Machine Learning</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your scheduled expert sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <Video className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">Machine Learning Fundamentals</h4>
                  <p className="text-sm text-muted-foreground">Tomorrow, 2:00 PM - 3:30 PM</p>
                  <p className="text-sm text-muted-foreground">Batch 2024 - Computer Science</p>
                </div>
                <Badge>Scheduled</Badge>
              </div>
              
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <Video className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">Data Science Workshop</h4>
                  <p className="text-sm text-muted-foreground">Jan 26, 10:00 AM - 12:00 PM</p>
                  <p className="text-sm text-muted-foreground">Batch 2023 - IT Department</p>
                </div>
                <Badge>Scheduled</Badge>
              </div>

              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <Video className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">AI Ethics Discussion</h4>
                  <p className="text-sm text-muted-foreground">Jan 28, 3:00 PM - 4:00 PM</p>
                  <p className="text-sm text-muted-foreground">All Batches - Special Session</p>
                </div>
                <Badge>Scheduled</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Your recently completed sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Python for Data Analysis</p>
                    <p className="text-sm text-muted-foreground">Jan 20, 2025</p>
                    <p className="text-sm text-muted-foreground">45 participants</p>
                  </div>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Deep Learning Concepts</p>
                    <p className="text-sm text-muted-foreground">Jan 18, 2025</p>
                    <p className="text-sm text-muted-foreground">38 participants</p>
                  </div>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Neural Networks Workshop</p>
                    <p className="text-sm text-muted-foreground">Jan 15, 2025</p>
                    <p className="text-sm text-muted-foreground">52 participants</p>
                  </div>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SMEDashboard;