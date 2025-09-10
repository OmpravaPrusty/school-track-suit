import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StudentMarks = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Marks</h1>
          <p className="text-muted-foreground">View your assessment results</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Assessment Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Assessment results functionality is being updated to work with the current database schema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMarks;