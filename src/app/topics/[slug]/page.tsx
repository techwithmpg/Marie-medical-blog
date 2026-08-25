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
        `Published writing and educational articles in ${category.name} by Marie Medere.`,
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
  try {
    category = await getCategoryBySlug(slug);
  } catch {
    throw new Error("Unable to load topic category.");
  }

  if (!category) {
    notFound();
  }

  let listResult;
  let fetchError = false;

  try {
    listResult = await getPublishedArticles({
      topicSlug: slug,
      page: currentPage,
      pageSize: 6,
    });
  } catch {
    fetchError = true;
  }

  if (fetchError || !listResult) {
    return (
      <div className="space-y-12 sm:space-y-16">
        <PageIntro
          title={category.name}
          topicLabel="Topic Archive"
          deck={
            category.description ||
            `Published writing and educational articles in ${category.name}.`
          }
        />
        <div className="bg-reading-surface text-muted-ink rounded-lg border border-subtle-divider p-8 text-center text-sm">
          Unable to load published writing at this time. Please try again later.
        </div>
      </div>
    );
  }

  const { articles, totalCount, totalPages } = listResult;

  return (
    <div className="space-y-12 sm:space-y-16">
      <PageIntro
        title={category.name}
        topicLabel="Topic Archive"
        deck={
          category.description ||
          `Published writing and educational articles in ${category.name}.`
        }
      />

      <div className="space-y-6">
        {articles.length > 0 ? (
          <>
            <div className="flex items-center justify-between border-b border-subtle-divider pb-3">
              <h2 className="font-serif text-lg font-medium text-ink">
                Published Articles
              </h2>
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

            <div className="pt-6">
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
            description={`Published writing and educational articles in ${category.name} will appear here as content becomes available.`}
            actionLabel="View all articles"
            actionHref="/blog"
          />
        )}
      </div>
    </div>
  );
}
