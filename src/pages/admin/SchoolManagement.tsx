import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  organization: string;
  establishedYear: string;
  status: "active" | "inactive";
}

// const mockOrganizations = ["Tech University", "Science Academy", "Arts Institute"];

const SchoolManagement = () => {
  const [schools, setSchools] = useState<School[]>([
    {
      id: "1",
      name: "Malanad Higher Secondary School",
      email: "info@malanada.edu.in",
      phone: "+91-9876543210",
      address: "MG Road, Kozhikode, Kerala 673001",
      organization: "", // Commented out
      establishedYear: "1985",
      status: "active",
    },
    {
      id: "2",
      name: "St. Mary's Convent School",
      email: "principal@stmarys.edu.in",
      phone: "+91-8765432109",
      address: "Church Street, Thrissur, Kerala 680001",
      organization: "", // Commented out
      establishedYear: "1978",
      status: "active",
    },
    {
      id: "3",
      name: "Bharatiya Vidya Bhavan School",
      email: "contact@bvb.edu.in",
      phone: "+91-7654321098",
      address: "Gandhi Nagar, Ernakulam, Kerala 682020",
      organization: "", // Commented out
      establishedYear: "1992",
      status: "active",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    organization: "",
    establishedYear: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingSchool) {
      setSchools(schools.map(school =>
        school.id === editingSchool.id
          ? { ...school, ...formData }
          : school
      ));
      toast({
        title: "Success",
        description: "School updated successfully",
      });
    } else {
      const newSchool: School = {
        id: Date.now().toString(),
        ...formData,
        status: "active",
      };
      setSchools([...schools, newSchool]);
      toast({
        title: "Success",
        description: "School added successfully",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      organization: "",
      establishedYear: "",
    });
    setEditingSchool(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      email: school.email,
      phone: school.phone,
      address: school.address,
      organization: school.organization,
      establishedYear: school.establishedYear,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSchools(schools.filter(school => school.id !== id));
    toast({
      title: "Success",
      description: "School deleted successfully",
    });
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">School Management</h1>
          <p className="text-muted-foreground">Manage schools and their information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add School
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSchool ? "Edit School" : "Add New School"}
                </DialogTitle>
                <DialogDescription>
                  Enter school information
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">School Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="School name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="school@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                    placeholder="1985"
                  />
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="organization">Organization *</Label>
                  <Select 
                    value={formData.organization} 
                    onValueChange={(value) => setFormData({ ...formData, organization: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockOrganizations.map((org) => (
                        <SelectItem key={org} value={org}>{org}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}
                <div className="space-y-2 col-span-1">
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="School address"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSchool ? "Update" : "Add"} School
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schools</CardTitle>
          <CardDescription>Manage schools within organizations</CardDescription>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Email</TableHead>
                {/* <TableHead>Organization</TableHead> */}
                <TableHead>Established</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>{school.email}</TableCell>
                  {/* <TableCell>{school.organization}</TableCell> */}
                  <TableCell>{school.establishedYear}</TableCell>
                  <TableCell>
                    <Badge variant={school.status === "active" ? "default" : "secondary"}>
                      {school.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(school)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(school.id)}
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
    </div>
  );
};

export default SchoolManagement;