import * as React from "react";
import Link from "next/link";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { cn } from "@/lib/utils";

interface MedicalDisclaimerProps {
  className?: string;
  compact?: boolean;
  disclaimerText?: string | null;
}

export function MedicalDisclaimer({
  className,
  compact = false,
  disclaimerText,
}: MedicalDisclaimerProps) {
  if (compact) {
    return (
      <aside
        aria-label="Medical disclaimer notice"
        className={cn(
          "rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-4 text-xs leading-relaxed text-[#5E5953]",
          className,
        )}
      >
        <p>
          <strong className="font-semibold text-[#242321]">
            Educational Notice:
          </strong>{" "}
          {disclaimerText ||
            "Content on this platform is for educational purposes only and does not constitute medical advice, diagnosis, or treatment."}{" "}
          <Link
            href="/disclaimer"
            className="text-[#704037] underline underline-offset-2 hover:text-[#582A22]"
          >
            Read full disclaimer
          </Link>
          .
        </p>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Medical and educational disclaimer"
      className={cn(
        "space-y-3 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-6 sm:p-8",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-serif text-lg font-medium text-[#242321] sm:text-xl">
          Medical Information &amp; Educational Notice
        </span>
        <TopicImprint variant="muted">Disclaimer</TopicImprint>
      </div>

      <p className="text-sm leading-relaxed text-[#5E5953] sm:text-base">
        {disclaimerText ||
          "Content published on this platform is provided strictly for educational and informational purposes. It does not constitute personalized medical advice, clinical diagnosis, or treatment recommendations, and does not replace consultation with a qualified healthcare professional."}
      </p>

      <div className="pt-1">
        <Link
          href="/disclaimer"
          className="inline-flex items-center text-sm font-medium text-[#704037] underline underline-offset-4 transition-colors hover:text-[#582A22]"
        >
          Read the complete medical disclaimer →
        </Link>
      </div>
    </aside>
  );
}
