import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";
import { PageIntro } from "@/components/public/page-intro";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { SplitRule } from "@/components/evidence/split-rule";
import { EvidenceRail } from "@/components/evidence/evidence-rail";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Medical Disclaimer — Marie Medere",
  description:
    "Medical and educational disclaimer for Marie Medere's Medical Writing Portfolio & Educational Blog.",
};

export default function DisclaimerPage() {
  const disclaimerSections = [
    {
      folio: "01",
      title: "Educational Purpose & Informational Scope",
      content:
        "All articles, scientific commentaries, clinical summaries, monographs, and related publications available on this platform are provided strictly for educational and informational purposes. The materials are intended to synthesize published scientific evidence, clinical research methodologies, and medical communications for professional, academic, and general educational audiences.",
    },
    {
      folio: "02",
      title: "No Doctor-Patient or Clinical Provider Relationship",
      content:
        "Accessing, reading, interacting with, or communicating through this publication does not establish a doctor-patient, clinician-patient, or healthcare provider relationship of any kind. None of the content provided on this website constitutes personalized clinical advice, diagnostic assessment, prognosis, or medical treatment recommendations.",
    },
    {
      folio: "03",
      title: "Individual Medical Decisions & Professional Healthcare Guidance",
      content:
        "Individual healthcare decisions should always be made in direct consultation with a licensed physician or qualified healthcare provider who can evaluate individual symptoms, medical history, physical findings, and diagnostic data. Never disregard, avoid, or delay obtaining professional medical advice because of something you have read on this website.",
    },
    {
      folio: "04",
      title: "Scientific Evidence, Source Selection & Editorial Responsibility",
      content:
        "Publications on this site reflect literature appraisal and synthesis of peer-reviewed biomedical research, clinical trials, and regulatory standards available at the time of authoring. While reasonable care is taken to ensure accuracy and transparent citation of primary literature, medical science evolves continuously. The author and publisher do not warrant that all historical content reflects the most recent consensus guidelines.",
    },
    {
      folio: "05",
      title: "No Endorsement of Commercial Products or Therapies",
      content:
        "Mention of specific pharmaceutical agents, medical devices, therapeutic regimens, clinical trial sponsors, or healthcare organizations within writing samples or educational articles does not constitute an endorsement, recommendation, or commercial promotion. All discussions are conducted strictly for scientific analysis and editorial examination.",
    },
    {
      folio: "06",
      title: "Emergency Situations",
      content:
        "If you believe you may be experiencing a medical emergency, acute clinical deterioration, or life-threatening situation, immediately contact your local emergency services or seek care at the nearest hospital or emergency facility. This website is not monitored for clinical inquiries.",
    },
  ];

  return (
    <PublicShell>
      <div className="space-y-16 sm:space-y-20">
        {/* Page Header */}
        <PageIntro
          folioNumber={1}
          folioLabel="Governance"
          topicLabel="Editorial Policy"
          topicVariant="oxide"
          title="Medical &amp; Educational Disclaimer"
          deck="Important notice regarding the educational scope, medical information limitations, and scientific editorial standards of this publication."
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Primary Reading Column */}
          <div className="space-y-10 lg:col-span-8">
            <div className="space-y-8">
              {disclaimerSections.map((section) => (
                <section
                  key={section.folio}
                  className="space-y-3 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <FolioMarker number={section.folio} />
                    <TopicImprint variant="muted">Notice</TopicImprint>
                  </div>
                  <h2 className="font-serif text-xl font-medium text-[#242321] sm:text-2xl">
                    {section.title}
                  </h2>
                  <p className="text-base leading-relaxed text-[#5E5953]">
                    {section.content}
                  </p>
                </section>
              ))}
            </div>

            {/* Back links */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                )}
              >
                Return to Home
              </Link>
              <Link
                href="/about"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                )}
              >
                About the Publication
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "default" }),
                )}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Desktop Evidence Rail / Sidebar */}
          <div className="space-y-6 lg:col-span-4">
            <EvidenceRail
              marker="Ref 01"
              label="Summary Note"
              className="rounded-md border border-[#D2C9BC] bg-[#FFFDF9]/80 p-5"
            >
              <div className="space-y-4">
                <span className="font-serif text-base font-medium text-[#242321]">
                  At a Glance
                </span>
                <p className="text-xs leading-relaxed text-[#5E5953]">
                  Key points regarding the platform&apos;s educational standard:
                </p>

                <ul className="space-y-2 text-xs text-[#5E5953]">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>Educational &amp; writing portfolio scope only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>
                      No clinical diagnosis, prescription, or treatment
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>Always consult a qualified personal physician</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>
                      Explicit literature references provided for transparency
                    </span>
                  </li>
                </ul>

                <SplitRule />

                <div className="text-xs text-[#5E5953]">
                  Last reviewed: {new Date().getFullYear()} Editorial Standards
                </div>
              </div>
            </EvidenceRail>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
