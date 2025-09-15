import { useState, useEffect } from "react";
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
import { format, startOfWeek, endOfWeek, add } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [viewType, setViewType] = useState("");
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const viewTypes = [
    { value: "day", label: "Day View" },
    { value: "week", label: "Week View" },
    { value: "month", label: "Month View" },
  ];

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch && viewType) {
      fetchStudentsAndAttendance();
    }
  }, [selectedBatch, viewType, referenceDate]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

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
      toast({
        title: "Error",
        description: "Failed to fetch batches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    if (!selectedBatch || !viewType) return;
    setLoading(true);
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name, students!inner(student_id)')
        .eq('students.batch_id', selectedBatch);

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      const studentIds = studentsData.map(s => s.id);
      const dateRange = generateDates();
      if (dateRange.length === 0 || studentIds.length === 0) {
        setAttendance({});
        setLoading(false);
        return;
      }

      const startDate = formatDate(dateRange[0]);
      const endDate = formatDate(dateRange[dateRange.length - 1]);

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
      setIsDirty(false);

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

  const generateDates = () => {
    if (!viewType) return [];
    const baseDate = new Date(referenceDate);
    const dates = [];
    if (viewType === "day") {
      dates.push(baseDate);
    } else if (viewType === "week") {
        let firstDayOfWeek = startOfWeek(baseDate, { weekStartsOn: 1 });
        for (let i = 0; i < 7; i++) {
            dates.push(add(firstDayOfWeek, { days: i }));
        }
    } else if (viewType === "month") {
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    }
    return dates;
  };

  const dates = generateDates();

  const handleAttendanceToggle = (studentId: string, date: string) => {
    const key = `${studentId}|${date}`;
    setAttendance(prev => {
      const currentStatus = prev[key];
      const newStatus = currentStatus === 'present' ? 'absent' : 'present';
      return { ...prev, [key]: newStatus };
    });
    setIsDirty(true);
  };

  const saveAttendance = async () => {
    try {
      const attendanceChanges = Object.entries(attendance);
      if (attendanceChanges.length === 0) {
        toast({ title: "No changes to save.", variant: "default" });
        return;
      }

      const modifiedDates = [...new Set(attendanceChanges.map(([key]) => key.split('|')[1]))];
      const allStudents = students;

      const upsertPromises = [];

      for (const date of modifiedDates) {
        for (const student of allStudents) {
          const key = `${student.id}|${date}`;
          const status = attendance[key] || 'absent';

          upsertPromises.push(
            supabase.from('attendance').upsert(
              { student_id: student.id, attendance_date: date, status: status, sme_id: null },
              { onConflict: 'student_id, attendance_date' }
            )
          );
        }
      }

      const results = await Promise.all(upsertPromises);

      results.forEach(result => {
        if (result.error) throw result.error;
      });

      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
      setIsDirty(false);
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

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date > today;
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

  const handleBackNavigation = () => {
    if (isDirty) {
      setShowConfirmDialog(true);
    } else {
      navigate("/admin/attendance");
    }
  };

  return (
    <div className="space-y-6">
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/admin/attendance")}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={handleBackNavigation}
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
                <Select value={viewType} onValueChange={setViewType}>
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
            <div className="w-full overflow-x-auto rounded-md border max-h-[600px] overflow-y-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="sticky top-0 left-0 bg-card p-3 text-left font-medium text-foreground z-30 w-60">Student (Name & ID)</th>
                    {dates.map((date) => (
                      <th key={date.toISOString()} className="sticky top-0 bg-card text-center p-3 font-medium text-foreground min-w-[100px] z-10">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs">{formatDate(date)}</span>
                          {isDateInFuture(date) && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              Future
                            </Badge>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                   {students.map((student) => (
                     <tr key={student.id} className="border-b border-border/50 hover:bg-muted/30">
                       <td className="sticky left-0 bg-card p-3 font-medium text-foreground z-20">
                         <div className="flex flex-col">
                           <span>{student.full_name}</span>
                           <span className="text-xs text-muted-foreground">{student.students?.student_id || '-'}</span>
                         </div>
                       </td>
                      {dates.map((date) => {
                        const dateStr = formatDate(date);
                        const key = `${student.id}|${dateStr}`;
                        const status = attendance[key] || 'absent';
                        const isPresent = status === 'present';
                        const isFuture = isDateInFuture(date);
                        const isSunday = date.getDay() === 0;
                        
                         return (
                           <td key={dateStr} className="p-3 text-center">
                             <div className="flex flex-col items-center gap-2">
                               <Switch
                                 checked={isPresent}
                                 onCheckedChange={() => handleAttendanceToggle(student.id, dateStr)}
                                 disabled={isFuture || isSunday}
                                 className="data-[state=checked]:bg-success"
                               />
                               <span className={`text-xs ${isPresent ? 'text-success' : 'text-muted-foreground'}`}>
                                 {isFuture || isSunday ? '-' : (isPresent ? 'Present' : 'Absent')}
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