import { useState } from "react";
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
import { Plus, Edit, Trash2, Search, Video, Calendar, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Session {
  id: string;
  meetingName: string;
  class: string;
  batch: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingLink: string;
  platform: "zoom" | "google-meet";
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
}

const mockBatches = ["Batch 2023", "Batch 2024", "Batch 2025"];
const mockClasses = ["10th Grade", "11th Grade", "12th Grade"];
const mockSubjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"];

const SessionManagement = () => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      meetingName: "Physics Lecture - Chapter 5",
      class: "11th Grade",
      batch: "Batch 2024",
      subject: "Physics",
      date: "2025-01-25",
      startTime: "10:00",
      endTime: "11:00",
      meetingLink: "https://zoom.us/j/1234567890",
      platform: "zoom",
      status: "scheduled",
    },
    {
      id: "2",
      meetingName: "Math Problem Solving",
      class: "12th Grade",
      batch: "Batch 2023",
      subject: "Mathematics",
      date: "2025-01-26",
      startTime: "14:00",
      endTime: "15:30",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      platform: "google-meet",
      status: "scheduled",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    meetingName: "",
    class: "",
    batch: "",
    subject: "",
    date: "",
    startTime: "",
    endTime: "",
    meetingLink: "",
    platform: "zoom" as "zoom" | "google-meet",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.meetingName || !formData.batch || !formData.subject || !formData.date || !formData.startTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingSession) {
      setSessions(sessions.map(session =>
        session.id === editingSession.id
          ? { ...session, ...formData }
          : session
      ));
      toast({
        title: "Success",
        description: "Session updated successfully",
      });
    } else {
      const newSession: Session = {
        id: Date.now().toString(),
        ...formData,
        status: "scheduled",
      };
      setSessions([...sessions, newSession]);
      toast({
        title: "Success",
        description: "Session created successfully",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      meetingName: "",
      class: "",
      batch: "",
      subject: "",
      date: "",
      startTime: "",
      endTime: "",
      meetingLink: "",
      platform: "zoom",
    });
    setEditingSession(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setFormData({
      meetingName: session.meetingName,
      class: session.class,
      batch: session.batch,
      subject: session.subject,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      meetingLink: session.meetingLink,
      platform: session.platform,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSessions(sessions.filter(session => session.id !== id));
    toast({
      title: "Success",
      description: "Session deleted successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "default";
      case "ongoing": return "destructive";
      case "completed": return "secondary";
      case "cancelled": return "outline";
      default: return "default";
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.meetingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Session Management</h1>
          <p className="text-muted-foreground">Create and manage online sessions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSession ? "Edit Session" : "Create New Session"}
                </DialogTitle>
                <DialogDescription>
                  Set up an online meeting session for students
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="meetingName">Meeting Name *</Label>
                  <Input
                    id="meetingName"
                    value={formData.meetingName}
                    onChange={(e) => setFormData({ ...formData, meetingName: e.target.value })}
                    placeholder="e.g., Physics Lecture - Chapter 5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select 
                    value={formData.class} 
                    onValueChange={(value) => setFormData({ ...formData, class: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClasses.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch *</Label>
                  <Select 
                    value={formData.batch} 
                    onValueChange={(value) => setFormData({ ...formData, batch: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBatches.map((batch) => (
                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select 
                    value={formData.subject} 
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select 
                    value={formData.platform} 
                    onValueChange={(value) => setFormData({ ...formData, platform: value as "zoom" | "google-meet" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="google-meet">Google Meet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input
                    id="meetingLink"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder="https://zoom.us/j/1234567890 or https://meet.google.com/abc-defg-hij"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSession ? "Update" : "Create"} Session
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Sessions</CardTitle>
          <CardDescription>Manage online meetings and sessions</CardDescription>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meeting Name</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.meetingName}</TableCell>
                  <TableCell>{session.batch}</TableCell>
                  <TableCell>{session.subject}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {session.date}
                      <Clock className="h-4 w-4 ml-2" />
                      {session.startTime}
                      {session.endTime && ` - ${session.endTime}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      {session.platform === "zoom" ? "Zoom" : "Google Meet"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {session.meetingLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(session.meetingLink, '_blank')}
                        >
                          Join
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(session)}
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
                              This action cannot be undone. This will permanently delete this session.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(session.id)}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionManagement;