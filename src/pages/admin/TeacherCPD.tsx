
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TeacherCPD = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/admin/programs")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-secondary">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teacher CPD Program</h1>
            <p className="text-muted-foreground">Continuous Professional Development for Teachers</p>
          </div>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Program Coming Soon</CardTitle>
          <CardDescription>
            The Teacher Continuous Professional Development program is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This program will include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Professional development courses for teachers</li>
              <li>Certification tracking and management</li>
              <li>Performance assessment tools</li>
              <li>Resource library and materials</li>
              <li>Collaborative learning platforms</li>
            </ul>
            <Button 
              onClick={() => navigate("/admin/programs")}
              className="mt-4"
            >
              Back to Programs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherCPD;
