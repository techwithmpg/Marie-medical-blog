import Image from "next/image";
import Link from "next/link";
import {
  Apple,
  BookOpen,
  Brain,
  ChevronRight,
  FileText,
  Globe2,
  HeartPulse,
  Moon,
  Pill,
  UserRound,
} from "lucide-react";

import type {
  PublicArticleSummary,
  PublicCategory,
} from "@/lib/public-articles";

interface BlogFeaturedDiscoveryProps {
  article: PublicArticleSummary;
  imageUrl: string | null;
  categories: PublicCategory[];
  isExplicitlyFeatured?: boolean;
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

function getTopicIcon(category: PublicCategory) {
  const value = `${category.name} ${category.slug}`.toLowerCase();

  if (value.includes("women")) return UserRound;
  if (value.includes("nutrition") || value.includes("food")) return Apple;
  if (value.includes("mental") || value.includes("brain")) return Brain;
  if (value.includes("sleep")) return Moon;
  if (value.includes("medication") || value.includes("drug")) return Pill;
  if (value.includes("chronic") || value.includes("heart")) return HeartPulse;
  if (value.includes("public")) return Globe2;

  return BookOpen;
}

export function BlogFeaturedDiscovery({
  article,
  imageUrl,
  categories,
  isExplicitlyFeatured = false,
}: BlogFeaturedDiscoveryProps) {
  const formattedDate = formatDate(article.published_at);
  const hasImage = Boolean(
    imageUrl &&
    article.featured_image_alt &&
    article.featured_image_alt.trim().length > 0,
  );

  return (
    <section className="grid gap-6 lg:grid-cols-12">
      {/* Featured article */}
      <article className="group overflow-hidden border border-subtle-divider bg-[#FFFDF9]/55 lg:col-span-8">
        <div className="grid md:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[270px] overflow-hidden bg-[#EDE5D9] md:min-h-[315px]">
            {hasImage && imageUrl && article.featured_image_alt ? (
              <Image
                src={imageUrl}
                alt={article.featured_image_alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 48vw"
                className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transform-none"
              />
            ) : (
              <div className="text-brand-oxide/70 flex h-full min-h-[270px] items-center justify-center md:min-h-[315px]">
                <FileText
                  aria-hidden="true"
                  strokeWidth={1.25}
                  className="h-10 w-10"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center px-6 py-7 sm:px-8">
            <div className="flex flex-wrap items-center gap-2">
              {article.category && (
                <span className="border-brand-oxide/55 text-brand-oxide inline-flex border px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.08em] uppercase">
                  {article.category.name}
                </span>
              )}

              {isExplicitlyFeatured && (
                <span className="text-muted-ink text-[0.62rem] font-semibold tracking-[0.08em] uppercase">
                  Featured
                </span>
              )}
            </div>

            <h2 className="mt-4 font-serif text-[2rem] leading-[1.02] font-medium tracking-tight text-ink sm:text-[2.25rem]">
              <Link
                href={`/blog/${article.slug}`}
                className="group-hover:text-brand-oxide transition-colors"
              >
                {article.title}
              </Link>
            </h2>

            {article.excerpt && (
              <p className="text-muted-ink mt-4 line-clamp-3 text-sm leading-relaxed sm:text-base">
                {article.excerpt}
              </p>
            )}

            <div className="text-muted-ink mt-6 flex flex-wrap items-center gap-2 text-xs">
              {formattedDate && <span>{formattedDate}</span>}

              {formattedDate && <span aria-hidden="true">•</span>}

              <span>{article.reading_time_minutes} min read</span>
            </div>
          </div>
        </div>
      </article>

      {/* Topic discovery */}
      <aside className="border border-subtle-divider bg-[#FFFDF9]/45 p-5 sm:p-6 lg:col-span-4">
        <h2 className="font-serif text-xl font-medium tracking-tight text-ink">
          Explore by Topic
        </h2>

        <div className="bg-brand-oxide mt-3 h-px w-8" />

        {categories.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {categories.slice(0, 8).map((category) => {
              const Icon = getTopicIcon(category);

              return (
                <Link
                  key={category.id}
                  href={`/blog?topic=${encodeURIComponent(category.slug)}`}
                  className="group/topic hover:text-brand-oxide flex min-h-12 items-center gap-3 border-b border-subtle-divider/70 py-3 text-sm text-ink transition-colors"
                >
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.35}
                    className="text-deep-sage h-5 w-5 shrink-0"
                  />

                  <span className="min-w-0 flex-1">{category.name}</span>

                  <ChevronRight
                    aria-hidden="true"
                    strokeWidth={1.4}
                    className="h-4 w-4 shrink-0 transition-transform group-hover/topic:translate-x-0.5"
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-ink mt-5 text-sm leading-relaxed">
            Published topics will appear here as categories become available.
          </p>
        )}

        <Link
          href="/blog"
          className="text-brand-oxide mt-5 inline-flex text-xs font-semibold tracking-wide hover:underline"
        >
          View all articles →
        </Link>
      </aside>
    </section>
  );
}
