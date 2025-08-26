import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarIcon, CheckCircle, XCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const SMEAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [smeList, setSmeList] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock data for now
    setSmeList([
      { id: 1, name: "Dr. John Smith", department: "Computer Science", employee_id: "SME001" },
      { id: 2, name: "Dr. Sarah Johnson", department: "Mathematics", employee_id: "SME002" },
    ]);
  }, []);

  const handleAttendanceToggle = (smeId: string, status: 'present' | 'absent') => {
    setAttendanceData(prev => {
      const existing = prev.find(a => a.smeId === smeId);
      if (existing) {
        return prev.map(a => a.smeId === smeId ? { ...a, status } : a);
      }
      return [...prev, { smeId, status, date: selectedDate }];
    });
  };

  const saveAttendance = async () => {
    setIsLoading(true);
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Success",
        description: "Attendance records have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save attendance records.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">SME Attendance</h1>
        <Button onClick={saveAttendance} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Attendance"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              SME Attendance for {format(new Date(selectedDate), "PPP")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SME Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {smeList.map((sme) => {
                const attendance = attendanceData.find(a => a.smeId === sme.id);
                const status = attendance?.status;
                
                return (
                  <TableRow key={sme.id}>
                    <TableCell className="font-medium">{sme.name}</TableCell>
                    <TableCell>{sme.employee_id}</TableCell>
                    <TableCell>{sme.department}</TableCell>
                    <TableCell>
                      {status ? (
                        <Badge variant={status === 'present' ? 'default' : 'destructive'}>
                          {status === 'present' ? 'Present' : 'Absent'}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Marked</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={status === 'present' ? 'default' : 'outline'}
                          onClick={() => handleAttendanceToggle(sme.id, 'present')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={status === 'absent' ? 'destructive' : 'outline'}
                          onClick={() => handleAttendanceToggle(sme.id, 'absent')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Absent
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMEAttendance;