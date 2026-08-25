import { Metadata } from "next";
import { PageIntro } from "@/components/public/page-intro";
import { TopicFilterBar } from "@/components/public/topic-filter-bar";
import { FeaturedArticle } from "@/components/public/featured-article";
import { ArticleListItem } from "@/components/public/article-list-item";
import { PaginationControls } from "@/components/public/pagination-controls";
import { EmptyEditorialState } from "@/components/public/empty-editorial-state";
import {
  getBlogViewData,
  getPublishedCategories,
  sanitizeSearchQuery,
  type PublicCategory,
  type PublicBlogViewData,
} from "@/lib/public-articles";

export const metadata: Metadata = {
  title: "Articles | Marie Medere",
  description:
    "Browse published writing and educational articles from the Marie Medere Medical Writing Portfolio & Educational Blog.",
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
  const parsedPage = Number(rawPage);
  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const safeQuery = sanitizeSearchQuery(q);
  const hasSearch = safeQuery.length > 0;
  const isFiltered = Boolean(hasSearch || topic);

  let blogData: PublicBlogViewData | null = null;
  let categories: PublicCategory[] = [];
  let fetchError = false;

  try {
    const [fetchedData, fetchedCategories] = await Promise.all([
      getBlogViewData({
        page: currentPage,
        pageSize: 6,
        topicSlug: topic,
        searchQuery: safeQuery,
      }),
      getPublishedCategories(),
    ]);
    blogData = fetchedData;
    categories = fetchedCategories;
  } catch {
    fetchError = true;
  }

  if (fetchError || !blogData) {
    return (
      <div className="space-y-12 sm:space-y-16">
        <PageIntro
          title="Articles"
          topicLabel="Editorial Archive"
          deck="Browse published writing and educational articles by topic or search."
        />
        <div className="bg-reading-surface text-muted-ink rounded-lg border border-subtle-divider p-8 text-center text-sm">
          Unable to load published writing at this time. Please try again later.
        </div>
      </div>
    );
  }

  const {
    leadArticle,
    isLeadExplicitlyFeatured,
    articles,
    totalCount,
    totalPages,
  } = blogData;

  const sectionHeading = hasSearch
    ? "Search Results"
    : topic
      ? "Topic Entries"
      : "Archive Entries";

  return (
    <div className="space-y-12 sm:space-y-16">
      <PageIntro
        title="Articles"
        topicLabel="Editorial Archive"
        deck="Browse published writing and educational articles by topic or search."
      />

      {/* Filter and Search Bar */}
      <div>
        <TopicFilterBar
          categories={categories}
          activeTopicSlug={topic}
          activeSearchQuery={safeQuery}
        />
      </div>

      {/* Lead Story Hero (Unfiltered Page 1 only) */}
      {leadArticle && (
        <div>
          <FeaturedArticle
            article={leadArticle}
            isExplicitlyFeatured={isLeadExplicitlyFeatured}
            headingLevel="h2"
          />
        </div>
      )}

      {/* Main / Supporting Articles Grid */}
      {articles.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-subtle-divider pb-3">
            <h2 className="font-serif text-lg font-medium text-ink">
              {sectionHeading}
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
                index={
                  !isFiltered
                    ? (currentPage - 1) * 6 + index + 1
                    : (currentPage - 1) * 6 + index
                }
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="pt-6">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/blog"
              searchQuery={safeQuery}
              topicSlug={topic}
            />
          </div>
        </div>
      ) : (
        !leadArticle && (
          <div className="pt-4">
            {isFiltered ? (
              <EmptyEditorialState
                title="No matching articles found"
                description={
                  safeQuery
                    ? `No published articles matched your search for "${safeQuery}".`
                    : "No published articles found for this topic filter."
                }
                actionLabel="View all articles"
                actionHref="/blog"
              />
            ) : (
              <EmptyEditorialState
                title="No published articles yet"
                description="Published writing and educational articles will appear here as content becomes available."
              />
            )}
          </div>
        )
      )}
    </div>
  );
}
