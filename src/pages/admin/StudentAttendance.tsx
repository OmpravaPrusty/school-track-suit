import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar, Users, Clock, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, add, getDaysInMonth, startOfWeek, endOfWeek } from "date-fns";

// Helper to create a date in UTC to avoid timezone issues
const createUTCDate = (year: number, month: number, day: number): Date => {
  return new Date(Date.UTC(year, month, day));
};

// Helper to format a date as 'yyyy-MM-dd' in UTC
const formatDateAsUTC = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface Student {
  id: string;
  full_name: string;
  students: {
    student_id: string;
  };
}

interface Batch {
  id: string;
  name: string;
}

const StudentAttendance = () => {
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState("");
  const [viewType, setViewType] = useState("day");
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});

  const viewTypes = [
    { value: "day", label: "Day View" },
    { value: "week", label: "Week View" },
    { value: "month", label: "Month View" },
  ];

  const dates = useMemo(() => {
    if (!viewType) return [];

    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();
    const day = referenceDate.getDate();

    const baseDate = createUTCDate(year, month, day);
    const newDates = [];

    if (viewType === "day") {
      newDates.push(baseDate);
    } else if (viewType === "week") {
      const dayOfWeek = baseDate.getUTCDay(); // 0 = Sunday
      const weekStart = createUTCDate(year, month, day - dayOfWeek);
      for (let i = 0; i < 7; i++) {
        const dateInWeek = createUTCDate(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate() + i);
        newDates.push(dateInWeek);
      }
    } else if (viewType === "month") {
      const daysInMonth = getDaysInMonth(baseDate);
      for (let i = 1; i <= daysInMonth; i++) {
        newDates.push(createUTCDate(year, month, i));
      }
    }
    return newDates;
  }, [viewType, referenceDate]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchStudentsAndAttendance = async () => {
    if (!selectedBatch || !viewType || dates.length === 0) return;
    setLoading(true);
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name, students!inner(student_id)')
        .eq('students.batch_id', selectedBatch);

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      const studentIds = (studentsData || []).map(s => s.id);
      if (studentIds.length === 0) {
        setAttendance({});
        setLoading(false);
        return;
      }

      const startDate = formatDateAsUTC(dates[0]);
      const endDate = formatDateAsUTC(dates[dates.length - 1]);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('student_id, status, attendance_date')
        .in('student_id', studentIds)
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate);

      if (attendanceError) throw attendanceError;

      const newAttendanceState: Record<string, 'present' | 'absent'> = {};
      attendanceData.forEach(record => {
        const key = `${record.student_id}|${record.attendance_date}`;
        newAttendanceState[key] = record.status as 'present' | 'absent';
      });
      setAttendance(newAttendanceState);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students or attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatch && viewType) {
      fetchStudentsAndAttendance();
    }
  }, [selectedBatch, viewType, dates]);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceToggle = (studentId: string, date: Date) => {
    const dateStr = formatDateAsUTC(date);
    const key = `${studentId}|${dateStr}`;
    setAttendance(prev => {
      const currentStatus = prev[key];
      const newStatus = currentStatus === 'present' ? 'absent' : 'present';
      return { ...prev, [key]: newStatus };
    });
  };

  const saveAttendance = async () => {
    try {
      const attendanceChanges = Object.entries(attendance);
      if (attendanceChanges.length === 0) {
        toast({ title: "No changes to save.", variant: "default" });
        return;
      }

      const upsertData = attendanceChanges.map(([key, status]) => {
        const [student_id, attendance_date] = key.split('|');
        return { student_id, attendance_date, status, sme_id: null };
      });

      const { error } = await supabase.from('attendance').upsert(upsertData, {
        onConflict: 'student_id, attendance_date',
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
      fetchStudentsAndAttendance();
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save attendance",
        variant: "destructive",
      });
    }
  };

  const formatDateRange = (date: Date, viewType: string) => {
    if (viewType === 'day') {
      return format(date, 'MMMM d, yyyy');
    }
    if (viewType === 'week') {
      const start = startOfWeek(date);
      const end = endOfWeek(date);
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    if (viewType === 'month') {
      return format(date, 'MMMM yyyy');
    }
    return '';
  };

  const isDateInFuture = (date: Date) => {
    const today = new Date();
    const todayUTC = createUTCDate(today.getFullYear(), today.getMonth(), today.getDate());
    return date.getTime() > todayUTC.getTime();
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const amount = direction === 'prev' ? -1 : 1;
    if (viewType === 'day') {
      setReferenceDate(add(referenceDate, { days: amount }));
    } else if (viewType === 'week') {
      setReferenceDate(add(referenceDate, { weeks: amount }));
    } else if (viewType === 'month') {
      setReferenceDate(add(referenceDate, { months: amount }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate("/admin/attendance")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Attendance
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Attendance</h1>
            <p className="text-muted-foreground">Track and manage student attendance records</p>
          </div>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-1">
                <Label className="text-sm font-medium mb-2 block">Select Batch</Label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            
              <div className="md:col-span-1">
                <Label className="text-sm font-medium mb-2 block">View Type</Label>
                <Select value={viewType} onValueChange={(value) => setViewType(value || "day")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose view type" />
                  </SelectTrigger>
                  <SelectContent>
                    {viewTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-center md:justify-end gap-2">
                <Button variant="outline" size="icon" onClick={() => handleDateNavigation('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-center w-48">
                  {formatDateRange(referenceDate, viewType)}
                </span>
                <Button variant="outline" size="icon" onClick={() => handleDateNavigation('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
          </div>
        </CardContent>
      </Card>

      {selectedBatch && viewType && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Attendance Table - {batches.find(b => b.id === selectedBatch)?.name}</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)} View
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <table className="border-collapse w-max">
                <thead>
                  <tr className="border-b border-border">
                    <th className="sticky left-0 bg-card p-3 text-left font-medium text-foreground z-10 w-48">Student</th>
                    <th className="sticky bg-card p-3 text-left font-medium text-foreground z-10 w-32" style={{ left: '12rem' }}>Student ID</th>
                    {dates.map((date) => {
                      const dayOfWeek = date.getUTCDay();
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                      return (
                        <th key={date.toISOString()} className={`text-center p-3 font-medium text-foreground min-w-[80px] ${isWeekend && viewType === 'month' ? 'bg-muted/20' : ''}`}>
                          <div className="flex flex-col items-center gap-1">
                            {viewType === 'month' ? (
                              <>
                                <span className="text-xs font-semibold">{format(date, 'E')}</span>
                                <span className="text-lg font-bold">{date.getUTCDate()}</span>
                              </>
                            ) : (
                              <span className="text-xs">{formatDateAsUTC(date)}</span>
                            )}
                            {isDateInFuture(date) && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                Future
                              </Badge>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                   {students.map((student) => (
                     <tr key={student.id} className="border-b border-border/50 hover:bg-muted/30">
                       <td className="sticky left-0 bg-card p-3 font-medium text-foreground">{student.full_name}</td>
                       <td className="sticky bg-card p-3 text-muted-foreground" style={{ left: '12rem' }}>{student.students?.student_id || '-'}</td>
                      {dates.map((date) => {
                        const dateStr = formatDateAsUTC(date);
                        const key = `${student.id}|${dateStr}`;
                        const status = attendance[key] || 'absent';
                        const isPresent = status === 'present';
                        const future = isDateInFuture(date);
                        const dayOfWeek = date.getUTCDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        
                         return (
                           <td key={dateStr} className={`p-3 text-center ${isWeekend && viewType === 'month' ? 'bg-muted/20' : ''}`}>
                             <div className="flex flex-col items-center gap-2">
                               <Switch
                                 checked={isPresent}
                                 onCheckedChange={() => handleAttendanceToggle(student.id, date)}
                                 disabled={future}
                                 className="data-[state=checked]:bg-success"
                               />
                               <span className={`text-xs ${future ? 'text-muted-foreground' : (isPresent ? 'text-success' : 'text-muted-foreground')}`}>
                                 {future ? '-' : (isPresent ? 'Present' : 'Absent')}
                               </span>
                             </div>
                           </td>
                         );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={saveAttendance}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Clock className="h-4 w-4 mr-2" />
                Save Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentAttendance;