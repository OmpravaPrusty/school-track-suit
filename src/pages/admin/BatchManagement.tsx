import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
}

interface Batch {
  id: string;
  name: string;
  createdDate: string;
  studentIds: string[];
}

const mockStudents: Student[] = [
  { id: "1", name: "John Doe", email: "john@example.com", class: "10th" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", class: "10th" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", class: "11th" },
  { id: "4", name: "Sarah Wilson", email: "sarah@example.com", class: "11th" },
  { id: "5", name: "David Brown", email: "david@example.com", class: "12th" },
];

const BatchManagement = () => {
  const [batches, setBatches] = useState<Batch[]>([
    { id: "1", name: "Batch 2023", createdDate: "2023-01-15", studentIds: ["1", "2"] },
    { id: "2", name: "Batch 2024", createdDate: "2024-01-15", studentIds: ["3", "4"] },
    { id: "3", name: "Batch 2025", createdDate: "2025-01-15", studentIds: ["5"] },
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [formData, setFormData] = useState({ name: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a batch name",
        variant: "destructive",
      });
      return;
    }

    const newBatch: Batch = {
      id: Date.now().toString(),
      name: formData.name,
      createdDate: new Date().toISOString().split('T')[0],
      studentIds: [],
    };

    setBatches([...batches, newBatch]);
    setFormData({ name: "" });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Batch created successfully",
    });
  };

  const handleDelete = (id: string) => {
    setBatches(batches.filter(batch => batch.id !== id));
    toast({
      title: "Success",
      description: "Batch deleted successfully",
    });
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleAssignStudents = () => {
    if (!selectedBatch) return;

    setBatches(batches.map(batch => 
      batch.id === selectedBatch.id 
        ? { ...batch, studentIds: [...new Set([...batch.studentIds, ...selectedStudents])] }
        : batch
    ));

    setSelectedStudents([]);
    setIsStudentDialogOpen(false);
    toast({
      title: "Success",
      description: "Students assigned to batch successfully",
    });
  };

  const getStudentsByBatch = (batch: Batch) => {
    return mockStudents.filter(student => batch.studentIds.includes(student.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Batch Management</h1>
          <p className="text-muted-foreground">Create and manage student batches</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Batch 2026"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Batch</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batch List</CardTitle>
          <CardDescription>Manage your student batches</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.name}</TableCell>
                  <TableCell>{batch.createdDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{batch.studentIds.length} students</Badge>
                      {getStudentsByBatch(batch).slice(0, 2).map((student) => (
                        <span key={student.id} className="text-sm text-muted-foreground">
                          {student.name}
                        </span>
                      ))}
                      {batch.studentIds.length > 2 && (
                        <span className="text-sm text-muted-foreground">...</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedBatch(batch);
                          setSelectedStudents([]);
                          setIsStudentDialogOpen(true);
                        }}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(batch.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Student Assignment Dialog */}
      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Students to {selectedBatch?.name}</DialogTitle>
            <DialogDescription>
              Select students to add to this batch
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => 
                          handleStudentSelection(student.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.class}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsStudentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignStudents}>
              Assign {selectedStudents.length} Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BatchManagement;