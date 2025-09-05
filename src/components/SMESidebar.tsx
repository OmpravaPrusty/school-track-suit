import { Home, Users, BookOpen, Bell, UserCheck, GraduationCap, FilePenLine } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/sme",
    icon: Home,
  },
  {
    title: "Sessions",
    url: "/sme/sessions",
    icon: Users,
  },
  {
    title: "Students",
    url: "/sme/students",
    icon: UserCheck,
  },
  {
    title: "Teachers",
    url: "/sme/teachers",
    icon: GraduationCap,
  },
  {
    title: "Assign Courses",
    url: "/sme/assign-courses",
    icon: BookOpen,
  },
  {
    title: "My Attendance",
    url: "/sme/attendance",
    icon: UserCheck,
  },
  {
    title: "Assessment",
    url: "/sme/assessment",
    icon: FilePenLine,
  },
  {
    title: "Notifications",
    url: "/sme/notifications",
    icon: Bell,
  },
];

export function SMESidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r border-sidebar-border bg-sidebar`}
    >
      <SidebarContent className="p-0">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-sidebar-foreground">SME Portal</h2>
                <p className="text-xs text-sidebar-foreground/70">Subject Matter Expert</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-sidebar-foreground/70 font-medium">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12 rounded-lg">
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-[var(--transition-smooth)] ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-[var(--shadow-card)]"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}