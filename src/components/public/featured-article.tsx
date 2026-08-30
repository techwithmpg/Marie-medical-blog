import Image from "next/image";
import Link from "next/link";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { getPublicAssetUrl } from "@/lib/public-data";
import type { PublicArticleSummary } from "@/lib/public-articles";
import { cn } from "@/lib/utils";

interface FeaturedArticleProps {
  article: PublicArticleSummary;
  isExplicitlyFeatured?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
  variant?: "spread" | "home";
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

export async function FeaturedArticle({
  article,
  isExplicitlyFeatured = false,
  headingLevel = "h2",
  className = "",
  variant = "spread",
}: FeaturedArticleProps) {
  const formattedDate = formatDate(article.published_at);

  const badgeLabel = isExplicitlyFeatured
    ? "Featured Writing"
    : "Latest Writing";

  const Heading = headingLevel;

  const imageUrl = article.featured_image_path
    ? await getPublicAssetUrl(article.featured_image_path)
    : null;

  const hasImage = Boolean(
    imageUrl &&
    article.featured_image_alt &&
    article.featured_image_alt.trim().length > 0,
  );

  if (
    variant === "home" &&
    hasImage &&
    imageUrl &&
    article.featured_image_alt
  ) {
    return (
      <article
        className={cn(
          "group relative border-t border-subtle-divider pt-5",
          className,
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-subtle-field">
          <Image
            src={imageUrl}
            alt={article.featured_image_alt}
            fill
            sizes="(max-width: 768px) 100vw, 58vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.012] motion-reduce:transform-none"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#F6F1E8]/45 to-transparent"
          />
        </div>

        <div className="relative z-10 -mt-8 ml-auto w-[94%] bg-[#F6F1E8] pt-6 pl-6 sm:-mt-10 sm:w-[90%] sm:pl-8">
          <div className="flex flex-wrap items-center gap-3">
            <FolioMarker number="01" />

            <span className="text-brand-oxide text-xs font-semibold tracking-[0.12em] uppercase">
              {badgeLabel}
            </span>

            {article.category && (
              <TopicImprint>{article.category.name}</TopicImprint>
            )}
          </div>

          <Heading className="group-hover:text-brand-oxide mt-4 max-w-3xl font-serif text-3xl leading-[1.08] font-medium tracking-tight text-ink transition-colors sm:text-4xl">
            <Link href={`/blog/${article.slug}`}>
              <span className="absolute inset-0" aria-hidden="true" />
              {article.title}
            </Link>
          </Heading>

          {article.excerpt && (
            <p className="text-muted-ink mt-4 max-w-2xl text-base leading-relaxed">
              {article.excerpt}
            </p>
          )}

          <div className="text-muted-ink mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-subtle-divider pt-4 text-xs">
            <div className="flex items-center gap-2">
              {formattedDate && <span>{formattedDate}</span>}
              {formattedDate && <span aria-hidden="true">•</span>}
              <span>{article.reading_time_minutes} min read</span>
            </div>

            <span className="text-brand-oxide font-medium">Read article →</span>
          </div>
        </div>
      </article>
    );
  }

  if (!hasImage || !imageUrl || !article.featured_image_alt) {
    return (
      <article
        className={cn(
          "group relative border-y border-subtle-divider py-8 sm:py-10",
          className,
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FolioMarker number="01" />
            <span className="text-brand-oxide text-xs font-semibold tracking-[0.12em] uppercase">
              {badgeLabel}
            </span>
          </div>

          {article.category && (
            <TopicImprint>{article.category.name}</TopicImprint>
          )}
        </div>

        <Heading className="group-hover:text-brand-oxide mt-5 max-w-5xl font-serif text-3xl leading-[1.12] font-medium tracking-tight text-ink transition-colors sm:text-4xl">
          <Link href={`/blog/${article.slug}`}>
            <span className="absolute inset-0" aria-hidden="true" />
            {article.title}
          </Link>
        </Heading>

        {article.excerpt && (
          <p className="text-muted-ink mt-4 max-w-3xl text-base leading-relaxed sm:text-lg">
            {article.excerpt}
          </p>
        )}

        <div className="text-muted-ink mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-subtle-divider pt-4 text-xs">
          <div className="flex items-center gap-2">
            {formattedDate && <span>{formattedDate}</span>}
            {formattedDate && <span aria-hidden="true">•</span>}
            <span>{article.reading_time_minutes} min read</span>
          </div>

          <span className="text-brand-oxide font-medium">Read article →</span>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative border-y border-subtle-divider py-6 sm:py-8",
        className,
      )}
    >
      <div className="grid items-stretch md:grid-cols-12">
        <div className="relative aspect-[16/10] overflow-hidden bg-subtle-field md:col-span-7 md:aspect-auto md:min-h-[330px]">
          <Image
            src={imageUrl}
            alt={article.featured_image_alt}
            fill
            sizes="(max-width: 768px) 100vw, 58vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.012] motion-reduce:transform-none"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center py-7 md:col-span-5 md:-ml-8 md:bg-[#F6F1E8]/95 md:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <FolioMarker number="01" />

            <span className="text-brand-oxide text-xs font-semibold tracking-[0.12em] uppercase">
              {badgeLabel}
            </span>
          </div>

          {article.category && (
            <div className="mt-3">
              <TopicImprint>{article.category.name}</TopicImprint>
            </div>
          )}

          <Heading className="group-hover:text-brand-oxide mt-5 font-serif text-3xl leading-[1.08] font-medium tracking-tight text-ink transition-colors sm:text-4xl">
            <Link href={`/blog/${article.slug}`}>
              <span className="absolute inset-0" aria-hidden="true" />
              {article.title}
            </Link>
          </Heading>

          {article.excerpt && (
            <p className="text-muted-ink mt-4 text-base leading-relaxed">
              {article.excerpt}
            </p>
          )}

          <div className="text-muted-ink mt-7 flex flex-wrap items-center gap-2 border-t border-subtle-divider pt-4 text-xs">
            {formattedDate && <span>{formattedDate}</span>}
            {formattedDate && <span aria-hidden="true">•</span>}
            <span>{article.reading_time_minutes} min read</span>
          </div>
        </div>
      </div>
    </article>
  );
}
