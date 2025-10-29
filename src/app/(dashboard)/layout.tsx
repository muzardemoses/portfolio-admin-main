import type { Metadata } from "next";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Header } from "@/components/layout/header";
import { getServerUser } from "@/config/getServerUser";


export const metadata: Metadata = {
  title: "Dashboard | Portfolio Admin",
  description: "Secure administration area for the Muzarde portfolio.",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getServerUser();

  return (
    <>
      <SidebarProvider>
        <AppSidebar
          user={{
            name: user?.name ?? null,
            email: user?.email ?? null,
            picture: user?.picture ?? null,
          }}
        />
        <SidebarInset>
          <Header />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
