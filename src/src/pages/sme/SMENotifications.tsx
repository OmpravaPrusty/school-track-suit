import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Info, CheckCircle, Calendar, X, Users } from "lucide-react";

const SMENotifications = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
        <p className="text-muted-foreground">Stay updated with session schedules and important announcements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">New notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Updates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Important</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Urgent alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Session ratings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Latest updates and announcements for SME activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: "urgent",
                icon: AlertTriangle,
                title: "Session Reschedule Request",
                message: "Tomorrow's Machine Learning session has been requested to be moved to Friday 3 PM due to equipment issues.",
                time: "1 hour ago",
                unread: true
              },
              {
                type: "info",
                icon: Users,
                title: "New Students Assigned",
                message: "15 new students from Batch 2024-C have been assigned to your Data Science specialization.",
                time: "3 hours ago",
                unread: true
              },
              {
                type: "success",
                icon: CheckCircle,
                title: "Session Feedback Received",
                message: "Great feedback from yesterday's AI Ethics session! Average rating: 4.9/5 from 45 participants.",
                time: "1 day ago",
                unread: false
              },
              {
                type: "info",
                icon: Bell,
                title: "Course Material Request",
                message: "Admin has requested you to upload additional study materials for Deep Learning fundamentals.",
                time: "2 days ago",
                unread: true
              },
              {
                type: "info",
                icon: Calendar,
                title: "Monthly Performance Report",
                message: "Your monthly session performance report is ready for review in the reports section.",
                time: "3 days ago",
                unread: false
              },
              {
                type: "success",
                icon: CheckCircle,
                title: "Course Assignment Completed",
                message: "Successfully assigned Neural Networks course to 32 students across 3 batches.",
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

export default SMENotifications;