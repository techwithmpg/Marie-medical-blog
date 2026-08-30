import Link from "next/link";
import { UserRound } from "lucide-react";

import { TopicImprint } from "@/components/evidence/topic-imprint";
import type { PublicCategory } from "@/lib/public-articles";

interface ArticleHeaderProps {
  title: string;
  excerpt?: string | null;
  category?: PublicCategory | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  readingTimeMinutes: number;
  authorName?: string;
  authorTagline?: string | null;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function ArticleHeader({
  title,
  excerpt,
  category,
  publishedAt,
  updatedAt,
  readingTimeMinutes,
  authorName,
  authorTagline,
}: ArticleHeaderProps) {
  const formattedPublished = publishedAt ? formatDate(publishedAt) : null;

  const formattedUpdated = updatedAt ? formatDate(updatedAt) : null;

  const showUpdated =
    formattedPublished &&
    formattedUpdated &&
    formattedUpdated !== formattedPublished;

  return (
    <header>
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="text-muted-ink flex flex-wrap items-center gap-2 text-xs">
          <li>
            <Link href="/" className="hover:text-brand-oxide">
              Home
            </Link>
          </li>

          <li aria-hidden="true">›</li>

          <li>
            <Link href="/blog" className="hover:text-brand-oxide">
              Articles
            </Link>
          </li>

          {category && (
            <>
              <li aria-hidden="true">›</li>

              <li>
                <Link
                  href={`/blog?topic=${encodeURIComponent(category.slug)}`}
                  className="hover:text-brand-oxide font-medium text-ink"
                >
                  {category.name}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>

      {category && <TopicImprint>{category.name}</TopicImprint>}

      <h1 className="mt-5 font-serif text-[2.65rem] leading-[1.01] font-medium tracking-[-0.025em] text-ink sm:text-[3.25rem] lg:text-[3.45rem]">
        {title}
      </h1>

      {excerpt && (
        <p className="text-muted-ink mt-5 max-w-[680px] text-lg leading-[1.5] sm:text-xl">
          {excerpt}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {authorName && (
          <>
            <div className="text-brand-oxide flex h-10 w-10 items-center justify-center rounded-full border border-subtle-divider bg-[#FFFDF9]">
              <UserRound
                aria-hidden="true"
                strokeWidth={1.35}
                className="h-5 w-5"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-ink">{authorName}</p>

              {authorTagline && (
                <p className="text-muted-ink text-[0.68rem]">{authorTagline}</p>
              )}
            </div>
          </>
        )}

        <div className="text-muted-ink ml-1 flex flex-wrap items-center gap-2 text-xs">
          {formattedPublished && <span>{formattedPublished}</span>}

          {formattedPublished && <span aria-hidden="true">•</span>}

          <span>{readingTimeMinutes} min read</span>

          {showUpdated && (
            <>
              <span aria-hidden="true">•</span>
              <span>Updated {formattedUpdated}</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
