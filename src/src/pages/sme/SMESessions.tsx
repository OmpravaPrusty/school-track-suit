import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, Users, ExternalLink } from "lucide-react";

const SMESessions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sessions</h2>
        <p className="text-muted-foreground">Manage your expert sessions and workshops</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled expert sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Machine Learning Fundamentals",
                date: "Tomorrow",
                time: "2:00 PM - 3:30 PM",
                batch: "Batch 2024 - Computer Science",
                participants: 45,
                meetingLink: "https://zoom.us/j/987654321",
                status: "Scheduled"
              },
              {
                title: "Data Science Workshop",
                date: "Jan 26, 2025",
                time: "10:00 AM - 12:00 PM",
                batch: "Batch 2023 - IT Department",
                participants: 38,
                meetingLink: "https://meet.google.com/xyz-abcd-efg",
                status: "Scheduled"
              },
              {
                title: "AI Ethics Discussion",
                date: "Jan 28, 2025",
                time: "3:00 PM - 4:00 PM",
                batch: "All Batches - Special Session",
                participants: 120,
                meetingLink: "https://zoom.us/j/555666777",
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
                  <p className="text-sm text-muted-foreground">{session.batch}</p>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{session.participants} participants</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge>{session.status}</Badge>
                  <Button size="sm" className="flex items-center space-x-1">
                    <ExternalLink className="h-4 w-4" />
                    <span>Start</span>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your recently completed sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Python for Data Analysis",
                date: "Jan 20, 2025",
                time: "2:00 PM - 3:30 PM",
                participants: 45,
                feedback: 4.8,
                status: "Completed"
              },
              {
                title: "Deep Learning Concepts",
                date: "Jan 18, 2025",
                time: "10:00 AM - 11:30 AM",
                participants: 38,
                feedback: 4.9,
                status: "Completed"
              },
              {
                title: "Neural Networks Workshop",
                date: "Jan 15, 2025",
                time: "3:00 PM - 5:00 PM",
                participants: 52,
                feedback: 4.7,
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
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{session.participants} participants</span>
                      </div>
                      <span>Rating: {session.feedback}/5</span>
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

export default SMESessions;