import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { FolioMarker } from "@/components/evidence/folio-marker";
import { EmptyEditorialState } from "@/components/public/empty-editorial-state";
import { HomeContactBanner } from "@/components/public/home-contact-banner";
import {
  PortfolioCompactCard,
  PortfolioFeaturedCard,
} from "@/components/public/portfolio-writing-cards";
import { PublicShell } from "@/components/site/public-shell";
import {
  getPortfolioPublishedArticles,
  type PublicArticleSummary,
} from "@/lib/public-articles";
import {
  getPublicArticleAssetData,
  getPublicSiteSettings,
} from "@/lib/public-data";
import { getPublicSiteMediaPlacement } from "@/lib/public-site-media";
import { getPublicRouteDiscoveryMetadata } from "@/lib/site-url";

const PAGE_TITLE = "Portfolio";

const PAGE_DESCRIPTION =
  "Selected Writing portfolio and educational publication index by Marie Medere.";

interface PortfolioPageProps {
  searchParams: Promise<{
    topic?: string | string[];
  }>;
}

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  ...getPublicRouteDiscoveryMetadata("/portfolio", {
    social: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
    },
  }),
};

function getTopicValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

export default async function PortfolioPage({
  searchParams,
}: PortfolioPageProps) {
  const query = await searchParams;

  let portfolioArticles: PublicArticleSummary[] = [];

  let fetchError = false;

  const settings = await getPublicSiteSettings();

  try {
    portfolioArticles = await getPortfolioPublishedArticles();
  } catch {
    fetchError = true;
  }

  const categoryMap = new Map<
    string,
    NonNullable<PublicArticleSummary["category"]>
  >();

  portfolioArticles.forEach((article) => {
    if (article.category) {
      categoryMap.set(article.category.slug, article.category);
    }
  });

  const categories = Array.from(categoryMap.values());

  const requestedTopic = getTopicValue(query.topic);

  const activeTopic = categoryMap.has(requestedTopic) ? requestedTopic : "";

  const visibleArticles = activeTopic
    ? portfolioArticles.filter(
        (article) => article.category?.slug === activeTopic,
      )
    : portfolioArticles;

  const featuredArticles = visibleArticles.slice(0, 3);

  const moreArticles = visibleArticles.slice(3);

  const imageEntries = await Promise.all(
    visibleArticles.map(async (article) => {
      try {
        const asset = await getPublicArticleAssetData(
          article.featured_image_path,
          article.featured_image_alt,
        );

        return [article.id, asset.publicUrl] as const;
      } catch {
        return [article.id, null] as const;
      }
    }),
  );

  const imageUrls: Record<string, string | null> =
    Object.fromEntries(imageEntries);

  const portfolioHero = await getPublicSiteMediaPlacement("portfolio_hero");

  const mastheadFallback = featuredArticles[0]
    ? (imageUrls[featuredArticles[0].id] ?? null)
    : null;

  const mastheadImageUrl = portfolioHero?.publicUrl ?? mastheadFallback;

  const mastheadAlt = portfolioHero
    ? portfolioHero.isDecorative
      ? ""
      : portfolioHero.altText
    : (featuredArticles[0]?.featured_image_alt ?? "");

  return (
    <PublicShell settings={settings}>
      <div className="space-y-10 sm:space-y-12">
        {/* Masthead */}
        <section className="overflow-hidden border-b border-subtle-divider">
          <div className="grid min-h-[300px] md:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)] lg:min-h-[330px]">
            <div className="relative z-10 flex min-w-0 flex-col justify-center py-8 pr-4 sm:py-10 md:pr-10 lg:pr-14">
              <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="text-muted-ink flex items-center gap-2 text-xs">
                  <li>
                    <Link href="/" className="hover:text-brand-oxide">
                      Home
                    </Link>
                  </li>

                  <li aria-hidden="true">›</li>

                  <li className="text-ink">Portfolio</li>
                </ol>
              </nav>

              <h1 className="font-serif text-5xl leading-[0.95] font-medium tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Portfolio
              </h1>

              <p className="text-brand-oxide mt-4 text-lg font-medium">
                Selected Writing
              </p>

              <p className="text-muted-ink mt-4 max-w-[60ch] text-sm leading-[1.65] sm:text-base">
                A curated selection of published medical writing and educational
                work.
              </p>
            </div>

            {mastheadImageUrl && (
              <figure className="relative hidden overflow-hidden bg-[#EEE6DA] md:block">
                <Image
                  src={mastheadImageUrl}
                  alt={mastheadAlt}
                  fill
                  priority
                  sizes="44vw"
                  style={
                    portfolioHero
                      ? {
                          objectPosition: `${portfolioHero.desktopFocalX}% ${portfolioHero.desktopFocalY}%`,
                        }
                      : undefined
                  }
                  className="object-cover"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-[20%] bg-gradient-to-r from-[#F6F1E8] via-[#F6F1E8]/55 to-transparent"
                />
              </figure>
            )}
          </div>

          {/* Functional portfolio category filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-5">
              <Link
                href="/portfolio"
                aria-current={!activeTopic ? "page" : undefined}
                className={
                  !activeTopic
                    ? "border-brand-oxide bg-brand-oxide inline-flex min-h-10 items-center rounded-md border px-4 text-xs font-semibold text-parchment"
                    : "hover:border-brand-oxide hover:text-brand-oxide inline-flex min-h-10 items-center rounded-md border border-subtle-divider bg-[#FFFDF9]/45 px-4 text-xs font-medium text-ink transition-colors"
                }
              >
                All
              </Link>

              {categories.map((category) => {
                const active = activeTopic === category.slug;

                return (
                  <Link
                    key={category.id}
                    href={`/portfolio?topic=${encodeURIComponent(category.slug)}`}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "border-brand-oxide bg-brand-oxide inline-flex min-h-10 items-center rounded-md border px-4 text-xs font-semibold text-parchment"
                        : "hover:border-brand-oxide hover:text-brand-oxide inline-flex min-h-10 items-center rounded-md border border-subtle-divider bg-[#FFFDF9]/45 px-4 text-xs font-medium text-ink transition-colors"
                    }
                  >
                    {category.name}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {fetchError ? (
          <div className="text-muted-ink rounded-md border border-subtle-divider bg-[#FFFDF9] p-8 text-center text-sm">
            Unable to load selected writing at this time.
          </div>
        ) : visibleArticles.length === 0 ? (
          <EmptyEditorialState
            title="Selected Writing"
            description="No selected published writing is available for this view."
            actionHref="/portfolio"
            actionLabel="View All Selected Writing"
          />
        ) : (
          <>
            {/* Featured Writing */}
            <section>
              <div className="mb-5">
                <FolioMarker number={2} label="Featured Writing" />

                <p className="text-muted-ink mt-2 text-xs">
                  Selected published work from the portfolio.
                </p>
              </div>

              <div
                className={
                  featuredArticles.length === 1
                    ? "grid"
                    : featuredArticles.length === 2
                      ? "grid gap-4 lg:grid-cols-2"
                      : "grid gap-4 lg:grid-cols-2 xl:grid-cols-3"
                }
              >
                {featuredArticles.map((article) => (
                  <PortfolioFeaturedCard
                    key={article.id}
                    article={article}
                    imageUrl={imageUrls[article.id] ?? null}
                  />
                ))}
              </div>
            </section>

            {/* More Writing Samples */}
            {moreArticles.length > 0 && (
              <section>
                <div className="mb-5">
                  <FolioMarker number={3} label="More Writing Samples" />

                  <p className="text-muted-ink mt-2 text-xs">
                    Additional selected writing across available topics.
                  </p>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  {moreArticles.map((article) => (
                    <PortfolioCompactCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Same compact CTA language as homepage */}
        <HomeContactBanner />
      </div>
    </PublicShell>
  );
}
