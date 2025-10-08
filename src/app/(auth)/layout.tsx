import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth | Portfolio Dashboard",
  description: "Authentication routes for the Muzarde portfolio dashboard.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
