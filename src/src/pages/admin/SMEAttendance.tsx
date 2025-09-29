import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  GraduationCap,
  Clock,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ThreeStateToggle from "@/components/ui/ThreeStateToggle";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  add,
  sub,
} from "date-fns";
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

interface SME {
  id: string;
  name: string;
  department: string;
  employee_id: string;
  status: "active" | "inactive" | "suspended";
}

const SMEAttendance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewType, setViewType] = useState("day");
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [smeList, setSmeList] = useState<SME[]>([]);
  const [dates, setDates] = useState<Date[]>([]);
  const [attendance, setAttendance] = useState<
    Record<string, "present" | "absent" | "not_applicable" | null>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const viewTypes = [
    { value: "day", label: "Day View" },
    { value: "week", label: "Week View" },
    { value: "month", label: "Month View" },
  ];

  const formatDateForSupabase = (date: Date) => {
    // return date.toISOString().split('T')[0];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateRange = (date: Date, viewType: string) => {
    if (viewType === "day") {
      return format(date, "MMMM d, yyyy");
    }
    if (viewType === "week") {
      const start = startOfWeek(date);
      const end = endOfWeek(date);
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
    if (viewType === "month") {
      return format(date, "MMMM yyyy");
    }
    return "";
  };

  const handleDateNavigation = (direction: "prev" | "next") => {
    const amount = direction === "prev" ? -1 : 1;
    if (viewType === "day") {
      setReferenceDate(add(referenceDate, { days: amount }));
    } else if (viewType === "week") {
      setReferenceDate(add(referenceDate, { weeks: amount }));
    } else if (viewType === "month") {
      setReferenceDate(add(referenceDate, { months: amount }));
    }
  };

  const generateDates = useCallback(() => {
    if (!viewType) return [];

    const baseDate = new Date(referenceDate);
    const newDates = [];

    if (viewType === "day") {
      newDates.push(baseDate);
    } else if (viewType === "week") {
      const firstDayOfWeek = startOfWeek(baseDate, { weekStartsOn: 1 });
      for (let i = 0; i < 7; i++) {
        newDates.push(add(firstDayOfWeek, { days: i }));
      }
    } else if (viewType === "month") {
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();
      const numDays = new Date(year, month + 1, 0).getDate();

      for (let i = 1; i <= numDays; i++) {
        newDates.push(new Date(year, month, i));
      }
    }

    return newDates;
  }, [viewType, referenceDate]);

  useEffect(() => {
    const fetchSMEs = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("smes")
        .select(
          `
          id,
          employee_id,
          department,
          profile:profiles!inner (
            full_name,
            status
          )
        `
        )
        .eq("profile.status", "active");

      if (error) {
        console.error("Error fetching SMEs:", error);
        toast({
          title: "Error",
          description: "Failed to fetch SME list.",
          variant: "destructive",
        });
      } else {
        const formattedSMEs = data.map((sme) => ({
          id: sme.id,
          name: sme.profile?.full_name || "N/A",
          department: sme.department,
          employee_id: sme.employee_id,
          status: sme.profile?.status,
        }));
        setSmeList(formattedSMEs);
      }
      setIsLoading(false);
    };

    fetchSMEs();
  }, [toast]);

  const fetchAttendance = useCallback(
    async (smeIds: string[], dateRange: Date[]) => {
      if (smeIds.length === 0 || dateRange.length === 0) return;

      const startDate = formatDateForSupabase(dateRange[0]);
      const endDate = formatDateForSupabase(dateRange[dateRange.length - 1]);

      const { data, error } = await supabase
        .from("sme_attendance")
        .select("sme_id, attendance_date, status")
        .in("sme_id", smeIds)
        .gte("attendance_date", startDate)
        .lte("attendance_date", endDate);

      if (error) {
        console.error("Error fetching attendance:", error);
        toast({
          title: "Error",
          description: "Failed to fetch attendance records.",
          variant: "destructive",
        });
        return;
      }

      const newAttendance: Record<
        string,
        "present" | "absent" | "not_applicable" | null
      > = {};
      data.forEach((record) => {
        if (record.sme_id) {
          const key = `${record.sme_id}|${record.attendance_date}`;
          newAttendance[key] = record.status as
            | "present"
            | "absent"
            | "not_applicable"
            | null;
        }
      });
      setAttendance(newAttendance);
      setIsDirty(false);
    },
    [toast]
  );

  useEffect(() => {
    const newDates = generateDates();
    setDates(newDates);

    if (smeList.length > 0 && newDates.length > 0) {
      fetchAttendance(
        smeList.map((s) => s.id),
        newDates
      );
    }
  }, [viewType, smeList, referenceDate, generateDates, fetchAttendance]);

  const handleAttendanceToggle = (
    smeId: string,
    date: Date,
    value: "present" | "absent" | "not_applicable"
  ) => {
    const dateStr = formatDateForSupabase(date);
    const key = `${smeId}|${dateStr}`;
    setAttendance((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    const attendanceChanges = Object.entries(attendance).filter(
      ([key, value]) => value !== null
    );

    if (attendanceChanges.length === 0) {
      toast({ title: "No changes to save.", variant: "default" });
      setIsSaving(false);
      return;
    }

    const upsertPromises = [];

    // Only create upsert operations for entries that have actual values
    for (const [key, status] of attendanceChanges) {
      const [smeId, date] = key.split("|");

      upsertPromises.push(
        supabase.from("sme_attendance").upsert(
          {
            sme_id: smeId,
            attendance_date: date,
            status: status,
          },
          {
            onConflict: "sme_id,attendance_date",
          }
        )
      );
    }

    try {
      const results = await Promise.all(upsertPromises);
      results.forEach((result) => {
        if (result.error) throw result.error;
      });
      toast({
        title: "Success",
        description: "Attendance records have been saved successfully.",
      });
      setIsDirty(false);
      // After saving, refetch the attendance to get the fresh state
      fetchAttendance(
        smeList.map((s) => s.id),
        dates
      );
    } catch (error: any) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Save Failed",
        description:
          error.message || "An unexpected error occurred while saving.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isDateInFuture = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const comparisonDate = new Date(date);
    comparisonDate.setHours(0, 0, 0, 0);
    return comparisonDate > today;
  };

  const handleBackNavigation = () => {
    if (isDirty) {
      setShowConfirmDialog(true);
    } else {
      navigate("/admin/attendance");
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

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
            <AlertDialogAction onClick={() => navigate("/admin/attendance")}>
              Leave
            </AlertDialogAction>
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
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              SME Attendance
            </h1>
            <p className="text-muted-foreground">
              Track Subject Matter Expert attendance
            </p>
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
              <Label className="text-sm font-medium mb-2 block">
                View Type
              </Label>
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
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDateNavigation("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-center w-48">
                {formatDateRange(referenceDate, viewType)}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDateNavigation("next")}
              >
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
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)} View
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end text-sm text-muted-foreground mb-2 space-x-4">
              <span>
                <span className="font-bold text-green-600">P:</span> Present
              </span>
              <span>
                <span className="font-bold text-red-600">A:</span> Absent
              </span>
              <span>
                <span className="font-bold text-gray-500">NM:</span> Not Marked
                / Holiday
              </span>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : smeList.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">
                No SMEs found. Please add SMEs first.
              </p>
            ) : (
              <div className="w-full overflow-x-auto rounded-md border max-h-[600px] overflow-y-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="sticky top-0 left-0 bg-card p-3 text-left font-medium text-foreground z-30 w-48">
                        SME Name
                      </th>
                      <th className="sticky top-0 bg-card p-3 text-left font-medium text-foreground z-10">
                        Department
                      </th>
                      <th className="sticky top-0 bg-card p-3 text-left font-medium text-foreground z-10">
                        Employee ID
                      </th>
                      {dates.map((date) => (
                        <th
                          key={date.toISOString()}
                          className="sticky top-0 bg-card text-center p-3 font-medium text-foreground min-w-[100px] z-10"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold">
                              {date.toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                            </span>
                            <span className="text-sm">
                              {formatDateForDisplay(date)}
                            </span>
                            {isDateInFuture(date) && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-1 py-0"
                              >
                                Future
                              </Badge>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {smeList.map((sme) => (
                      <tr
                        key={sme.id}
                        className="border-b border-border/50 hover:bg-muted/30"
                      >
                        <td className="sticky left-0 bg-card p-3 font-medium text-foreground z-20">
                          {sme.name}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {sme.department}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {sme.employee_id}
                        </td>
                        {dates.map((date) => {
                          const dateStr = formatDateForSupabase(date);
                          const key = `${sme.id}|${dateStr}`;
                          const status =
                            attendance[key] === undefined
                              ? "not_applicable"
                              : attendance[key] || "not_applicable";
                          const isFuture = isDateInFuture(date);
                          const isSunday = date.getDay() === 0;
                          const isInactive = sme.status === "inactive";

                          return (
                            <td key={key} className="p-3 text-center">
                              <ThreeStateToggle
                                value={status}
                                onChange={(value) =>
                                  handleAttendanceToggle(sme.id, date, value)
                                }
                                disabled={isFuture || isSunday || isInactive}
                              />
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
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4 mr-2" />
                )}
                {isSaving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SMEAttendance;
