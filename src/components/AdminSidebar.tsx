import { CalendarCheck, Users, GraduationCap, Layers, BookOpen, School, Building, VideoIcon, FileText ,FolderOpen, ChevronDown, ChevronRight} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const navigationItems = [
  {
    title: "Programs",
    url: "/admin/programs",
    icon: FolderOpen,
    subItems: [
      {
        title: "Sankalp 90",
        url: "/admin/attendance",
        description: "90-day skill development program"
      },
      {
        title: "Teacher CPD",
        url: "/admin/programs/teacher-cpd",
        description: "Continuous Professional Development"
      },
      {
        title: "CACI",
        url: "/admin/programs/caci",
        description: "Community and Civic Initiatives"
      }
    ]
  }
];

const sankalp90Items = [
  {
    title: "Attendance",
    url: "/admin/attendance",
    icon: CalendarCheck,
  },
  {
    title: "Batches",
    url: "/admin/batches",
    icon: Layers,
  },
  {
    title: "Teachers",
    url: "/admin/teachers",
    icon: BookOpen,
  },
  {
    title: "SME",
    url: "/admin/sme",
    icon: GraduationCap,
  },
  {
    title: "Students",
    url: "/admin/students",
    icon: Users,
  },
  {
    title: "Schools",
    url: "/admin/schools",
    icon: School,
  },
  // {
  //   title: "Organizations",
  //   url: "/admin/organizations",
  //   icon: Building,
  // },
  {
    title: "Sessions",
    url: "/admin/sessions",
    icon: VideoIcon,
  },
  {
    title: "Reports",
    url: "/admin/reports",
    icon: FileText,
  },
  // {
  //   title: "User Management",
  //   url: "/admin/user-management",
  //   icon: Users,
  // },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
    const location = useLocation();
  const [programsOpen, setProgramsOpen] = useState(true);

  // Check if we're in a Sankalp90 route to show those navigation items
  const isSankalp90Route = location.pathname.includes('/admin/attendance') || 
                           location.pathname.includes('/admin/batches') ||
                           location.pathname.includes('/admin/teachers') ||
                           location.pathname.includes('/admin/sme') ||
                           location.pathname.includes('/admin/students') ||
                           location.pathname.includes('/admin/schools') ||
                           location.pathname.includes('/admin/sessions') ||
                           location.pathname.includes('/admin/reports');

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
                <h2 className="font-semibold text-sidebar-foreground">Admin Panel</h2>
                <p className="text-xs text-sidebar-foreground/70">Educational Management</p>
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
                   <Collapsible open={programsOpen && !collapsed} onOpenChange={setProgramsOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="h-12 rounded-lg">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground w-full">
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="flex-1">{item.title}</span>
                              {programsOpen ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </>
                          )}
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {!collapsed && (
                      <CollapsibleContent className="ml-6 mt-2 space-y-1">
                        {item.subItems?.map((subItem) => (
                          <SidebarMenuButton key={subItem.title} asChild className="h-10 rounded-lg">
                            <NavLink
                              to={subItem.url}
                              className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                  isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                }`
                              }
                            >
                              <span>{subItem.title}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        ))}
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                </SidebarMenuItem>
              ))}
              
              {/* Show Sankalp90 specific navigation when in those routes */}
              {isSankalp90Route && !collapsed && (
                <>
                  <div className="my-4 px-3">
                    <div className="h-px bg-sidebar-border"></div>
                  </div>
                  <div className="px-3 mb-2">
                    <span className="text-xs font-medium text-sidebar-foreground/70">Sankalp 90 Management</span>
                  </div>
                  {sankalp90Items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="h-12 rounded-lg">
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            }`
                          }
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}