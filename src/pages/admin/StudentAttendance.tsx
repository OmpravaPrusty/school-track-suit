import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});

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
  }, [selectedBatch, viewType]);

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
    const today = new Date();
    const dates = [];
    if (viewType === "day") {
      dates.push(today);
    } else if (viewType === "week") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date);
      }
    } else if (viewType === "month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
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
  };

  const saveAttendance = async () => {
    try {
      const attendanceChanges = Object.entries(attendance);
      if (attendanceChanges.length === 0) {
        toast({ title: "No changes to save.", variant: "default" });
        return;
      }

      const promises = attendanceChanges.map(async ([key, status]) => {
        const [student_id, attendance_date] = key.split('|');

        const { data: existing } = await supabase
          .from('attendance')
          .select('id')
          .eq('student_id', student_id)
          .eq('attendance_date', attendance_date)
          .maybeSingle();

        if (existing) {
          await supabase.from('attendance').update({ status }).eq('id', existing.id).throwOnError();
        } else {
          await supabase.from('attendance').insert({ student_id, attendance_date, status, sme_id: null }).throwOnError();
        }
      });

      await Promise.all(promises);

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

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateInFuture = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date > today;
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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select Batch</label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose batch" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">View Type</label>
              <Select value={viewType} onValueChange={setViewType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose view type" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {viewTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-foreground">Student</th>
                    <th className="text-left p-3 font-medium text-foreground">Student ID</th>
                    {dates.map((date) => (
                      <th key={date.toISOString()} className="text-center p-3 font-medium text-foreground">
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
                       <td className="p-3 font-medium text-foreground">{student.full_name}</td>
                       <td className="p-3 text-muted-foreground">{student.students?.student_id || '-'}</td>
                      {dates.map((date) => {
                        const dateStr = formatDate(date);
                        const key = `${student.id}|${dateStr}`;
                        const status = attendance[key] || 'absent';
                        const isPresent = status === 'present';
                        const isFuture = isDateInFuture(date);
                        
                         return (
                           <td key={dateStr} className="p-3 text-center">
                             <div className="flex flex-col items-center gap-2">
                               <Switch
                                 checked={isPresent}
                                 onCheckedChange={() => handleAttendanceToggle(student.id, dateStr)}
                                 disabled={isFuture}
                                 className="data-[state=checked]:bg-success"
                               />
                               <span className={`text-xs ${isPresent ? 'text-success' : 'text-muted-foreground'}`}>
                                 {isFuture ? '-' : (isPresent ? 'Present' : 'Absent')}
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