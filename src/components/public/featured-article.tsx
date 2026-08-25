import Link from "next/link";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import type { PublicArticleSummary } from "@/lib/public-articles";

interface FeaturedArticleProps {
  article: PublicArticleSummary;
  isExplicitlyFeatured: boolean;
  className?: string;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function FeaturedArticle({
  article,
  isExplicitlyFeatured,
  className = "",
}: FeaturedArticleProps) {
  const badgeLabel = isExplicitlyFeatured
    ? "Featured Writing"
    : "Latest Writing";
  const formattedDate = formatDate(article.published_at);

  return (
    <article
      className={`group bg-reading-surface hover:border-brand-oxide relative rounded-md border border-subtle-divider p-6 transition-all sm:p-8 md:p-10 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FolioMarker number="01" />
          <span className="text-brand-oxide font-sans text-xs font-semibold tracking-wider uppercase">
            {badgeLabel}
          </span>
        </div>
        {article.category && (
          <TopicImprint>{article.category.name}</TopicImprint>
        )}
      </div>

      <h2 className="group-hover:text-brand-oxide mt-5 font-serif text-2xl font-medium tracking-tight text-ink transition-colors sm:text-3xl md:text-4xl">
        <Link href={`/blog/${article.slug}`}>
          <span className="absolute inset-0" aria-hidden="true" />
          {article.title}
        </Link>
      </h2>

      {article.excerpt && (
        <p className="text-muted-ink mt-4 text-base leading-relaxed sm:text-lg">
          {article.excerpt}
        </p>
      )}

      <div className="text-muted-ink mt-6 flex items-center justify-between border-t border-subtle-divider pt-4 font-sans text-xs">
        <div className="flex items-center gap-3">
          {formattedDate && <span>{formattedDate}</span>}
          {formattedDate && (
            <span aria-hidden="true" className="text-subtle-divider">
              •
            </span>
          )}
          <span>{article.reading_time_minutes} min read</span>
        </div>
        <span className="text-brand-oxide font-medium group-hover:underline">
          Read article →
        </span>
      </div>
    </article>
  );
}
