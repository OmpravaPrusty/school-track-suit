import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Users, Search, Mail, Phone, Edit, Plus, Trash2, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SchoolAdminSidebar } from "@/components/SchoolAdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

const studentFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  student_id: z.string().min(1, "Student ID is required"),
  batch_id: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  student_id: string;
  status: string;
  enrollment_date: string;
  batch_name?: string;
  batch_id?: string;
}

interface Batch {
  id: string;
  name: string;
}

const SchoolAdminStudents = () => {
  const [students, setStudents] = useState<Student[]>([
    {
      id: "1",
      student_id: "STU001",
      enrollment_date: "2024-06-01",
      batch_id: "batch1",
      full_name: "Aditya Menon",
      email: "aditya.menon@school.edu.in",
      phone: "+91-9876543210",
      status: "active",
      batch_name: "Class 10A"
    },
    {
      id: "2",
      student_id: "STU002", 
      enrollment_date: "2024-06-01",
      batch_id: "batch1",
      full_name: "Nisha Sharma",
      email: "nisha.sharma@school.edu.in",
      phone: "+91-8765432109",
      status: "active",
      batch_name: "Class 10A"
    },
    {
      id: "3",
      student_id: "STU003",
      enrollment_date: "2024-06-01", 
      batch_id: "batch2",
      full_name: "Kiran Kumar",
      email: "kiran.kumar@school.edu.in",
      phone: "+91-7654321098",
      status: "active",
      batch_name: "Class 9B"
    },
  ]);
  const [batches, setBatches] = useState<Batch[]>([
    { id: "batch-1", name: "Batch A" },
    { id: "batch-2", name: "Batch B" },
    { id: "batch-3", name: "Batch C" },
    { id: "batch-4", name: "Batch D" }
  ]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      student_id: "",
      batch_id: "",
    },
  });

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('id, name');

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          enrollment_date,
          batch_id,
          batches(name),
          profiles(
            full_name,
            email,
            phone,
            status
          )
        `);

      if (error) throw error;

      const studentsData = data.map((student: any) => ({
        id: student.id,
        full_name: student.profiles?.full_name || '',
        email: student.profiles?.email || '',
        phone: student.profiles?.phone || '',
        student_id: student.student_id || '',
        status: student.profiles?.status || 'active',
        enrollment_date: student.enrollment_date || '',
        batch_name: student.batches?.name || '',
        batch_id: student.batch_id || '',
      }));

      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchStudents();
  }, []);

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (editingStudent) {
        // Update existing student
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
          })
          .eq('id', editingStudent.id);

        if (profileError) throw profileError;

        const { error: studentError } = await supabase
          .from('students')
          .update({
            student_id: data.student_id,
            batch_id: data.batch_id || null,
          })
          .eq('id', editingStudent.id);

        if (studentError) throw studentError;

        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } else {
        // Create new student - this would require auth.users creation first
        toast({
          title: "Info",
          description: "Student creation requires full authentication setup",
        });
      }

      setIsDialogOpen(false);
      setEditingStudent(null);
      form.reset();
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: "Error",
        description: "Failed to save student",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    form.setValue("full_name", student.full_name);
    form.setValue("email", student.email);
    form.setValue("phone", student.phone);
    form.setValue("student_id", student.student_id);
    form.setValue("batch_id", student.batch_id || "");
    setIsDialogOpen(true);
  };

  const handleDelete = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter((student) =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.batch_name && student.batch_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <SchoolAdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader title="Students Management" subtitle="Manage your school students" />
            <main className="flex-1 p-6 bg-background">
              <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading students...</div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SchoolAdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Students Management" subtitle="Manage your school students" />
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Students Management</h2>
                  <p className="text-muted-foreground">Manage students in your school</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingStudent(null);
                      form.reset();
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingStudent ? "Edit Student" : "Add Student"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingStudent 
                          ? "Update student information" 
                          : "Add a new student to your school"
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter email" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="student_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter student ID" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="batch_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Batch</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a batch" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {batches.map((batch) => (
                                    <SelectItem key={batch.id} value={batch.id}>
                                      {batch.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingStudent ? "Update" : "Add"} Student
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Student List</CardTitle>
                  <CardDescription>Students in your school</CardDescription>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search students..." 
                      className="max-w-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredStudents.length === 0 ? (
                      <div className="text-center py-8">
                        <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No students found</p>
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-medium text-primary">
                                {student.full_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium">{student.full_name}</h4>
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
                                <span>ID: {student.student_id}</span>
                                {student.batch_name && (
                                  <>
                                    <span>•</span>
                                    <span>Batch: {student.batch_name}</span>
                                  </>
                                )}
                                {student.enrollment_date && (
                                  <>
                                    <span>•</span>
                                    <span>Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                              {student.status}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(student)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this student.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(student.id)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SchoolAdminStudents;