import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CACI = () => {
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
          <div className="p-3 rounded-lg bg-accent">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Computing and AI Course Implementation</h1>
            <p className="text-muted-foreground">Computing and AI Course</p>
          </div>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Program Coming Soon</CardTitle>
          <CardDescription>
            {/* The Community and Civic Initiatives program is currently under development. */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
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

export default CACI;