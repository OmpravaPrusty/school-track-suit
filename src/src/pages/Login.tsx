import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Users, BookOpen, Shield, School } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const roleIcons = {
    admin: Shield,
    school_admin: School,
    teacher: GraduationCap,
    sme: BookOpen,
    student: Users,
  };

  const dummyCredentials = {
    admin: { email: "admin@school.com", password: "admin123" },
    school_admin: { email: "schooladmin@school.com", password: "schooladmin123" },
    teacher: { email: "teacher@school.com", password: "teacher123" },
    sme: { email: "sme@school.com", password: "sme123" },
    student: { email: "student@school.com", password: "student123" },
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Check credentials for selected role
    const roleCredentials = dummyCredentials[role as keyof typeof dummyCredentials];
    if (email === roleCredentials?.email && password === roleCredentials?.password) {
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", email);
      toast({
        title: "Login Successful",
        description: `Welcome ${role.replace('_', ' ').toUpperCase()}`,
      });
      
      // Navigate based on role
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "school_admin":
          navigate("/school-admin");
          break;
        case "teacher":
          navigate("/teacher");
          break;
        case "sme":
          navigate("/sme");
          break;
        case "student":
          navigate("/student");
          break;
        default:
          navigate("/");
      }
    } else {
      toast({
        title: "Invalid Credentials",
        description: "Please check your email, password, and role",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <Card className="w-full max-w-md shadow-[var(--shadow-elegant)] border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Ashwakalpam Portal</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all duration-300 focus:shadow-[var(--shadow-soft)]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="transition-all duration-300 focus:shadow-[var(--shadow-soft)]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="transition-all duration-300 focus:shadow-[var(--shadow-soft)]">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {Object.entries(roleIcons).map(([roleKey, Icon]) => (
                    <SelectItem key={roleKey} value={roleKey} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{roleKey.replace('_', ' ')}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-[var(--transition-smooth)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]"
            >
              Sign In
            </Button>
          </CardFooter>
        </form>
        
        {/* <div className="px-6 pb-6 space-y-2 text-center text-xs text-muted-foreground">
          <p className="font-medium">Demo Credentials:</p>
          <div className="grid grid-cols-1 gap-1">
            <p>Admin: admin@school.com / admin123</p>
            <p>School Admin: schooladmin@school.com / schooladmin123</p>
            <p>Teacher: teacher@school.com / teacher123</p>
            <p>SME: sme@school.com / sme123</p>
            <p>Student: student@school.com / student123</p>
          </div>
        </div> */}
      </Card>
    </div>
  );
};

export default Login;