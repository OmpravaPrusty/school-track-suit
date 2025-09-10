import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, GraduationCap } from "lucide-react";

const SMEManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">SME Management</h1>
            <p className="text-muted-foreground">Manage Subject Matter Experts</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add SME
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SME List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>SME management functionality will be implemented soon.</p>
            <p className="text-sm mt-2">This feature is currently under development.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMEManagement;