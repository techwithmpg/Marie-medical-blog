import { type Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminSiteSettings } from "@/lib/admin/settings";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const metadata: Metadata = {
  title: "Settings | Marie Medere Workspace",
  description:
    "Manage publication identity, editorial notices, and verified social links.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  const settings = await getAdminSiteSettings();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Site Settings"
        description="Configure site-wide publication identity, editorial positioning copy, reusable educational notices, and verified social channels."
      />

      {/* Settings Editor Form */}
      <SiteSettingsForm initialSettings={settings} />
    </div>
  );
}
