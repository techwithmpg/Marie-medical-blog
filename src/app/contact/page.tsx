import * as React from "react";
import { PublicShell } from "@/components/site/public-shell";
import { PageIntro } from "@/components/public/page-intro";
import { ContactFormShell } from "@/components/public/contact-form-shell";
import { EvidenceRail } from "@/components/evidence/evidence-rail";
import { SplitRule } from "@/components/evidence/split-rule";
import { MedicalDisclaimer } from "@/components/public/medical-disclaimer";

export const metadata = {
  title: "Contact — Marie Medere",
  description:
    "Contact and inquiry information for Marie Medere's Medical Writing Portfolio & Educational Blog.",
};

export default function ContactPage() {
  return (
    <PublicShell>
      <div className="space-y-16 sm:space-y-20">
        {/* Page Header */}
        <PageIntro
          folioNumber={1}
          folioLabel="Communication"
          topicLabel="Inquiries"
          topicVariant="oxide"
          title="Contact"
          deck="For professional medical writing inquiries, editorial discussions, and publication communications."
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Primary Form Shell Column */}
          <div className="space-y-8 lg:col-span-8">
            <ContactFormShell />
          </div>

          {/* Desktop Evidence Rail / Sidebar */}
          <div className="space-y-6 lg:col-span-4">
            <EvidenceRail
              marker="Ref 01"
              label="Inquiry Scope"
              className="rounded-md border border-[#D2C9BC] bg-[#FFFDF9]/80 p-5"
            >
              <div className="space-y-4">
                <span className="font-serif text-base font-medium text-[#242321]">
                  Professional Communications
                </span>
                <p className="text-xs leading-relaxed text-[#5E5953]">
                  This contact channel is intended for professional inquiries
                  regarding Marie Medere&apos;s medical writing portfolio and
                  educational publication.
                </p>

                <SplitRule />

                <div className="space-y-2 text-xs text-[#5E5953]">
                  <strong className="block font-semibold tracking-wider text-[#242321] uppercase">
                    Important Notice
                  </strong>
                  <p className="leading-relaxed">
                    Personal medical inquiries, clinical diagnostic requests, or
                    individual treatment consultations cannot be answered.
                  </p>
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
