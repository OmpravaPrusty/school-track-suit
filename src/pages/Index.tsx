import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, UserCheck, Building } from "lucide-react";

const Index = () => {
  const dashboards = [
    {
      title: "Admin Dashboard",
      description: "System administration and management",
      icon: Users,
      path: "/admin",
      color: "text-blue-600"
    },
    {
      title: "Student Dashboard", 
      description: "Student portal for courses and attendance",
      icon: GraduationCap,
      path: "/student",
      color: "text-green-600"
    },
    {
      title: "Teacher Dashboard",
      description: "Teacher portal for managing classes",
      icon: BookOpen,
      path: "/teacher", 
      color: "text-purple-600"
    },
    {
      title: "SME Dashboard",
      description: "Subject Matter Expert portal",
      icon: UserCheck,
      path: "/sme",
      color: "text-orange-600"
    },
    {
      title: "School Admin Dashboard",
      description: "School administration portal", 
      icon: Building,
      path: "/school-admin",
      color: "text-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Educational Management System</h1>
          <p className="text-xl text-muted-foreground">Choose your role to access the dashboard</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {dashboards.map((dashboard) => (
            <Card key={dashboard.path} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <dashboard.icon className={`h-12 w-12 ${dashboard.color}`} />
                </div>
                <CardTitle>{dashboard.title}</CardTitle>
                <CardDescription>{dashboard.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={dashboard.path}>Access Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
