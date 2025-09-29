import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { Users, Search, Mail, Phone, Edit, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SchoolAdminSidebar } from "@/components/SchoolAdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

const teacherFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  specialization: z.string().min(2, "Specialization is required"),
});

type TeacherFormData = z.infer<typeof teacherFormSchema>;

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  status: string;
  hire_date: string;
  employee_id: string;
}

const SchoolAdminTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: "1",
      full_name: "Ravi Krishnan",
      email: "ravi.krishnan@school.edu.in",
      phone: "+91-9876543210",
      specialization: "Mathematics",
      status: "active",
      hire_date: "2020-06-15",
      employee_id: "EMP001",
    },
    {
      id: "2", 
      full_name: "Lakshmi Pillai",
      email: "lakshmi.pillai@school.edu.in",
      phone: "+91-8765432109",
      specialization: "Science",
      status: "active",
      hire_date: "2019-08-20",
      employee_id: "EMP002",
    },
    {
      id: "3",
      full_name: "Suresh Kumar",
      email: "suresh.kumar@school.edu.in", 
      phone: "+91-7654321098",
      specialization: "English",
      status: "active",
      hire_date: "2021-01-10",
      employee_id: "EMP003",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      specialization: "",
    },
  });

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id,
          employee_id,
          specialization,
          hire_date,
          profiles(
            full_name,
            email,
            phone,
            status
          )
        `);

      if (error) throw error;

      const teachersData = data.map((teacher: any) => ({
        id: teacher.id,
        full_name: teacher.profiles?.full_name || '',
        email: teacher.profiles?.email || '',
        phone: teacher.profiles?.phone || '',
        specialization: teacher.specialization || '',
        status: teacher.profiles?.status || 'active',
        hire_date: teacher.hire_date || '',
        employee_id: teacher.employee_id || '',
      }));

      setTeachers(teachersData);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const onSubmit = async (data: TeacherFormData) => {
    try {
      if (editingTeacher) {
        // Update existing teacher
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
          })
          .eq('id', editingTeacher.id);

        if (profileError) throw profileError;

        const { error: teacherError } = await supabase
          .from('teachers')
          .update({
            specialization: data.specialization,
          })
          .eq('id', editingTeacher.id);

        if (teacherError) throw teacherError;

        toast({
          title: "Success",
          description: "Teacher updated successfully",
        });
      } else {
        // Create new teacher - this would require auth.users creation first
        toast({
          title: "Info",
          description: "Teacher creation requires full authentication setup",
        });
      }

      setIsDialogOpen(false);
      setEditingTeacher(null);
      form.reset();
      fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast({
        title: "Error",
        description: "Failed to save teacher",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    form.setValue("full_name", teacher.full_name);
    form.setValue("email", teacher.email);
    form.setValue("phone", teacher.phone);
    form.setValue("specialization", teacher.specialization);
    setIsDialogOpen(true);
  };

  const handleDelete = async (teacherId: string) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({
        title: "Error",
        description: "Failed to delete teacher",
        variant: "destructive",
      });
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <SchoolAdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader title="Teachers Management" subtitle="Manage your school teachers" />
            <main className="flex-1 p-6 bg-background">
              <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading teachers...</div>
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
          <AdminHeader title="Teachers Management" subtitle="Manage your school teachers" />
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Teachers Management</h2>
                  <p className="text-muted-foreground">Manage teachers in your school</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingTeacher(null);
                      form.reset();
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Teacher
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTeacher ? "Edit Teacher" : "Add Teacher"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingTeacher 
                          ? "Update teacher information" 
                          : "Add a new teacher to your school"
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
                          name="specialization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specialization</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter specialization" {...field} />
                              </FormControl>
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
                            {editingTeacher ? "Update" : "Add"} Teacher
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Teacher List</CardTitle>
                  <CardDescription>Teachers in your school</CardDescription>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search teachers..." 
                      className="max-w-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredTeachers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No teachers found</p>
                      </div>
                    ) : (
                      filteredTeachers.map((teacher) => (
                        <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-medium text-primary">
                                {teacher.full_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium">{teacher.full_name}</h4>
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
                                <span>{teacher.specialization}</span>
                                {teacher.hire_date && (
                                  <>
                                    <span>•</span>
                                    <span>Hired: {new Date(teacher.hire_date).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                              {teacher.status}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(teacher)}
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
                                    This action cannot be undone. This will permanently delete this teacher.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(teacher.id)}>Continue</AlertDialogAction>
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

export default SchoolAdminTeachers;