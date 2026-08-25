import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getAdminArticleById,
  getAdminCategories,
  getAdminArticleReferences,
} from "@/lib/admin/articles";
import { ArticleEditor } from "@/components/admin/editor/article-editor";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata: Metadata = {
  title: "Edit Article | Marie Medere Workspace",
  description: "Edit article in Evidence Folio publishing workspace.",
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

  // Validate route ID format prior to database query
  if (!articleId || !UUID_REGEX.test(articleId)) {
    notFound();
  }

  // Concurrent data loading
  const [article, categories, references] = await Promise.all([
    getAdminArticleById(articleId),
    getAdminCategories(),
    getAdminArticleReferences(articleId),
  ]);

  if (!article) {
    notFound();
  }

  // Render the full Stage 8 editing and lifecycle workspace
  return (
    <ArticleEditor
      article={article}
      initialCategories={categories}
      initialReferences={references}
    />
  );
}
