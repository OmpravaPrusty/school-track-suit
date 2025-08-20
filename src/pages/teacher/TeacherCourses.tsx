import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, Clock, Play, FileText } from "lucide-react";

const TeacherCourses = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
        <p className="text-muted-foreground">Courses assigned by SME for teaching</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Advanced Mathematics",
            assignedBy: "Dr. John Smith (SME)",
            students: 28,
            progress: 65,
            totalLessons: 20,
            completedLessons: 13,
            duration: "12 weeks",
            status: "In Progress"
          },
          {
            title: "Physics Fundamentals",
            assignedBy: "Prof. Sarah Johnson (SME)",
            students: 32,
            progress: 45,
            totalLessons: 16,
            completedLessons: 7,
            duration: "10 weeks",
            status: "In Progress"
          },
          {
            title: "Chemistry Basics",
            assignedBy: "Dr. Michael Brown (SME)",
            students: 25,
            progress: 100,
            totalLessons: 14,
            completedLessons: 14,
            duration: "8 weeks",
            status: "Completed"
          },
          {
            title: "English Literature",
            assignedBy: "Ms. Emily Davis (SME)",
            students: 30,
            progress: 30,
            totalLessons: 18,
            completedLessons: 5,
            duration: "14 weeks",
            status: "In Progress"
          },
          {
            title: "Computer Science",
            assignedBy: "Mr. David Wilson (SME)",
            students: 22,
            progress: 80,
            totalLessons: 12,
            completedLessons: 10,
            duration: "6 weeks",
            status: "In Progress"
          },
          {
            title: "Biology Essentials",
            assignedBy: "Dr. Lisa Anderson (SME)",
            students: 26,
            progress: 55,
            totalLessons: 15,
            completedLessons: 8,
            duration: "11 weeks",
            status: "In Progress"
          }
        ].map((course, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                </div>
                <Badge variant={course.status === "Completed" ? "default" : "outline"}>
                  {course.status}
                </Badge>
              </div>
              <CardDescription>
                <div className="space-y-1">
                  <p>Assigned by: {course.assignedBy}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students} students</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Teaching Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {course.completedLessons} of {course.totalLessons} lessons completed
                </p>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1" size="sm" disabled={course.status === "Completed"}>
                  <Play className="h-4 w-4 mr-2" />
                  {course.status === "Completed" ? "Completed" : "Continue"}
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherCourses;