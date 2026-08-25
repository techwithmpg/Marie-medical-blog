import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageIntro } from "@/components/public/page-intro";
import { ArticleListItem } from "@/components/public/article-list-item";
import { PaginationControls } from "@/components/public/pagination-controls";
import { EmptyEditorialState } from "@/components/public/empty-editorial-state";
import { getCategoryBySlug, getPublishedArticles } from "@/lib/public-articles";

interface TopicPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await getCategoryBySlug(slug);
    if (!category) {
      return {
        title: "Topic Not Found | Marie Medere",
      };
    }

    return {
      title: `${category.name} | Topics | Marie Medere`,
      description:
        category.description ||
        `Published medical writing and educational articles in ${category.name} by Marie Medere.`,
    };
  } catch {
    return {
      title: "Topics | Marie Medere",
    };
  }
}

export default async function TopicDetailPage({
  params,
  searchParams,
}: TopicPageProps) {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const parsedPage = parseInt(rawPage || "1", 10);
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  let category;
  let listResult;

  try {
    category = await getCategoryBySlug(slug);
    if (!category) {
      notFound();
    }

    listResult = await getPublishedArticles({
      topicSlug: slug,
      page: currentPage,
      pageSize: 6,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest: string }).digest === "string" &&
      (error as { digest: string }).digest.includes("NEXT_NOT_FOUND")
    ) {
      throw error;
    }

    throw error;
  }

  const { articles, totalCount, totalPages } = listResult;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <PageIntro
        title={category.name}
        topicLabel="Topic Archive"
        deck={
          category.description ||
          `Published medical writing, clinical samples, and educational resources in ${category.name}.`
        }
      />

      <div className="mt-12 space-y-6">
        {articles.length > 0 ? (
          <>
            <div className="flex items-center justify-between border-b border-subtle-divider pb-3">
              <span className="font-serif text-lg font-medium text-ink">
                Published Articles
              </span>
              <span className="text-muted-ink text-xs">
                Showing {articles.length} of {totalCount}
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              {articles.map((article, index) => (
                <ArticleListItem
                  key={article.id}
                  article={article}
                  index={(currentPage - 1) * 6 + index}
                />
              ))}
            </div>

            <div className="mt-12">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                basePath={`/topics/${slug}`}
              />
            </div>
          </>
        ) : (
          <EmptyEditorialState
            title="No published articles in this topic yet"
            description={`Articles under ${category.name} will appear here as they are published.`}
            actionLabel="View all articles"
            actionHref="/blog"
          />
        )}
      </div>
    </main>
  );
}
