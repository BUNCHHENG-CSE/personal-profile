import { redirect } from "next/navigation";
import { admin } from "@/lib/security";
import { DashboardShell } from "@/components/dashboard-shell";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await admin())) redirect("/login");
  return <DashboardShell>{children}</DashboardShell>;
}
