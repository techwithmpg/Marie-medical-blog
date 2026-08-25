import { type Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminCategories } from "@/lib/admin/articles";
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

  // Load category options for editorial classification
  const categories = await getAdminCategories();

  return (
    <ArticleEditor
      article={null}
      initialCategories={categories}
      initialReferences={[]}
    />
  );
}
