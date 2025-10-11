"use client";

import { Suspense, type ComponentProps } from "react";
import {
  LayoutDashboard,
  Files,
  Settings2,
  MonitorSmartphone,
  Palette,
  Users2,
  Command,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/layout/nav-main";
import { NavProjects } from "@/components/layout/nav-projects";
import { NavUser } from "@/components/layout/nav-user";
import { TeamSwitcher } from "@/components/layout/team-switcher";

const navConfig = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: "layout-dashboard",
      isActive: true,
      items: [
        { title: "Overview", url: "/" },
        { title: "Analytics", url: "/analytics" },
        { title: "Projects", url: "/projects" },
      ],
    },
    {
      title: "Content",
      url: "/dashboard/content",
      icon: "files",
      items: [
        { title: "Posts", url: "/content/posts" },
        { title: "Gallery", url: "/content/gallery" },
        { title: "Testimonials", url: "/content/testimonials" },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: "settings",
      items: [
        { title: "Profile", url: "/settings/profile" },
        { title: "Team", url: "/settings/team" },
        { title: "Billing", url: "/settings/billing" },
      ],
    },
  ],
  projects: [
    { name: "Portfolio Website", url: "/projects/portfolio", icon: "monitor" },
    { name: "Brand Assets", url: "/projects/brand", icon: "palette" },
    { name: "Client Feedback", url: "/projects/clients", icon: "users" },
  ],
  teams: [
    { name: "Muzarde Studio", logo: "/images/logo.png", plan: "Pro" },
    { name: "Creative Lab", logo: "/images/logo.png", plan: "Collaborator" },
  ],
};

const navIconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  files: Files,
  settings: Settings2,
  monitor: MonitorSmartphone,
  palette: Palette,
  users: Users2,
  command: Command,
  sparkles: Sparkles,
};

const AppSidebarSkeleton = () => (
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <div className="h-10 w-full animate-pulse rounded bg-muted" />
    </SidebarHeader>
    <SidebarContent>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 p-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_item, j) => (
                <div key={j} className="h-3 w-full animate-pulse rounded bg-muted/70" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </SidebarContent>
    <SidebarFooter>
      <div className="h-12 w-full animate-pulse rounded bg-muted" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
);

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
  user?: {
    name?: string | null;
    picture?: string | null;
    email?: string | null;
  } | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const userDisplay = {
    name: user?.name ?? "Admin",
    email: user?.email ?? "admin@example.com",
    avatar: user?.picture ?? "",
  };

  const navMainWithIcons = navConfig.navMain.map((item) => ({
    ...item,
    icon: navIconMap[item.icon] ?? navIconMap["layout-dashboard"],
  }));

  const projectsWithIcons = navConfig.projects.map((project) => ({
    ...project,
    icon: navIconMap[project.icon] ?? navIconMap["monitor"],
  }));

  return (
    <Suspense fallback={<AppSidebarSkeleton />}>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={navConfig.teams} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={navMainWithIcons} />
          <NavProjects projects={projectsWithIcons} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={userDisplay} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </Suspense>
  );
}
