import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatNameToTitleCase } from "@/lib/utils";

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  school_name: string;
  school_id: string;
  employee_id: string;
  status: "active" | "inactive";
}

interface School {
  id: string;
  name: string;
}

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const TEACHERS_PER_PAGE = 10;
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    school_id: "",
    employee_id: "",
    password: "",
  });

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, selectedSchool, sortOrder]);

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const from = page * TEACHERS_PER_PAGE;
      const to = from + TEACHERS_PER_PAGE - 1;
      
      let query = supabase
        .from('teachers')
        .select(`
          id,
          employee_id,
          specialization,
          hire_date,
          school_id,
          profiles!inner (
            full_name,
            email,
            phone,
            status
          ),
          schools (
            name
          )
        `, { count: 'exact' });

      if (selectedSchool !== 'all') {
        query = query.eq('school_id', selectedSchool);
      }

      query = query.order('profiles(full_name)', { ascending: sortOrder === 'asc' }).range(from, to);

      const { data: teachersData, error: teachersError, count: teacherCount } = await query;

      if (teachersError) throw teachersError;

      // Fetch schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');

      if (schoolsError) throw schoolsError;

      const formattedTeachers = teachersData?.map(teacher => ({
        id: teacher.id,
        full_name: teacher.profiles.full_name,
        email: teacher.profiles.email,
        phone: teacher.profiles.phone || '',
        specialization: teacher.specialization || '',
        school_name: teacher.schools?.name || '',
        school_id: teacher.school_id || '',
        employee_id: teacher.employee_id || '',
        status: teacher.profiles.status as "active" | "inactive",
      })) || [];

      setTeachers(formattedTeachers);
      setTotalTeachers(teacherCount || 0);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.school_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTeacher) {
        // Update existing teacher
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
          })
          .eq('id', editingTeacher.id);

        if (profileError) throw profileError;

        const { error: teacherError } = await supabase
          .from('teachers')
          .update({
            employee_id: formData.employee_id,
            specialization: formData.specialization,
            school_id: formData.school_id,
          })
          .eq('id', editingTeacher.id);

        if (teacherError) throw teacherError;

        toast({
          title: "Success",
          description: "Teacher updated successfully",
        });
      } else {
        // Create new teacher
        const password = formData.password || generateRandomPassword();

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: password,
          options: {
            data: {
              full_name: formData.full_name,
              phone: formData.phone,
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        // Insert teacher record
        const { error: teacherError } = await supabase
          .from('teachers')
          .insert({
            id: authData.user.id,
            employee_id: formData.employee_id,
            specialization: formData.specialization,
            school_id: formData.school_id,
          });

        if (teacherError) throw teacherError;

        // Assign teacher role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'teacher',
          });

        if (roleError) throw roleError;

        toast({
          title: "Success",
          description: `Teacher created successfully. Password: ${password}`,
        });
      }

      resetForm();
      fetchData(); // Refresh the data
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create teacher",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      specialization: "",
      school_id: "",
      employee_id: "",
      password: "",
    });
    setEditingTeacher(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      full_name: teacher.full_name,
      email: teacher.email,
      phone: teacher.phone,
      specialization: teacher.specialization,
      school_id: teacher.school_id,
      employee_id: teacher.employee_id,
      password: "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
      
      fetchData(); // Refresh the data
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      toast({
        title: "Error",
        description: "Failed to delete teacher",
        variant: "destructive",
      });
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teacher Management</h1>
          <p className="text-muted-foreground">Manage teachers and their information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
                </DialogTitle>
                <DialogDescription>
                  Enter teacher information
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: formatNameToTitleCase(e.target.value) })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                    disabled={!!editingTeacher}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    placeholder="Enter employee ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Subject/Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Enter subject area"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school_id">School *</Label>
                  <Select
                    value={formData.school_id}
                    onValueChange={(value) => setFormData({ ...formData, school_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!editingTeacher && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="password">Password (leave empty for auto-generation)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password or leave empty"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTeacher ? "Update" : "Add"} Teacher
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teachers</CardTitle>
          <CardDescription>Manage your teaching staff</CardDescription>
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by school" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map(school => (
                  <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
              Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{formatNameToTitleCase(teacher.full_name)}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.phone}</TableCell>
                  <TableCell>{teacher.specialization}</TableCell>
                  <TableCell>{teacher.school_name}</TableCell>
                  <TableCell>{teacher.employee_id}</TableCell>
                  <TableCell>
                    <Badge variant={teacher.status === "active" ? "default" : "secondary"}>
                      {teacher.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(teacher)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this teacher and all their associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(teacher.id)}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredTeachers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No teachers found
            </div>
          )}
        </CardContent>
        <div className="flex justify-between items-center p-4 border-t">
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {Math.ceil(totalTeachers / TEACHERS_PER_PAGE)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalTeachers / TEACHERS_PER_PAGE) - 1))}
              disabled={(currentPage + 1) * TEACHERS_PER_PAGE >= totalTeachers}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TeacherManagement;