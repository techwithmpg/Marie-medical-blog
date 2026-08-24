import * as React from "react";
import { PublicShell } from "@/components/site/public-shell";
import { Button } from "@/components/ui/button";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { SplitRule } from "@/components/evidence/split-rule";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { EvidenceRail } from "@/components/evidence/evidence-rail";
import { ReferenceLedger } from "@/components/evidence/reference-ledger";

export default function Home() {
  const sampleReferences = [
    {
      id: 1,
      text: "Standardized methodology for clinical evidence synthesis and peer-reviewed communication.",
      citation: "Evidence Review Standards, 2024",
    },
    {
      id: 2,
      text: "Accessible health literacy frameworks and Plain Language Summaries in clinical practice.",
      citation: "Health Literacy Guidelines, 2023",
    },
  ];

  return (
    <PublicShell>
      <div className="space-y-16 sm:space-y-20">
        {/* Section 01: Typographic Masthead & Identity */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <FolioMarker number={1} label="Design System Baseline" />
            <TopicImprint variant="oxide">Stage 2 Foundation</TopicImprint>
          </div>

          <h1 className="max-w-3xl font-serif text-4xl leading-[1.12] font-medium tracking-tight text-[#242321] sm:text-5xl lg:text-6xl">
            Evidence-based medical writing with editorial clarity.
          </h1>

          <p className="max-w-2xl font-sans text-lg leading-relaxed text-[#5E5953] sm:text-xl">
            The Evidence Folio system pairs rigorous medical accuracy with calm,
            restrained editorial design for clinical publications and
            educational portfolios.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button variant="default" size="default">
              Primary Action
            </Button>
            <Button variant="secondary" size="default">
              Secondary Action
            </Button>
            <Button variant="outline" size="default">
              Outline Action
            </Button>
          </div>

          <SplitRule className="pt-4" />
        </section>

        {/* Section 02: Signature Components & Editorial Grid */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <FolioMarker number={2} label="Editorial Primitives" />
            <TopicImprint variant="sage">Signature Language</TopicImprint>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Primary reading column */}
            <div className="space-y-6 lg:col-span-8">
              <h2 className="font-serif text-2xl font-medium text-[#242321] sm:text-3xl">
                Typography and Content Hierarchy
              </h2>

              <p className="text-base leading-relaxed text-[#242321] sm:text-lg">
                Body copy is rendered in Source Sans 3 with generous line height
                and controlled line measure to ensure optimal readability across
                mobile, tablet, and desktop environments.
              </p>

              <div className="space-y-4 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-6">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg font-medium text-[#242321]">
                    Sample Reading Card
                  </span>
                  <TopicImprint variant="muted">Specification</TopicImprint>
                </div>
                <p className="text-sm leading-relaxed text-[#5E5953]">
                  Surfaces utilize paper tones with subtle borders and
                  restrained corner radii, avoiding heavy floating shadows in
                  favor of typographic structure and spacing.
                </p>
                <div className="pt-2">
                  <Button variant="link" size="sm">
                    Read documentation →
                  </Button>
                </div>
              </div>

              {/* Reference Ledger primitive */}
              <ReferenceLedger items={sampleReferences} />
            </div>

            {/* Evidence Rail side column on desktop */}
            <div className="space-y-6 lg:col-span-4">
              <EvidenceRail
                marker="Ref 02"
                label="Structural Cue"
                className="rounded-md border border-[#D2C9BC] bg-[#FFFDF9]/60 p-4"
              >
                <p className="text-xs leading-normal text-[#5E5953]">
                  The Evidence Rail serves as a subtle structural reference cue
                  on desktop without competing with the primary reading flow.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <TopicImprint variant="default">Clinical</TopicImprint>
                  <TopicImprint variant="sage">Research</TopicImprint>
                </div>
              </EvidenceRail>

              <div className="lg:hidden">
                <EvidenceRail
                  orientation="horizontal"
                  marker="Ref 02"
                  label="Collapsed Mobile Rail"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
