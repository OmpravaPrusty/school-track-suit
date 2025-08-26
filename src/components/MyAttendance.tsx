import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface MyAttendanceProps {
  userId: string;
  userRole: 'student' | 'sme';
}

interface AttendanceRecord {
  attendance_date: string;
  status: 'present' | 'absent';
}

const MyAttendance = ({ userId, userRole }: MyAttendanceProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      setError(null);

      const from = startOfMonth(date);
      const to = endOfMonth(date);

      const query = supabase
        .from('attendance')
        .select('attendance_date, status')
        .eq(userRole === 'student' ? 'student_id' : 'sme_id', userId)
        .gte('attendance_date', format(from, 'yyyy-MM-dd'))
        .lte('attendance_date', format(to, 'yyyy-MM-dd'));

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Error fetching attendance:", fetchError);
        setError("Failed to load attendance data.");
      } else {
        setAttendance(data as AttendanceRecord[] || []);
      }
      setIsLoading(false);
    };

    if (userId) {
      fetchAttendance();
    }
  }, [userId, userRole, date]);

  const presentDays = attendance.filter(d => d.status === 'present').map(d => new Date(d.attendance_date + 'T00:00:00'));
  const absentDays = attendance.filter(d => d.status === 'absent').map(d => new Date(d.attendance_date + 'T00:00:00'));

  const monthDays = eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date)
  });

  const totalDays = monthDays.length;
  const presentCount = presentDays.length;
  const absentCount = absentDays.length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentCount / (presentCount + absentCount)) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-destructive text-center">{error}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                onMonthChange={setDate}
                className="rounded-md border"
                modifiers={{
                  present: presentDays,
                  absent: absentDays,
                }}
                modifiersStyles={{
                  present: {
                    color: 'hsl(var(--success-foreground))',
                    backgroundColor: 'hsl(var(--success))',
                  },
                  absent: {
                    color: 'hsl(var(--destructive-foreground))',
                    backgroundColor: 'hsl(var(--destructive))',
                  },
                }}
              />
               <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-success" />
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-destructive" />
                  <span>Absent</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Summary for {format(date, "MMMM yyyy")}
              </h3>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Attendance</span>
                  <Badge className={
                    attendancePercentage >= 80 ? "bg-success hover:bg-success" :
                    attendancePercentage >= 50 ? "bg-warning hover:bg-warning" :
                    "bg-destructive hover:bg-destructive"
                  }>
                    {attendancePercentage}%
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Present Days</p>
                  <p className="text-2xl font-bold">{presentCount}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Absent Days</p>
                  <p className="text-2xl font-bold">{absentCount}</p>
                </Card>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyAttendance;
