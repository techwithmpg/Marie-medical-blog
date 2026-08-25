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
  description:
    "Evidence-led medical writing portfolio and educational publication translating complex clinical data, regulatory documentation, and healthcare science into rigorous communication.",
};

export default async function HomePage() {
  const profile = await getPublicProfile();
  const settings = await getPublicSiteSettings();

  const coreFocusAreas = [
    {
      folio: "01",
      topic: "Clinical Synthesis",
      title: "Translating Trial Evidence into Practice",
      description:
        "Rigorous meta-analyses, systematic literature reviews, and clinical monograph summaries structured for healthcare professionals.",
    },
    {
      folio: "02",
      topic: "Regulatory & Medical Writing",
      title: "Precision in Regulatory Communications",
      description:
        "Protocol development, clinical evaluation reports, and structured regulatory dossiers adhering to strict scientific documentation standards.",
    },
    {
      folio: "03",
      topic: "Health Communication",
      title: "Evidence-Based Patient & Professional Education",
      description:
        "Clear, accurate medical education materials designed to bridge the gap between complex biomedical findings and clinical understanding.",
    },
  ];

  return (
    <PublicShell>
      <div className="space-y-16 sm:space-y-24">
        {/* Section 01: Professional & Editorial Positioning */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <FolioMarker number={1} label="Publication Masthead" />
            <TopicImprint variant="oxide">
              Evidence-Led Medical Writing
            </TopicImprint>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="font-serif text-4xl leading-[1.12] font-medium tracking-tight text-[#242321] sm:text-5xl lg:text-6xl">
              {profile.display_name}
            </h1>
            <p className="font-serif text-xl font-normal text-[#7B3F35] sm:text-2xl">
              {settings.tagline || profile.professional_tagline}
            </p>
          </div>

          <p className="max-w-2xl font-sans text-lg leading-relaxed text-[#5E5953] sm:text-xl">
            {settings.homepage_intro || profile.short_bio}
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
              About the Author &amp; Approach
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
              )}
            >
              Get in Touch
            </Link>
          </div>

          <SplitRule className="pt-6" />
        </section>

        {/* Section 02: Publication Overview & Evidence Rail Grid */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <FolioMarker number={2} label="Editorial Foundations" />
            <TopicImprint variant="sage">Scientific Restraint</TopicImprint>
          </div>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            {/* Primary reading & structural column */}
            <div className="space-y-6 lg:col-span-8">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl lg:text-4xl">
                Rigorous Medical Writing Grounded in Primary Evidence
              </h2>

              <p className="text-base leading-relaxed text-[#242321] sm:text-lg">
                This publication serves as both a curated portfolio of
                professional medical communications and an independent
                educational platform. Every entry is developed through
                methodical literature appraisal, adherence to evidence
                hierarchies, and plain-language scientific translation.
              </p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2.5 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-medium text-[#242321]">
                      Primary Literature Focus
                    </span>
                    <TopicImprint variant="muted">Methodology</TopicImprint>
                  </div>
                  <p className="text-sm leading-relaxed text-[#5E5953]">
                    Grounding all syntheses in peer-reviewed clinical trials,
                    systematic reviews, and established regulatory guidelines.
                  </p>
                </div>

                <div className="space-y-2.5 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-medium text-[#242321]">
                      Clarity for Stakeholders
                    </span>
                    <TopicImprint variant="muted">Communication</TopicImprint>
                  </div>
                  <p className="text-sm leading-relaxed text-[#5E5953]">
                    Crafting clear, accurate, and audience-tailored materials
                    for clinical, regulatory, and multidisciplinary audiences.
                  </p>
                </div>
              </div>
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
                    A structured editorial grammar ensuring transparency in
                    sources, bibliographic citations, and independent medical
                    writing standards.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <TopicImprint variant="oxide">Evidence-First</TopicImprint>
                    <TopicImprint variant="sage">Peer-Reviewed</TopicImprint>
                  </div>
                </div>
              </EvidenceRail>
            </div>
          </div>
        </section>

        {/* Section 03: Core Focus Areas */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <FolioMarker number={3} label="Practice Domains" />
            <TopicImprint variant="default">Focus Areas</TopicImprint>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl">
              Medical Writing &amp; Educational Pillars
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-[#5E5953]">
              Specialized domains spanning clinical documentation, regulatory
              synthesis, and healthcare communication.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {coreFocusAreas.map((area) => (
              <div
                key={area.folio}
                className="flex flex-col justify-between space-y-4 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-6 transition-all hover:border-[#918579]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FolioMarker number={area.folio} />
                    <TopicImprint variant="sage">{area.topic}</TopicImprint>
                  </div>
                  <h3 className="font-serif text-xl leading-snug font-medium text-[#242321]">
                    {area.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#5E5953]">
                    {area.description}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center text-xs font-semibold tracking-wider text-[#7B3F35] uppercase hover:underline"
                  >
                    View domain writing →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 04: Selected Writing / Portfolio Preview */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <FolioMarker number={4} label="Selected Writing" />
            <TopicImprint variant="oxide">Portfolio</TopicImprint>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl">
                Curated Writing &amp; Publications
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-[#5E5953]">
                Selected clinical monographs, regulatory overviews, and
                educational writing samples.
              </p>
            </div>
            <Link
              href="/portfolio"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              View Full Portfolio →
            </Link>
          </div>

          <EmptyEditorialState
            title="Curated Entries in Editorial Preparation"
            description="Selected medical writing samples and educational articles are undergoing final editorial review. Initial entries will be published here upon release."
            topicLabel="Selected Writing"
            actionHref="/portfolio"
            actionLabel="Explore Writing Domains"
          />
        </section>

        {/* Section 05: About Bridge */}
        <section className="space-y-6 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-8 sm:p-12">
          <div className="flex items-center gap-3">
            <FolioMarker number={5} label="Author Profile" />
            <TopicImprint variant="sage">About Marie</TopicImprint>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl">
                Dedicated to Evidence-Led Medical Communication
              </h2>
              <p className="text-base leading-relaxed text-[#5E5953] sm:text-lg">
                {profile.short_bio}
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

            <div className="space-y-3 rounded-xs border border-[#D2C9BC] bg-[#F6F1E8]/50 p-5 lg:col-span-4">
              <span className="font-serif text-sm font-medium text-[#242321]">
                Editorial Principles
              </span>
              <ul className="space-y-2 text-xs leading-relaxed text-[#5E5953]">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#7B3F35]" />
                  Scientific accuracy above promotional tone
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#7B3F35]" />
                  Explicit reference indexing for all clinical data
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#7B3F35]" />
                  Audience-tailored clarity without oversimplification
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 06: Contact CTA */}
        <section className="space-y-6 text-center">
          <div className="flex justify-center">
            <FolioMarker number={6} label="Collaboration" />
          </div>

          <h2 className="font-serif text-3xl font-medium tracking-tight text-[#242321] sm:text-4xl">
            Inquire About Writing Engagements
          </h2>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-[#5E5953] sm:text-lg">
            Available for medical communications, regulatory writing consults,
            and educational publication projects.
          </p>

          <div className="pt-2">
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Open Contact Form
            </Link>
          </div>
        </section>

        {/* Section 07: Medical Disclaimer Banner */}
        <section className="pt-4">
          <MedicalDisclaimer />
        </section>
      </div>
    </PublicShell>
  );
}
