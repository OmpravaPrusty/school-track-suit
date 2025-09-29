import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, Phone, BookOpen, GraduationCap } from "lucide-react";

const TeacherStudents = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Students</h2>
        <p className="text-muted-foreground">Students under your teaching supervision</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">134</div>
            <p className="text-xs text-muted-foreground">Across all subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Teaching subjects</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>Students enrolled in your courses</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students..." className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Alex Johnson",
                email: "alex.johnson@school.com",
                phone: "+1 234-567-8901",
                batch: "Batch 2024-A",
                subjects: ["Mathematics", "Physics"],
                attendance: 92,
                performance: 88,
                status: "Active"
              },
              {
                name: "Sarah Williams",
                email: "sarah.williams@school.com",
                phone: "+1 234-567-8902",
                batch: "Batch 2024-B",
                subjects: ["Chemistry", "Biology"],
                attendance: 87,
                performance: 91,
                status: "Active"
              },
              {
                name: "Michael Brown",
                email: "michael.brown@school.com",
                phone: "+1 234-567-8903",
                batch: "Batch 2023-C",
                subjects: ["English", "Computer Science"],
                attendance: 95,
                performance: 85,
                status: "Active"
              },
              {
                name: "Emily Davis",
                email: "emily.davis@school.com",
                phone: "+1 234-567-8904",
                batch: "Batch 2024-A",
                subjects: ["Mathematics", "Chemistry"],
                attendance: 89,
                performance: 93,
                status: "Active"
              },
              {
                name: "David Wilson",
                email: "david.wilson@school.com",
                phone: "+1 234-567-8905",
                batch: "Batch 2023-B",
                subjects: ["Physics", "Biology"],
                attendance: 91,
                performance: 87,
                status: "Active"
              }
            ].map((student, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">{student.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{student.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{student.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{student.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{student.batch}</span>
                      <span>•</span>
                      <span>{student.subjects.join(", ")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">{student.attendance}%</p>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{student.performance}%</p>
                    <p className="text-xs text-muted-foreground">Performance</p>
                  </div>
                  <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                    {student.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStudents;