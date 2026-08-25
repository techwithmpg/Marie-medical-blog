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
import { getPublicProfile } from "@/lib/public-data";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "About — Marie Medere",
  description:
    "Professional profile, editorial philosophy, and medical writing approach of Marie Medere, dedicated to clear, evidence-based healthcare communication.",
};

export default async function AboutPage() {
  const profile = await getPublicProfile();

  const writingPillars = [
    {
      folio: "01",
      title: "Evidence-First Synthesis",
      description:
        "Every publication begins with comprehensive appraisal of peer-reviewed literature, clinical trials data, and consensus guidelines. Conclusions reflect evidence strength without overstated claims.",
    },
    {
      folio: "02",
      title: "Clarity Without Oversimplification",
      description:
        "Complex medical mechanisms and therapeutic data are articulated with linguistic precision. Technical accuracy is maintained while ensuring readability for multidisciplinary stakeholders.",
    },
    {
      folio: "03",
      title: "Editorial Independence & Integrity",
      description:
        "Writing adheres strictly to objective scientific standards, transparent bibliographic referencing, and educational integrity free from commercial bias.",
    },
  ];

  return (
    <PublicShell>
      <div className="space-y-16 sm:space-y-20">
        {/* Page Header */}
        <PageIntro
          folioNumber={1}
          folioLabel="Profile & Philosophy"
          topicLabel="About the Author"
          topicVariant="oxide"
          title={`About ${profile.display_name}`}
          deck={
            profile.short_bio ||
            "Evidence-led medical writer dedicated to translating complex healthcare research, clinical data, and regulatory documents into rigorous, transparent communications."
          }
        />

        {/* Main Profile Grid */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Primary Profile Column */}
          <div className="space-y-10 lg:col-span-8">
            {/* Professional Background */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl">
                Editorial Background &amp; Focus
              </h2>

              <p className="text-base leading-relaxed text-[#242321] sm:text-lg">
                Marie Medere specializes in evidence-based medical writing,
                clinical literature synthesis, and educational healthcare
                communication. Working at the intersection of clinical science
                and structured documentation, the objective is always to deliver
                clarity, accuracy, and rigorous evidence representation.
              </p>

              {profile.long_bio && (
                <p className="text-base leading-relaxed text-[#5E5953] sm:text-lg">
                  {profile.long_bio}
                </p>
              )}

              <p className="text-base leading-relaxed text-[#5E5953]">
                Through structured editorial frameworks such as The Evidence
                Folio, every published piece incorporates transparent reference
                ledgers, methodological context, and disciplined scientific
                language tailored to discerning medical and professional
                audiences.
              </p>
            </section>

            {/* Writing Pillars */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <FolioMarker number={2} label="Methodology" />
                <TopicImprint variant="sage">Core Principles</TopicImprint>
              </div>

              <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl">
                The Writing &amp; Editorial Approach
              </h2>

              <div className="space-y-4">
                {writingPillars.map((pillar) => (
                  <div
                    key={pillar.folio}
                    className="space-y-2 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-6"
                  >
                    <div className="flex items-center justify-between">
                      <FolioMarker number={pillar.folio} />
                      <TopicImprint variant="muted">Standard</TopicImprint>
                    </div>
                    <h3 className="font-serif text-xl font-medium text-[#242321]">
                      {pillar.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#5E5953]">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Conditional Education / Verified Profile details */}
            {profile.education_summary && (
              <section className="space-y-4 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-6">
                <h3 className="font-serif text-xl font-medium text-[#242321]">
                  Verified Academic &amp; Professional Background
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
                  Explore Portfolio &amp; Inquire
                </h3>
                <p className="text-sm leading-relaxed text-[#5E5953]">
                  Browse curated writing samples across clinical and educational
                  domains, or reach out for project collaboration.
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
                  Contact Marie
                </Link>
                {profile.cv_storage_path ? (
                  <a
                    href={profile.cv_storage_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "default" }),
                    )}
                  >
                    Download Curriculum Vitae
                  </a>
                ) : null}
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
                    {profile.display_name}
                  </span>
                  <p className="text-xs text-[#5E5953]">
                    {profile.professional_tagline}
                  </p>
                </div>

                <SplitRule />

                <div className="space-y-2 text-xs leading-relaxed text-[#5E5953]">
                  <strong className="block font-semibold tracking-wider text-[#242321] uppercase">
                    Practice Scope
                  </strong>
                  <ul className="space-y-1.5">
                    <li>• Clinical summaries &amp; review manuscripts</li>
                    <li>• Regulatory documentation support</li>
                    <li>• Healthcare educational writing</li>
                    <li>• Evidence synthesis &amp; bibliographic auditing</li>
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
