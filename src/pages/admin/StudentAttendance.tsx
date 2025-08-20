import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentAttendance = () => {
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState("");
  const [viewType, setViewType] = useState("");

  const batches = [
    { value: "2023", label: "Batch 2023" },
    { value: "2024", label: "Batch 2024" },
    { value: "2025", label: "Batch 2025" },
  ];

  const viewTypes = [
    { value: "day", label: "Day View" },
    { value: "week", label: "Week View" },
    { value: "month", label: "Month View" },
  ];

  // Mock student data
  const students = [
    { id: 1, name: "John Smith", rollNo: "2024001" },
    { id: 2, name: "Emma Johnson", rollNo: "2024002" },
    { id: 3, name: "Michael Brown", rollNo: "2024003" },
    { id: 4, name: "Sarah Wilson", rollNo: "2024004" },
    { id: 5, name: "David Lee", rollNo: "2024005" },
  ];

  // Generate dates based on view type
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
      
      for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    }
    
    return dates;
  };

  const dates = generateDates();
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const handleAttendanceToggle = (studentId: number, date: string) => {
    const key = `${studentId}-${date}`;
    setAttendance(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
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
                    <SelectItem key={batch.value} value={batch.value}>
                      {batch.label}
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
              <span>Attendance Table - {selectedBatch}</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)} View
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-foreground">Student</th>
                    <th className="text-left p-3 font-medium text-foreground">Roll No</th>
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
                      <td className="p-3 font-medium text-foreground">{student.name}</td>
                      <td className="p-3 text-muted-foreground">{student.rollNo}</td>
                      {dates.map((date) => {
                        const dateStr = formatDate(date);
                        const key = `${student.id}-${dateStr}`;
                        const isPresent = attendance[key] || false;
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
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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