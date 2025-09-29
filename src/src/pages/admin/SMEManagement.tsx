import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Search, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { formatNameToTitleCase } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const subjects = ["English", "Math", "BIO", "PHY", "CHEM", "AI", "CS"];

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
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedSME, setSelectedSME] = useState<SME | null>(null);
  const [statusChangeReason, setStatusChangeReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalSMEs, setTotalSMEs] = useState(0);
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const SMES_PER_PAGE = 10;
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
    fetchData(currentPage);
  }, [currentPage]);

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const from = page * SMES_PER_PAGE;
      const to = from + SMES_PER_PAGE - 1;

      const {
        data: smesData,
        error: smesError,
        count: smeCount,
      } = await supabase
        .from("smes")
        .select(
          `
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
        `,
          { count: "exact" }
        )
        .range(from, to);

      if (smesError) throw smesError;

      const { data: batchesData, error: batchesError } = await supabase
        .from("batches")
        .select("id, name");

      if (batchesError) throw batchesError;
      setBatches(batchesData || []);

      const formattedSMEs =
        smesData?.map((sme) => ({
          id: sme.id,
          full_name: sme.profiles.full_name,
          email: sme.profiles.email,
          phone: sme.profiles.phone || "",
          department: sme.department || "",
          employee_id: sme.employee_id || "",
          status: sme.profiles.status as "active" | "inactive",
          sme_subjects: sme.sme_subjects,
          sme_batches: sme.sme_batches,
        })) || [];

      setSMEs(formattedSMEs);
      setTotalSMEs(smeCount || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
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

    if (
      !formData.full_name ||
      !formData.email ||
      formData.subject_names.length === 0
    ) {
      toast({
        title: "Error",
        description:
          "Please fill in all required fields and select at least one subject.",
        variant: "destructive",
      });
      return;
    }

    // Email validation: check for valid email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description:
          "Please enter a valid email address (e.g., user@example.com).",
        variant: "destructive",
      });
      return;
    }

    // Additional email validation checks
    if (formData.email.length > 254) {
      toast({
        title: "Invalid Email",
        description: "Email address is too long (maximum 254 characters).",
        variant: "destructive",
      });
      return;
    }

    // Check for common invalid patterns
    if (
      formData.email.includes("..") ||
      formData.email.startsWith(".") ||
      formData.email.endsWith(".") ||
      formData.email.includes("@.") ||
      formData.email.includes(".@")
    ) {
      toast({
        title: "Invalid Email",
        description: "Email address contains invalid characters or patterns.",
        variant: "destructive",
      });
      return;
    }

    // Phone validation: only numbers, exactly 10 digits
    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/\D/g, "");
      if (phoneDigits.length !== 10) {
        toast({
          title: "Invalid Phone Number",
          description: "Phone number must be exactly 10 digits.",
          variant: "destructive",
        });
        return;
      }
      if (!/^\d{10}$/.test(phoneDigits)) {
        toast({
          title: "Invalid Phone Number",
          description: "Phone number must contain only numbers.",
          variant: "destructive",
        });
        return;
      }
      // Normalize phone to digits only
      formData.phone = phoneDigits;
    }

    try {
      if (editingSME) {
        // Update existing SME
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ full_name: formData.full_name, phone: formData.phone })
          .eq("id", editingSME.id);
        if (profileError) throw profileError;

        const { error: smeError } = await supabase
          .from("smes")
          .update({
            department: formData.department,
            employee_id: formData.employee_id,
          })
          .eq("id", editingSME.id);
        if (smeError) throw smeError;

        // Update subjects
        await supabase
          .from("sme_subjects")
          .delete()
          .eq("sme_id", editingSME.id);
        const subjectInsert = formData.subject_names.map((subject) => ({
          sme_id: editingSME.id,
          subject: subject as
            | "English"
            | "Math"
            | "BIO"
            | "PHY"
            | "CHEM"
            | "AI"
            | "CS",
        }));
        const { error: subjectError } = await supabase
          .from("sme_subjects")
          .insert(subjectInsert);
        if (subjectError) throw subjectError;

        // Update batches
        await supabase.from("sme_batches").delete().eq("sme_id", editingSME.id);
        const batchInsert = formData.batch_ids.map((batch_id) => ({
          sme_id: editingSME.id,
          batch_id,
        }));
        const { error: batchError } = await supabase
          .from("sme_batches")
          .insert(batchInsert);
        if (batchError) throw batchError;

        toast({ title: "Success", description: "SME updated successfully" });
      } else {
        // Create new SME
        const password = formData.password || generateRandomPassword();

        // Step 1: Create auth user with better error handling
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: formData.email,
            password: password,
            options: {
              data: { full_name: formData.full_name, phone: formData.phone },
            },
          }
        );

        if (authError) {
          console.error("Auth signup error:", authError);
          throw new Error(`Failed to create user: ${authError.message}`);
        }

        if (!authData.user) {
          throw new Error("Auth user was not created");
        }

        const smeId = authData.user.id;
        console.log("Created auth user with ID:", smeId);

        // Step 2: Verify auth user exists (optional verification step)
        const { data: authUser, error: authCheckError } =
          await supabase.auth.getUser();
        if (authCheckError) {
          console.warn("Could not verify auth user:", authCheckError);
        }

        // Step 3: Create profile with better error handling
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: smeId,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          status: "active",
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // If profile creation fails, we should clean up the auth user
          await supabase.auth.admin.deleteUser(smeId).catch(console.error);
          throw new Error(`Failed to create profile: ${profileError.message}`);
        }

        // Step 4: Now safe to create SME record
        const { error: smeError } = await supabase.from("smes").insert({
          id: smeId,
          department: formData.department,
          employee_id: formData.employee_id,
        });
        if (smeError) throw smeError;

        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: smeId, role: "sme" });
        if (roleError) throw roleError;

        const subjectInsert = formData.subject_names.map((subject) => ({
          sme_id: smeId,
          subject: subject as
            | "English"
            | "Math"
            | "BIO"
            | "PHY"
            | "CHEM"
            | "AI"
            | "CS",
        }));
        const { error: subjectError } = await supabase
          .from("sme_subjects")
          .insert(subjectInsert);
        if (subjectError) throw subjectError;

        const batchInsert = formData.batch_ids.map((batch_id) => ({
          sme_id: smeId,
          batch_id,
        }));
        const { error: batchError } = await supabase
          .from("sme_batches")
          .insert(batchInsert);
        if (batchError) throw batchError;

        toast({
          title: "Success",
          description: `SME created successfully. Password: ${password}`,
        });
      }

      resetForm();
      await fetchData(currentPage);
    } catch (error: any) {
      console.error("Error handling SME:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process SME",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      department: "",
      employee_id: "",
      password: "",
      subject_names: [],
      batch_ids: [],
    });
    setEditingSME(null);
    setIsDialogOpen(false);
    // await fetchData(currentPage);
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
      subject_names: sme.sme_subjects.map((s) => s.subject),
      batch_ids: sme.sme_batches.map((b) => b.batch_id),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId: id },
      });
      if (error) throw error;
      toast({ title: "Success", description: "SME deleted successfully" });
      fetchData(currentPage);
    } catch (error: any) {
      console.error("Error deleting SME:", error);
      toast({
        title: "Error",
        description: "Failed to delete SME",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async () => {
    if (!selectedSME) return;
    const newStatus = selectedSME.status === "active" ? "inactive" : "active";
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus, status_reason: statusChangeReason })
        .eq("id", selectedSME.id);

      if (error) throw error;

      setSMEs((prevSMEs) =>
        prevSMEs.map((s) =>
          s.id === selectedSME.id ? { ...s, status: newStatus } : s
        )
      );

      toast({
        title: "Status Updated",
        description: `${selectedSME.full_name}'s status has been updated to ${newStatus}.`,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsStatusDialogOpen(false);
      setStatusChangeReason("");
      setSelectedSME(null);
    }
  };

  const openStatusDialog = (sme: SME) => {
    setSelectedSME(sme);
    setIsStatusDialogOpen(true);
  };

  const filteredSMEs = smes
    .filter((sme) => {
      const searchMatch =
        searchTerm === "" ||
        sme.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sme.email.toLowerCase().includes(searchTerm.toLowerCase());

      const batchMatch =
        selectedBatch === "all" ||
        sme.sme_batches.some((b) => b.batch_id === selectedBatch);

      const subjectMatch =
        selectedSubject === "all" ||
        sme.sme_subjects.some((s) => s.subject === selectedSubject);

      return searchMatch && batchMatch && subjectMatch;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.full_name.localeCompare(b.full_name);
      } else {
        return b.full_name.localeCompare(a.full_name);
      }
    });

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
          <p className="text-muted-foreground">
            Manage Subject Matter Experts and their expertise areas
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-2 flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search SMEs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            Sort {sortOrder === "asc" ? "A-Z" : "Z-A"}
          </Button>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) resetForm();
            else setIsDialogOpen(true);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add SME
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSME ? "Edit SME" : "Add New SME"}
                </DialogTitle>
                <DialogDescription>
                  Enter SME information, assign subjects, and batches.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        full_name: formatNameToTitleCase(e.target.value),
                      })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    placeholder="Enter department"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_id: e.target.value })
                    }
                    placeholder="Enter employee ID"
                  />
                </div>
                {!editingSME && (
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password (leave empty for auto-generation)
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Enter password or leave empty"
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="space-y-3">
                  <Label className="font-semibold">Subjects *</Label>
                  <div className="grid grid-cols-2 gap-2 p-4 border rounded-md">
                    {subjects.map((subject) => (
                      <div key={subject} className="flex items-center gap-2">
                        <Checkbox
                          id={`subject-${subject}`}
                          checked={formData.subject_names.includes(subject)}
                          onCheckedChange={(checked) => {
                            const newSubjects = checked
                              ? [...formData.subject_names, subject]
                              : formData.subject_names.filter(
                                  (s) => s !== subject
                                );
                            setFormData({
                              ...formData,
                              subject_names: newSubjects,
                            });
                          }}
                        />
                        <Label
                          htmlFor={`subject-${subject}`}
                          className="font-normal"
                        >
                          {subject}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="font-semibold">Batches</Label>
                  <div className="p-4 border rounded-md max-h-48 overflow-y-auto">
                    {batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="flex items-center gap-2 mb-2"
                      >
                        <Checkbox
                          id={`batch-${batch.id}`}
                          checked={formData.batch_ids.includes(batch.id)}
                          onCheckedChange={(checked) => {
                            const newBatches = checked
                              ? [...formData.batch_ids, batch.id]
                              : formData.batch_ids.filter(
                                  (b) => b !== batch.id
                                );
                            setFormData({ ...formData, batch_ids: newBatches });
                          }}
                        />
                        <Label
                          htmlFor={`batch-${batch.id}`}
                          className="font-normal"
                        >
                          {batch.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
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
          <CardDescription>
            Subject Matter Experts and their areas of expertise
          </CardDescription>
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
                  <TableCell className="font-medium">
                    {formatNameToTitleCase(sme.full_name)}
                  </TableCell>
                  <TableCell>{sme.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {sme.sme_subjects.map((s) => (
                        <Badge key={s.subject} variant="secondary">
                          {s.subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {sme.sme_batches.map((b) => (
                        <Badge key={b.batch_id} variant="outline">
                          {batches.find((batch) => batch.id === b.batch_id)
                            ?.name || "Deleted Batch"}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <Switch
                        checked={sme.status === "active"}
                        onCheckedChange={() => openStatusDialog(sme)}
                        aria-label="Toggle SME status"
                      />
                      <Badge
                        variant={
                          sme.status === "active" ? "default" : "secondary"
                        }
                        className="text-xs capitalize"
                      >
                        {sme.status}
                      </Badge>
                    </div>
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
                              permanently delete this SME and all their
                              associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(sme.id)}
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
          {filteredSMEs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No SMEs found
            </div>
          )}
        </CardContent>
        <div className="flex justify-between items-center p-4 border-t">
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {Math.ceil(totalSMEs / SMES_PER_PAGE)}
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
                  Math.min(prev + 1, Math.ceil(totalSMEs / SMES_PER_PAGE) - 1)
                )
              }
              disabled={(currentPage + 1) * SMES_PER_PAGE >= totalSMEs}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change SME Status</DialogTitle>
            <DialogDescription>
              You are changing the status for{" "}
              <span className="font-semibold">{selectedSME?.full_name}</span>.
              Please provide a reason for this change.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="status-reason">Reason for Status Change</Label>
            <Input
              id="status-reason"
              value={statusChangeReason}
              onChange={(e) => setStatusChangeReason(e.target.value)}
              placeholder="e.g., Left the organization, On sabbatical, etc."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusChange}>Confirm Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SMEManagement;
