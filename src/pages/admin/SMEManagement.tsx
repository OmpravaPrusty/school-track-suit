import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Plus, Edit2, Trash2, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SME {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  employee_id: string;
  bio: string;
  experience_years: number;
  status: "active" | "inactive";
}

interface Batch {
  id: string;
  name: string;
}

const SMEManagement = () => {
  const [smes, setSMEs] = useState<SME[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSME, setEditingSME] = useState<SME | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    employee_id: "",
    bio: "",
    experience_years: 0,
    batch_ids: [] as string[],
  });

  useEffect(() => {
    fetchSMEs();
  }, []);

  const fetchSMEs = async () => {
    try {
      setLoading(true);

      const { data: smesData, error: smesError } = await supabase
        .from('smes')
        .select(`
          id,
          bio,
          experience_years,
          created_at,
          updated_at,
          profiles:id (
            full_name,
            email,
            phone,
            status
          )
        `);

      if (smesError) {
        console.error('Query error:', smesError);
        throw smesError;
      }

      const { data: batchesData, error: batchesError } = await supabase
        .from('batches')
        .select('id, name');

      if (batchesError) throw batchesError;
      setBatches(batchesData || []);

      const formattedSMEs = smesData?.map(sme => ({
        id: sme.id,
        full_name: sme.profiles?.full_name || '',
        email: sme.profiles?.email || '',
        phone: sme.profiles?.phone || '',
        employee_id: '', // Not available in current schema
        bio: sme.bio || '',
        experience_years: sme.experience_years || 0,
        status: (sme.profiles?.status as "active" | "inactive") || "active",
      })) || [];

      setSMEs(formattedSMEs);
    } catch (error) {
      console.error('Error fetching SMEs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch SMEs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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
          .update({ 
            bio: formData.bio,
            experience_years: formData.experience_years
          })
          .eq('id', editingSME.id);
        if (smeError) throw smeError;

        toast({ title: "Success", description: "SME updated successfully" });
      } else {
        // Create new SME - simplified version since sme_subjects and sme_batches tables aren't accessible
        toast({ 
          title: "Info", 
          description: "SME creation functionality needs to be implemented with proper authentication flow" 
        });
      }

      setIsDialogOpen(false);
      setEditingSME(null);
      resetForm();
      fetchSMEs();
    } catch (error: any) {
      console.error('Error saving SME:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save SME",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (sme: SME) => {
    setEditingSME(sme);
    setFormData({
      full_name: sme.full_name,
      email: sme.email,
      phone: sme.phone,
      employee_id: sme.employee_id,
      bio: sme.bio,
      experience_years: sme.experience_years,
      batch_ids: [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (sme: SME) => {
    if (!confirm('Are you sure you want to delete this SME?')) return;

    try {
      const { error } = await supabase
        .from('smes')
        .delete()
        .eq('id', sme.id);

      if (error) throw error;

      toast({ title: "Success", description: "SME deleted successfully" });
      fetchSMEs();
    } catch (error: any) {
      console.error('Error deleting SME:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete SME",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      employee_id: "",
      bio: "",
      experience_years: 0,
      batch_ids: [],
    });
  };

  const openCreateDialog = () => {
    setEditingSME(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading SMEs...</div>
      </div>
    );
  }

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add SME
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSME ? 'Edit SME' : 'Add New SME'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!editingSME}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="experience_years">Experience (Years)</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingSME ? 'Update' : 'Create'} SME
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject Matter Experts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {smes.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No SMEs found. Add your first SME to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {smes.map((sme) => (
                  <Card key={sme.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{sme.full_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{sme.email}</p>
                        </div>
                        <Badge variant={sme.status === 'active' ? 'default' : 'secondary'}>
                          {sme.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>Employee ID:</strong> {sme.employee_id}</p>
                        <p><strong>Phone:</strong> {sme.phone}</p>
                        <p><strong>Experience:</strong> {sme.experience_years} years</p>
                        {sme.bio && <p><strong>Bio:</strong> {sme.bio}</p>}
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(sme)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(sme)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMEManagement;