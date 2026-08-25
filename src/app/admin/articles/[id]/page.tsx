import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getAdminArticleById,
  getAdminCategories,
  getAdminArticleReferences,
} from "@/lib/admin/articles";
import { ArticleEditor } from "@/components/admin/editor/article-editor";
import { ReadOnlyArticleView } from "@/components/admin/editor/read-only-article-view";

export const metadata: Metadata = {
  title: "Edit Article Draft | Marie Medere Workspace",
  description: "Edit article draft in Evidence Folio workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminArticleDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminArticleDetailPage({
  params,
}: AdminArticleDetailPageProps) {
  await requireAdmin();

  const resolvedParams = await params;
  const articleId = resolvedParams.id;

  // Concurrent data loading
  const [article, categories, references] = await Promise.all([
    getAdminArticleById(articleId),
    getAdminCategories(),
    getAdminArticleReferences(articleId),
  ]);

  if (!article) {
    notFound();
  }

  // If the article is published or archived, render the read-only view in Stage 7
  if (article.status !== "draft") {
    const category =
      categories.find((c) => c.id === article.category_id) || null;

    return (
      <ReadOnlyArticleView
        article={article}
        category={category}
        references={references}
      />
    );
  }

  // Otherwise render the full editing workspace
  return (
    <ArticleEditor
      article={article}
      initialCategories={categories}
      initialReferences={references}
    />
  );
}
