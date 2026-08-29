import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageIntro } from "@/components/public/page-intro";
import { ArticleListItem } from "@/components/public/article-list-item";
import { PaginationControls } from "@/components/public/pagination-controls";
import { EmptyEditorialState } from "@/components/public/empty-editorial-state";
import {
  getCategoryBySlug,
  getMemoizedTopicArticles,
} from "@/lib/public-articles";
import {
  parsePageQuery,
  resolveTopicDiscovery,
  type DiscoverySearchParams,
} from "@/lib/discovery-query";
import { getPublicRouteDiscoveryMetadata } from "@/lib/site-url";

const TOPIC_PAGE_SIZE = 6;

interface TopicPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<DiscoverySearchParams>;
}

export async function generateMetadata({
  params,
  searchParams,
}: TopicPageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const basePath = `/topics/${encodeURIComponent(category.slug)}`;
  const title = category.name;
  const description =
    category.description ||
    `Published writing and educational articles in ${category.name} by Marie Medere.`;
  const pageState = parsePageQuery(query.page);

  try {
    const listResult = pageState.isMalformed
      ? null
      : await getMemoizedTopicArticles(
          category.slug,
          pageState.page,
          TOPIC_PAGE_SIZE,
        );
    const discovery = resolveTopicDiscovery({
      basePath,
      page: query.page,
      totalPages: listResult?.totalPages ?? 0,
      hasPublishedArticles: listResult ? listResult.totalCount > 0 : true,
    });

    return {
      title,
      description,
      ...getPublicRouteDiscoveryMetadata(discovery.canonicalPath, {
        routePolicy: {
          index: discovery.index,
          follow: true,
        },
        social: {
          title,
          description,
        },
      }),
    };
  } catch {
    return {
      title,
      description,
      ...getPublicRouteDiscoveryMetadata(basePath, {
        routePolicy: {
          index: false,
          follow: true,
        },
        social: {
          title,
          description,
        },
      }),
    };
  }
}

export default async function TopicDetailPage({
  params,
  searchParams,
}: TopicPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const currentPage = parsePageQuery(query.page).page;

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
    listResult = await getMemoizedTopicArticles(
      category.slug,
      currentPage,
      TOPIC_PAGE_SIZE,
    );
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
                  index={(currentPage - 1) * TOPIC_PAGE_SIZE + index}
                />
              ))}
            </div>

            <div className="pt-6">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                basePath={`/topics/${category.slug}`}
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
