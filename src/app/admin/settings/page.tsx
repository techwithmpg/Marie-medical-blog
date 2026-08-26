import { type Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminSiteSettings } from "@/lib/admin/settings";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

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
      {/* Settings Workspace Header */}
      <div className="border-b border-subtle-divider pb-5">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
          Site Settings
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Configure site-wide publication identity, editorial positioning copy,
          reusable educational notices, and verified social channels.
        </p>
      </div>

      {/* Settings Editor Form */}
      <SiteSettingsForm initialSettings={settings} />
    </div>
  );
}
