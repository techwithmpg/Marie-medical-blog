import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";
import { buttonVariants } from "@/components/ui/button";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { SplitRule } from "@/components/evidence/split-rule";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { EvidenceRail } from "@/components/evidence/evidence-rail";
import { MedicalDisclaimer } from "@/components/public/medical-disclaimer";
import { EmptyEditorialState } from "@/components/public/empty-editorial-state";
import { getPublicProfile, getPublicSiteSettings } from "@/lib/public-data";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Marie Medere — Medical Writing Portfolio & Educational Blog",
  description: "Medical Writing Portfolio & Educational Blog by Marie Medere.",
};

export default async function HomePage() {
  const profile = await getPublicProfile();
  const settings = await getPublicSiteSettings();

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
    <PublicShell>
      <div className="space-y-16 sm:space-y-24">
        {/* Section 01: Professional & Editorial Positioning */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <FolioMarker number={1} label="Publication Masthead" />
            <TopicImprint variant="oxide">Medical Writing</TopicImprint>
          </div>

          <div className="max-w-4xl space-y-3">
            <h1 className="font-serif text-4xl leading-[1.12] font-medium tracking-tight text-[#242321] sm:text-5xl lg:text-6xl">
              {siteTitle}
            </h1>
            <p className="font-serif text-xl font-normal text-[#7B3F35] sm:text-2xl">
              {tagline}
            </p>
          </div>

          <p className="max-w-2xl font-sans text-lg leading-relaxed text-[#5E5953] sm:text-xl">
            {introText}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/portfolio"
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Explore Selected Writing
            </Link>
            <Link
              href="/about"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              About the Author
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
              )}
            >
              Contact
            </Link>
          </div>

          <SplitRule className="pt-6" />
        </section>

        {/* Section 02: Publication Scope & Evidence Rail */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <FolioMarker number={2} label="Editorial Foundations" />
            <TopicImprint variant="sage">Purpose &amp; Scope</TopicImprint>
          </div>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            {/* Primary reading & structural column */}
            <div className="space-y-6 lg:col-span-8">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl lg:text-4xl">
                Evidence-Led Medical Communication
              </h2>

              <p className="text-base leading-relaxed text-[#242321] sm:text-lg">
                This platform serves as an independent publication and writing
                portfolio. Its objective is to present medical communication,
                educational writing, and scientific literature overviews with
                clarity and disciplined source citation.
              </p>

              <p className="text-base leading-relaxed text-[#5E5953]">
                Through structured editorial frameworks, published materials
                emphasize primary reference documentation, accessible synthesis,
                and responsible educational presentation.
              </p>
            </div>

            {/* Desktop Evidence Rail */}
            <div className="space-y-6 lg:col-span-4">
              <EvidenceRail
                marker="Ref 01"
                label="Editorial Standard"
                className="rounded-md border border-[#D2C9BC] bg-[#FFFDF9]/80 p-5"
              >
                <div className="space-y-3">
                  <span className="font-serif text-base font-medium text-[#242321]">
                    The Evidence Folio Standard
                  </span>
                  <p className="text-xs leading-relaxed text-[#5E5953]">
                    A structured editorial design system emphasizing source
                    transparency, educational integrity, and clear
                    communication.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <TopicImprint variant="oxide">Evidence-First</TopicImprint>
                    <TopicImprint variant="sage">Educational</TopicImprint>
                  </div>
                </div>
              </EvidenceRail>
            </div>
          </div>
        </section>

        {/* Section 03: Selected Writing Overview (Editorial Layout, No 3-card grid) */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <FolioMarker number={3} label="Selected Writing" />
            <TopicImprint variant="oxide">Portfolio</TopicImprint>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl">
                Selected Writing &amp; Publications
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-[#5E5953]">
                Curated medical writing entries and educational publications.
              </p>
            </div>
            <Link
              href="/portfolio"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              View Portfolio Overview →
            </Link>
          </div>

          <EmptyEditorialState
            title="Selected Writing"
            description="Published articles and selected medical writing entries will appear here as publications are released."
            topicLabel="Publication Archive"
            actionHref="/portfolio"
            actionLabel="View Portfolio Overview"
          />
        </section>

        {/* Section 04: About Marie Bridge */}
        <section className="space-y-6 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-8 sm:p-12">
          <div className="flex items-center gap-3">
            <FolioMarker number={4} label="Author Profile" />
            <TopicImprint variant="sage">About</TopicImprint>
          </div>

          <div className="max-w-3xl space-y-4">
            <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl">
              About Marie Medere
            </h2>
            <p className="text-base leading-relaxed text-[#5E5953] sm:text-lg">
              {profile.short_bio ||
                "Marie Medere authors medical writing and educational publications focused on clarity, scientific accuracy, and accessible communication."}
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                )}
              >
                Read Full Profile &amp; Approach
              </Link>
            </div>
          </div>
        </section>

        {/* Section 05: Contact CTA */}
        <section className="space-y-6 text-center">
          <div className="flex justify-center">
            <FolioMarker number={5} label="Inquiries" />
          </div>

          <h2 className="font-serif text-3xl font-medium tracking-tight text-[#242321] sm:text-4xl">
            Contact &amp; Inquiries
          </h2>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-[#5E5953] sm:text-lg">
            For professional inquiries regarding medical writing and educational
            publications.
          </p>

          <div className="pt-2">
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Contact
            </Link>
          </div>
        </section>

        {/* Section 06: Medical Disclaimer Banner */}
        <section className="pt-4">
          <MedicalDisclaimer />
        </section>
      </div>
    </PublicShell>
  );
}
