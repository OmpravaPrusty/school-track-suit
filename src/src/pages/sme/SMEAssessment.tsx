import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FilePenLine } from "lucide-react";

interface Batch {
  id: string;
  name: string;
}

interface Subject {
  subject: "English" | "Math" | "BIO" | "PHY" | "CHEM" | "AI" | "CS";
}

interface Student {
  id: string;
  full_name: string;
  email: string;
}

interface Assessment {
  student_id: string;
  subject: "English" | "Math" | "BIO" | "PHY" | "CHEM" | "AI" | "CS";
  marks: number | null;
  assessment_date: string;
  assessment_type: "regular" | "monthly";
}

const SMEAssessment = () => {
  const [user, setUser] = useState<any>(null);
  const [assignedBatches, setAssignedBatches] = useState<Batch[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<Subject[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [assessmentDate, setAssessmentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [assessmentType, setAssessmentType] = useState<"regular" | "monthly">(
    "regular"
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndAssignments = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");
        setUser(user);

        // Fetch assigned batches
        console.log("🔍 Fetching batches for SME:", user.id);

        // First, let's try to see if we can access the table at all
        const { data: testSmeData, error: testSmeError } = await supabase
          .from("sme_batches")
          .select("*")
          .limit(1);

        console.log("🧪 Test query to sme_batches:", {
          testSmeData,
          testSmeError,
        });

        // Try a simpler approach - get batch IDs first, then batch details
        const { data: smeBatchData, error: smeBatchError } = await supabase
          .from("sme_batches")
          .select("batch_id")
          .eq("sme_id", user.id);

        console.log("SME batch assignments:", {
          smeBatchData,
          smeBatchError,
          userId: user.id,
          errorCode: smeBatchError?.code,
          errorMessage: smeBatchError?.message,
          errorDetails: smeBatchError,
        });

        let batches = [];

        if (smeBatchError) {
          console.error("❌ Error fetching SME batch assignments:", {
            error: smeBatchError,
            code: smeBatchError?.code,
            message: smeBatchError?.message,
            details: smeBatchError?.details,
            hint: smeBatchError?.hint,
            fullError: JSON.stringify(smeBatchError),
          });
          // Still continue, just set empty batches
        } else if (!smeBatchData || smeBatchData.length === 0) {
          console.log("ℹ️ SME has no batch assignments");
        } else {
          // Get batch details separately
          const batchIds = smeBatchData.map((item) => item.batch_id);
          console.log("📋 Fetching batch details for IDs:", batchIds);

          const { data: batchDetails, error: batchDetailsError } =
            await supabase
              .from("batches")
              .select("id, name")
              .in("id", batchIds);

          console.log("Batch details query:", {
            batchDetails,
            batchDetailsError,
          });

          if (batchDetailsError) {
            console.error(
              "❌ Error fetching batch details:",
              batchDetailsError
            );
          } else if (batchDetails) {
            batches = batchDetails;
          }
        }

        console.log("Final batches result:", batches);
        setAssignedBatches(batches);

        // Fetch assigned subjects
        console.log("🔍 Fetching subjects for SME:", user.id);

        // Test access to sme_subjects table
        const { data: testSubjectData, error: testSubjectError } =
          await supabase.from("sme_subjects").select("*").limit(1);

        console.log("🧪 Test query to sme_subjects:", {
          testSubjectData,
          testSubjectError,
        });

        const { data: subjectData, error: subjectError } = await supabase
          .from("sme_subjects")
          .select("subject")
          .eq("sme_id", user.id);

        console.log("SME subjects query result:", {
          subjectData,
          subjectError,
          userId: user.id,
          errorCode: subjectError?.code,
          errorMessage: subjectError?.message,
        });

        if (subjectError) {
          console.error("❌ Subject fetch error:", subjectError);
          setAssignedSubjects([]);
        } else {
          console.log("✅ Found subjects:", subjectData);
          setAssignedSubjects(subjectData || []);
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast({
          title: "Error",
          description: "Failed to fetch your assignments.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndAssignments();
  }, []);

  useEffect(() => {
    const fetchStudentsAndAssessments = async () => {
      if (!selectedBatch || !user) return;

      try {
        setLoading(true);
        console.log("🔍 Fetching students for batch:", selectedBatch);

        // Use direct join query for better performance
        const { data: directData, error: directError } = await supabase
          .from("students")
          .select(
            `
            id,
            student_id,
            batch_id,
            profiles!inner(
              id,
              full_name,
              email
            )
          `
          )
          .eq("batch_id", selectedBatch);

        console.log("Query result:", {
          studentsFound: directData?.length || 0,
          error: directError?.message || "none",
        });

        let studentsData: any[] = [];

        if (directError) {
          console.log("Direct query failed, trying two-step approach...");

          // Fallback: Two-step query
          const { data: studentsInBatch, error: studentsError } = await supabase
            .from("students")
            .select("*")
            .eq("batch_id", selectedBatch);

          console.log("Step 1 - Students query result:", {
            studentsInBatch,
            studentsError,
            count: studentsInBatch?.length || 0,
          });

          if (studentsError) {
            console.error("Error fetching students:", studentsError);
            throw studentsError;
          }

          if (studentsInBatch && studentsInBatch.length > 0) {
            console.log("Students found, fetching profiles...");
            const profileIds = studentsInBatch.map((student) => student.id);
            console.log("Profile IDs to fetch:", profileIds);

            const { data: profilesData, error: profilesError } = await supabase
              .from("profiles")
              .select("id, full_name, email")
              .in("id", profileIds);

            console.log("Profiles query result:", {
              profilesData,
              profilesError,
              count: profilesData?.length || 0,
            });

            if (profilesError) {
              console.error("Error fetching profiles:", profilesError);
              throw profilesError;
            }

            console.log("Setting students from two-step query:", profilesData);
            setStudents(profilesData || []);
            studentsData = studentsInBatch || []; // Store for assessment query
          } else {
            console.log("No students found in batch");
            setStudents([]);
            studentsData = [];
          }
        } else if (directData && directData.length > 0) {
          // Transform the joined data
          const studentsFromJoin = directData.map((item: any) => ({
            id: item.profiles.id,
            full_name: item.profiles.full_name,
            email: item.profiles.email,
          }));
          console.log("Setting students from direct query:", studentsFromJoin);
          setStudents(studentsFromJoin);

          // Store the original student data for assessment query
          studentsData = directData || [];
        } else {
          console.log("Direct query succeeded but returned no results");
          setStudents([]);
          studentsData = [];
        }

        console.log("=== STUDENT FETCH COMPLETE ===");

        // Only fetch assessments if we have all required fields and students
        if (
          selectedSubject &&
          assessmentDate &&
          assessmentType &&
          studentsData &&
          studentsData.length > 0
        ) {
          // Get student IDs from the students data
          const studentIds = studentsData.map((student) => student.id);

          const { data: assessmentData, error: assessmentError } =
            await supabase
              .from("assessments")
              .select(
                "student_id, subject, marks, assessment_date, assessment_type"
              )
              .eq("sme_id", user.id)
              .eq("batch_id", selectedBatch)
              .eq("assessment_date", assessmentDate)
              .eq("assessment_type", assessmentType)
              .eq(
                "subject",
                selectedSubject as
                  | "English"
                  | "Math"
                  | "BIO"
                  | "PHY"
                  | "CHEM"
                  | "AI"
                  | "CS"
              )
              .in("student_id", studentIds);

          console.log("Assessment data:", { assessmentData, assessmentError });

          if (assessmentError) throw assessmentError;
          setAssessments(assessmentData || []);
        } else {
          // Clear assessments if not all fields are selected
          setAssessments([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast({
          title: "Error",
          description: "Failed to fetch students for the selected batch.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAssessments();
  }, [selectedBatch, selectedSubject, assessmentDate, assessmentType, user]);

  const handleMarksChange = (student_id: string, marks: string) => {
    if (!selectedSubject || !assessmentDate || !assessmentType) return;

    const newMarks = parseInt(marks, 10);
    const updatedAssessments = [...assessments];
    const existing = updatedAssessments.find(
      (a) => a.student_id === student_id
    );

    if (existing) {
      existing.marks = isNaN(newMarks) ? null : newMarks;
    } else {
      updatedAssessments.push({
        student_id,
        subject: selectedSubject as
          | "English"
          | "Math"
          | "BIO"
          | "PHY"
          | "CHEM"
          | "AI"
          | "CS",
        marks: isNaN(newMarks) ? null : newMarks,
        assessment_date: assessmentDate,
        assessment_type: assessmentType,
      });
    }
    setAssessments(updatedAssessments);
  };

  const handleSaveAssessments = async () => {
    if (
      !user ||
      !selectedBatch ||
      !selectedSubject ||
      !assessmentDate ||
      !assessmentType
    )
      return;

    try {
      const upsertData = assessments.map((assessment) => ({
        student_id: assessment.student_id,
        sme_id: user.id,
        batch_id: selectedBatch,
        subject: selectedSubject as
          | "English"
          | "Math"
          | "BIO"
          | "PHY"
          | "CHEM"
          | "AI"
          | "CS",
        marks: assessment.marks,
        assessment_date: assessmentDate,
        assessment_type: assessmentType,
      }));

      const { error } = await supabase.from("assessments").upsert(upsertData, {
        onConflict:
          "student_id,sme_id,batch_id,subject,assessment_date,assessment_type",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assessments saved successfully.",
      });
    } catch (error) {
      console.error("Error saving assessments:", error);
      toast({
        title: "Error",
        description: "Failed to save assessments.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-secondary/10">
          <FilePenLine className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Student Assessment
          </h1>
          <p className="text-muted-foreground">
            Select a batch, subject, date, and assessment type to enter student
            marks.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Select Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a batch" />
                </SelectTrigger>
                <SelectContent>
                  {assignedBatches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Select Subject</Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {assignedSubjects.map((subject) => (
                    <SelectItem key={subject.subject} value={subject.subject}>
                      {subject.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assessment Date</Label>
              <Input
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label>Assessment Type</Label>
              <Select
                value={assessmentType}
                onValueChange={(value: "regular" | "monthly") =>
                  setAssessmentType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Assessment</SelectItem>
                  <SelectItem value="monthly">Monthly Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-48">Marks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.full_name}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder={
                          !selectedSubject || !assessmentDate || !assessmentType
                            ? "Select all fields first"
                            : "Enter marks"
                        }
                        value={
                          assessments.find((a) => a.student_id === student.id)
                            ?.marks ?? ""
                        }
                        onChange={(e) =>
                          handleMarksChange(student.id, e.target.value)
                        }
                        disabled={
                          !selectedBatch ||
                          !selectedSubject ||
                          !assessmentDate ||
                          !assessmentType
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    {!selectedBatch
                      ? "Select a batch to see students."
                      : "No students found in this batch."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSaveAssessments}
              disabled={loading || students.length === 0}
            >
              Save Assessments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMEAssessment;
