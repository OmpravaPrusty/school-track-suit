import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, getUserRole } = useAuth();

  const redirectBasedOnRole = (role: string | null) => {
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
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { user, error } = await signIn(email, password);
      
      if (error || !user) {
        toast({
          title: "Login Failed",
          description: error?.message || "An unknown error occurred.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting...",
        });
        
        // Get user role and redirect
        const role = await getUserRole(user.id);
        redirectBasedOnRole(role);
      }
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        
        <Tabs defaultValue="signin" className="w-full">
          {/* <TabsList className="w-full grid-cols-1"> */}
          {/* <TabsList className="grid w-full grid-cols-2"> */}
            {/* <TabsTrigger value="signin">Sign In</TabsTrigger> */}
            {/* <TabsTrigger value="signup">Sign Up</TabsTrigger> */}
          {/* </TabsList> */}
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="transition-all duration-300 focus:shadow-[var(--shadow-soft)] focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <Button variant="link" type="button" className="h-auto p-0 text-xs" asChild>
                      <Link to="/forgot-password">Forgot password?</Link>
                    </Button>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="transition-all duration-300 focus:shadow-[var(--shadow-soft)] focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-[var(--transition-smooth)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground text-center">
                  New user accounts are created by administrators. 
                  Please contact your admin if you need access.
                </p>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
        
        <div className="px-6 pb-6 space-y-2 text-center text-xs text-muted-foreground">
          {/* <p className="font-medium">Need to set up the system?</p> */}
          {/* <Button variant="link" className="h-auto p-0 text-xs" asChild>
            <Link to="/admin-setup">Create Admin Account</Link>
          </Button> */}
        </div>
      </Card>
    </div>
  );
};

export default Auth;