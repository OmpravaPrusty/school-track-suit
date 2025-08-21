import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Users, Search, Clock, CheckCircle, XCircle } from "lucide-react";

interface AttendanceRecord {
  id: string;
  session_date: string;
  session_title: string;
  course: string;
  status: string;
  check_in_time: string;
  duration: string;
  teacher: string;
  students_present: number;
  total_students: number;
}

const SMEAttendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const attendanceRecords: AttendanceRecord[] = [
    {
      id: "1",
      session_date: "2025-01-21",
      session_title: "Advanced Mathematics - Calculus",
      course: "Mathematics",
      status: "present",
      check_in_time: "09:00 AM",
      duration: "1.5 hours",
      teacher: "Ravi Krishnan",
      students_present: 28,
      total_students: 30,
    },
    {
      id: "2",
      session_date: "2025-01-20",
      session_title: "Physics Fundamentals - Optics",
      course: "Physics",
      status: "present",
      check_in_time: "11:00 AM",
      duration: "2 hours",
      teacher: "Lakshmi Pillai",
      students_present: 25,
      total_students: 28,
    },
    {
      id: "3",
      session_date: "2025-01-19",
      session_title: "Chemistry Workshop",
      course: "Chemistry",
      status: "absent",
      check_in_time: "-",
      duration: "-",
      teacher: "Suresh Kumar",
      students_present: 22,
      total_students: 25,
    },
    {
      id: "4",
      session_date: "2025-01-18",
      session_title: "Biology Practical Session",
      course: "Biology",
      status: "present",
      check_in_time: "02:00 PM",
      duration: "1.5 hours",
      teacher: "Priya Nair",
      students_present: 24,
      total_students: 26,
    },
    {
      id: "5",
      session_date: "2025-01-17",
      session_title: "Computer Science Lab",
      course: "Computer Science",
      status: "present",
      check_in_time: "10:00 AM",
      duration: "2 hours",
      teacher: "Arun Menon",
      students_present: 20,
      total_students: 22,
    },
    {
      id: "6",
      session_date: "2025-01-16",
      session_title: "English Literature Discussion",
      course: "English",
      status: "present",
      check_in_time: "11:30 AM",
      duration: "1 hour",
      teacher: "Kavitha Das",
      students_present: 26,
      total_students: 28,
    },
  ];

  const filteredRecords = attendanceRecords.filter((record) =>
    record.session_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.session_date.includes(searchTerm)
  );

  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const attendanceRate = Math.round((presentCount / attendanceRecords.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Attendance</h2>
        <p className="text-muted-foreground">Track your session attendance as SME</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{presentCount}</p>
              <p className="text-sm text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="h-8 w-8 text-red-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{absentCount}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{attendanceRate}%</p>
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-purple-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{attendanceRecords.length}</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your session attendance records</CardDescription>
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
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No attendance records found</p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {record.status === 'present' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{record.session_title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{record.session_date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{record.check_in_time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{record.teacher}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Course: {record.course}</span>
                        {record.duration !== '-' && (
                          <>
                            <span>•</span>
                            <span>Duration: {record.duration}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>Students: {record.students_present}/{record.total_students}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                      {record.status === 'present' ? 'Present' : 'Absent'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMEAttendance;