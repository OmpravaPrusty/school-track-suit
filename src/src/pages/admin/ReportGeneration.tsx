import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2, Eye, BarChart2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import AttendancePDF from "@/components/AttendancePDF";
import SmeAttendancePDF from "@/components/SmeAttendancePDF";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { startOfMonth, endOfMonth, getDaysInMonth, format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import StudentAttendanceGrid from "@/components/StudentAttendanceGrid";
import SmeAttendanceGrid from "@/components/SmeAttendanceGrid";

interface Batch {
  id: string;
  name: string;
}

interface StudentProfile {
  id: string;
  full_name: string;
  students: {
    student_id: string;
  };
}

interface SmeProfile {
  id: string;
  employee_id: string;
  profile: {
    full_name: string;
  };
}

interface AttendanceRecord {
  student_id: string;
  sme_id: string;
  status: "present" | "absent";
  attendance_date: string;
}

interface ReportData {
  students: {
    id: string;
    studentId: string;
    name: string;
    present: number;
    absent: number;
    percentage: number;
  }[];
  attendanceRecords: {
    student_id: string;
    status: "present" | "absent";
    attendance_date: string;
  }[];
  batchName: string;
  month: string;
  totalSessions: number;
  overallPercentage: number;
}

interface SmeReportData {
  smes: {
    id: string;
    employeeId: string;
    name: string;
    present: number;
    absent: number;
    percentage: number;
  }[];
  attendanceRecords: {
    sme_id: string;
    status: "present" | "absent";
    attendance_date: string;
  }[];
  month: string;
  totalSessions: number;
  overallPercentage: number;
}

const ReportGeneration = () => {
  const [reportType, setReportType] = useState<string>("student");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [smeReportData, setSmeReportData] = useState<SmeReportData | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchBatches = async () => {
      const { data, error } = await supabase
        .from("batches")
        .select("id, name")
        .order("name");
      if (error) {
        toast({
          title: "Error fetching batches",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setBatches(data || []);
      }
    };
    fetchBatches();
  }, []);

  // Reset report data if controls change
  useEffect(() => {
    setReportData(null);
    setSmeReportData(null);
  }, [reportType, selectedBatch, selectedMonth, selectedYear]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReportData(null);
    setSmeReportData(null);

    try {
      const fromDate = startOfMonth(new Date(selectedYear, selectedMonth));
      const toDate = endOfMonth(new Date(selectedYear, selectedMonth));
      const monthName = new Date(selectedYear, selectedMonth).toLocaleString(
        "default",
        { month: "long", year: "numeric" }
      );

      if (reportType === "student") {
        if (!selectedBatch) {
          toast({
            title: "Missing Information",
            description: "Please select a batch.",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }

        const { data: studentsData, error: studentsError } = await supabase
          .from("profiles")
          .select("id, full_name, students!inner(student_id, batch_id)")
          .eq("students.batch_id", selectedBatch);

        if (studentsError) throw studentsError;
        const students = studentsData as StudentProfile[];

        const { data: attendanceData, error: attendanceError } = await supabase
          .from("student_attendance")
          .select("student_id, status, attendance_date")
          .in(
            "student_id",
            students.map((s) => s.id)
          )
          .gte("attendance_date", fromDate.toISOString())
          .lte("attendance_date", toDate.toISOString());
        if (attendanceError) throw attendanceError;
        const attendanceRecords = attendanceData as any[];

        const sessionDays = new Set<string>();
        attendanceRecords.forEach((record) => {
          if (record.status === "present") {
            const date = new Date(record.attendance_date);
            if (date.getDay() !== 0) {
              sessionDays.add(record.attendance_date.split("T")[0]);
            }
          }
        });
        const totalSessions = sessionDays.size;

        let totalPresent = 0;
        let totalAbsent = 0;
        const processedStudents = students.map((student) => {
          const studentAttendance = attendanceRecords.filter(
            (rec) => rec.student_id === student.id
          );
          const present = studentAttendance.filter(
            (rec) => rec.status === "present"
          ).length;
          const absent = studentAttendance.filter(
            (rec) => rec.status === "absent"
          ).length;
          const totalForStudent = present + absent;
          const percentage =
            totalForStudent > 0
              ? Math.round((present / totalForStudent) * 100)
              : 0;
          totalPresent += present;
          totalAbsent += absent;
          return {
            id: student.id,
            studentId: student.students.student_id || "N/A",
            name: student.full_name,
            present,
            absent,
            percentage,
          };
        });
        const overallTotal = totalPresent + totalAbsent;
        const overallPercentage =
          overallTotal > 0
            ? Math.round((totalPresent / overallTotal) * 100)
            : 0;
        const batchName =
          batches.find((b) => b.id === selectedBatch)?.name || "Unknown Batch";
        setReportData({
          students: processedStudents,
          attendanceRecords,
          batchName,
          month: monthName,
          totalSessions,
          overallPercentage,
        });
      } else if (reportType === "sme") {
        const { data: smesData, error: smesError } = await supabase
          .from("smes")
          .select("id, employee_id, profile:profiles(full_name)");
        if (smesError) throw smesError;
        const smes = smesData as SmeProfile[];

        const { data: attendanceData, error: attendanceError } = await supabase
          .from("sme_attendance")
          .select("sme_id, status, attendance_date")
          .in(
            "sme_id",
            smes.map((s) => s.id)
          )
          .gte("attendance_date", fromDate.toISOString())
          .lte("attendance_date", toDate.toISOString());
        if (attendanceError) throw attendanceError;
        const attendanceRecords = attendanceData as any[];

        const sessionDays = new Set<string>();
        attendanceData.forEach((record) => {
          if (record.status === "present") {
            const date = new Date(record.attendance_date);
            if (date.getDay() !== 0) {
              sessionDays.add(record.attendance_date.split("T")[0]);
            }
          }
        });
        const totalSessions = sessionDays.size;

        let totalPresent = 0;
        let totalAbsent = 0;
        const processedSMEs = smes.map((sme) => {
          const smeAttendance = attendanceData.filter(
            (rec) => rec.sme_id === sme.id
          );
          const present = smeAttendance.filter(
            (rec) => rec.status === "present"
          ).length;
          const absent = smeAttendance.filter(
            (rec) => rec.status === "absent"
          ).length;
          const totalForSME = present + absent;
          const percentage =
            totalForSME > 0 ? Math.round((present / totalForSME) * 100) : 0;
          totalPresent += present;
          totalAbsent += absent;
          return {
            id: sme.id,
            employeeId: sme.employee_id || "N/A",
            name: sme.profile.full_name,
            present,
            absent,
            percentage,
          };
        });
        const overallTotal = totalPresent + totalAbsent;
        const overallPercentage =
          overallTotal > 0
            ? Math.round((totalPresent / overallTotal) * 100)
            : 0;
        setSmeReportData({
          smes: processedSMEs,
          attendanceRecords,
          month: monthName,
          totalSessions,
          overallPercentage,
        });
      }
      toast({
        title: "Report Generated",
        description: "Your PDF is ready for download.",
      });
    } catch (error: any) {
      toast({
        title: "Error Generating Report",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "long" })
  );
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Report Generation
        </h1>
        <p className="text-muted-foreground">
          Generate monthly attendance reports for batches.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Attendance Report</CardTitle>
          <CardDescription>
            Select a report type, and a month to generate a PDF attendance
            report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student Report</SelectItem>
                  <SelectItem value="sme">SME Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportType === "student" && (
              <div className="space-y-2 flex-1">
                <Label>Batch</Label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a batch" />
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
            )}
            <div className="space-y-2 flex-1">
              <Label>Month</Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(v) => setSelectedMonth(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <Label>Year</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerateReport}
            className="w-full gap-2"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
        </CardContent>
      </Card>

      {/* Student Report Display */}
      {reportType === "student" && reportData && !isGenerating && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Data Visualization</CardTitle>
              <CardDescription>
                Visual representation of the attendance data for{" "}
                {reportData.batchName}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <StudentAttendanceGrid
                  students={reportData.students}
                  attendanceRecords={reportData.attendanceRecords}
                  month={selectedMonth}
                  year={selectedYear}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" /> Student-wise Attendance
                  Percentage
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.students}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="percentage"
                      fill="#8884d8"
                      name="Attendance %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Report is Ready</CardTitle>
              <CardDescription>
                Preview or download the PDF for {reportData.batchName}.
              </CardDescription>
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
                  <div className="h-full">
                    <PDFViewer
                      width="100%"
                      height="100%"
                      className="rounded-md"
                    >
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
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {loading ? "Preparing..." : "Download PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </CardContent>
          </Card>
        </>
      )}

      {/* SME Report Display */}
      {reportType === "sme" && smeReportData && !isGenerating && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>SME Report Visualization</CardTitle>
              <CardDescription>
                Visual representation of the SME attendance data for{" "}
                {smeReportData.month}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <SmeAttendanceGrid
                  smes={smeReportData.smes}
                  attendanceRecords={smeReportData.attendanceRecords}
                  month={selectedMonth}
                  year={selectedYear}
                />
              </div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BarChart2 className="h-5 w-5" /> SME-wise Attendance Percentage
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={smeReportData.smes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="percentage"
                    fill="#82ca9d"
                    name="Attendance %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Your SME Report is Ready</CardTitle>
              <CardDescription>
                Preview or download the PDF for {smeReportData.month}.
              </CardDescription>
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
                  <div className="h-full">
                    <PDFViewer
                      width="100%"
                      height="100%"
                      className="rounded-md"
                    >
                      <SmeAttendancePDF data={smeReportData} />
                    </PDFViewer>
                  </div>
                </DialogContent>
              </Dialog>

              <PDFDownloadLink
                document={<SmeAttendancePDF data={smeReportData} />}
                fileName={`SME_Report_${smeReportData.month}.pdf`}
                className="w-full"
              >
                {({ loading }) => (
                  <Button className="w-full gap-2" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {loading ? "Preparing..." : "Download PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportGeneration;
