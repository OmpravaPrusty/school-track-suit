import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FilePenLine } from 'lucide-react';

interface Batch {
  id: string;
  name: string;
}

interface Subject {
  subject: string;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
}

interface Assessment {
  student_id: string;
  subject: string;
  marks: number | null;
}

const SMEAssessment = () => {
  const [user, setUser] = useState<any>(null);
  const [assignedBatches, setAssignedBatches] = useState<Batch[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<Subject[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndAssignments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");
        setUser(user);

        // Fetch assigned batches
        const { data: batchData, error: batchError } = await supabase
          .from('sme_batches')
          .select('batches!inner(id, name)')
          .eq('sme_id', user.id);
        if (batchError) throw batchError;
        setAssignedBatches(batchData.map((b: any) => b.batches));

        // Fetch assigned subjects
        const { data: subjectData, error: subjectError } = await supabase
          .from('sme_subjects')
          .select('subject')
          .eq('sme_id', user.id);
        if (subjectError) throw subjectError;
        setAssignedSubjects(subjectData);

      } catch (error) {
        console.error('Error fetching assignments:', error);
        toast({ title: "Error", description: "Failed to fetch your assignments.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndAssignments();
  }, []);

  useEffect(() => {
    const fetchStudentsAndAssessments = async () => {
      if (!selectedBatch || !selectedSubject || !user) return;

      try {
        setLoading(true);
        // Fetch students in the selected batch
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('profiles!inner(id, full_name, email)')
          .eq('batch_id', selectedBatch);
        if (studentsError) throw studentsError;
        const studentList = studentsData.map((s: any) => s.profiles);
        setStudents(studentList);

        // Fetch existing assessments for these students
        const studentIds = studentList.map((s: Student) => s.id);
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('student_id, subject, marks')
          .eq('sme_id', user.id)
          .eq('batch_id', selectedBatch)
          .eq('subject', selectedSubject)
          .in('student_id', studentIds);

        if (assessmentError) throw assessmentError;
        setAssessments(assessmentData);

      } catch (error) {
        console.error('Error fetching students:', error);
        toast({ title: "Error", description: "Failed to fetch students for the selected batch.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAssessments();
  }, [selectedBatch, selectedSubject, user]);

  const handleMarksChange = (student_id: string, marks: string) => {
    const newMarks = parseInt(marks, 10);
    const updatedAssessments = [...assessments];
    const existing = updatedAssessments.find(a => a.student_id === student_id);

    if (existing) {
      existing.marks = isNaN(newMarks) ? null : newMarks;
    } else {
      updatedAssessments.push({ student_id, subject: selectedSubject, marks: isNaN(newMarks) ? null : newMarks });
    }
    setAssessments(updatedAssessments);
  };

  const handleSaveAssessments = async () => {
    if (!user || !selectedBatch || !selectedSubject) return;

    try {
      const upsertData = assessments.map(assessment => ({
        student_id: assessment.student_id,
        sme_id: user.id,
        batch_id: selectedBatch,
        subject: selectedSubject,
        marks: assessment.marks,
      }));

      const { error } = await supabase.from('assessments').upsert(upsertData, {
        onConflict: 'student_id,sme_id,batch_id,subject',
      });

      if (error) throw error;

      toast({ title: "Success", description: "Assessments saved successfully." });
    } catch (error) {
      console.error("Error saving assessments:", error);
      toast({ title: "Error", description: "Failed to save assessments.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-secondary/10">
          <FilePenLine className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Assessment</h1>
          <p className="text-muted-foreground">Select a batch and subject to enter student marks.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="w-1/3">
              <Label>Select Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a batch" />
                </SelectTrigger>
                <SelectContent>
                  {assignedBatches.map(batch => (
                    <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/3">
              <Label>Select Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {assignedSubjects.map(subject => (
                    <SelectItem key={subject.subject} value={subject.subject}>{subject.subject}</SelectItem>
                  ))}
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
                <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
              ) : students.length > 0 ? (
                students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.full_name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="Enter marks"
                        value={assessments.find(a => a.student_id === student.id)?.marks ?? ''}
                        onChange={(e) => handleMarksChange(student.id, e.target.value)}
                        disabled={!selectedBatch || !selectedSubject}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={3} className="text-center">Select a batch and subject to see students.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-6">
            <Button onClick={handleSaveAssessments} disabled={loading || students.length === 0}>
              Save Assessments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMEAssessment;
