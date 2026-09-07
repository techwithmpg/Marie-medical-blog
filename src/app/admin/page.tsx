import { type Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminDashboardData } from "@/lib/admin/dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Marie Medere Workspace",
  description: "Editorial workspace and administrative overview.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  await requireAdmin();
  const data = await getAdminDashboardData();
  return <AdminDashboard {...data} />;
}
