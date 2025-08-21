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
import { Bell, Search, AlertTriangle, Info, CheckCircle, Plus, Eye, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SchoolAdminSidebar } from "@/components/SchoolAdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

const notificationFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  type: z.enum(["info", "warning", "success", "error"]),
  recipient_type: z.enum(["all", "teachers", "students"]),
  recipient_id: z.string().optional(),
});

type NotificationFormData = z.infer<typeof notificationFormSchema>;

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  recipient_name?: string;
  recipient_type: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

const SchoolAdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recipientType, setRecipientType] = useState("all");
  const { toast } = useToast();

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "info",
      recipient_type: "all",
      recipient_id: "",
    },
  });

  const fetchData = async () => {
    try {
      // Fetch notifications with recipient information
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select(`
          id,
          title,
          message,
          type,
          read,
          created_at,
          user_id,
          profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (notificationsError) throw notificationsError;

      const notificationsFormatted = notificationsData.map((notification: any) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        created_at: notification.created_at,
        recipient_name: notification.profiles?.full_name || 'Unknown',
        recipient_type: 'individual',
      }));

      setNotifications(notificationsFormatted);

      // Fetch teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('id, profiles(full_name, email)');
      if (teachersError) throw teachersError;
      const teachersFormatted = teachersData.map((teacher: any) => ({
        id: teacher.id,
        full_name: teacher.profiles?.full_name || '',
        email: teacher.profiles?.email || '',
      }));
      setTeachers(teachersFormatted);

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, profiles(full_name, email)');
      if (studentsError) throw studentsError;
      const studentsFormatted = studentsData.map((student: any) => ({
        id: student.id,
        full_name: student.profiles?.full_name || '',
        email: student.profiles?.email || '',
      }));
      setStudents(studentsFormatted);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: NotificationFormData) => {
    try {
      let recipients: string[] = [];

      if (data.recipient_type === "all") {
        // Send to all users (teachers + students)
        recipients = [...teachers.map(t => t.id), ...students.map(s => s.id)];
      } else if (data.recipient_type === "teachers") {
        recipients = teachers.map(t => t.id);
      } else if (data.recipient_type === "students") {
        recipients = students.map(s => s.id);
      } else if (data.recipient_id) {
        recipients = [data.recipient_id];
      }

      // Create notifications for all recipients
      const notificationData = recipients.map(userId => ({
        title: data.title,
        message: data.message,
        type: data.type,
        user_id: userId,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Notification sent to ${recipients.length} recipient(s)`,
      });

      setIsDialogOpen(false);
      form.reset();
      fetchData();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));

      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(notifications.filter(n => n.id !== notificationId));

      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filteredNotifications = notifications.filter((notification) =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (notification.recipient_name && notification.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <SchoolAdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader title="Notifications" subtitle="Manage school notifications" />
            <main className="flex-1 p-6 bg-background">
              <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading notifications...</div>
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
          <AdminHeader title="Notifications" subtitle="Manage school notifications" />
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Notifications Management</h2>
                  <p className="text-muted-foreground">Send and manage important notifications</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => form.reset()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Send Notification
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Send Notification</DialogTitle>
                      <DialogDescription>
                        Send an important notification to users
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter notification title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter notification message" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select notification type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="info">Info</SelectItem>
                                  <SelectItem value="warning">Warning</SelectItem>
                                  <SelectItem value="success">Success</SelectItem>
                                  <SelectItem value="error">Error</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="recipient_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Send To</FormLabel>
                              <Select onValueChange={(value) => {
                                field.onChange(value);
                                setRecipientType(value);
                              }} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select recipients" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="all">All Users</SelectItem>
                                  <SelectItem value="teachers">All Teachers</SelectItem>
                                  <SelectItem value="students">All Students</SelectItem>
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
                            Send Notification
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications History</CardTitle>
                  <CardDescription>All sent notifications</CardDescription>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search notifications..." 
                      className="max-w-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No notifications found</p>
                      </div>
                    ) : (
                      filteredNotifications.map((notification) => (
                        <div key={notification.id} className={`flex items-center justify-between p-4 border rounded-lg ${!notification.read ? 'bg-muted/50' : ''}`}>
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div>
                              <h4 className="font-medium">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>To: {notification.recipient_name}</span>
                                <span>•</span>
                                <span>{new Date(notification.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant={getNotificationVariant(notification.type)}>
                              {notification.type}
                            </Badge>
                            {!notification.read && (
                              <Badge variant="secondary">Unread</Badge>
                            )}
                            {!notification.read && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Mark Read
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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

export default SchoolAdminNotifications;