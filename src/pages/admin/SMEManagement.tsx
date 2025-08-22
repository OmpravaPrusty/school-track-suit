import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

interface SME {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  bio: string;
  experience_years: number;
  status: "active" | "inactive";
}

const SMEManagement = () => {
  const [smes, setSMEs] = useState<SME[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSME, setEditingSME] = useState<SME | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    bio: "",
    experience_years: "",
    password: "",
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
      
      // Fetch SMEs with their profiles
      const { data: smesData, error: smesError } = await supabase
        .from('smes')
        .select(`
          id,
          specialization,
          bio,
          experience_years,
          profiles!inner (
            full_name,
            email,
            phone,
            status
          )
        `);

      if (smesError) throw smesError;

      const formattedSMEs = smesData?.map(sme => ({
        id: sme.id,
        full_name: sme.profiles.full_name,
        email: sme.profiles.email,
        phone: sme.profiles.phone || '',
        specialization: sme.specialization || '',
        bio: sme.bio || '',
        experience_years: sme.experience_years || 0,
        status: sme.profiles.status as "active" | "inactive",
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
    
    if (!formData.full_name || !formData.email || !formData.specialization) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSME) {
        // Update existing SME
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
          })
          .eq('id', editingSME.id);

        if (profileError) throw profileError;

        const { error: smeError } = await supabase
          .from('smes')
          .update({
            specialization: formData.specialization,
            bio: formData.bio,
            experience_years: parseInt(formData.experience_years) || 0,
          })
          .eq('id', editingSME.id);

        if (smeError) throw smeError;

        toast({
          title: "Success",
          description: "SME updated successfully",
        });
      } else {
        // Create new SME
        const password = formData.password || generateRandomPassword();

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: password,
          options: {
            data: {
              full_name: formData.full_name,
              phone: formData.phone,
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        // Insert SME record
        const { error: smeError } = await supabase
          .from('smes')
          .insert({
            id: authData.user.id,
            specialization: formData.specialization,
            bio: formData.bio,
            experience_years: parseInt(formData.experience_years) || 0,
          });

        if (smeError) throw smeError;

        // Assign SME role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'sme',
          });

        if (roleError) throw roleError;

        toast({
          title: "Success",
          description: `SME created successfully. Password: ${password}`,
        });
      }

      resetForm();
      fetchData(); // Refresh the data
    } catch (error: any) {
      console.error('Error creating SME:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create SME",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      specialization: "",
      bio: "",
      experience_years: "",
      password: "",
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
      specialization: sme.specialization,
      bio: sme.bio,
      experience_years: sme.experience_years.toString(),
      password: "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('smes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "SME deleted successfully",
      });
      
      fetchData(); // Refresh the data
    } catch (error: any) {
      console.error('Error deleting SME:', error);
      toast({
        title: "Error",
        description: "Failed to delete SME",
        variant: "destructive",
      });
    }
  };

  const filteredSMEs = smes.filter(sme =>
    sme.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sme.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sme.specialization.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add SME
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSME ? "Edit SME" : "Add New SME"}
                </DialogTitle>
                <DialogDescription>
                  Enter SME information and expertise details
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                    disabled={!!editingSME}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Experience (years)</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    placeholder="Years of experience"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Area of expertise"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief bio and background"
                    rows={3}
                  />
                </div>
                {!editingSME && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="password">Password (leave empty for auto-generation)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password or leave empty"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSME ? "Update" : "Add"} SME
                </Button>
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
                <TableHead>Phone</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSMEs.map((sme) => (
                <TableRow key={sme.id}>
                  <TableCell className="font-medium">{sme.full_name}</TableCell>
                  <TableCell>{sme.email}</TableCell>
                  <TableCell>{sme.phone}</TableCell>
                  <TableCell>{sme.specialization}</TableCell>
                  <TableCell>{sme.experience_years} years</TableCell>
                  <TableCell>
                    <Badge variant={sme.status === "active" ? "default" : "secondary"}>
                      {sme.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(sme)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(sme.id)}
                      >
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