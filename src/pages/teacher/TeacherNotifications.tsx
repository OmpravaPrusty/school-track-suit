import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Info, CheckCircle, Calendar, X, Users, BookOpen } from "lucide-react";

const TeacherNotifications = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
        <p className="text-muted-foreground">Important updates and announcements for teachers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">New notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Updates</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Important</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Urgent alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Updates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Recent activities</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Latest updates and announcements for teaching activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: "urgent",
                icon: AlertTriangle,
                title: "Session Room Changed",
                message: "Tomorrow's Mathematics class has been moved from Room 201 to Room 305 due to maintenance work.",
                time: "30 minutes ago",
                unread: true
              },
              {
                type: "info",
                icon: BookOpen,
                title: "New Course Material Available",
                message: "SME has uploaded new study materials for Advanced Mathematics. Please review before next class.",
                time: "2 hours ago",
                unread: true
              },
              {
                type: "urgent",
                icon: AlertTriangle,
                title: "Student Attendance Alert",
                message: "Arjun Menon has attendance below 75% in Mathematics. Please review and take necessary action.",
                time: "4 hours ago",
                unread: true
              },
              {
                type: "success",
                icon: CheckCircle,
                title: "Course Assignment Completed",
                message: "You have successfully completed teaching 'Biology Essentials' course. Feedback from students: 4.8/5.",
                time: "1 day ago",
                unread: false
              },
              {
                type: "info",
                icon: Users,
                title: "New Students Enrolled",
                message: "3 new students have been enrolled in your Chemistry Basics course for this semester.",
                time: "2 days ago",
                unread: true
              },
              {
                type: "info",
                icon: Calendar,
                title: "Exam Schedule Updated",
                message: "Mid-term examination schedule has been updated. Physics exam moved to Jan 30th, 10:00 AM.",
                time: "3 days ago",
                unread: false
              },
              {
                type: "success",
                icon: CheckCircle,
                title: "Session Feedback Received",
                message: "Great feedback from students for your Computer Science session! Average rating: 4.7/5.",
                time: "1 week ago",
                unread: false
              }
            ].map((notification, index) => (
              <div key={index} className={`flex items-start space-x-4 p-4 border rounded-lg ${notification.unread ? 'bg-muted/30 border-primary/20' : ''}`}>
                <div className={`p-2 rounded-full ${
                  notification.type === 'urgent' ? 'bg-destructive/10' :
                  notification.type === 'success' ? 'bg-primary/10' :
                  'bg-muted'
                }`}>
                  <notification.icon className={`h-4 w-4 ${
                    notification.type === 'urgent' ? 'text-destructive' :
                    notification.type === 'success' ? 'text-primary' :
                    'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{notification.title}</h4>
                    <div className="flex items-center space-x-2">
                      {notification.unread && <Badge variant="default" className="text-xs">New</Badge>}
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherNotifications;