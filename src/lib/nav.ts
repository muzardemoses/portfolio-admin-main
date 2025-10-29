export type NavMainItem = {
  title: string;
  url: string;
  icon: string;
  isActive?: boolean;
  items?: { title: string; url: string }[];
};

export type NavProjectItem = {
  name: string;
  url: string;
  icon: string;
};

// do not change this file, the dashboard is "/" not "/dashboard"
export const navConfig: {
  navMain: NavMainItem[];
  projects: NavProjectItem[];
  teams: { name: string; logo: string; plan: string }[];
} = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: "layout-dashboard",
      isActive: true,
      items: [
        { title: "Overview", url: "/" },
        { title: "Analytics", url: "/analytics" },
      ],
    },
    {
      title: "Content",
      url: "/content",
      icon: "files",
      items: [
        { title: "Posts", url: "/content/posts" },
        { title: "Gallery", url: "/content/gallery" },
        { title: "Testimonials", url: "/content/testimonials" },
      ],
    },
    {
      title: "Projects",
      url: "/projects",
      icon: "folder-kanban",
      items: [
        { title: "All Projects", url: "/projects" },
        { title: "Add Project", url: "/projects/add" },
        { title: "Inactive Projects", url: "/projects/inactive" },
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
    { name: "Brand Assets", url: "/projects/brand-assets", icon: "palette" },
    { name: "Client Feedback", url: "/projects/client-feedback", icon: "users" },
  ],
  teams: [
    { name: "Muzarde Studio", logo: "/images/logo.png", plan: "Pro" },
    { name: "Creative Lab", logo: "/images/logo.png", plan: "Collaborator" },
  ],
};

type BreadcrumbNode = {
  title: string;
  url: string;
  children?: BreadcrumbNode[];
};

export const breadcrumbTree: BreadcrumbNode[] = [
  ...navConfig.navMain.map((item) => ({
    title: item.title,
    url: item.url,
    children:
      item.items?.map((sub) => ({
        title: sub.title,
        url: sub.url,
      })) ?? [],
  })),
  {
    title: "Projects",
    url: "/dashboard/projects",
    children: navConfig.projects.map((project) => ({
      title: project.name,
      url: project.url,
    })),
  },
];
