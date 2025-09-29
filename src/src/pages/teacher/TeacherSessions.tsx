import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, Users, ExternalLink } from "lucide-react";

const TeacherSessions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sessions</h2>
        <p className="text-muted-foreground">View and manage your teaching sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled teaching sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Advanced Mathematics",
                date: "2025-01-22",
                time: "09:00 AM - 10:30 AM",
                batch: "Class 10-A",
                subject: "Quadratic Equations",
                students: 28,
                meetingLink: "https://meet.google.com/abc-defg-hij",
                status: "Scheduled"
              },
              {
                title: "Physics Fundamentals",
                date: "2025-01-22", 
                time: "11:00 AM - 12:30 PM",
                batch: "Class 11-B",
                subject: "Light and Optics",
                students: 32,
                meetingLink: "https://meet.google.com/xyz-mnop-qrs",
                status: "Scheduled"
              },
              {
                title: "Mathematics Workshop",
                date: "2025-01-23",
                time: "02:00 PM - 03:30 PM", 
                batch: "Class 12-A",
                subject: "Calculus Review",
                students: 25,
                meetingLink: "https://meet.google.com/def-ghi-jkl",
                status: "Scheduled"
              }
            ].map((session, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Video className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">{session.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{session.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{session.batch} • {session.subject}</p>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{session.students} students</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge>{session.status}</Badge>
                  <Button size="sm" className="flex items-center space-x-1">
                    <ExternalLink className="h-4 w-4" />
                    <span>Join</span>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your completed teaching sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Chemistry Basics",
                date: "2025-01-21",
                time: "09:00 AM - 10:30 AM",
                batch: "Class 11-B",
                students: 25,
                attendance: 24,
                status: "Completed"
              },
              {
                title: "English Literature",
                date: "2025-01-20",
                time: "11:00 AM - 12:30 PM",
                batch: "Class 12-A",
                students: 30,
                attendance: 28,
                status: "Completed"
              },
              {
                title: "Computer Science Lab",
                date: "2025-01-19",
                time: "02:00 PM - 04:00 PM",
                batch: "Class 11-A",
                students: 22,
                attendance: 20,
                status: "Completed"
              },
              {
                title: "Biology Workshop",
                date: "2025-01-18",
                time: "10:00 AM - 11:30 AM",
                batch: "Class 10-B",
                students: 26,
                attendance: 25,
                status: "Completed"
              }
            ].map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{session.title}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{session.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{session.batch}</span>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{session.attendance}/{session.students} attended</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{session.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherSessions;