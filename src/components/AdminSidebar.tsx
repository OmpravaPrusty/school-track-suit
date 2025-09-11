import {
  CalendarCheck,
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  School,
  VideoIcon,
  FileText,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navigationConfig = [
  {
    program: "Sankalp 90",
    icon: Layers,
    basePath: "/admin",
    subItems: [
      { title: "Attendance", url: "/admin/attendance", icon: CalendarCheck },
      { title: "Batches", url: "/admin/batches", icon: Layers },
      { title: "Teachers", url: "/admin/teachers", icon: BookOpen },
      { title: "SME", url: "/admin/sme", icon: GraduationCap },
      { title: "Students", url: "/admin/students", icon: Users },
      { title: "Schools", url: "/admin/schools", icon: School },
      { title: "Sessions", url: "/admin/sessions", icon: VideoIcon },
      { title: "Reports", url: "/admin/reports", icon: FileText },
    ],
  },
  {
    program: "Teacher CPD",
    icon: BookOpen,
    basePath: "/admin/programs/teacher-cpd",
    subItems: [],
  },
  {
    program: "Computing & AI",
    icon: GraduationCap,
    basePath: "/admin/programs/caci",
    subItems: [],
  },
];

const NavItem = ({ collapsed, item }: { collapsed: boolean, item: any }) => {
  const { isActive } = useIsActive(item.basePath || item.url);

  const linkContent = (
    <>
      <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
      {!collapsed && <span className="flex-1 text-left">{item.program || item.title}</span>}
    </>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton asChild className="h-12 rounded-lg">
            <NavLink
              to={item.basePath || item.url}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {linkContent}
            </NavLink>
          </SidebarMenuButton>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" className="bg-foreground text-background">
            {item.program || item.title}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const useIsActive = (path: string) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  return { isActive };
};

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [openAccordion, setOpenAccordion] = useState<string[]>([]);

  useEffect(() => {
    if (collapsed) {
      setOpenAccordion([]);
      return;
    }
    // Sort by path length descending to find the most specific match first.
    // This prevents a generic path like "/admin" from matching before a more specific
    // path like "/admin/programs/caci".
    const sortedConfig = [...navigationConfig].sort((a, b) => b.basePath.length - a.basePath.length);
    const activeProgram = sortedConfig.find(item => location.pathname.startsWith(item.basePath));

    if (activeProgram) {
      setOpenAccordion([activeProgram.program]);
    }
  }, [location.pathname, collapsed]);

  return (
    <Sidebar
      className={`border-r border-border bg-card text-foreground`}
    >
      <SidebarContent className="p-0">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-lg">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">Educational Management</p>
            </div>
          )}
        </div>

        <SidebarGroup className="py-4">
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              <Accordion
                type="multiple"
                value={openAccordion}
                onValueChange={setOpenAccordion}
                className="space-y-1"
              >
                {navigationConfig.map((item) => (
                  <SidebarMenuItem key={item.program} className="px-0">
                    {item.subItems && item.subItems.length > 0 ? (
                      <AccordionItem value={item.program} className="border-none">
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <AccordionTrigger
                                    className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-muted"
                                    >
                                    <item.icon className="h-5 w-5 flex-shrink-0 text-primary" />
                                    {!collapsed && <span className="flex-1 text-left font-semibold">{item.program}</span>}
                                    </AccordionTrigger>
                                </TooltipTrigger>
                                {collapsed && <TooltipContent side="right">{item.program}</TooltipContent>}
                            </Tooltip>
                        </TooltipProvider>

                        <AccordionContent className="ml-4 mt-2 space-y-1 border-l border-border pl-4">
                          {item.subItems.map((subItem) => (
                            <NavItem key={subItem.title} collapsed={collapsed} item={subItem} />
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <NavItem collapsed={collapsed} item={{...item, url: item.basePath}} />
                    )}
                  </SidebarMenuItem>
                ))}
              </Accordion>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}