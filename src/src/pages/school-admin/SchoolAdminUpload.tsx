import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Video, FileText, Users, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SchoolAdminSidebar } from "@/components/SchoolAdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

interface Student {
  id: string;
  full_name: string;
  student_id: string;
}

interface Teacher {
  id: string;
  full_name: string;
  specialization: string;
}

const SchoolAdminUpload = () => {
  const [students, setStudents] = useState<Student[]>([
    { id: "s1", full_name: "Rahul Sharma", student_id: "ST001" },
    { id: "s2", full_name: "Priya Nair", student_id: "ST002" },
    { id: "s3", full_name: "Arjun Menon", student_id: "ST003" },
    { id: "s4", full_name: "Kavya Krishnan", student_id: "ST004" },
    { id: "s5", full_name: "Amal Thomas", student_id: "ST005" }
  ]);
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: "t1", full_name: "Dr. Rajesh Kumar", specialization: "Mathematics" },
    { id: "t2", full_name: "Mrs. Sunitha Nair", specialization: "Physics" },
    { id: "t3", full_name: "Mr. Vishnu Pillai", specialization: "Chemistry" },
    { id: "t4", full_name: "Ms. Lakshmi Menon", specialization: "Biology" },
    { id: "t5", full_name: "Mr. Santhosh Kumar", specialization: "English" }
  ]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          profiles(full_name)
        `);

      if (error) throw error;

      const studentsData = data.map((student: any) => ({
        id: student.id,
        full_name: student.profiles?.full_name || '',
        student_id: student.student_id || '',
      }));

      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id,
          specialization,
          profiles(full_name)
        `);

      if (error) throw error;

      const teachersData = data.map((teacher: any) => ({
        id: teacher.id,
        full_name: teacher.profiles?.full_name || '',
        specialization: teacher.specialization || '',
      }));

      setTeachers(teachersData);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, []);

  const handleFileUpload = async (file: File, type: 'video' | 'pdf', userType: 'student' | 'teacher', userId: string) => {
    setUploading(true);
    try {
      // Note: This is a placeholder implementation
      // In a real application, you would implement Supabase Storage
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userType}_${userId}_${type}_${Date.now()}.${fileExt}`;
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully for ${userType}`,
      });

      // Reset selections
      setSelectedStudent("");
      setSelectedTeacher("");
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const UploadSection = ({ title, type, icon: Icon }: { title: string; type: 'video' | 'pdf'; icon: any }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>Upload {type} files</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`${type}-file`}>Select {type.toUpperCase()} File</Label>
          <Input
            id={`${type}-file`}
            type="file"
            accept={type === 'video' ? 'video/*' : '.pdf'}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const userType = selectedStudent ? 'student' : 'teacher';
                const userId = selectedStudent || selectedTeacher;
                if (userId) {
                  handleFileUpload(file, type, userType as 'student' | 'teacher', userId);
                } else {
                  toast({
                    title: "Error",
                    description: "Please select a student or teacher first",
                    variant: "destructive",
                  });
                }
              }
            }}
            disabled={uploading || (!selectedStudent && !selectedTeacher)}
          />
          {type === 'video' && (
            <p className="text-sm text-muted-foreground mt-1">
              Supported formats: MP4, AVI, MOV, WMV (Max: 100MB)
            </p>
          )}
          {type === 'pdf' && (
            <p className="text-sm text-muted-foreground mt-1">
              Supported format: PDF (Max: 10MB)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SchoolAdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="File Upload" subtitle="Upload content for students and teachers" />
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">File Upload Management</h2>
                <p className="text-muted-foreground">Upload videos and PDFs for students and teachers</p>
              </div>

              <Tabs defaultValue="students" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="students" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Students
                  </TabsTrigger>
                  <TabsTrigger value="teachers" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Teachers
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="students" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Student</CardTitle>
                      <CardDescription>Choose a student to upload content for</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.full_name} ({student.student_id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {selectedStudent && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <UploadSection title="Upload Video" type="video" icon={Video} />
                      <UploadSection title="Upload PDF" type="pdf" icon={FileText} />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="teachers" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Teacher</CardTitle>
                      <CardDescription>Choose a teacher to upload content for</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.full_name} ({teacher.specialization})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {selectedTeacher && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <UploadSection title="Upload Video" type="video" icon={Video} />
                      <UploadSection title="Upload PDF" type="pdf" icon={FileText} />
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {uploading && (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2">
                      <Upload className="h-5 w-5 animate-spin" />
                      <span>Uploading file...</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SchoolAdminUpload;