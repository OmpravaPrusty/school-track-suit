import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';

interface AssessmentRecord {
  subject: string;
  marks: number;
  created_at: string;
  smes: {
    full_name: string;
  };
  batches: {
    name: string;
  };
}

const StudentMarks = () => {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('assessments')
          .select(`
            subject,
            marks,
            created_at,
            smes (
              profiles (
                full_name
              )
            ),
            batches (
              name
            )
          `)
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedData = data.map((item: any) => ({
          ...item,
          smes: {
            full_name: item.smes?.profiles?.full_name || 'Unknown SME',
          },
        }));

        setAssessments(formattedData);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        toast({ title: "Error", description: "Failed to fetch your marks.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAssessments();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-secondary/10">
          <ClipboardCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Marks</h1>
          <p className="text-muted-foreground">Here is a summary of all your assessment marks.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Results</CardTitle>
          <CardDescription>All marks uploaded by your Subject Matter Experts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Assessed By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Marks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading your marks...</TableCell></TableRow>
              ) : assessments.length > 0 ? (
                assessments.map((assessment, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{assessment.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{assessment.batches.name}</Badge>
                    </TableCell>
                    <TableCell>{assessment.smes.full_name}</TableCell>
                    <TableCell>{format(new Date(assessment.created_at), 'PPP')}</TableCell>
                    <TableCell className="text-right font-semibold text-lg">
                      {assessment.marks !== null ? assessment.marks : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center">No marks have been uploaded for you yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMarks;
