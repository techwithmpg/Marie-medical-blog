import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";
import { PageIntro } from "@/components/public/page-intro";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { SplitRule } from "@/components/evidence/split-rule";
import { EvidenceRail } from "@/components/evidence/evidence-rail";
import { buttonVariants } from "@/components/ui/button";
import { getPublicRouteDiscoveryMetadata } from "@/lib/site-url";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Medical Disclaimer — Marie Medere",
  description:
    "Medical and educational disclaimer for Marie Medere's Medical Writing Portfolio & Educational Blog.",
  ...getPublicRouteDiscoveryMetadata("/disclaimer"),
};

export default function DisclaimerPage() {
  const disclaimerSections = [
    {
      folio: "01",
      title: "Educational Purpose & Informational Scope",
      content:
        "All articles, commentaries, and educational writings published on this platform are provided strictly for informational and educational purposes. The content is designed to explore published healthcare literature and medical topics for general and professional educational audiences.",
    },
    {
      folio: "02",
      title: "No Doctor-Patient Relationship",
      content:
        "Accessing or reading this website does not establish a doctor-patient, clinician-patient, or healthcare provider relationship. Nothing on this website constitutes personalized clinical advice, diagnostic assessment, or medical treatment recommendations.",
    },
    {
      folio: "03",
      title: "Individual Medical Decisions",
      content:
        "Health-related decisions should always be made in consultation with a qualified, licensed healthcare professional who can evaluate individual medical history and clinical circumstances. Never disregard or delay seeking professional medical advice because of information read on this website.",
    },
    {
      folio: "04",
      title: "Software & Platform Boundaries",
      content:
        "This platform is a publishing and portfolio website. The software does not provide medical diagnosis, clinical decision support, or treatment recommendations. The author and editor remain responsible for source selection and editorial content.",
    },
    {
      folio: "05",
      title: "Emergency Situations",
      content:
        "If you believe you are experiencing a medical emergency, immediately contact local emergency services or seek immediate care from a hospital or qualified medical professional. This website is not monitored for urgent or clinical communications.",
    },
  ];

  return (
    <PublicShell>
      <div className="space-y-16 sm:space-y-20">
        {/* Page Header */}
        <PageIntro
          folioNumber={1}
          folioLabel="Governance"
          topicLabel="Disclaimer"
          topicVariant="oxide"
          title="Medical &amp; Educational Disclaimer"
          deck="Important notice regarding the educational scope, medical information limitations, and platform boundaries of this publication."
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
                About
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
              label="Summary"
              className="rounded-md border border-[#D2C9BC] bg-[#FFFDF9]/80 p-5"
            >
              <div className="space-y-4">
                <span className="font-serif text-base font-medium text-[#242321]">
                  Summary Principles
                </span>

                <ul className="space-y-2 text-xs text-[#5E5953]">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>Educational and portfolio scope only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>
                      No medical diagnosis, treatment, or clinical provider
                      relationship
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>
                      Consult a qualified physician for healthcare decisions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>Software platform does not provide medical care</span>
                  </li>
                </ul>

                <SplitRule />

                <div className="text-xs text-[#5E5953]">
                  Editorial Policy &amp; Platform Boundaries
                </div>
              </div>
            </EvidenceRail>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
