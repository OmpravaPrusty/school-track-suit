import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, Phone, Edit, Plus } from "lucide-react";

const SchoolAdminTeachers = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Teachers Management</h2>
          <p className="text-muted-foreground">Manage teachers in your school</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher List</CardTitle>
          <CardDescription>Teachers in your school</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search teachers..." className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Dr. John Smith",
                email: "john.smith@school.com",
                phone: "+1 234-567-8901",
                subjects: ["Mathematics", "Physics"],
                experience: "8 years",
                status: "Active"
              },
              {
                name: "Prof. Sarah Johnson",
                email: "sarah.johnson@school.com",
                phone: "+1 234-567-8902",
                subjects: ["Chemistry", "Biology"],
                experience: "12 years",
                status: "Active"
              }
            ].map((teacher, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">{teacher.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{teacher.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{teacher.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{teacher.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{teacher.subjects.join(", ")}</span>
                      <span>•</span>
                      <span>{teacher.experience}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="default">{teacher.status}</Badge>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
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

export default SchoolAdminTeachers;