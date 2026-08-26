import { type Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminCategories } from "@/lib/admin/articles";
import { getPublicProfile, getPublicSiteSettings } from "@/lib/public-data";
import { ArticleEditor } from "@/components/admin/editor/article-editor";

export const metadata: Metadata = {
  title: "New Article Draft | Marie Medere Workspace",
  description: "Compose a new medical article draft.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewArticleDraftPage() {
  await requireAdmin();

  // Load category options, public profile, and site settings concurrently for editorial classification and full-fidelity preview
  const [categories, profile, settings] = await Promise.all([
    getAdminCategories(),
    getPublicProfile(),
    getPublicSiteSettings(),
  ]);

  return (
    <ArticleEditor
      article={null}
      initialCategories={categories}
      initialReferences={[]}
      previewProfile={profile}
      previewDisclaimerText={settings.disclaimer_text}
    />
  );
}
