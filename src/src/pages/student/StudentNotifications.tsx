import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Info, CheckCircle, Calendar, X } from "lucide-react";

const StudentNotifications = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
        <p className="text-muted-foreground">Stay updated with important announcements and alerts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">New notifications</p>
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
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Recent updates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Your latest updates and announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: "urgent",
                icon: AlertTriangle,
                title: "Class Cancelled - Physics Lab",
                message: "Tomorrow's Physics lab session has been cancelled due to equipment maintenance. Rescheduled for Friday 2 PM.",
                time: "2 hours ago",
                unread: true
              },
              {
                type: "info",
                icon: Info,
                title: "Assignment Reminder",
                message: "Mathematics assignment due tomorrow. Don't forget to submit your calculus problem set before 11:59 PM.",
                time: "5 hours ago",
                unread: true
              },
              {
                type: "success",
                icon: CheckCircle,
                title: "Attendance Updated",
                message: "Your attendance for Chemistry class on Jan 20th has been marked as Present.",
                time: "1 day ago",
                unread: false
              },
              {
                type: "info",
                icon: Bell,
                title: "New Course Material",
                message: "New study materials for English Literature have been uploaded. Check your courses section.",
                time: "2 days ago",
                unread: true
              },
              {
                type: "urgent",
                icon: AlertTriangle,
                title: "Exam Schedule Released",
                message: "Mid-term examination schedule has been published. Please check the academic calendar for your subjects.",
                time: "3 days ago",
                unread: true
              },
              {
                type: "success",
                icon: CheckCircle,
                title: "Course Completion",
                message: "Congratulations! You have successfully completed the Computer Science fundamentals course.",
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

export default StudentNotifications;