import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  status: "active" | "inactive" | "suspended";
  students?: {
    student_id: string;
    batch_id: string;
    school_id: string;
    batches?: {
      name: string;
    };
    schools?: {
      name: string;
    };
  };
}

interface Batch {
  id: string;
  name: string;
}

interface School {
  id: string;
  name: string;
}

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStudent, setNewStudent] = useState({
    full_name: "",
    email: "",
    phone: "",
    student_id: "",
    batch_id: "",
    school_id: "",
    password: "",
  });

  // Generate a random password
  const generateRandomPassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch students with batch and school info
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          status,
          students!inner (
            student_id,
            batch_id,
            school_id,
            batches (
              name
            ),
            schools (
              name
            )
          )
        `);

      if (studentsError) throw studentsError;

      // Fetch batches
      const { data: batchesData, error: batchesError } = await supabase
        .from('batches')
        .select('id, name')
        .order('name');

      if (batchesError) throw batchesError;

      // Fetch schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');

      if (schoolsError) throw schoolsError;

      setStudents(studentsData || []);
      setBatches(batchesData || []);
      setSchools(schoolsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.students?.student_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = async () => {
    if (!newStudent.full_name || !newStudent.email || !newStudent.school_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate password if not provided
      const password = newStudent.password || generateRandomPassword();

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newStudent.email,
        password: password,
        options: {
          data: {
            full_name: newStudent.full_name,
            phone: newStudent.phone,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Insert into students table
        const { error: studentError } = await supabase
          .from('students')
          .insert({
            id: authData.user.id,
            student_id: newStudent.student_id,
            batch_id: newStudent.batch_id || null,
            school_id: newStudent.school_id,
          });

        if (studentError) throw studentError;

        // Insert role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'student'
          });

        if (roleError) throw roleError;

        toast({
          title: "Student Added",
          description: `${newStudent.full_name} has been successfully added with password: ${password}`,
        });

        // Reset form and refresh data
        setNewStudent({
          full_name: "",
          email: "",
          phone: "",
          student_id: "",
          batch_id: "",
          school_id: "",
          password: "",
        });
        setIsAddDialogOpen(false);
        fetchData();
      }
    } catch (error: any) {
      console.error('Error creating student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create student",
        variant: "destructive",
      });
    }
  };

  const handleEditStudent = async () => {
    if (!selectedStudent) return;

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: selectedStudent.full_name,
          phone: selectedStudent.phone,
        })
        .eq('id', selectedStudent.id);

      if (profileError) throw profileError;

      // Update student record if exists
      if (selectedStudent.students) {
        const studentData = selectedStudent.students;
        const { error: studentError } = await supabase
          .from('students')
          .update({
            student_id: studentData.student_id,
            batch_id: studentData.batch_id,
            school_id: studentData.school_id,
          })
          .eq('id', selectedStudent.id);

        if (studentError) throw studentError;
      }

      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      fetchData();
      
      toast({
        title: "Student Updated",
        description: "Student information has been successfully updated",
      });
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      // Delete from auth will cascade to other tables
      const { error } = await supabase.auth.admin.deleteUser(id);
      
      if (error) throw error;
      
      fetchData();
      toast({
        title: "Student Deleted",
        description: "Student has been removed from the system",
      });
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent({ ...student });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                        value={newStudent.full_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, full_name: e.target.value }))}
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
                      <Label htmlFor="add-phone">Phone</Label>
                      <Input
                        id="add-phone"
                        value={newStudent.phone}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-student-id">Student ID</Label>
                      <Input
                        id="add-student-id"
                        value={newStudent.student_id}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, student_id: e.target.value }))}
                        placeholder="Enter student ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-school">School *</Label>
                      <Select value={newStudent.school_id} onValueChange={(value) => setNewStudent(prev => ({ ...prev, school_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select school" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {schools.map((school) => (
                            <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-batch">Batch</Label>
                      <Select value={newStudent.batch_id} onValueChange={(value) => setNewStudent(prev => ({ ...prev, batch_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {batches.map((batch) => (
                            <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-password">Password (optional)</Label>
                      <Input
                        id="add-password"
                        type="password"
                        value={newStudent.password}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Leave empty for auto-generated"
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
                  <TableHead>Student ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredStudents.map((student) => (
                   <TableRow key={student.id} className="hover:bg-muted/30">
                     <TableCell className="font-medium">{student.full_name}</TableCell>
                     <TableCell>{student.students?.student_id || '-'}</TableCell>
                     <TableCell>{student.email}</TableCell>
                     <TableCell>{student.students?.batches?.name || '-'}</TableCell>
                     <TableCell>{student.students?.schools?.name || '-'}</TableCell>
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
                  value={selectedStudent.full_name}
                  onChange={(e) => setSelectedStudent(prev => prev ? ({ ...prev, full_name: e.target.value }) : null)}
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