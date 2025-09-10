import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import AttendancePDF from '@/components/AttendancePDF';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';

interface Batch {
  id: string;
  name: string;
}

interface StudentProfile {
  id: string; // This is the profile UUID
  full_name: string;
  students: {
    student_id: string; // This is the human-readable ID
  };
}

interface AttendanceRecord {
  student_id: string;
  status: 'present' | 'absent';
}

interface ReportData {
  students: {
    name: string;
    id: string; // This is the human-readable student_id
    present: number;
    absent: number;
    percentage: number;
  }[];
  batchName: string;
  month: string;
  totalPresent: number;
  totalAbsent: number;
  overallPercentage: number;
}

const ReportGeneration = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchBatches = async () => {
      const { data, error } = await supabase.from("batches").select("id, name").order("name");
      if (error) {
        toast({ title: "Error fetching batches", description: error.message, variant: "destructive" });
      } else {
        setBatches(data || []);
      }
    };
    fetchBatches();
  }, []);

  // Reset report data if controls change
  useEffect(() => {
    setReportData(null);
  }, [selectedBatch, selectedMonth, selectedYear]);

  const handleGenerateReport = async () => {
    if (!selectedBatch) {
      toast({ title: "Missing Information", description: "Please select a batch.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setReportData(null);

    try {
      // 1. Fetch students in the selected batch
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name, students!inner(student_id, batch_id)')
        .eq('students.batch_id', selectedBatch);

      if (studentsError) throw studentsError;
      const students = studentsData as StudentProfile[];

      // 2. Fetch attendance for these students for the selected month
      const fromDate = startOfMonth(new Date(selectedYear, selectedMonth));
      const toDate = endOfMonth(new Date(selectedYear, selectedMonth));

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('student_id, status')
        .in('student_id', students.map(s => s.id))
        .gte('attendance_date', fromDate.toISOString())
        .lte('attendance_date', toDate.toISOString());

      if (attendanceError) throw attendanceError;
      const attendanceRecords = attendanceData as AttendanceRecord[];

      // 3. Process the data
      const totalDaysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
      let totalPresent = 0;
      let totalAbsent = 0;

      const processedStudents = students.map(student => {
        const studentAttendance = attendanceRecords.filter(rec => rec.student_id === student.id);
        const present = studentAttendance.filter(rec => rec.status === 'present').length;
        const absent = studentAttendance.filter(rec => rec.status === 'absent').length;
        // Assuming non-recorded days are absent for percentage calculation
        const totalRecordedOrAssumed = present + absent; // Or use totalDaysInMonth
        const percentage = totalRecordedOrAssumed > 0 ? Math.round((present / totalRecordedOrAssumed) * 100) : 0;

        totalPresent += present;
        totalAbsent += absent;

        return {
          id: student.students.student_id || 'N/A',
          name: student.full_name,
          present,
          absent,
          percentage,
        };
      });

      const overallTotal = totalPresent + totalAbsent;
      const overallPercentage = overallTotal > 0 ? Math.round((totalPresent / overallTotal) * 100) : 0;

      const monthName = new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
      const batchName = batches.find(b => b.id === selectedBatch)?.name || 'Unknown Batch';

      setReportData({
        students: processedStudents,
        batchName,
        month: monthName,
        totalPresent,
        totalAbsent,
        overallPercentage,
      });

      toast({ title: "Report Generated", description: "Your PDF is ready for download." });

    } catch (error: any) {
      toast({ title: "Error Generating Report", description: error.message, variant: "destructive" });
      setReportData(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Report Generation</h1>
        <p className="text-muted-foreground">Generate monthly attendance reports for batches.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Attendance Report</CardTitle>
          <CardDescription>Select a batch and a month to generate a PDF attendance report.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger><SelectValue placeholder="Select a batch" /></SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (<SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Select a month" /></SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (<SelectItem key={index} value={index.toString()}>{month}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Select a year" /></SelectTrigger>
                <SelectContent>
                  {years.map((year) => (<SelectItem key={year} value={year.toString()}>{year}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleGenerateReport} className="w-full gap-2" disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {isGenerating ? "Generating..." : "Generate PDF Report"}
          </Button>
        </CardContent>
      </Card>

      {reportData && !isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle>Your Report is Ready</CardTitle>
            <CardDescription>Preview the generated report or download it as a PDF.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Eye className="h-4 w-4" />
                  Preview Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Report Preview</DialogTitle>
                </DialogHeader>
                <div className="h-full">
                  <PDFViewer width="100%" height="100%" className="rounded-md">
                    <AttendancePDF data={reportData} />
                  </PDFViewer>
                </div>
              </DialogContent>
            </Dialog>

            <PDFDownloadLink
              document={<AttendancePDF data={reportData} />}
              fileName={`${reportData.batchName}_${reportData.month}_Attendance.pdf`}
              className="w-full"
            >
              {({ loading }) => (
                <Button className="w-full gap-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {loading ? 'Preparing...' : 'Download PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportGeneration;