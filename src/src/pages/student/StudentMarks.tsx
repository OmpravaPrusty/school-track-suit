import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardCheck } from "lucide-react";
import { format } from "date-fns";

interface AssessmentRecord {
  subject: string;
  marks: number;
  created_at: string;
  assessment_date: string;
  assessment_type: string;
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user) return;
      try {
        setLoading(true);

        console.log("🔍 Fetching assessments for student:", user.id);

        // First, let's try a simple query without complex joins
        const { data, error } = await supabase
          .from("assessments")
          .select(
            `
            subject,
            marks,
            created_at,
            assessment_date,
            assessment_type,
            sme_id,
            batch_id
          `
          )
          .eq("student_id", user.id)
          .order("assessment_date", { ascending: false })
          .order("created_at", { ascending: false });

        console.log("Assessment query result:", {
          data,
          error,
          count: data?.length || 0,
        });

        if (error) throw error;

        // Now fetch SME and batch details separately for better debugging
        let formattedData = [];

        if (data && data.length > 0) {
          // Get unique SME IDs and batch IDs
          const smeIds = [...new Set(data.map((item) => item.sme_id))];
          const batchIds = [...new Set(data.map((item) => item.batch_id))];

          console.log(
            "Fetching details for SMEs:",
            smeIds,
            "and batches:",
            batchIds
          );

          // Fetch SME details
          const { data: smeData, error: smeError } = await supabase
            .from("smes")
            .select(
              `
              id,
              profiles!inner(
                full_name
              )
            `
            )
            .in("id", smeIds);

          console.log("SME data:", { smeData, smeError });

          // Fetch batch details
          const { data: batchData, error: batchError } = await supabase
            .from("batches")
            .select("id, name")
            .in("id", batchIds);

          console.log("Batch data:", { batchData, batchError });

          // Create lookup maps
          const smeMap = new Map();
          if (smeData) {
            smeData.forEach((sme) => {
              smeMap.set(sme.id, sme.profiles.full_name);
            });
          }

          const batchMap = new Map();
          if (batchData) {
            batchData.forEach((batch) => {
              batchMap.set(batch.id, batch.name);
            });
          }

          // Combine data
          formattedData = data.map((item: any) => ({
            ...item,
            smes: {
              full_name: smeMap.get(item.sme_id) || "Unknown SME",
            },
            batches: {
              name: batchMap.get(item.batch_id) || "Unknown Batch",
            },
          }));
        }

        console.log("Final formatted data:", formattedData);
        setAssessments(formattedData);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        toast({
          title: "Error",
          description: "Failed to fetch your marks.",
          variant: "destructive",
        });
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
          <p className="text-muted-foreground">
            Here is a summary of all your assessment marks.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Results</CardTitle>
          <CardDescription>
            All marks uploaded by your Subject Matter Experts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Assessment Type</TableHead>
                <TableHead>Assessment Date</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Assessed By</TableHead>
                <TableHead className="text-right">Marks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading your marks...
                  </TableCell>
                </TableRow>
              ) : assessments.length > 0 ? (
                assessments.map((assessment, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {assessment.subject}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          assessment.assessment_type === "monthly"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {assessment.assessment_type === "monthly"
                          ? "Monthly"
                          : "Regular"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(assessment.assessment_date), "PPP")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{assessment.batches.name}</Badge>
                    </TableCell>
                    <TableCell>{assessment.smes.full_name}</TableCell>
                    <TableCell className="text-right font-semibold text-lg">
                      {assessment.marks !== null ? assessment.marks : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No marks have been uploaded for you yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMarks;
