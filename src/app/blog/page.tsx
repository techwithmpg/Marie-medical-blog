import type { Metadata } from "next";
import { PageIntro } from "@/components/public/page-intro";
import { TopicFilterBar } from "@/components/public/topic-filter-bar";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { BlogFeaturedDiscovery } from "@/components/public/blog-featured-discovery";
import { BlogLatestArticles } from "@/components/public/blog-latest-articles";
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
import { getPublicArticleAssetData } from "@/lib/public-data";

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
  let leadImageUrl: string | null = null;

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

  if (blogData?.leadArticle) {
    try {
      const assetData = await getPublicArticleAssetData(
        blogData.leadArticle.featured_image_path,
        blogData.leadArticle.featured_image_alt,
      );
      leadImageUrl = assetData.publicUrl;
    } catch {
      leadImageUrl = null;
    }
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
      : "Latest Articles";

  const articleImageEntries = await Promise.all(
    articles.map(async (article) => {
      try {
        const assetData = await getPublicArticleAssetData(
          article.featured_image_path,
          article.featured_image_alt,
        );

        return [article.id, assetData.publicUrl] as const;
      } catch {
        return [article.id, null] as const;
      }
    }),
  );

  const articleImageUrls: Record<string, string | null> =
    Object.fromEntries(articleImageEntries);
  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 01 — Articles masthead + discovery controls */}
      <section className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-5">
          <FolioMarker number={1} label="Editorial Archive" />

          <h1 className="mt-5 font-serif text-5xl leading-none font-medium tracking-tight text-ink sm:text-6xl">
            Articles
          </h1>

          <p className="text-muted-ink mt-4 max-w-lg text-base leading-relaxed sm:text-lg">
            Browse published writing and educational articles by topic or
            search.
          </p>
        </div>

        <div className="lg:col-span-7">
          <TopicFilterBar
            categories={categories}
            activeTopicSlug={topicSlug}
            activeSearchQuery={safeQuery}
          />
        </div>
      </section>

      {/* Featured article + topic discovery */}
      {leadArticle && (
        <BlogFeaturedDiscovery
          article={leadArticle}
          imageUrl={leadImageUrl}
          categories={categories}
          isExplicitlyFeatured={isLeadExplicitlyFeatured}
        />
      )}
      {/* 02 — Latest / filtered article entries */}
      {articles.length > 0 ? (
        <BlogLatestArticles
          articles={articles}
          imageUrls={articleImageUrls}
          heading={sectionHeading}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          searchQuery={safeQuery}
          topicSlug={topicSlug}
        />
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
