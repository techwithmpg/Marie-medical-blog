import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Apple,
  BookOpen,
  Brain,
  FileText,
  Globe2,
  HeartPulse,
  Moon,
  Pill,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { FolioMarker } from "@/components/evidence/folio-marker";
import { getPublicAssetUrl } from "@/lib/public-data";
import type {
  PublicArticleSummary,
  PublicCategory,
} from "@/lib/public-articles";
import { cn } from "@/lib/utils";

interface HomeDiscoverySectionsProps {
  leadArticle: PublicArticleSummary | null;
  supportingArticles: PublicArticleSummary[];
  isLeadExplicitlyFeatured: boolean;
  categories: PublicCategory[];
  fetchError: boolean;
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

const topicIconRules: {
  terms: string[];
  icon: LucideIcon;
}[] = [
  {
    terms: ["women", "woman", "maternal", "reproductive"],
    icon: UserRound,
  },
  {
    terms: ["nutrition", "food", "diet"],
    icon: Apple,
  },
  {
    terms: ["heart", "cardio", "chronic"],
    icon: HeartPulse,
  },
  {
    terms: ["mental", "brain", "neuro"],
    icon: Brain,
  },
  {
    terms: ["sleep", "recovery"],
    icon: Moon,
  },
  {
    terms: ["medication", "medicine", "drug", "pharma"],
    icon: Pill,
  },
  {
    terms: ["literacy", "education", "communication"],
    icon: BookOpen,
  },
  {
    terms: ["public", "population", "epidemiology"],
    icon: Globe2,
  },
  {
    terms: ["clinical", "patient"],
    icon: Stethoscope,
  },
];

function getTopicIcon(category: PublicCategory): LucideIcon {
  const value = `${category.name} ${category.slug}`.toLowerCase();

  for (const rule of topicIconRules) {
    if (rule.terms.some((term) => value.includes(term))) {
      return rule.icon;
    }
  }

  return Activity;
}

export async function HomeDiscoverySections({
  leadArticle,
  supportingArticles,
  isLeadExplicitlyFeatured,
  categories,
  fetchError,
}: HomeDiscoverySectionsProps) {
  const visibleSupporting = supportingArticles.slice(0, 2);
  const visibleCategories = categories.slice(0, 8);
  const sparseTopics = visibleCategories.length <= 2;

  const articles = [leadArticle, ...visibleSupporting].filter(
    (article): article is PublicArticleSummary => Boolean(article),
  );

  const imageEntries = await Promise.all(
    articles.map(async (article) => {
      if (!article.featured_image_path) {
        return [article.id, null] as const;
      }

      const url = await getPublicAssetUrl(article.featured_image_path);

      return [article.id, url] as const;
    }),
  );

  const imageUrls = new Map(imageEntries);

  const leadImageUrl = leadArticle
    ? (imageUrls.get(leadArticle.id) ?? null)
    : null;

  const leadHasImage = Boolean(
    leadArticle && leadImageUrl && leadArticle.featured_image_alt?.trim(),
  );

  const topicGridClass =
    visibleCategories.length <= 2
      ? "grid grid-cols-1 gap-3"
      : visibleCategories.length <= 4
        ? "grid grid-cols-2 gap-3"
        : "grid grid-cols-2 gap-3 sm:grid-cols-4";

  return (
    <section className="border-t border-subtle-divider py-10 sm:py-12">
      <div className="grid items-start gap-10 xl:grid-cols-2 xl:gap-12">
        {/* 02 — Latest Articles */}
        <div>
          <div className="mb-6 flex items-center gap-3">
            <FolioMarker number={2} label="Latest Articles" />
          </div>

          {fetchError ? (
            <div className="text-muted-ink border-t border-subtle-divider py-10 text-sm">
              Unable to load published writing at this time.
            </div>
          ) : leadArticle ? (
            <div className="grid gap-5 md:grid-cols-[1.02fr_1fr]">
              {/* Lead article */}
              <article className="group relative min-h-[310px] overflow-hidden border border-subtle-divider bg-[#F3ECE2]">
                {leadHasImage &&
                leadImageUrl &&
                leadArticle.featured_image_alt ? (
                  <>
                    {/* Landscape image remains visually strong on the right */}
                    <div className="absolute inset-y-0 right-0 w-[58%] overflow-hidden">
                      <Image
                        src={leadImageUrl}
                        alt={leadArticle.featured_image_alt}
                        fill
                        sizes="(max-width: 768px) 58vw, 19vw"
                        className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.015] motion-reduce:transform-none"
                      />
                    </div>

                    {/* Cream reading field transitions naturally into the artwork */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#F3ECE2] from-[0%] via-[#F3ECE2] via-[44%] to-transparent to-[72%]"
                    />

                    {/* Quiet lower field for date and reading-time metadata */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#F3ECE2]/75 via-[#F3ECE2]/25 to-transparent"
                    />

                    {/* Very restrained editorial vignette over the artwork */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 right-0 w-[42%] bg-gradient-to-l from-[#29231F]/18 via-[#29231F]/7 to-transparent"
                    />
                  </>
                ) : null}

                <div className="relative z-10 flex min-h-[310px] flex-col justify-between p-5 sm:p-6">
                  <div className={leadHasImage ? "max-w-[64%]" : "max-w-none"}>
                    <span className="bg-brand-oxide inline-flex px-2.5 py-1 text-[0.64rem] font-semibold tracking-wider text-white uppercase">
                      {isLeadExplicitlyFeatured ? "Featured" : "Latest"}
                    </span>

                    {leadArticle.category && (
                      <p className="text-muted-ink mt-5 text-[0.66rem] font-semibold tracking-[0.11em] uppercase">
                        {leadArticle.category.name}
                      </p>
                    )}

                    <h3 className="group-hover:text-brand-oxide mt-3 font-serif text-[1.6rem] leading-[1.08] font-medium tracking-tight text-ink transition-colors sm:text-[1.72rem]">
                      <Link href={`/blog/${leadArticle.slug}`}>
                        <span className="absolute inset-0" aria-hidden="true" />
                        {leadArticle.title}
                      </Link>
                    </h3>

                    {leadArticle.excerpt && (
                      <p className="text-muted-ink mt-4 line-clamp-3 text-sm leading-relaxed">
                        {leadArticle.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="text-muted-ink mt-7 flex flex-wrap items-center gap-2 text-[0.69rem]">
                    {formatDate(leadArticle.published_at) && (
                      <span>{formatDate(leadArticle.published_at)}</span>
                    )}

                    <span aria-hidden="true">•</span>

                    <span>{leadArticle.reading_time_minutes} min read</span>
                  </div>
                </div>
              </article>
              {/* Supporting stories */}
              <div className="divide-y divide-subtle-divider border-y border-subtle-divider">
                {visibleSupporting.map((article, index) => {
                  const imageUrl = imageUrls.get(article.id) ?? null;

                  const hasImage = Boolean(
                    imageUrl && article.featured_image_alt?.trim(),
                  );

                  return (
                    <article
                      key={article.id}
                      className={
                        hasImage
                          ? "group relative min-h-[145px] overflow-hidden py-4 first:pt-0 last:pb-0"
                          : "group relative grid min-h-[145px] grid-cols-[104px_1fr] gap-4 py-4 first:pt-0 last:pb-0 sm:grid-cols-[116px_1fr]"
                      }
                    >
                      {hasImage && imageUrl && article.featured_image_alt ? (
                        <>
                          {/* Wide landscape image — intentionally not squeezed */}
                          <div className="absolute inset-y-0 left-0 w-[62%] overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={article.featured_image_alt}
                              fill
                              sizes="(max-width: 768px) 62vw, 20vw"
                              className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.015] motion-reduce:transform-none"
                            />
                          </div>

                          {/* Cream reading surface deliberately overlaps the image */}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 right-0 w-[58%] bg-[#F6F1E8]"
                          />

                          {/* Narrow feather only at the image / paper transition */}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-[30%] w-[14%] bg-gradient-to-r from-transparent via-[#F6F1E8]/65 to-[#F6F1E8]"
                          />
                        </>
                      ) : (
                        <div className="text-brand-oxide flex aspect-[4/3] flex-col items-center justify-center self-center border border-subtle-divider bg-[#F1EADF]/70">
                          <FileText
                            aria-hidden="true"
                            strokeWidth={1.4}
                            className="h-5 w-5"
                          />

                          <span className="mt-2 font-serif text-xs">
                            {String(index + 2).padStart(2, "0")}
                          </span>
                        </div>
                      )}

                      <div
                        className={
                          hasImage
                            ? "relative z-10 ml-auto flex min-h-[137px] w-[70%] min-w-0 flex-col justify-center py-3 pr-3 pl-10"
                            : "flex min-w-0 flex-col justify-center"
                        }
                      >
                        {article.category && (
                          <p className="text-muted-ink text-[0.63rem] font-semibold tracking-[0.1em] uppercase">
                            {article.category.name}
                          </p>
                        )}

                        <h3 className="group-hover:text-brand-oxide mt-2 font-serif text-[1.08rem] leading-[1.08] font-medium tracking-tight text-ink transition-colors sm:text-[1.18rem]">
                          <Link href={`/blog/${article.slug}`}>
                            <span
                              className="absolute inset-0"
                              aria-hidden="true"
                            />
                            {article.title}
                          </Link>
                        </h3>

                        <div className="text-muted-ink mt-3 flex flex-wrap items-center gap-2 text-[0.66rem]">
                          {formatDate(article.published_at) && (
                            <span>{formatDate(article.published_at)}</span>
                          )}

                          <span aria-hidden="true">•</span>

                          <span>{article.reading_time_minutes} min read</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border-t border-subtle-divider py-10">
              <p className="font-serif text-xl text-ink">
                Published articles will appear here.
              </p>
            </div>
          )}
        </div>

        {/* 03 — Explore Topics */}
        <div>
          <div className="mb-6 flex items-center gap-3">
            <FolioMarker number={3} label="Explore Topics" />
          </div>

          {visibleCategories.length > 0 ? (
            <>
              <div className={topicGridClass}>
                {visibleCategories.map((category) => {
                  const Icon = getTopicIcon(category);

                  return (
                    <Link
                      key={category.id}
                      href={`/topics/${category.slug}`}
                      className={cn(
                        "group hover:border-brand-oxide border border-subtle-divider bg-[#FFFDF9]/45 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFFDF9] motion-reduce:transform-none",
                        sparseTopics
                          ? "flex min-h-[128px] items-center gap-5 px-6 py-5 text-left"
                          : "flex min-h-[104px] flex-col items-center justify-center px-3 py-4 text-center",
                      )}
                    >
                      <span
                        className={cn(
                          "text-deep-sage group-hover:text-brand-oxide flex shrink-0 items-center justify-center transition-colors",
                          sparseTopics
                            ? "h-12 w-12 border border-subtle-divider bg-[#F6F1E8]/60"
                            : "",
                        )}
                      >
                        <Icon
                          aria-hidden="true"
                          strokeWidth={1.45}
                          className={sparseTopics ? "h-6 w-6" : "h-7 w-7"}
                        />
                      </span>

                      <span className={sparseTopics ? "min-w-0" : ""}>
                        <span className="block text-sm leading-tight font-medium text-ink">
                          {category.name}
                        </span>

                        {sparseTopics && category.description && (
                          <span className="text-muted-ink mt-2 line-clamp-2 block text-xs leading-relaxed">
                            {category.description}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-subtle-divider pt-4">
                <Link
                  href="/blog"
                  className="text-brand-oxide text-xs font-semibold tracking-wide hover:underline"
                >
                  Browse all topics →
                </Link>
              </div>
            </>
          ) : (
            <div className="text-muted-ink border-t border-subtle-divider py-10 text-sm">
              Topics will appear here as categories are published.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
