import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";
import { buttonVariants } from "@/components/ui/button";
import { PageIntro } from "@/components/public/page-intro";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { SplitRule } from "@/components/evidence/split-rule";
import { EvidenceRail } from "@/components/evidence/evidence-rail";
import { MedicalDisclaimer } from "@/components/public/medical-disclaimer";
import { getPublicProfile, getPublicCvUrl } from "@/lib/public-data";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "About — Marie Medere",
  description:
    "About Marie Medere, medical writing portfolio, and educational publication approach.",
};

export default async function AboutPage() {
  const profile = await getPublicProfile();
  const cvUrl = await getPublicCvUrl(profile.cv_storage_path);

  const displayName = profile.display_name || "Marie Medere";
  const tagline = profile.professional_tagline;

  const corePrinciples = [
    {
      folio: "01",
      title: "Evidence-Based Communication",
      description:
        "Presenting healthcare and scientific topics with direct reference to underlying clinical evidence and literature sources.",
    },
    {
      folio: "02",
      title: "Clarity & Accuracy",
      description:
        "Maintaining scientific precision while structuring content for clear, accessible reading across professional audiences.",
    },
    {
      folio: "03",
      title: "Educational Integrity",
      description:
        "Structuring publications objectively to support educational understanding, free from promotional bias.",
    },
  ];

  return (
    <PublicShell>
      <div className="space-y-16 sm:space-y-20">
        {/* Page Header */}
        <PageIntro
          folioNumber={1}
          folioLabel="Profile & Purpose"
          topicLabel="About"
          topicVariant="oxide"
          title={`About ${displayName}`}
          deck={
            profile.short_bio ||
            "Medical writing portfolio and educational publication dedicated to clear, evidence-based healthcare communication."
          }
        />

        {/* Main Profile Grid */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Primary Column */}
          <div className="space-y-10 lg:col-span-8">
            {/* Publication Approach & Purpose */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl">
                Publication Purpose &amp; Approach
              </h2>

              <p className="text-base leading-relaxed text-[#242321] sm:text-lg">
                This website serves as a dedicated platform for medical writing
                and educational publications authored by {displayName}. The goal
                of the publication is to explore healthcare science, clinical
                evidence, and medical topics with rigorous attention to clarity
                and transparent citations.
              </p>

              {profile.long_bio && (
                <p className="text-base leading-relaxed text-[#5E5953] sm:text-lg">
                  {profile.long_bio}
                </p>
              )}

              <p className="text-base leading-relaxed text-[#5E5953]">
                By combining clear language with transparent reference
                structures, entries are organized to make complex biomedical
                concepts understandable without sacrificing scientific accuracy.
              </p>
            </section>

            {/* Core Principles */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <FolioMarker number={2} label="Editorial Foundations" />
                <TopicImprint variant="sage">Principles</TopicImprint>
              </div>

              <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl">
                Editorial Principles
              </h2>

              <div className="space-y-4">
                {corePrinciples.map((principle) => (
                  <div
                    key={principle.folio}
                    className="space-y-2 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-6"
                  >
                    <div className="flex items-center justify-between">
                      <FolioMarker number={principle.folio} />
                      <TopicImprint variant="muted">Standard</TopicImprint>
                    </div>
                    <h3 className="font-serif text-xl font-medium text-[#242321]">
                      {principle.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#5E5953]">
                      {principle.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Conditional Education / Verified Profile details */}
            {profile.education_summary && (
              <section className="space-y-4 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-6">
                <h3 className="font-serif text-xl font-medium text-[#242321]">
                  Academic Background
                </h3>
                <p className="text-sm leading-relaxed text-[#5E5953]">
                  {profile.education_summary}
                </p>
              </section>
            )}

            {/* Selected Writing & Contact CTAs */}
            <section className="space-y-6 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-8">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-medium text-[#242321]">
                  Selected Writing &amp; Inquiries
                </h3>
                <p className="text-sm leading-relaxed text-[#5E5953]">
                  Explore curated writing entries or reach out for professional
                  inquiries.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/portfolio"
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                  )}
                >
                  View Selected Writing
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                  )}
                >
                  Contact
                </Link>
                {cvUrl && (
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "default" }),
                    )}
                  >
                    Download CV
                  </a>
                )}
              </div>
            </section>
          </div>

          {/* Desktop Evidence Rail / Sidebar */}
          <div className="space-y-6 lg:col-span-4">
            <EvidenceRail
              marker="Ref 01"
              label="Author Profile"
              className="rounded-md border border-[#D2C9BC] bg-[#FFFDF9]/80 p-5"
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="font-serif text-lg font-medium text-[#242321]">
                    {displayName}
                  </span>
                  {tagline && (
                    <p className="text-xs text-[#5E5953]">{tagline}</p>
                  )}
                </div>

                <SplitRule />

                <div className="space-y-2 text-xs leading-relaxed text-[#5E5953]">
                  <strong className="block font-semibold tracking-wider text-[#242321] uppercase">
                    Publication Focus
                  </strong>
                  <ul className="space-y-1.5">
                    <li>• Evidence-based medical writing</li>
                    <li>• Educational healthcare publications</li>
                    <li>• Literature synthesis and review</li>
                  </ul>
                </div>

                {profile.interests && profile.interests.length > 0 && (
                  <div className="space-y-2 pt-2 text-xs leading-relaxed text-[#5E5953]">
                    <strong className="block font-semibold tracking-wider text-[#242321] uppercase">
                      Focus Areas
                    </strong>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.interests.map((interest) => (
                        <TopicImprint key={interest} variant="sage">
                          {interest}
                        </TopicImprint>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </EvidenceRail>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <section className="pt-4">
          <MedicalDisclaimer />
        </section>
      </div>
    </PublicShell>
  );
}
