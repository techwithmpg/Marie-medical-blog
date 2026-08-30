import Image from "next/image";
import Link from "next/link";
import { FileText } from "lucide-react";

import { FolioMarker } from "@/components/evidence/folio-marker";
import type { PublicArticleSummary } from "@/lib/public-articles";

interface BlogLatestArticlesProps {
  articles: PublicArticleSummary[];
  imageUrls: Record<string, string | null>;
  heading: string;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery?: string;
  topicSlug?: string;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;

  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function buildPageUrl(
  page: number,
  searchQuery?: string,
  topicSlug?: string,
): string {
  const params = new URLSearchParams();

  if (searchQuery) params.set("q", searchQuery);
  if (topicSlug) params.set("topic", topicSlug);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();

  return query ? `/blog?${query}` : "/blog";
}

function getPageItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    items.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);

  return items;
}

export function BlogLatestArticles({
  articles,
  imageUrls,
  heading,
  totalCount,
  currentPage,
  totalPages,
  searchQuery,
  topicSlug,
}: BlogLatestArticlesProps) {
  const pageItems = getPageItems(currentPage, totalPages);
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <section>
      <div className="flex flex-col gap-3 border-b border-subtle-divider pb-4 sm:flex-row sm:items-center sm:justify-between">
        <FolioMarker number={2} label={heading} />

        <span className="text-muted-ink text-xs">
          Showing {articles.length} of {totalCount}
        </span>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article, index) => {
          const imageUrl = imageUrls[article.id] ?? null;
          const hasImage = Boolean(
            imageUrl &&
            article.featured_image_alt &&
            article.featured_image_alt.trim().length > 0,
          );

          const formattedDate = formatDate(article.published_at);

          return (
            <article
              key={article.id}
              className="group relative border-b border-subtle-divider py-5 xl:px-5 xl:not-[&:nth-child(3n+1)]:border-l xl:not-[&:nth-child(3n+1)]:border-subtle-divider xl:first:pl-0 xl:nth-[3n]:pr-0 xl:nth-[3n+1]:pl-0"
            >
              <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 sm:grid-cols-[124px_minmax(0,1fr)]">
                <div className="relative aspect-[4/3] overflow-hidden border border-subtle-divider bg-[#EEE6DA]">
                  {hasImage && imageUrl && article.featured_image_alt ? (
                    <Image
                      src={imageUrl}
                      alt={article.featured_image_alt}
                      fill
                      sizes="(max-width: 640px) 112px, 124px"
                      className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.02] motion-reduce:transform-none"
                    />
                  ) : (
                    <div className="text-brand-oxide/70 flex h-full w-full flex-col items-center justify-center">
                      <FileText
                        aria-hidden="true"
                        strokeWidth={1.35}
                        className="h-5 w-5"
                      />

                      <span className="mt-2 font-serif text-xs">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-col">
                  {article.category && (
                    <p className="text-deep-sage text-[0.58rem] font-semibold tracking-[0.09em] uppercase">
                      {article.category.name}
                    </p>
                  )}

                  <h3 className="group-hover:text-brand-oxide mt-2 font-serif text-[1.05rem] leading-[1.12] font-medium tracking-tight text-ink transition-colors sm:text-[1.12rem]">
                    <Link href={`/blog/${article.slug}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {article.title}
                    </Link>
                  </h3>

                  {article.excerpt && (
                    <p className="text-muted-ink mt-2 line-clamp-2 text-xs leading-[1.45]">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="text-muted-ink mt-auto flex flex-wrap items-center gap-2 pt-3 text-[0.64rem]">
                    {formattedDate && <span>{formattedDate}</span>}

                    {formattedDate && <span aria-hidden="true">•</span>}

                    <span>{article.reading_time_minutes} min read</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Article pagination"
          className="mt-7 flex flex-wrap items-center justify-center gap-2 border-t border-subtle-divider pt-6"
        >
          {hasPrevious ? (
            <Link
              href={buildPageUrl(currentPage - 1, searchQuery, topicSlug)}
              aria-label={`Go to page ${currentPage - 1}`}
              className="text-muted-ink hover:text-brand-oxide inline-flex min-h-11 items-center justify-center px-3 text-sm transition-colors focus:ring-2 focus:ring-focus-slate focus:outline-none"
            >
              ← Previous
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="text-muted-ink/35 inline-flex min-h-11 items-center justify-center px-3 text-sm"
            >
              ← Previous
            </span>
          )}

          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="text-muted-ink inline-flex h-11 min-w-8 items-center justify-center"
              >
                …
              </span>
            ) : (
              <Link
                key={item}
                href={buildPageUrl(item, searchQuery, topicSlug)}
                aria-current={item === currentPage ? "page" : undefined}
                aria-label={`Go to page ${item}`}
                className={
                  item === currentPage
                    ? "border-brand-oxide bg-brand-oxide inline-flex h-11 min-w-11 items-center justify-center border px-3 text-sm font-semibold text-parchment focus:ring-2 focus:ring-focus-slate focus:outline-none"
                    : "hover:border-brand-oxide hover:text-brand-oxide inline-flex h-11 min-w-11 items-center justify-center border border-subtle-divider bg-[#FFFDF9]/45 px-3 text-sm text-ink transition-colors focus:ring-2 focus:ring-focus-slate focus:outline-none"
                }
              >
                {item}
              </Link>
            ),
          )}

          {hasNext ? (
            <Link
              href={buildPageUrl(currentPage + 1, searchQuery, topicSlug)}
              aria-label={`Go to page ${currentPage + 1}`}
              className="hover:text-brand-oxide inline-flex min-h-11 items-center justify-center px-3 text-sm text-ink transition-colors focus:ring-2 focus:ring-focus-slate focus:outline-none"
            >
              Next →
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="text-muted-ink/35 inline-flex min-h-11 items-center justify-center px-3 text-sm"
            >
              Next →
            </span>
          )}
        </nav>
      )}
    </section>
  );
}
