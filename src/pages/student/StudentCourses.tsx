import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, User, Play } from "lucide-react";

const StudentCourses = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
        <p className="text-muted-foreground">View your enrolled courses and progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Advanced Mathematics",
            instructor: "Dr. John Smith",
            progress: 75,
            totalLessons: 20,
            completedLessons: 15,
            duration: "12 weeks",
            status: "In Progress"
          },
          {
            title: "Physics Fundamentals",
            instructor: "Prof. Sarah Johnson",
            progress: 60,
            totalLessons: 16,
            completedLessons: 10,
            duration: "10 weeks",
            status: "In Progress"
          },
          {
            title: "Chemistry Basics",
            instructor: "Dr. Michael Brown",
            progress: 90,
            totalLessons: 14,
            completedLessons: 13,
            duration: "8 weeks",
            status: "Almost Complete"
          },
          {
            title: "English Literature",
            instructor: "Ms. Emily Davis",
            progress: 45,
            totalLessons: 18,
            completedLessons: 8,
            duration: "14 weeks",
            status: "In Progress"
          },
          {
            title: "Computer Science",
            instructor: "Mr. David Wilson",
            progress: 100,
            totalLessons: 12,
            completedLessons: 12,
            duration: "6 weeks",
            status: "Completed"
          },
          {
            title: "Biology Essentials",
            instructor: "Dr. Lisa Anderson",
            progress: 30,
            totalLessons: 15,
            completedLessons: 5,
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
                <Badge variant={course.status === "Completed" ? "default" : course.status === "Almost Complete" ? "secondary" : "outline"}>
                  {course.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {course.completedLessons} of {course.totalLessons} lessons completed
                </p>
              </div>
              <Button className="w-full" disabled={course.status === "Completed"}>
                <Play className="h-4 w-4 mr-2" />
                {course.status === "Completed" ? "Course Completed" : "Continue Learning"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentCourses;