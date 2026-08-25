import { Metadata } from "next";
import { PageIntro } from "@/components/public/page-intro";
import { TopicFilterBar } from "@/components/public/topic-filter-bar";
import { FeaturedArticle } from "@/components/public/featured-article";
import { ArticleListItem } from "@/components/public/article-list-item";
import { PaginationControls } from "@/components/public/pagination-controls";
import { EmptyEditorialState } from "@/components/public/empty-editorial-state";
import { getBlogViewData, getPublishedCategories } from "@/lib/public-articles";

export const metadata: Metadata = {
  title: "Articles | Marie Medere",
  description:
    "Explore peer-referenced medical communications, clinical writing samples, and educational healthcare analyses by Marie Medere.",
};

interface BlogPageProps {
  searchParams: Promise<{
    q?: string;
    topic?: string;
    page?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { q, topic, page: rawPage } = await searchParams;
  const parsedPage = parseInt(rawPage || "1", 10);
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  let blogData;
  let categories = [];

  try {
    const [fetchedData, fetchedCategories] = await Promise.all([
      getBlogViewData({
        page: currentPage,
        pageSize: 6,
        topicSlug: topic,
        searchQuery: q,
      }),
      getPublishedCategories(),
    ]);
    blogData = fetchedData;
    categories = fetchedCategories;
  } catch {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <PageIntro
          title="Articles"
          topicLabel="Editorial Archive"
          deck="Explore peer-referenced medical communications, clinical writing samples, and educational healthcare analyses."
        />
        <div className="bg-reading-surface text-muted-ink mt-12 rounded-lg border border-subtle-divider p-8 text-center text-sm">
          Unable to load articles at this time. Please try again later.
        </div>
      </main>
    );
  }

  const {
    leadArticle,
    isLeadExplicitlyFeatured,
    articles,
    totalCount,
    totalPages,
  } = blogData;

  const isFiltered = Boolean(q || topic);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <PageIntro
        title="Articles"
        topicLabel="Editorial Archive"
        deck="Explore peer-referenced medical communications, clinical writing samples, and educational healthcare analyses."
      />

      {/* Filter and Search Bar */}
      <div className="mt-10 mb-12">
        <TopicFilterBar
          categories={categories}
          activeTopicSlug={topic}
          activeSearchQuery={q}
        />
      </div>

      {/* Lead Story (Unfiltered Page 1 only) */}
      {leadArticle && (
        <div className="mb-12">
          <FeaturedArticle
            article={leadArticle}
            isExplicitlyFeatured={isLeadExplicitlyFeatured}
          />
        </div>
      )}

      {/* Main / Supporting Articles Grid */}
      {articles.length > 0 ? (
        <div className="space-y-6">
          {leadArticle && (
            <div className="flex items-center justify-between border-b border-subtle-divider pb-3">
              <span className="font-serif text-lg font-medium text-ink">
                Archive Entries
              </span>
              <span className="text-muted-ink text-xs">
                Showing {articles.length} of {totalCount}
              </span>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {articles.map((article, index) => (
              <ArticleListItem
                key={article.id}
                article={article}
                index={(currentPage - 1) * 6 + index + (leadArticle ? 1 : 0)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/blog"
              searchQuery={q}
              topicSlug={topic}
            />
          </div>
        </div>
      ) : (
        !leadArticle && (
          <div className="mt-8">
            {isFiltered ? (
              <EmptyEditorialState
                title="No matching articles found"
                description={
                  q
                    ? `No published articles matched your search for "${q}".`
                    : "No published articles found for this topic filter."
                }
                actionLabel="View all articles"
                actionHref="/blog"
              />
            ) : (
              <EmptyEditorialState
                title="No published articles yet"
                description="Educational articles, clinical writing samples, and health literacy resources will appear here as they are published."
              />
            )}
          </div>
        )
      )}
    </main>
  );
}
