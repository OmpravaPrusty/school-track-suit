import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Video, Search, Calendar, Clock, Users, Plus, Edit, ExternalLink, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SchoolAdminSidebar } from "@/components/SchoolAdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

const sessionFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  session_date: z.string().min(1, "Session date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  course_id: z.string().min(1, "Course is required"),
  teacher_id: z.string().min(1, "Teacher is required"),
  batch_id: z.string().min(1, "Batch is required"),
  meeting_link: z.string().url("Meeting link must be a valid URL").optional().or(z.literal("")),
});

type SessionFormData = z.infer<typeof sessionFormSchema>;

interface Session {
  id: string;
  title: string;
  description: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  meeting_link: string;
  course_name: string;
  teacher_name: string;
  batch_name: string;
  course_id: string;
  teacher_id: string;
  batch_id: string;
}

interface Course {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  full_name: string;
}

interface Batch {
  id: string;
  name: string;
}

const SchoolAdminSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      title: "Mathematics - Algebra",
      description: "Introduction to Algebraic Equations",
      session_date: "2024-08-25",
      start_time: "10:00",
      end_time: "11:00",
      status: "scheduled",
      meeting_link: "https://meet.google.com/abc-defg-hij",
      course_id: "course1",
      teacher_id: "teacher1",
      batch_id: "batch1",
      course_name: "Mathematics",
      teacher_name: "Ravi Krishnan",
      batch_name: "Class 10A"
    },
    {
      id: "2",
      title: "Science - Physics",
      description: "Laws of Motion",
      session_date: "2024-08-26",
      start_time: "14:00", 
      end_time: "15:00",
      status: "completed",
      meeting_link: "https://meet.google.com/xyz-uvwx-yz",
      course_id: "course2",
      teacher_id: "teacher2",
      batch_id: "batch1",
      course_name: "Science",
      teacher_name: "Lakshmi Pillai",
      batch_name: "Class 10A"
    },
  ]);
  const [courses, setCourses] = useState<Course[]>([
    { id: "c1", name: "Mathematics" },
    { id: "c2", name: "Physics" },
    { id: "c3", name: "Chemistry" }, 
    { id: "c4", name: "Biology" },
    { id: "c5", name: "English" }
  ]);
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: "t1", full_name: "Dr. Rajesh Kumar" },
    { id: "t2", full_name: "Mrs. Sunitha Nair" },
    { id: "t3", full_name: "Mr. Vishnu Pillai" },
    { id: "t4", full_name: "Ms. Lakshmi Menon" },
    { id: "t5", full_name: "Mr. Santhosh Kumar" }
  ]);
  const [batches, setBatches] = useState<Batch[]>([
    { id: "b1", name: "Class 12A" },
    { id: "b2", name: "Class 11B" },
    { id: "b3", name: "Class 10C" },
    { id: "b4", name: "Class 9D" }
  ]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const { toast } = useToast();

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      session_date: "",
      start_time: "",
      end_time: "",
      course_id: "",
      teacher_id: "",
      batch_id: "",
      meeting_link: "",
    },
  });

  const fetchData = async () => {
    try {
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, name');
      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Fetch teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('id, profiles(full_name)');
      if (teachersError) throw teachersError;
      const teachersFormatted = teachersData.map((teacher: any) => ({
        id: teacher.id,
        full_name: teacher.profiles?.full_name || '',
      }));
      setTeachers(teachersFormatted);

      // Fetch batches
      const { data: batchesData, error: batchesError } = await supabase
        .from('batches')
        .select('id, name');
      if (batchesError) throw batchesError;
      setBatches(batchesData || []);

      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          id,
          title,
          description,
          session_date,
          start_time,
          end_time,
          status,
          meeting_link,
          course_id,
          teacher_id,
          batch_id,
          courses(name),
          teachers!sessions_teacher_id_fkey(profiles(full_name)),
          batches(name)
        `);

      if (sessionsError) throw sessionsError;

      const sessionsFormatted = sessionsData.map((session: any) => ({
        id: session.id,
        title: session.title || '',
        description: session.description || '',
        session_date: session.session_date || '',
        start_time: session.start_time || '',
        end_time: session.end_time || '',
        status: session.status || 'scheduled',
        meeting_link: session.meeting_link || '',
        course_name: session.courses?.name || '',
        teacher_name: session.teachers?.profiles?.full_name || '',
        batch_name: session.batches?.name || '',
        course_id: session.course_id || '',
        teacher_id: session.teacher_id || '',
        batch_id: session.batch_id || '',
      }));

      setSessions(sessionsFormatted);
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

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: SessionFormData) => {
    try {
      const sessionData = {
        title: data.title,
        description: data.description || null,
        session_date: data.session_date,
        start_time: data.start_time,
        end_time: data.end_time,
        course_id: data.course_id,
        teacher_id: data.teacher_id,
        batch_id: data.batch_id,
        meeting_link: data.meeting_link || null,
        status: 'scheduled' as const,
      };

      if (editingSession) {
        const { error } = await supabase
          .from('sessions')
          .update(sessionData)
          .eq('id', editingSession.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Session updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('sessions')
          .insert([sessionData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Session created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingSession(null);
      form.reset();
      fetchData();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Error",
        description: "Failed to save session",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    form.setValue("title", session.title);
    form.setValue("description", session.description);
    form.setValue("session_date", session.session_date);
    form.setValue("start_time", session.start_time);
    form.setValue("end_time", session.end_time);
    form.setValue("course_id", session.course_id);
    form.setValue("teacher_id", session.teacher_id);
    form.setValue("batch_id", session.batch_id);
    form.setValue("meeting_link", session.meeting_link);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.batch_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <SchoolAdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader title="Sessions Management" subtitle="Manage your school sessions" />
            <main className="flex-1 p-6 bg-background">
              <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading sessions...</div>
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
          <AdminHeader title="Sessions Management" subtitle="Manage your school sessions" />
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Sessions Management</h2>
                  <p className="text-muted-foreground">Create and manage learning sessions</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingSession(null);
                      form.reset();
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingSession ? "Edit Session" : "Create Session"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingSession 
                          ? "Update session information" 
                          : "Create a new learning session"
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Session Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter session title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter session description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="session_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="start_time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="end_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="course_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                      {course.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="teacher_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teacher</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a teacher" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {teachers.map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id}>
                                      {teacher.full_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                        <FormField
                          control={form.control}
                          name="meeting_link"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meeting Link</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter meeting link (optional)" {...field} />
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
                            {editingSession ? "Update" : "Create"} Session
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Sessions List</CardTitle>
                  <CardDescription>All sessions in your school</CardDescription>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search sessions..." 
                      className="max-w-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredSessions.length === 0 ? (
                      <div className="text-center py-8">
                        <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No sessions found</p>
                      </div>
                    ) : (
                      filteredSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Video className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{session.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(session.session_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{session.start_time} - {session.end_time}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>Course: {session.course_name}</span>
                                <span>•</span>
                                <span>Teacher: {session.teacher_name}</span>
                                <span>•</span>
                                <span>Batch: {session.batch_name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                            {session.meeting_link && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Join
                                </a>
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(session)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
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

export default SchoolAdminSessions;