import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Users, School, Building, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReportData {
  student: {
    name: string;
    email: string;
    phone: string;
    class: string;
    batch: string;
    attendance: string;
    performance: string;
    organization: string;
    school: string;
  };
  teacher: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    experience: string;
    organization: string;
    school: string;
  };
  sme: {
    name: string;
    email: string;
    phone: string;
    specialization: string;
    experience: string;
    organization: string;
    sessionsDelivered: string;
  };
  school: {
    name: string;
    email: string;
    phone: string;
    address: string;
    organization: string;
    totalStudents: string;
    totalTeachers: string;
    attendancePercentage: string;
  };
  organization: {
    name: string;
    email: string;
    phone: string;
    address: string;
    type: string;
    totalSchools: string;
    totalStudents: string;
    totalTeachers: string;
    overallAttendance: string;
  };
}

const mockData: ReportData = {
  student: {
    name: "John Doe",
    email: "john.doe@student.edu",
    phone: "+1234567890",
    class: "11th Grade",
    batch: "Batch 2024",
    attendance: "85%",
    performance: "Grade A",
    organization: "Tech University",
    school: "Engineering College",
  },
  teacher: {
    name: "Dr. Jane Smith",
    email: "jane.smith@tech.edu",
    phone: "+1234567891",
    subject: "Physics",
    experience: "8 years",
    organization: "Tech University",
    school: "Engineering College",
  },
  sme: {
    name: "Prof. Michael Brown",
    email: "michael.brown@expert.com",
    phone: "+1234567892",
    specialization: "Machine Learning",
    experience: "12 years",
    organization: "Tech University",
    sessionsDelivered: "25",
  },
  school: {
    name: "Engineering College",
    email: "info@engineering.tech.edu",
    phone: "+1234567893",
    address: "123 Tech Street, Tech City",
    organization: "Tech University",
    totalStudents: "1,250",
    totalTeachers: "85",
    attendancePercentage: "87%",
  },
  organization: {
    name: "Tech University",
    email: "info@techuniversity.edu",
    phone: "+1234567894",
    address: "123 University Ave, Tech City",
    type: "University",
    totalSchools: "5",
    totalStudents: "5,000",
    totalTeachers: "400",
    overallAttendance: "85%",
  },
};

const mockOrganizations = ["Tech University", "Science Academy", "Arts Institute"];
const mockSchools = {
  "Tech University": ["Engineering College", "IT College"],
  "Science Academy": ["Physics Department", "Chemistry Department"],
  "Arts Institute": ["Fine Arts School", "Music School"],
};

const ReportGeneration = () => {
  const [reportType, setReportType] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const reportTypes = [
    { value: "student", label: "Student Report", icon: Users },
    { value: "teacher", label: "Teacher Report", icon: BookOpen },
    { value: "sme", label: "SME Report", icon: GraduationCap },
    { value: "school", label: "School Report", icon: School },
    { value: "organization", label: "Organization Report", icon: Building },
  ];

  const getEntitiesByType = () => {
    switch (reportType) {
      case "student":
        return ["John Doe", "Jane Smith", "Mike Johnson"];
      case "teacher":
        return ["Dr. Jane Smith", "Prof. Bob Wilson", "Dr. Alice Cooper"];
      case "sme":
        return ["Prof. Michael Brown", "Dr. Sarah Davis", "Prof. Tom Anderson"];
      case "school":
        return selectedOrganization 
          ? mockSchools[selectedOrganization as keyof typeof mockSchools] || []
          : [];
      case "organization":
        return mockOrganizations;
      default:
        return [];
    }
  };

  const handleGenerateReport = () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    if (reportType !== "organization" && !selectedOrganization) {
      toast({
        title: "Error",
        description: "Please select an organization",
        variant: "destructive",
      });
      return;
    }

    if (["student", "teacher", "sme"].includes(reportType) && !selectedSchool) {
      toast({
        title: "Error",
        description: "Please select a school",
        variant: "destructive",
      });
      return;
    }

    if (!selectedEntity && reportType !== "organization") {
      toast({
        title: "Error",
        description: `Please select a ${reportType}`,
        variant: "destructive",
      });
      return;
    }

    // Generate report based on selected type
    const reportData = mockData[reportType as keyof typeof mockData];
    setGeneratedReport({
      type: reportType,
      data: reportData,
      organization: selectedOrganization,
      school: selectedSchool,
      entity: selectedEntity,
      generatedAt: new Date().toLocaleString(),
    });

    toast({
      title: "Success",
      description: "Report generated successfully",
    });
  };

  const handleDownloadReport = () => {
    if (!generatedReport) return;

    const reportContent = JSON.stringify(generatedReport, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedReport.type}_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Report downloaded successfully",
    });
  };

  const renderReportContent = () => {
    if (!generatedReport) return null;

    const { data, type } = generatedReport;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {type.charAt(0).toUpperCase() + type.slice(1)} Report
          </CardTitle>
          <CardDescription>
            Generated on {generatedReport.generatedAt}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <Label className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <p className="text-sm text-muted-foreground">{value as string}</p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end pt-4">
            <Button onClick={handleDownloadReport} className="gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const availableSchools = selectedOrganization 
    ? mockSchools[selectedOrganization as keyof typeof mockSchools] || []
    : [];

  const availableEntities = getEntitiesByType();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Report Generation</h1>
        <p className="text-muted-foreground">Generate detailed reports for various entities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>
            Select the type of report and entity to generate a detailed report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reportType && reportType !== "organization" && (
              <div className="space-y-2">
                <Label>Organization</Label>
                <Select 
                  value={selectedOrganization} 
                  onValueChange={(value) => {
                    setSelectedOrganization(value);
                    setSelectedSchool("");
                    setSelectedEntity("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockOrganizations.map((org) => (
                      <SelectItem key={org} value={org}>{org}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {reportType && ["student", "teacher", "sme"].includes(reportType) && selectedOrganization && (
              <div className="space-y-2">
                <Label>School</Label>
                <Select 
                  value={selectedSchool} 
                  onValueChange={(value) => {
                    setSelectedSchool(value);
                    setSelectedEntity("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSchools.map((school) => (
                      <SelectItem key={school} value={school}>{school}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {reportType && reportType !== "organization" && (
              <div className="space-y-2">
                <Label>{reportType.charAt(0).toUpperCase() + reportType.slice(1)}</Label>
                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${reportType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEntities.map((entity) => (
                      <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button onClick={handleGenerateReport} className="w-full gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {renderReportContent()}
    </div>
  );
};

export default ReportGeneration;