import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Search, Users, Plus } from "lucide-react";

const SMEAssignCourses = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Assign Courses</h2>
        <p className="text-muted-foreground">Assign courses to students and teachers under your guidance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
            <CardDescription>Courses in your expertise area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Machine Learning Fundamentals",
                  description: "Introduction to ML algorithms and concepts",
                  duration: "12 weeks",
                  level: "Beginner",
                  enrolled: 45
                },
                {
                  title: "Advanced Data Science",
                  description: "Deep dive into data analysis and visualization",
                  duration: "16 weeks",
                  level: "Intermediate",
                  enrolled: 32
                },
                {
                  title: "Neural Networks & Deep Learning",
                  description: "Comprehensive study of neural networks",
                  duration: "14 weeks",
                  level: "Advanced",
                  enrolled: 28
                },
                {
                  title: "AI Ethics and Applications",
                  description: "Ethical considerations in AI development",
                  duration: "8 weeks",
                  level: "Intermediate",
                  enrolled: 67
                },
                {
                  title: "Python for Data Analysis",
                  description: "Python programming for data scientists",
                  duration: "10 weeks",
                  level: "Beginner",
                  enrolled: 89
                }
              ].map((course, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox />
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span>{course.duration}</span>
                        <Badge variant="outline" className="text-xs">{course.level}</Badge>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{course.enrolled} enrolled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment Panel</CardTitle>
            <CardDescription>Select recipients for course assignment</CardDescription>
            <div className="flex items-center space-x-2">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="max-w-sm" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">Select Students/Teachers:</div>
              {[
                {
                  name: "Alex Johnson",
                  email: "alex.johnson@school.com",
                  batch: "Batch 2024-A",
                  courses: 3,
                  type: "Student"
                },
                {
                  name: "Sarah Williams",
                  email: "sarah.williams@school.com",
                  batch: "Batch 2024-B",
                  courses: 2,
                  type: "Student"
                },
                {
                  name: "Dr. Michael Brown",
                  email: "michael.brown@school.com",
                  department: "Computer Science",
                  courses: 5,
                  type: "Teacher"
                },
                {
                  name: "Emily Davis",
                  email: "emily.davis@school.com",
                  batch: "Batch 2024-A",
                  courses: 4,
                  type: "Student"
                },
                {
                  name: "Prof. David Wilson",
                  email: "david.wilson@school.com",
                  department: "Data Science",
                  courses: 3,
                  type: "Teacher"
                }
              ].map((person, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox />
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{person.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{person.name}</h4>
                      <p className="text-sm text-muted-foreground">{person.email}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{person.type}</Badge>
                        <span>•</span>
                        <span>{person.batch || person.department}</span>
                        <span>•</span>
                        <span>{person.courses} courses</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Selected: 0 recipients, 0 courses
                </div>
                <Button>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Assign Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SMEAssignCourses;