import Link from "next/link";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import type { PublicArticleSummary } from "@/lib/public-articles";

interface ArticleListItemProps {
  article: PublicArticleSummary;
  index?: number;
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

export function ArticleListItem({
  article,
  index,
  className = "",
}: ArticleListItemProps) {
  const formattedDate = formatDate(article.published_at);
  const folioNumber =
    typeof index === "number" ? String(index + 1).padStart(2, "0") : undefined;

  return (
    <article
      className={`group bg-reading-surface hover:border-brand-oxide relative rounded-md border border-subtle-divider p-5 transition-all sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {folioNumber && <FolioMarker number={folioNumber} />}
          {article.category && (
            <TopicImprint>{article.category.name}</TopicImprint>
          )}
        </div>
        <div className="text-muted-ink flex items-center gap-2 text-xs">
          {formattedDate && <span>{formattedDate}</span>}
          {formattedDate && (
            <span aria-hidden="true" className="text-subtle-divider">
              •
            </span>
          )}
          <span>{article.reading_time_minutes} min read</span>
        </div>
      </div>

      <h3 className="group-hover:text-brand-oxide mt-3 font-serif text-xl font-medium tracking-tight text-ink transition-colors sm:text-2xl">
        <Link href={`/blog/${article.slug}`}>
          <span className="absolute inset-0" aria-hidden="true" />
          {article.title}
        </Link>
      </h3>

      {article.excerpt && (
        <p className="text-muted-ink mt-2.5 line-clamp-2 text-sm leading-relaxed sm:text-base">
          {article.excerpt}
        </p>
      )}

      <div className="mt-4 flex items-center justify-end">
        <span className="text-brand-oxide text-xs font-medium group-hover:underline">
          Read entry →
        </span>
      </div>
    </article>
  );
}
