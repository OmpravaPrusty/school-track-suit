import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Student {
  id: number;
  name: string;
  email: string;
  rollNo: string;
  batch: string;
  department: string;
  phone: string;
  status: "active" | "inactive";
}

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    rollNo: "",
    batch: "",
    department: "",
    phone: "",
  });

  // Mock student data
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@student.edu",
      rollNo: "2024001",
      batch: "2024",
      department: "Computer Science",
      phone: "+1 (555) 123-4567",
      status: "active",
    },
    {
      id: 2,
      name: "Emma Johnson",
      email: "emma.johnson@student.edu",
      rollNo: "2024002",
      batch: "2024",
      department: "Mathematics",
      phone: "+1 (555) 234-5678",
      status: "active",
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael.brown@student.edu",
      rollNo: "2023045",
      batch: "2023",
      department: "Physics",
      phone: "+1 (555) 345-6789",
      status: "inactive",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah.wilson@student.edu",
      rollNo: "2025001",
      batch: "2025",
      department: "Chemistry",
      phone: "+1 (555) 456-7890",
      status: "active",
    },
  ]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.email || !newStudent.rollNo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const student: Student = {
      id: students.length + 1,
      ...newStudent,
      status: "active",
    };

    setStudents(prev => [...prev, student]);
    setNewStudent({
      name: "",
      email: "",
      rollNo: "",
      batch: "",
      department: "",
      phone: "",
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Student Added",
      description: `${student.name} has been successfully added`,
    });
  };

  const handleEditStudent = () => {
    if (!selectedStudent) return;

    setStudents(prev =>
      prev.map(student =>
        student.id === selectedStudent.id ? selectedStudent : student
      )
    );

    setIsEditDialogOpen(false);
    setSelectedStudent(null);
    
    toast({
      title: "Student Updated",
      description: "Student information has been successfully updated",
    });
  };

  const handleDeleteStudent = (id: number) => {
    const student = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    
    toast({
      title: "Student Deleted",
      description: `${student?.name} has been removed from the system`,
    });
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent({ ...student });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground">Manage student records and information</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Student Directory</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-card">
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>
                      Enter the student's information below to add them to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-name">Full Name *</Label>
                      <Input
                        id="add-name"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-email">Email *</Label>
                      <Input
                        id="add-email"
                        type="email"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-rollno">Roll Number *</Label>
                      <Input
                        id="add-rollno"
                        value={newStudent.rollNo}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, rollNo: e.target.value }))}
                        placeholder="Enter roll number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-batch">Batch</Label>
                      <Select value={newStudent.batch} onValueChange={(value) => setNewStudent(prev => ({ ...prev, batch: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="2023">Batch 2023</SelectItem>
                          <SelectItem value="2024">Batch 2024</SelectItem>
                          <SelectItem value="2025">Batch 2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-department">Department</Label>
                      <Input
                        id="add-department"
                        value={newStudent.department}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="Enter department"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-phone">Phone</Label>
                      <Input
                        id="add-phone"
                        value={newStudent.phone}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddStudent} className="bg-primary text-primary-foreground">
                      Add Student
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.rollNo}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.batch}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>
                      <Badge
                        variant={student.status === "active" ? "default" : "secondary"}
                        className={student.status === "active" ? "bg-success text-success-foreground" : ""}
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(student)}
                          className="hover:bg-accent"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                          className="hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No students found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student's information below.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={selectedStudent.name}
                  onChange={(e) => setSelectedStudent(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedStudent.email}
                  onChange={(e) => setSelectedStudent(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rollno">Roll Number *</Label>
                <Input
                  id="edit-rollno"
                  value={selectedStudent.rollNo}
                  onChange={(e) => setSelectedStudent(prev => prev ? ({ ...prev, rollNo: e.target.value }) : null)}
                  placeholder="Enter roll number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-batch">Batch</Label>
                <Select value={selectedStudent.batch} onValueChange={(value) => setSelectedStudent(prev => prev ? ({ ...prev, batch: value }) : null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="2023">Batch 2023</SelectItem>
                    <SelectItem value="2024">Batch 2024</SelectItem>
                    <SelectItem value="2025">Batch 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={selectedStudent.department}
                  onChange={(e) => setSelectedStudent(prev => prev ? ({ ...prev, department: e.target.value }) : null)}
                  placeholder="Enter department"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={selectedStudent.phone}
                  onChange={(e) => setSelectedStudent(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStudent} className="bg-primary text-primary-foreground">
              Update Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;