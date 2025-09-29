import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap } from "lucide-react";

const AdminSetup = () => {
  const [email, setEmail] = useState("admin@school.com");
  const [password, setPassword] = useState("admin123");
  const [fullName, setFullName] = useState("System Administrator");
  const [phone, setPhone] = useState("+91-9876543210");
  const [creating, setCreating] = useState(false);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      // Create admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          data: {
            full_name: fullName,
            phone
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Sign in immediately after signup
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        // Create profile (trigger should handle this, but ensure it exists)
        await supabase
          .from('profiles')
          .upsert([{
            id: authData.user.id,
            email,
            full_name: fullName,
            phone: phone || null
          }], { 
            onConflict: 'id'
          });

        // Assign admin role
        await supabase
          .from('user_roles')
          .upsert([{
            user_id: authData.user.id,
            role: 'admin' as const
          }], {
            onConflict: 'user_id,role'
          });

        toast({
          title: "Admin Created Successfully",
          description: "Welcome! Redirecting to admin dashboard...",
        });

        // Force page reload to ensure auth state is updated properly
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to create admin user",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <Card className="w-full max-w-md shadow-[var(--shadow-elegant)] border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Setup</CardTitle>
          <CardDescription className="text-muted-foreground">
            Create the first admin user for your education portal
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleCreateAdmin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="transition-all duration-300 focus:shadow-[var(--shadow-soft)]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all duration-300 focus:shadow-[var(--shadow-soft)]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="transition-all duration-300 focus:shadow-[var(--shadow-soft)]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="transition-all duration-300 focus:shadow-[var(--shadow-soft)]"
              />
            </div>
          </CardContent>
          
          <CardContent>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-[var(--transition-smooth)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]"
              disabled={creating}
            >
              {creating ? "Creating Admin..." : "Create Admin User"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default AdminSetup;