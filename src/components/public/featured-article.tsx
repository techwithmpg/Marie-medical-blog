import Link from "next/link";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import type { PublicArticleSummary } from "@/lib/public-articles";

interface FeaturedArticleProps {
  article: PublicArticleSummary;
  isExplicitlyFeatured?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function FeaturedArticle({
  article,
  isExplicitlyFeatured = false,
  headingLevel = "h2",
  className = "",
}: FeaturedArticleProps) {
  const formattedDate = formatDate(article.published_at);
  const badgeLabel = isExplicitlyFeatured
    ? "Featured Writing"
    : "Latest Writing";

  const HeadingTag = headingLevel;

  return (
    <article
      className={`group border-brand-oxide/30 bg-reading-surface hover:border-brand-oxide relative rounded-md border p-6 shadow-xs transition-all sm:p-8 ${className}`}
      aria-label={`${badgeLabel}: ${article.title}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FolioMarker number="01" />
          <span className="bg-brand-oxide/10 text-brand-oxide rounded px-2.5 py-1 text-xs font-semibold tracking-wider uppercase">
            {badgeLabel}
          </span>
        </div>
        {article.category && (
          <TopicImprint>{article.category.name}</TopicImprint>
        )}
      </div>

      <HeadingTag className="group-hover:text-brand-oxide mt-4 font-serif text-2xl font-medium tracking-tight text-ink transition-colors sm:text-3xl lg:text-4xl">
        <Link href={`/blog/${article.slug}`}>
          <span className="absolute inset-0" aria-hidden="true" />
          {article.title}
        </Link>
      </HeadingTag>

      {article.excerpt && (
        <p className="text-muted-ink mt-3 max-w-3xl text-base leading-relaxed sm:text-lg">
          {article.excerpt}
        </p>
      )}

      <div className="text-muted-ink mt-6 flex items-center justify-between border-t border-subtle-divider pt-4 text-xs">
        <div className="flex items-center gap-2">
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
