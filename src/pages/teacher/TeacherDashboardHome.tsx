import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, Users, Clock, CheckCircle } from "lucide-react";

const TeacherDashboardHome = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Scheduled classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Mathematics, Physics</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h4 className="font-medium">Mathematics - Class 10-A</h4>
                <p className="text-sm text-muted-foreground">9:00 AM - 10:00 AM</p>
                <p className="text-sm text-muted-foreground">Room 201</p>
              </div>
              <Badge>Upcoming</Badge>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h4 className="font-medium">Physics - Class 11-B</h4>
                <p className="text-sm text-muted-foreground">11:00 AM - 12:00 PM</p>
                <p className="text-sm text-muted-foreground">Room 105</p>
              </div>
              <Badge>Upcoming</Badge>
            </div>

            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h4 className="font-medium">Mathematics - Class 12-A</h4>
                <p className="text-sm text-muted-foreground">2:00 PM - 3:00 PM</p>
                <p className="text-sm text-muted-foreground">Room 102</p>
              </div>
              <Badge>Upcoming</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Class Attendance</CardTitle>
            <CardDescription>Attendance summary for your recent classes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Mathematics - Class 10-A</p>
                  <p className="text-sm text-muted-foreground">Jan 20, 2025</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">28/30</p>
                <p className="text-sm text-muted-foreground">93%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Physics - Class 11-B</p>
                  <p className="text-sm text-muted-foreground">Jan 19, 2025</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">25/28</p>
                <p className="text-sm text-muted-foreground">89%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Mathematics - Class 12-A</p>
                  <p className="text-sm text-muted-foreground">Jan 18, 2025</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">22/25</p>
                <p className="text-sm text-muted-foreground">88%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboardHome;