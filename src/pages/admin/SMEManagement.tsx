import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Search, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const subjects = ['English', 'Math', 'BIO', 'PHY', 'CHEM', 'AI', 'CS'];

interface SME {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  employee_id: string;
  status: "active" | "inactive";
  sme_subjects: { subject: string }[];
  sme_batches: { batch_id: string }[];
}

interface Batch {
  id: string;
  name: string;
}

const SMEManagement = () => {
  const [smes, setSMEs] = useState<SME[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSME, setEditingSME] = useState<SME | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    employee_id: "",
    password: "",
    subject_names: [] as string[],
    batch_ids: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: smesData, error: smesError } = await supabase
        .from('smes')
        .select(`
          id,
          department,
          employee_id,
          profiles!inner (
            full_name,
            email,
            phone,
            status
          ),
          sme_subjects (
            subject
          ),
          sme_batches (
            batch_id
          )
        `);

      if (smesError) throw smesError;

      const { data: batchesData, error: batchesError } = await supabase
        .from('batches')
        .select('id, name');

      if (batchesError) throw batchesError;
      setBatches(batchesData || []);

      const formattedSMEs = smesData?.map(sme => ({
        id: sme.id,
        full_name: sme.profiles.full_name,
        email: sme.profiles.email,
        phone: sme.profiles.phone || '',
        department: sme.department || '',
        employee_id: sme.employee_id || '',
        status: sme.profiles.status as "active" | "inactive",
        sme_subjects: sme.sme_subjects,
        sme_batches: sme.sme_batches,
      })) || [];

      setSMEs(formattedSMEs);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || formData.subject_names.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select at least one subject.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSME) {
        // Update existing SME
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: formData.full_name, phone: formData.phone })
          .eq('id', editingSME.id);
        if (profileError) throw profileError;

        const { error: smeError } = await supabase
          .from('smes')
          .update({ department: formData.department, employee_id: formData.employee_id })
          .eq('id', editingSME.id);
        if (smeError) throw smeError;

        // Update subjects
        await supabase.from('sme_subjects').delete().eq('sme_id', editingSME.id);
        const subjectInsert = formData.subject_names.map(subject => ({ sme_id: editingSME.id, subject }));
        const { error: subjectError } = await supabase.from('sme_subjects').insert(subjectInsert);
        if (subjectError) throw subjectError;

        // Update batches
        await supabase.from('sme_batches').delete().eq('sme_id', editingSME.id);
        const batchInsert = formData.batch_ids.map(batch_id => ({ sme_id: editingSME.id, batch_id }));
        const { error: batchError } = await supabase.from('sme_batches').insert(batchInsert);
        if (batchError) throw batchError;

        toast({ title: "Success", description: "SME updated successfully" });
      } else {
        // Create new SME
        const password = formData.password || generateRandomPassword();
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: password,
          options: { data: { full_name: formData.full_name, phone: formData.phone } }
        });
        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        const smeId = authData.user.id;
        const { error: smeError } = await supabase
          .from('smes')
          .insert({ id: smeId, department: formData.department, employee_id: formData.employee_id });
        if (smeError) throw smeError;

        const { error: roleError } = await supabase.from('user_roles').insert({ user_id: smeId, role: 'sme' });
        if (roleError) throw roleError;

        const subjectInsert = formData.subject_names.map(subject => ({ sme_id: smeId, subject }));
        const { error: subjectError } = await supabase.from('sme_subjects').insert(subjectInsert);
        if (subjectError) throw subjectError;

        const batchInsert = formData.batch_ids.map(batch_id => ({ sme_id: smeId, batch_id }));
        const { error: batchError } = await supabase.from('sme_batches').insert(batchInsert);
        if (batchError) throw batchError;

        toast({ title: "Success", description: `SME created successfully. Password: ${password}` });
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error handling SME:', error);
      toast({ title: "Error", description: error.message || "Failed to process SME", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "", email: "", phone: "", department: "", employee_id: "", password: "",
      subject_names: [], batch_ids: []
    });
    setEditingSME(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (sme: SME) => {
    setEditingSME(sme);
    setFormData({
      full_name: sme.full_name,
      email: sme.email,
      phone: sme.phone,
      department: sme.department,
      employee_id: sme.employee_id,
      password: "",
      subject_names: sme.sme_subjects.map(s => s.subject),
      batch_ids: sme.sme_batches.map(b => b.batch_id),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('delete-user', { body: { userId: id } });
      if (error) throw error;
      toast({ title: "Success", description: "SME deleted successfully" });
      fetchData();
    } catch (error: any) {
      console.error('Error deleting SME:', error);
      toast({ title: "Error", description: "Failed to delete SME", variant: "destructive" });
    }
  };

  const filteredSMEs = smes.filter(sme =>
    sme.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sme.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sme.sme_subjects.some(s => s.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-secondary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">SME Management</h1>
          <p className="text-muted-foreground">Manage Subject Matter Experts and their expertise areas</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search SMEs by name, email, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add SME
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingSME ? "Edit SME" : "Add New SME"}</DialogTitle>
                <DialogDescription>Enter SME information, assign subjects, and batches.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Enter full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email address" required disabled={!!editingSME} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone number" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="Enter department" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input id="employee_id" value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} placeholder="Enter employee ID" />
                </div>
                {!editingSME && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password (leave empty for auto-generation)</Label>
                    <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter password or leave empty" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="space-y-3">
                  <Label className="font-semibold">Subjects *</Label>
                  <div className="grid grid-cols-2 gap-2 p-4 border rounded-md">
                    {subjects.map(subject => (
                      <div key={subject} className="flex items-center gap-2">
                        <Checkbox
                          id={`subject-${subject}`}
                          checked={formData.subject_names.includes(subject)}
                          onCheckedChange={(checked) => {
                            const newSubjects = checked
                              ? [...formData.subject_names, subject]
                              : formData.subject_names.filter(s => s !== subject);
                            setFormData({ ...formData, subject_names: newSubjects });
                          }}
                        />
                        <Label htmlFor={`subject-${subject}`} className="font-normal">{subject}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="font-semibold">Batches</Label>
                  <div className="p-4 border rounded-md max-h-48 overflow-y-auto">
                    {batches.map(batch => (
                      <div key={batch.id} className="flex items-center gap-2 mb-2">
                        <Checkbox
                          id={`batch-${batch.id}`}
                          checked={formData.batch_ids.includes(batch.id)}
                          onCheckedChange={(checked) => {
                            const newBatches = checked
                              ? [...formData.batch_ids, batch.id]
                              : formData.batch_ids.filter(b => b !== batch.id);
                            setFormData({ ...formData, batch_ids: newBatches });
                          }}
                        />
                        <Label htmlFor={`batch-${batch.id}`} className="font-normal">{batch.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit">{editingSME ? "Update" : "Add"} SME</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SME Directory</CardTitle>
          <CardDescription>Subject Matter Experts and their areas of expertise</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Batches</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSMEs.map((sme) => (
                <TableRow key={sme.id}>
                  <TableCell className="font-medium">{sme.full_name}</TableCell>
                  <TableCell>{sme.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {sme.sme_subjects.map(s => <Badge key={s.subject} variant="secondary">{s.subject}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {sme.sme_batches.map(b => (
                        <Badge key={b.batch_id} variant="outline">
                          {batches.find(batch => batch.id === b.batch_id)?.name || 'Deleted Batch'}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sme.status === "active" ? "default" : "secondary"}>
                      {sme.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(sme)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(sme.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredSMEs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No SMEs found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SMEManagement;