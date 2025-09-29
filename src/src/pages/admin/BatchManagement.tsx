import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Users, Pencil, Power, PowerOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

interface Batch {
  id: string;
  name: string;
  created_at: string;
  start_date: string | null;
  end_date: string | null;
  student_count: number;
}

type FormData = {
  id?: string;
  name: string;
  start_date?: Date;
  end_date?: Date;
};

const BatchManagement = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    start_date: undefined,
    end_date: undefined,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const BATCHES_PER_PAGE = 10;

  useEffect(() => {
    fetchBatches(currentPage);
  }, [currentPage, sortOrder]);

  const fetchBatches = async (page: number) => {
    setLoading(true);
    try {
      const from = page * BATCHES_PER_PAGE;
      const to = from + BATCHES_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from("batches")
        .select(
          `
          id,
          name,
          created_at,
          start_date,
          end_date,
          students!inner(count)
        `,
          { count: "exact" }
        )
        .order("name", { ascending: sortOrder === "asc" })
        .range(from, to);

      if (error) throw error;

      const formattedBatches = data.map((batch) => ({
        id: batch.id,
        name: batch.name,
        created_at: batch.created_at,
        start_date: batch.start_date,
        end_date: batch.end_date,
        student_count: batch.students[0]?.count || 0,
      }));

      setBatches(formattedBatches);
      setTotalBatches(count || 0);
    } catch (error: any) {
      toast({
        title: "Error fetching batches",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a batch name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("batches")
        .insert({
          name: formData.name,
          start_date: formData.start_date
            ? format(formData.start_date, "yyyy-MM-dd")
            : null,
          end_date: formData.end_date
            ? format(formData.end_date, "yyyy-MM-dd")
            : null,
        })
        .select()
        .single();

      if (error) throw error;

      setFormData({ name: "", start_date: undefined, end_date: undefined });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Batch created successfully",
      });
      fetchBatches(currentPage);
    } catch (error: any) {
      toast({
        title: "Error creating batch",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.id) {
      toast({
        title: "Error",
        description: "Invalid data for update.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("batches")
        .update({
          name: formData.name,
          start_date: formData.start_date
            ? format(formData.start_date, "yyyy-MM-dd")
            : null,
          end_date: formData.end_date
            ? format(formData.end_date, "yyyy-MM-dd")
            : null,
        })
        .eq("id", formData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Batch updated successfully",
      });

      setIsEditDialogOpen(false);
      fetchBatches(currentPage);
    } catch (error: any) {
      toast({
        title: "Error updating batch",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (batch: Batch) => {
    setFormData({
      id: batch.id,
      name: batch.name,
      start_date: batch.start_date ? new Date(batch.start_date) : undefined,
      end_date: batch.end_date ? new Date(batch.end_date) : undefined,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("batches").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Batch deleted successfully",
      });
      fetchBatches(currentPage); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error deleting batch",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create/Edit Dialogs */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Batch Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage student batches
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() =>
                setFormData({
                  name: "",
                  start_date: undefined,
                  end_date: undefined,
                })
              }
            >
              <Plus className="h-4 w-4" />
              Create Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
                <DialogDescription>
                  Enter batch details to create a new batch
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Batch Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Batch 2026"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <DatePicker
                    value={formData.start_date}
                    onChange={(date) =>
                      setFormData({ ...formData, start_date: date })
                    }
                    placeholder="Select start date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <DatePicker
                    value={formData.end_date}
                    onChange={(date) =>
                      setFormData({ ...formData, end_date: date })
                    }
                    placeholder="Select end date"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Batch</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Batch</DialogTitle>
              <DialogDescription>
                Update the details for this batch.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Batch Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Batch 2026"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_start_date">Start Date</Label>
                <DatePicker
                  value={formData.start_date}
                  onChange={(date) =>
                    setFormData({ ...formData, start_date: date })
                  }
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_end_date">End Date</Label>
                <DatePicker
                  value={formData.end_date}
                  onChange={(date) =>
                    setFormData({ ...formData, end_date: date })
                  }
                  placeholder="Select end date"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Batch List</CardTitle>
              <CardDescription>Manage your student batches</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              Sort by Name {sortOrder === "asc" ? "(A-Z)" : "(Z-A)"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto relative border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 z-10 bg-card">
                    Batch Name
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">
                    Start Date
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">
                    End Date
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">
                    Created Date
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">
                    Students
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>
                      {batch.start_date
                        ? format(new Date(batch.start_date), "dd MMM yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {batch.end_date
                        ? format(new Date(batch.end_date), "dd MMM yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {batch.created_at
                        ? format(new Date(batch.created_at), "dd MMM yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{batch.student_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(batch)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete this batch and all students
                                associated with it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(batch.id)}
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <div className="flex justify-between items-center p-4 border-t">
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of{" "}
            {Math.ceil(totalBatches / BATCHES_PER_PAGE)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil(totalBatches / BATCHES_PER_PAGE) - 1
                  )
                )
              }
              disabled={(currentPage + 1) * BATCHES_PER_PAGE >= totalBatches}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BatchManagement;
