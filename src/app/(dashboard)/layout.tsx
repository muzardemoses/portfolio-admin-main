import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Portfolio Admin",
  description: "Secure administration area for the Muzarde portfolio.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
