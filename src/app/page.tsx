import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { PublicShell } from "@/components/site/public-shell";
import { buttonVariants } from "@/components/ui/button";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { MedicalDisclaimer } from "@/components/public/medical-disclaimer";
import { HomeContactBanner } from "@/components/public/home-contact-banner";
import { HomeDiscoverySections } from "@/components/public/home-discovery-sections";
import { ManagedSiteImage } from "@/components/public/managed-site-image";
import { getPublicProfile, getPublicSiteSettings } from "@/lib/public-data";
import { getPublicRouteDiscoveryMetadata } from "@/lib/site-url";
import { getPublicSiteMediaSlot } from "@/lib/public-site-media";
import {
  getFeaturedPublishedArticle,
  getLatestPublishedArticles,
  getPortfolioPublishedArticles,
  getPublishedCategories,
  type PublicArticleSummary,
  type PublicCategory,
} from "@/lib/public-articles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = getPublicRouteDiscoveryMetadata("/");

export default async function HomePage() {
  const [profile, settings, homeHero] = await Promise.all([
    getPublicProfile(),
    getPublicSiteSettings(),
    getPublicSiteMediaSlot("home_hero"),
  ]);

  let leadArticle: PublicArticleSummary | null = null;
  let isLeadExplicitlyFeatured = false;
  let supportingArticles: PublicArticleSummary[] = [];
  let categories: PublicCategory[] = [];
  let selectedWriting: PublicArticleSummary[] = [];
  let fetchError = false;

  try {
    const [fetchedFeatured, fetchedLatest, fetchedCategories] =
      await Promise.all([
        getFeaturedPublishedArticle(),
        getLatestPublishedArticles(4),
        getPublishedCategories(),
      ]);

    categories = fetchedCategories;

    if (fetchedFeatured) {
      leadArticle = fetchedFeatured;
      isLeadExplicitlyFeatured = true;
      supportingArticles = fetchedLatest
        .filter((a) => a.id !== fetchedFeatured.id)
        .slice(0, 3);
    } else if (fetchedLatest.length > 0) {
      leadArticle = fetchedLatest[0];
      isLeadExplicitlyFeatured = false;
      supportingArticles = fetchedLatest.slice(1, 4);
    }
  } catch {
    fetchError = true;
  }

  try {
    selectedWriting = (await getPortfolioPublishedArticles()).slice(0, 4);
  } catch {
    selectedWriting = [];
  }
  const siteTitle =
    settings.site_title || profile.display_name || "Marie Medere";
  const tagline =
    settings.tagline ||
    profile.professional_tagline ||
    "Medical Writing Portfolio & Educational Blog";
  const introText =
    settings.homepage_intro ||
    profile.short_bio ||
    "A professional medical writing portfolio and educational publication dedicated to clear, evidence-based communication.";

  return (
    <PublicShell settings={settings}>
      <div className="space-y-16 sm:space-y-24">
        {/* Section 01: Professional & Editorial Positioning */}
        <section className="relative isolate overflow-hidden">
          {homeHero ? (
            <>
              <div className="absolute inset-y-0 right-[-12%] w-[76%] md:hidden">
                <ManagedSiteImage
                  media={homeHero}
                  priority
                  sizes="76vw"
                  className="h-full w-full"
                />
              </div>

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-[#F6F1E8] via-[#F6F1E8]/96 via-[58%] to-[#F6F1E8]/20 md:hidden"
              />
            </>
          ) : null}

          <div className="relative z-10 grid min-h-[430px] items-center md:grid-cols-12 md:gap-0 lg:min-h-[480px]">
            <div className="max-w-[88%] py-12 md:col-span-6 md:max-w-none md:pr-10 lg:col-span-5 lg:pr-6">
              <div className="flex flex-wrap items-center gap-3">
                <FolioMarker number={1} label="Publication Masthead" />
                <TopicImprint variant="oxide">Medical Writing</TopicImprint>
              </div>

              <h1 className="mt-7 font-serif text-4xl leading-[1.02] font-medium tracking-tight text-[#242321] sm:text-5xl lg:text-[4rem]">
                {siteTitle}
              </h1>

              <p className="mt-5 max-w-lg font-serif text-xl leading-snug text-[#7B3F35] sm:text-2xl">
                {tagline}
              </p>

              <p className="mt-7 max-w-xl font-sans text-base leading-relaxed text-[#5E5953] sm:text-lg">
                {introText}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/blog"
                  className={cn(
                    buttonVariants({
                      variant: "default",
                      size: "lg",
                    }),
                  )}
                >
                  Explore Articles
                </Link>

                <Link
                  href="/portfolio"
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: "lg",
                    }),
                  )}
                >
                  Selected Writing
                </Link>
              </div>
            </div>

            {homeHero ? (
              <div className="relative hidden h-full min-h-[430px] md:col-span-6 md:block lg:col-span-7 lg:-mr-6">
                <ManagedSiteImage
                  media={homeHero}
                  priority
                  sizes="(max-width: 1024px) 50vw, 58vw"
                  className="absolute inset-0"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F6F1E8] to-transparent lg:w-32"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#F6F1E8]/35 to-transparent"
                />
              </div>
            ) : null}
          </div>
        </section>
        {/* Sections 02 + 03: Latest Articles & Explore Topics */}
        <HomeDiscoverySections
          leadArticle={leadArticle}
          supportingArticles={supportingArticles}
          isLeadExplicitlyFeatured={isLeadExplicitlyFeatured}
          categories={categories}
          fetchError={fetchError}
        />
        {/* Sections 04 + 05: Selected Writing & About Marie */}
        <section className="-mt-6 border-t border-subtle-divider py-8 sm:-mt-10 sm:py-9">
          <div className="grid items-stretch lg:grid-cols-12">
            {/* 04 — Selected Writing */}
            <div className="lg:col-span-8 lg:pr-10">
              <div className="flex items-center justify-between gap-4">
                <FolioMarker number={4} label="Selected Writing" />

                <Link
                  href="/portfolio"
                  className="text-brand-oxide hidden text-[0.68rem] font-semibold tracking-wide hover:underline sm:inline-flex"
                >
                  View all writing →
                </Link>
              </div>

              {selectedWriting.length > 0 ? (
                <div
                  className={cn(
                    "mt-5 grid gap-x-7 gap-y-5",
                    selectedWriting.length <= 2
                      ? "sm:grid-cols-2"
                      : "sm:grid-cols-2 xl:grid-cols-4",
                  )}
                >
                  {selectedWriting.map((article, index) => (
                    <Link
                      key={article.id}
                      href={`/blog/${article.slug}`}
                      className="group relative border-t border-subtle-divider pt-4"
                    >
                      <div className="flex items-start gap-3">
                        <FileText
                          aria-hidden="true"
                          strokeWidth={1.45}
                          className="text-brand-oxide mt-0.5 h-4 w-4 shrink-0"
                        />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-brand-oxide font-serif text-[0.72rem]">
                              {String(index + 1).padStart(2, "0")}
                            </span>

                            {article.category && (
                              <span className="text-muted-ink text-[0.56rem] font-semibold tracking-[0.09em] uppercase">
                                {article.category.name}
                              </span>
                            )}
                          </div>

                          <h3 className="group-hover:text-brand-oxide mt-2 font-serif text-[1.03rem] leading-[1.14] font-medium tracking-tight text-ink transition-colors">
                            {article.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-ink mt-5 max-w-xl border-t border-subtle-divider pt-4 text-sm leading-relaxed">
                  Selected published writing will appear here as articles are
                  featured for the portfolio.
                </p>
              )}

              <Link
                href="/portfolio"
                className="text-brand-oxide mt-5 inline-flex text-xs font-semibold tracking-wide hover:underline sm:hidden"
              >
                View selected writing →
              </Link>
            </div>

            {/* 05 — About Marie */}
            <aside className="mt-8 border-t border-subtle-divider pt-7 lg:col-span-4 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <FolioMarker number={5} label="About Marie" />

              <div className="mt-5 max-w-md">
                <p className="text-sm leading-[1.65] text-[#45413D] sm:text-[0.95rem]">
                  {profile.short_bio ||
                    "Professional profile information will appear here as approved content becomes available."}
                </p>

                <Link
                  href="/about"
                  className="text-brand-oxide mt-4 inline-flex text-xs font-semibold tracking-wide hover:underline"
                >
                  Learn more about my approach →
                </Link>
              </div>
            </aside>
          </div>
        </section>
        {/* Compact Professional Contact Banner */}
        <HomeContactBanner />
        {/* Section 06: Medical Disclaimer Banner */}
        <section className="pt-4">
          <MedicalDisclaimer disclaimerText={settings.disclaimer_text} />
        </section>
      </div>
    </PublicShell>
  );
}
