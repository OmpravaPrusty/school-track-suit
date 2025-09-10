import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth } from "date-fns";

// Helper to create a date in UTC to avoid timezone issues
const createUTCDate = (year: number, month: number, day: number): Date => {
  return new Date(Date.UTC(year, month, day));
};

// Helper to parse a 'yyyy-MM-dd' string into a UTC Date object
const parseUTCDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return createUTCDate(year, month - 1, day);
};

interface MyAttendanceProps {
  userId: string;
  userRole: 'student' | 'sme';
}

interface AttendanceRecord {
  check_in_time: string;
  status: 'present' | 'absent';
}

const MyAttendance = ({ userId, userRole }: MyAttendanceProps) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      setError(null);

      const from = startOfMonth(currentMonth);
      const to = endOfMonth(currentMonth);

      const query = supabase
        .from('attendance')
        .select('check_in_time, status')
        .eq(userRole === 'student' ? 'student_id' : 'sme_id', userId)
        .gte('check_in_time::date', format(from, 'yyyy-MM-dd'))
        .lte('check_in_time::date', format(to, 'yyyy-MM-dd'));

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Error fetching attendance:", fetchError);
        setError("Failed to load attendance data.");
      } else {
        setAttendance((data || []).map((record: any) => ({
          check_in_time: record.check_in_time?.split('T')[0] || '',
          status: record.status
        })));
      }
      setIsLoading(false);
    };

    if (userId) {
      fetchAttendance();
    }
  }, [userId, userRole, currentMonth]);

  const presentDays = attendance.filter(d => d.status === 'present').map(d => parseUTCDate(d.check_in_time));
  const absentDays = attendance.filter(d => d.status === 'absent').map(d => parseUTCDate(d.check_in_time));

  const totalDaysInMonth = getDaysInMonth(currentMonth);
  const presentCount = presentDays.length;
  const absentCount = absentDays.length;
  const attendancePercentage = (presentCount + absentCount) > 0 ? Math.round((presentCount / (presentCount + absentCount)) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && attendance.length === 0 ? (
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
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border"
                modifiers={{
                  present: presentDays,
                  absent: absentDays,
                }}
                modifiersClassNames={{
                  present: 'bg-success text-success-foreground',
                  absent: 'bg-destructive text-destructive-foreground',
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
                Summary for {format(currentMonth, "MMMM yyyy")}
              </h3>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Attendance</span>
                  <Badge className={
                    attendancePercentage >= 80 ? "bg-success hover:bg-success" :
                    attendancePercentage >= 50 ? "bg-warning hover:bg-warning" :
                    "bg-destructive hover:bg-destructive"
                  }>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${attendancePercentage}%`}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Present Days</p>
                  <p className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : presentCount}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Absent Days</p>
                  <p className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : absentCount}</p>
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
