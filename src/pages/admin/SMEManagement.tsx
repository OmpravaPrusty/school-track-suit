import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GraduationCap, Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SME {
  id: number;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  phone: string;
  experience: string;
  specialization: string;
  status: "active" | "inactive";
}

const SMEManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSME, setSelectedSME] = useState<SME | null>(null);
  const [newSME, setNewSME] = useState({
    name: "",
    email: "",
    employeeId: "",
    department: "",
    phone: "",
    experience: "",
    specialization: "",
  });

  // Mock SME data
  const [smeList, setSMEList] = useState<SME[]>([
    {
      id: 1,
      name: "Dr. Alice Cooper",
      email: "alice.cooper@university.edu",
      employeeId: "SME001",
      department: "Computer Science",
      phone: "+1 (555) 111-2222",
      experience: "15 years",
      specialization: "Machine Learning",
      status: "active",
    },
    {
      id: 2,
      name: "Prof. Robert Martinez",
      email: "robert.martinez@university.edu",
      employeeId: "SME002",
      department: "Mathematics",
      phone: "+1 (555) 222-3333",
      experience: "12 years",
      specialization: "Applied Mathematics",
      status: "active",
    },
    {
      id: 3,
      name: "Dr. Jennifer Wong",
      email: "jennifer.wong@university.edu",
      employeeId: "SME003",
      department: "Physics",
      phone: "+1 (555) 333-4444",
      experience: "8 years",
      specialization: "Quantum Physics",
      status: "inactive",
    },
    {
      id: 4,
      name: "Prof. David Kumar",
      email: "david.kumar@university.edu",
      employeeId: "SME004",
      department: "Chemistry",
      phone: "+1 (555) 444-5555",
      experience: "20 years",
      specialization: "Organic Chemistry",
      status: "active",
    },
  ]);

  const filteredSMEs = smeList.filter(sme =>
    sme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sme.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sme.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sme.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSME = () => {
    if (!newSME.name || !newSME.email || !newSME.employeeId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const sme: SME = {
      id: smeList.length + 1,
      ...newSME,
      status: "active",
    };

    setSMEList(prev => [...prev, sme]);
    setNewSME({
      name: "",
      email: "",
      employeeId: "",
      department: "",
      phone: "",
      experience: "",
      specialization: "",
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "SME Added",
      description: `${sme.name} has been successfully added`,
    });
  };

  const handleEditSME = () => {
    if (!selectedSME) return;

    setSMEList(prev =>
      prev.map(sme =>
        sme.id === selectedSME.id ? selectedSME : sme
      )
    );

    setIsEditDialogOpen(false);
    setSelectedSME(null);
    
    toast({
      title: "SME Updated",
      description: "SME information has been successfully updated",
    });
  };

  const handleDeleteSME = (id: number) => {
    const sme = smeList.find(s => s.id === id);
    setSMEList(prev => prev.filter(s => s.id !== id));
    
    toast({
      title: "SME Deleted",
      description: `${sme?.name} has been removed from the system`,
    });
  };

  const openEditDialog = (sme: SME) => {
    setSelectedSME({ ...sme });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-secondary/10">
          <GraduationCap className="h-6 w-6 text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">SME Management</h1>
          <p className="text-muted-foreground">Manage Subject Matter Expert records and information</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>SME Directory</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search SMEs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add SME
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-card">
                  <DialogHeader>
                    <DialogTitle>Add New SME</DialogTitle>
                    <DialogDescription>
                      Enter the SME's information below to add them to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-name">Full Name *</Label>
                      <Input
                        id="add-name"
                        value={newSME.name}
                        onChange={(e) => setNewSME(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-email">Email *</Label>
                      <Input
                        id="add-email"
                        type="email"
                        value={newSME.email}
                        onChange={(e) => setNewSME(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-employeeid">Employee ID *</Label>
                      <Input
                        id="add-employeeid"
                        value={newSME.employeeId}
                        onChange={(e) => setNewSME(prev => ({ ...prev, employeeId: e.target.value }))}
                        placeholder="Enter employee ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-department">Department</Label>
                      <Select value={newSME.department} onValueChange={(value) => setNewSME(prev => ({ ...prev, department: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-phone">Phone</Label>
                      <Input
                        id="add-phone"
                        value={newSME.phone}
                        onChange={(e) => setNewSME(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-experience">Experience</Label>
                      <Input
                        id="add-experience"
                        value={newSME.experience}
                        onChange={(e) => setNewSME(prev => ({ ...prev, experience: e.target.value }))}
                        placeholder="e.g., 10 years"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="add-specialization">Specialization</Label>
                      <Input
                        id="add-specialization"
                        value={newSME.specialization}
                        onChange={(e) => setNewSME(prev => ({ ...prev, specialization: e.target.value }))}
                        placeholder="Enter area of specialization"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSME} className="bg-secondary text-secondary-foreground">
                      Add SME
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSMEs.map((sme) => (
                  <TableRow key={sme.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{sme.name}</TableCell>
                    <TableCell>{sme.employeeId}</TableCell>
                    <TableCell>{sme.email}</TableCell>
                    <TableCell>{sme.department}</TableCell>
                    <TableCell>{sme.experience}</TableCell>
                    <TableCell>{sme.specialization}</TableCell>
                    <TableCell>
                      <Badge
                        variant={sme.status === "active" ? "default" : "secondary"}
                        className={sme.status === "active" ? "bg-success text-success-foreground" : ""}
                      >
                        {sme.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(sme)}
                          className="hover:bg-accent"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSME(sme.id)}
                          className="hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSMEs.length === 0 && (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No SMEs found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit SME Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card">
          <DialogHeader>
            <DialogTitle>Edit SME</DialogTitle>
            <DialogDescription>
              Update the SME's information below.
            </DialogDescription>
          </DialogHeader>
          {selectedSME && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={selectedSME.name}
                  onChange={(e) => setSelectedSME(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedSME.email}
                  onChange={(e) => setSelectedSME(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-employeeid">Employee ID *</Label>
                <Input
                  id="edit-employeeid"
                  value={selectedSME.employeeId}
                  onChange={(e) => setSelectedSME(prev => prev ? ({ ...prev, employeeId: e.target.value }) : null)}
                  placeholder="Enter employee ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select value={selectedSME.department} onValueChange={(value) => setSelectedSME(prev => prev ? ({ ...prev, department: value }) : null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={selectedSME.phone}
                  onChange={(e) => setSelectedSME(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-experience">Experience</Label>
                <Input
                  id="edit-experience"
                  value={selectedSME.experience}
                  onChange={(e) => setSelectedSME(prev => prev ? ({ ...prev, experience: e.target.value }) : null)}
                  placeholder="e.g., 10 years"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-specialization">Specialization</Label>
                <Input
                  id="edit-specialization"
                  value={selectedSME.specialization}
                  onChange={(e) => setSelectedSME(prev => prev ? ({ ...prev, specialization: e.target.value }) : null)}
                  placeholder="Enter area of specialization"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSME} className="bg-secondary text-secondary-foreground">
              Update SME
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SMEManagement;