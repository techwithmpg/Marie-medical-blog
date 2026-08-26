import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";
import { buttonVariants } from "@/components/ui/button";
import { PageIntro } from "@/components/public/page-intro";
import { EvidenceRail } from "@/components/evidence/evidence-rail";
import { EmptyEditorialState } from "@/components/public/empty-editorial-state";
import { ArticleListItem } from "@/components/public/article-list-item";
import { MedicalDisclaimer } from "@/components/public/medical-disclaimer";
import { SplitRule } from "@/components/evidence/split-rule";
import { getPortfolioPublishedArticles } from "@/lib/public-articles";
import { getPublicSiteSettings } from "@/lib/public-data";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Selected Writing — Marie Medere",
  description:
    "Selected Writing portfolio and educational publication index by Marie Medere.",
};

export default async function PortfolioPage() {
  let portfolioArticles: Awaited<
    ReturnType<typeof getPortfolioPublishedArticles>
  > = [];
  const settings = await getPublicSiteSettings();
  let fetchError = false;

  try {
    portfolioArticles = await getPortfolioPublishedArticles();
  } catch {
    fetchError = true;
  }

  return (
    <PublicShell settings={settings}>
      <div className="space-y-16 sm:space-y-20">
        {/* Page Header */}
        <PageIntro
          folioNumber={1}
          folioLabel="Curated Works"
          topicLabel="Portfolio"
          topicVariant="oxide"
          title="Selected Writing"
          deck="Selected published medical writing and educational publications will appear here as approved content becomes available."
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Primary Column */}
          <div className="space-y-12 lg:col-span-8">
            {/* Selected Articles / Curated Writing Shell */}
            <section className="space-y-6">
              {fetchError ? (
                <div className="bg-reading-surface text-muted-ink rounded-lg border border-subtle-divider p-8 text-center text-sm">
                  Unable to load published writing at this time. Please try
                  again later.
                </div>
              ) : portfolioArticles.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#D2C9BC] pb-3">
                    <h2 className="font-serif text-lg font-medium text-[#242321]">
                      Curated Publications
                    </h2>
                    <span className="text-xs text-[#5E5953]">
                      {portfolioArticles.length} Selected{" "}
                      {portfolioArticles.length === 1 ? "Work" : "Works"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {portfolioArticles.map((article, index) => (
                      <ArticleListItem
                        key={article.id}
                        article={article}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyEditorialState
                  title="Selected Writing"
                  description="Published medical writing entries and educational publications will appear here as entries are released."
                  topicLabel="Publication Archive"
                  actionHref="/blog"
                  actionLabel="Browse All Articles"
                />
              )}
            </section>

            {/* Inquiries Bridge */}
            <section className="space-y-4 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-8">
              <h2 className="font-serif text-2xl font-medium text-[#242321]">
                Professional Inquiries
              </h2>
              <p className="text-sm leading-relaxed text-[#5E5953]">
                For inquiries about Marie Medere&apos;s medical writing
                portfolio and educational publication work, use the contact
                page.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                  )}
                >
                  Contact
                </Link>
              </div>
            </section>
          </div>

          {/* Desktop Evidence Rail / Sidebar */}
          <div className="space-y-6 lg:col-span-4">
            <EvidenceRail
              marker="Ref 01"
              label="Portfolio"
              className="rounded-md border border-[#D2C9BC] bg-[#FFFDF9]/80 p-5"
            >
              <div className="space-y-4">
                <span className="font-serif text-base font-medium text-[#242321]">
                  Selected Writing
                </span>
                <p className="text-xs leading-relaxed text-[#5E5953]">
                  Approved published writing will be presented here as content
                  becomes available.
                </p>

                <SplitRule />

                <div className="pt-1">
                  <Link
                    href="/blog"
                    className="inline-flex items-center text-xs font-semibold tracking-wider text-[#7B3F35] uppercase hover:underline"
                  >
                    Browse publication archive →
                  </Link>
                </div>
              </div>
            </EvidenceRail>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <section className="pt-4">
          <MedicalDisclaimer disclaimerText={settings.disclaimer_text} />
        </section>
      </div>
    </PublicShell>
  );
}
