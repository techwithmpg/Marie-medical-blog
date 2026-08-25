import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";
import { buttonVariants } from "@/components/ui/button";
import { PageIntro } from "@/components/public/page-intro";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { SplitRule } from "@/components/evidence/split-rule";
import { EvidenceRail } from "@/components/evidence/evidence-rail";
import { EmptyEditorialState } from "@/components/public/empty-editorial-state";
import { MedicalDisclaimer } from "@/components/public/medical-disclaimer";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Selected Writing — Marie Medere",
  description:
    "Curated portfolio of evidence-led medical writing, clinical literature syntheses, regulatory summaries, and health communications by Marie Medere.",
};

export default function PortfolioPage() {
  const writingDomains = [
    {
      folio: "01",
      domain: "Clinical Evidence Syntheses",
      description:
        "Comprehensive evaluations of primary clinical trial data, systematic reviews, and meta-analyses structured for healthcare practitioners and clinical researchers.",
      topics: ["Clinical Trials", "Meta-Analysis", "Systematic Review"],
    },
    {
      folio: "02",
      domain: "Regulatory & Technical Writing",
      description:
        "Precise documentation supporting clinical evaluation reports, regulatory submissions, protocol summaries, and briefing documents adhering to strict reporting guidelines.",
      topics: ["Regulatory Affairs", "Clinical Evaluation", "Protocols"],
    },
    {
      folio: "03",
      domain: "Educational Healthcare Publications",
      description:
        "High-integrity medical education monographs translating complex pathophysiological mechanisms and pharmacotherapy into clear, accessible knowledge.",
      topics: ["Medical Education", "Therapeutics", "Pathophysiology"],
    },
  ];

  return (
    <PublicShell>
      <div className="space-y-16 sm:space-y-20">
        {/* Page Header */}
        <PageIntro
          folioNumber={1}
          folioLabel="Curated Works"
          topicLabel="Portfolio"
          topicVariant="oxide"
          title="Selected Writing"
          deck="A curated index of evidence-based medical writing, clinical summaries, regulatory documentation overviews, and educational healthcare publications."
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Primary Column */}
          <div className="space-y-12 lg:col-span-8">
            {/* Writing Domains Overview */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <FolioMarker number={2} label="Practice Areas" />
                <TopicImprint variant="sage">Domains</TopicImprint>
              </div>

              <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl">
                Writing Disciplines &amp; Focus Areas
              </h2>

              <p className="text-base leading-relaxed text-[#5E5953]">
                Works are curated across distinct medical communication
                categories. Each piece emphasizes rigorous source verification,
                structural transparency, and tailored linguistic precision.
              </p>

              <div className="space-y-4">
                {writingDomains.map((domain) => (
                  <div
                    key={domain.folio}
                    className="space-y-3 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-6 transition-all hover:border-[#918579]"
                  >
                    <div className="flex items-center justify-between">
                      <FolioMarker number={domain.folio} />
                      <div className="flex flex-wrap gap-1.5">
                        {domain.topics.map((t) => (
                          <TopicImprint key={t} variant="muted">
                            {t}
                          </TopicImprint>
                        ))}
                      </div>
                    </div>
                    <h3 className="font-serif text-xl font-medium text-[#242321]">
                      {domain.domain}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#5E5953]">
                      {domain.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Selected Articles / Curated Writing Shell */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <FolioMarker number={3} label="Publication Index" />
                <TopicImprint variant="oxide">Entries</TopicImprint>
              </div>

              <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl">
                Featured Entries
              </h2>

              <EmptyEditorialState
                title="Curated Writing in Editorial Preparation"
                description="Selected publications and clinical manuscripts are being prepared for public display. Published portfolio entries will appear here upon release."
                topicLabel="Editorial Pipeline"
                actionHref="/contact"
                actionLabel="Inquire About Specific Writing Samples"
              />
            </section>

            {/* Inquiries & Collaboration Bridge */}
            <section className="space-y-4 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-8">
              <h3 className="font-serif text-2xl font-medium text-[#242321]">
                Request Writing Samples &amp; Inquire
              </h3>
              <p className="text-sm leading-relaxed text-[#5E5953]">
                For blinded writing samples, regulatory documentation excerpts,
                or publication collaboration inquiries, contact Marie Medere
                directly.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                  )}
                >
                  Send Inquiry
                </Link>
              </div>
            </section>
          </div>

          {/* Desktop Evidence Rail / Sidebar */}
          <div className="space-y-6 lg:col-span-4">
            <EvidenceRail
              marker="Ref 01"
              label="Editorial Criteria"
              className="rounded-md border border-[#D2C9BC] bg-[#FFFDF9]/80 p-5"
            >
              <div className="space-y-4">
                <span className="font-serif text-base font-medium text-[#242321]">
                  Portfolio Selection Standards
                </span>
                <p className="text-xs leading-relaxed text-[#5E5953]">
                  All featured entries adhere to strict scientific evaluation
                  criteria:
                </p>

                <ul className="space-y-2 text-xs text-[#5E5953]">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>
                      Primary evidence sourcing with full bibliographic ledger
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>
                      Compliance with medical writing reporting guidelines
                      (ICMJE/GPP)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>
                      Audience-appropriate complexity and technical rigor
                    </span>
                  </li>
                </ul>

                <SplitRule />

                <div className="pt-1">
                  <Link
                    href="/about"
                    className="inline-flex items-center text-xs font-semibold tracking-wider text-[#7B3F35] uppercase hover:underline"
                  >
                    Read editorial philosophy →
                  </Link>
                </div>
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
