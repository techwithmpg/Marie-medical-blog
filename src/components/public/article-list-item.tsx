import Image from "next/image";
import Link from "next/link";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { getPublicAssetUrl } from "@/lib/public-data";
import type { PublicArticleSummary } from "@/lib/public-articles";
import { cn } from "@/lib/utils";

interface ArticleListItemProps {
  article: PublicArticleSummary;
  index?: number;
  className?: string;
  variant?: "card" | "row" | "compact" | "rail";
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

export async function ArticleListItem({
  article,
  index,
  className = "",
  variant = "card",
}: ArticleListItemProps) {
  const formattedDate = formatDate(article.published_at);

  const folioNumber =
    typeof index === "number" ? String(index + 1).padStart(2, "0") : undefined;

  const imageUrl = article.featured_image_path
    ? await getPublicAssetUrl(article.featured_image_path)
    : null;

  const hasImage = Boolean(
    imageUrl &&
    article.featured_image_alt &&
    article.featured_image_alt.trim().length > 0,
  );

  const storyText = (
    <div className={cn("min-w-0", variant === "row" ? "py-1" : "pt-4")}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2.5">
          {folioNumber && <FolioMarker number={folioNumber} />}

          {article.category && (
            <TopicImprint>{article.category.name}</TopicImprint>
          )}
        </div>

        <div className="text-muted-ink flex items-center gap-2 text-[0.72rem]">
          {formattedDate && <span>{formattedDate}</span>}
          {formattedDate && <span aria-hidden="true">•</span>}
          <span>{article.reading_time_minutes} min</span>
        </div>
      </div>

      <h3
        className={cn(
          "group-hover:text-brand-oxide mt-3 font-serif leading-[1.16] font-medium tracking-tight text-ink transition-colors",
          variant === "compact"
            ? "text-lg sm:text-xl"
            : "text-xl sm:text-[1.55rem]",
        )}
      >
        <Link href={`/blog/${article.slug}`}>
          <span className="absolute inset-0" aria-hidden="true" />
          {article.title}
        </Link>
      </h3>

      {article.excerpt && variant !== "compact" && (
        <p className="text-muted-ink mt-3 line-clamp-3 text-sm leading-relaxed">
          {article.excerpt}
        </p>
      )}

      <div className="mt-4">
        <span className="text-brand-oxide text-xs font-medium">
          Read entry →
        </span>
      </div>
    </div>
  );

  if (variant === "rail") {
    return (
      <article
        className={cn(
          "group relative grid grid-cols-[1fr_112px] gap-5 border-t border-subtle-divider py-5 sm:grid-cols-[1fr_138px]",
          className,
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            {folioNumber && <FolioMarker number={folioNumber} />}

            {article.category && (
              <TopicImprint>{article.category.name}</TopicImprint>
            )}
          </div>

          <h3 className="group-hover:text-brand-oxide mt-3 font-serif text-lg leading-[1.15] font-medium tracking-tight text-ink transition-colors sm:text-xl">
            <Link href={`/blog/${article.slug}`}>
              <span className="absolute inset-0" aria-hidden="true" />
              {article.title}
            </Link>
          </h3>

          <div className="text-muted-ink mt-3 flex flex-wrap items-center gap-2 text-[0.7rem]">
            {formattedDate && <span>{formattedDate}</span>}
            {formattedDate && <span aria-hidden="true">•</span>}
            <span>{article.reading_time_minutes} min</span>
          </div>

          <div className="mt-3">
            <span className="text-brand-oxide text-xs font-medium">
              Read entry →
            </span>
          </div>
        </div>

        {hasImage && imageUrl && article.featured_image_alt ? (
          <div className="relative aspect-[4/3] self-start overflow-hidden bg-subtle-field">
            <Image
              src={imageUrl}
              alt={article.featured_image_alt}
              fill
              sizes="138px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.015] motion-reduce:transform-none"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="h-full min-h-24 border-l border-subtle-divider"
          />
        )}
      </article>
    );
  }
  if (variant === "row") {
    return (
      <article
        className={cn(
          "group relative grid gap-5 border-b border-subtle-divider py-5 sm:grid-cols-[190px_1fr]",
          className,
        )}
      >
        {hasImage && imageUrl && article.featured_image_alt ? (
          <div className="relative aspect-[16/10] overflow-hidden bg-subtle-field sm:aspect-auto sm:min-h-[138px]">
            <Image
              src={imageUrl}
              alt={article.featured_image_alt}
              fill
              sizes="(max-width: 640px) 100vw, 190px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.015] motion-reduce:transform-none"
            />
          </div>
        ) : (
          <div className="hidden border-l border-subtle-divider sm:block" />
        )}

        {storyText}
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative border-t border-subtle-divider pt-4",
        variant === "compact" ? "pb-4" : "pb-6",
        className,
      )}
    >
      {hasImage && imageUrl && article.featured_image_alt && (
        <div className="relative mb-1 aspect-[16/9] overflow-hidden bg-subtle-field">
          <Image
            src={imageUrl}
            alt={article.featured_image_alt}
            fill
            sizes={
              variant === "compact"
                ? "(max-width: 768px) 100vw, 280px"
                : "(max-width: 768px) 100vw, 50vw"
            }
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.015] motion-reduce:transform-none"
          />

          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/5 to-transparent"
          />
        </div>
      )}

      {storyText}
    </article>
  );
}
