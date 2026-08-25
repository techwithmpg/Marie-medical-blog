import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";
import { buttonVariants } from "@/components/ui/button";
import { PageIntro } from "@/components/public/page-intro";
import { EvidenceRail } from "@/components/evidence/evidence-rail";
import { EmptyEditorialState } from "@/components/public/empty-editorial-state";
import { MedicalDisclaimer } from "@/components/public/medical-disclaimer";
import { SplitRule } from "@/components/evidence/split-rule";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Selected Writing — Marie Medere",
  description:
    "Selected Writing portfolio and educational publication index by Marie Medere.",
};

export default function PortfolioPage() {
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
          deck="A curated index of evidence-based medical writing, educational healthcare articles, and published communications."
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Primary Column */}
          <div className="space-y-12 lg:col-span-8">
            {/* Selected Articles / Curated Writing Shell */}
            <section className="space-y-6">
              <EmptyEditorialState
                title="Selected Writing"
                description="Published medical writing entries and educational publications will appear here as entries are released."
                topicLabel="Publication Archive"
                actionHref="/contact"
                actionLabel="Contact the Author"
              />
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
              label="Editorial Standard"
              className="rounded-md border border-[#D2C9BC] bg-[#FFFDF9]/80 p-5"
            >
              <div className="space-y-4">
                <span className="font-serif text-base font-medium text-[#242321]">
                  Publication Standards
                </span>
                <p className="text-xs leading-relaxed text-[#5E5953]">
                  All entries presented in this portfolio reflect commitment to:
                </p>

                <ul className="space-y-2 text-xs text-[#5E5953]">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>
                      Evidence-based analysis and primary literature referencing
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>Clear and disciplined scientific communication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7B3F35]" />
                    <span>Objective educational presentation</span>
                  </li>
                </ul>

                <SplitRule />

                <div className="pt-1">
                  <Link
                    href="/about"
                    className="inline-flex items-center text-xs font-semibold tracking-wider text-[#7B3F35] uppercase hover:underline"
                  >
                    Read editorial approach →
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
