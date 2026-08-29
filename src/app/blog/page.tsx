import type { Metadata } from "next";
import { PageIntro } from "@/components/public/page-intro";
import { TopicFilterBar } from "@/components/public/topic-filter-bar";
import { FeaturedArticle } from "@/components/public/featured-article";
import { ArticleListItem } from "@/components/public/article-list-item";
import { PaginationControls } from "@/components/public/pagination-controls";
import { EmptyEditorialState } from "@/components/public/empty-editorial-state";
import {
  getCategoryBySlug,
  getMemoizedBlogViewData,
  getPublishedCategories,
  sanitizeSearchQuery,
  type PublicCategory,
  type PublicBlogViewData,
} from "@/lib/public-articles";
import {
  getSingleQueryParam,
  hasQueryParam,
  parsePageQuery,
  resolveBlogDiscovery,
  type DiscoverySearchParams,
} from "@/lib/discovery-query";
import { getPublicRouteDiscoveryMetadata } from "@/lib/site-url";

const BLOG_TITLE = "Articles";
const BLOG_DESCRIPTION =
  "Browse published writing and educational articles from the Marie Medere Medical Writing Portfolio & Educational Blog.";
const BLOG_PAGE_SIZE = 6;

interface BlogPageProps {
  searchParams: Promise<DiscoverySearchParams>;
}

export async function generateMetadata({
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const query = await searchParams;
  const pageState = parsePageQuery(query.page);
  const requestedTopicSlug = getSingleQueryParam(query.topic)?.trim();

  let canonicalTopicSlug: string | null = null;
  let totalPages = 0;

  try {
    if (
      !hasQueryParam(query.q) &&
      hasQueryParam(query.topic) &&
      requestedTopicSlug
    ) {
      const category = await getCategoryBySlug(requestedTopicSlug);
      canonicalTopicSlug = category?.slug ?? null;
    } else if (
      !hasQueryParam(query.q) &&
      !hasQueryParam(query.topic) &&
      !pageState.isMalformed &&
      pageState.page > 1
    ) {
      const blogData = await getMemoizedBlogViewData(
        pageState.page,
        BLOG_PAGE_SIZE,
        "",
        "",
      );
      totalPages = blogData.totalPages;
    }

    const discovery = resolveBlogDiscovery({
      q: query.q,
      topic: query.topic,
      page: query.page,
      totalPages,
      canonicalTopicSlug,
    });

    return {
      title: BLOG_TITLE,
      description: BLOG_DESCRIPTION,
      ...getPublicRouteDiscoveryMetadata(discovery.canonicalPath, {
        routePolicy: {
          index: discovery.index,
          follow: true,
        },
        social: {
          title: BLOG_TITLE,
          description: BLOG_DESCRIPTION,
        },
      }),
    };
  } catch {
    return {
      title: BLOG_TITLE,
      description: BLOG_DESCRIPTION,
      ...getPublicRouteDiscoveryMetadata("/blog", {
        routePolicy: {
          index: false,
          follow: true,
        },
        social: {
          title: BLOG_TITLE,
          description: BLOG_DESCRIPTION,
        },
      }),
    };
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const query = await searchParams;
  const currentPage = parsePageQuery(query.page).page;
  const requestedQuery = getSingleQueryParam(query.q);
  const topicSlug = getSingleQueryParam(query.topic)?.trim() || undefined;

  const safeQuery = sanitizeSearchQuery(requestedQuery);
  const hasSearch = safeQuery.length > 0;
  const isFiltered = Boolean(hasSearch || topicSlug);

  let blogData: PublicBlogViewData | null = null;
  let categories: PublicCategory[] = [];
  let fetchError = false;

  try {
    const [fetchedData, fetchedCategories] = await Promise.all([
      getMemoizedBlogViewData(
        currentPage,
        BLOG_PAGE_SIZE,
        topicSlug || "",
        safeQuery,
      ),
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
    : topicSlug
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
          activeTopicSlug={topicSlug}
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
                    ? (currentPage - 1) * BLOG_PAGE_SIZE + index + 1
                    : (currentPage - 1) * BLOG_PAGE_SIZE + index
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
              topicSlug={topicSlug}
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
