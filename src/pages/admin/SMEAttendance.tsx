import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar, GraduationCap, Clock, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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

interface SME {
  id: string;
  name: string;
  department: string;
  employee_id: string;
}

const SMEAttendance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewType, setViewType] = useState("day");
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [smeList, setSmeList] = useState<SME[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const fetchSMEsAndAttendance = async () => {
    if (dates.length === 0) return;
    setIsLoading(true);
    try {
      const { data: smeData, error: smeError } = await supabase
        .from('smes')
        .select('id, employee_id, bio, profiles(full_name)');

      if (smeError) throw smeError;

      const formattedSMEs = smeData.map((sme: any) => ({
        id: sme.id,
        name: sme.profiles?.full_name || 'N/A',
        department: sme.bio || 'N/A',
        employee_id: sme.employee_id || 'N/A',
      }));
      setSmeList(formattedSMEs);

      const smeIds = formattedSMEs.map(s => s.id);
      if (smeIds.length === 0) {
        setAttendance({});
        setIsLoading(false);
        return;
      }

      const startDate = formatDateAsUTC(dates[0]);
      const endDate = formatDateAsUTC(dates[dates.length - 1]);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('sme_id, check_in_time, status')
        .in('sme_id', smeIds)
        .gte('check_in_time::date', startDate)
        .lte('check_in_time::date', endDate);

      if (attendanceError) throw attendanceError;

      const newAttendance: Record<string, 'present' | 'absent'> = {};
      attendanceData.forEach((record: any) => {
        if (record.sme_id && record.check_in_time) {
          const dateStr = record.check_in_time.split('T')[0];
          const key = `${record.sme_id}|${dateStr}`;
          newAttendance[key] = record.status as 'present' | 'absent';
        }
      });
      setAttendance(newAttendance);

    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch SME data or attendance.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSMEsAndAttendance();
  }, [dates]);

  const handleAttendanceToggle = (smeId: string, date: Date) => {
    const dateStr = formatDateAsUTC(date);
    const key = `${smeId}|${dateStr}`;
    setAttendance(prev => {
      const currentStatus = prev[key];
      const newStatus = currentStatus === 'present' ? 'absent' : 'present';
      return { ...prev, [key]: newStatus };
    });
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      const attendanceChanges = Object.entries(attendance);
      if (attendanceChanges.length === 0) {
        toast({ title: "No changes to save.", variant: "default" });
        return;
      }

      const upsertData = attendanceChanges.map(([key, status]) => {
        const [sme_id, dateStr] = key.split('|');
        return { sme_id, check_in_time: `${dateStr}T09:00:00Z`, status, student_id: null };
      });

      const { error } = await supabase.from('attendance').upsert(upsertData, {
        onConflict: 'sme_id, check_in_time',
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance records have been saved successfully.",
      });
      fetchSMEsAndAttendance();
    } catch (error: any) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Save Failed",
        description: error.message || "An unexpected error occurred while saving.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">SME Attendance</h1>
            <p className="text-muted-foreground">Track Subject Matter Expert attendance</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
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

      {viewType && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>SME Attendance Table</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)} View
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : smeList.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No SMEs found.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border shadow-sm bg-gradient-to-br from-card to-card/50">
                <table className="border-collapse w-max">
                  <thead>
                    <tr className="border-b border-border/60 bg-gradient-to-r from-muted/50 to-muted/30">
                      <th className="sticky left-0 bg-gradient-to-r from-card to-card/90 backdrop-blur-sm p-4 text-left font-semibold text-foreground z-20 w-48 shadow-[2px_0_8px_-2px_hsl(var(--border))] border-r border-border/30">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                          SME Name
                        </div>
                      </th>
                      <th className="sticky bg-gradient-to-r from-card to-card/90 backdrop-blur-sm p-4 text-left font-semibold text-foreground z-10 w-40 shadow-[2px_0_8px_-2px_hsl(var(--border))] border-r border-border/30" style={{ left: '12rem' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                          Department
                        </div>
                      </th>
                      <th className="sticky bg-gradient-to-r from-card to-card/90 backdrop-blur-sm p-4 text-left font-semibold text-foreground z-10 w-32 shadow-[2px_0_8px_-2px_hsl(var(--border))] border-r border-border/30" style={{ left: '22rem' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                          Employee ID
                        </div>
                      </th>
                      {dates.map((date) => {
                        const dayOfWeek = date.getUTCDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        const isToday = formatDateAsUTC(date) === formatDateAsUTC(new Date());
                        return (
                          <th key={date.toISOString()} className={`text-center p-4 font-medium text-foreground min-w-[90px] transition-all duration-300 ${
                            isWeekend && viewType === 'month' 
                              ? 'bg-gradient-to-b from-accent/10 to-accent/5 border-l border-accent/20' 
                              : 'hover:bg-muted/20'
                          } ${isToday ? 'bg-gradient-to-b from-primary/10 to-primary/5 border-l-2 border-primary/40' : ''}`}>
                            <div className="flex flex-col items-center gap-1">
                              {viewType === 'month' ? (
                                <>
                                  <span className={`text-xs font-bold tracking-wide ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {format(date, 'E')}
                                  </span>
                                  <span className={`text-xl font-bold ${isToday ? 'text-primary scale-110' : 'text-foreground'} transition-all duration-200`}>
                                    {date.getUTCDate()}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs font-medium">{formatDateAsUTC(date)}</span>
                              )}
                              {isDateInFuture(date) && (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground border-0">
                                  Future
                                </Badge>
                              )}
                              {isToday && (
                                <div className="w-2 h-0.5 bg-primary rounded-full mt-0.5"></div>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {smeList.map((sme, index) => (
                      <tr key={sme.id} className="border-b border-border/30 hover:bg-gradient-to-r hover:from-muted/20 hover:to-muted/10 transition-all duration-300 group">
                        <td className="sticky left-0 bg-gradient-to-r from-card to-card/90 backdrop-blur-sm p-4 font-semibold text-foreground shadow-[2px_0_8px_-2px_hsl(var(--border))] border-r border-border/30 group-hover:shadow-[2px_0_12px_-2px_hsl(var(--border))] transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${index % 2 === 0 ? 'bg-primary/60' : 'bg-secondary/60'}`}></div>
                            {sme.name}
                          </div>
                        </td>
                        <td className="sticky bg-gradient-to-r from-card to-card/90 backdrop-blur-sm p-4 text-muted-foreground font-medium shadow-[2px_0_8px_-2px_hsl(var(--border))] border-r border-border/30 group-hover:shadow-[2px_0_12px_-2px_hsl(var(--border))] transition-all duration-300" style={{ left: '12rem' }}>
                          {sme.department}
                        </td>
                        <td className="sticky bg-gradient-to-r from-card to-card/90 backdrop-blur-sm p-4 text-muted-foreground font-medium shadow-[2px_0_8px_-2px_hsl(var(--border))] border-r border-border/30 group-hover:shadow-[2px_0_12px_-2px_hsl(var(--border))] transition-all duration-300" style={{ left: '22rem' }}>
                          <span className="font-mono text-sm">{sme.employee_id}</span>
                        </td>
                        {dates.map((date) => {
                          const dateStr = formatDateAsUTC(date);
                          const key = `${sme.id}|${dateStr}`;
                          const status = attendance[key] || 'absent';
                          const isPresent = status === 'present';
                          const future = isDateInFuture(date);
                          const dayOfWeek = date.getUTCDay();
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                          const isToday = formatDateAsUTC(date) === formatDateAsUTC(new Date());

                          return (
                            <td key={key} className={`p-4 text-center transition-all duration-300 ${
                              isWeekend && viewType === 'month' 
                                ? 'bg-gradient-to-b from-accent/5 to-accent/2' 
                                : 'hover:bg-muted/10'
                            } ${isToday ? 'bg-gradient-to-b from-primary/5 to-primary/2' : ''}`}>
                              <div className="flex flex-col items-center gap-2">
                                <Switch
                                  checked={isPresent}
                                  onCheckedChange={() => handleAttendanceToggle(sme.id, date)}
                                  disabled={future}
                                  className={`transition-all duration-300 ${
                                    isPresent 
                                      ? 'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-green-600 shadow-sm' 
                                      : 'hover:scale-105'
                                  }`}
                                />
                                <span className={`text-xs font-medium transition-all duration-200 ${
                                  future 
                                    ? 'text-muted-foreground/60' 
                                    : isPresent 
                                      ? 'text-green-600 font-semibold' 
                                      : 'text-red-500'
                                }`}>
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
            )}
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveAttendance}
                disabled={isSaving || isLoading || smeList.length === 0}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Clock className="h-4 w-4 mr-2" />}
                {isSaving ? 'Saving...' : 'Save Attendance'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SMEAttendance;