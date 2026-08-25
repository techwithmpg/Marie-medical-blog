import * as React from "react";
import { FolioMarker } from "@/components/evidence/folio-marker";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { SplitRule } from "@/components/evidence/split-rule";
import { cn } from "@/lib/utils";

interface PageIntroProps {
  folioNumber?: string | number;
  folioLabel?: string;
  topicLabel?: string;
  topicVariant?: "default" | "oxide" | "sage" | "muted";
  title: string;
  deck?: string;
  className?: string;
  showSplitRule?: boolean;
}

export function PageIntro({
  folioNumber,
  folioLabel,
  topicLabel,
  topicVariant = "oxide",
  title,
  deck,
  className,
  showSplitRule = true,
}: PageIntroProps) {
  return (
    <div className={cn("space-y-5 sm:space-y-6", className)}>
      {(folioNumber !== undefined || topicLabel) && (
        <div className="flex flex-wrap items-center gap-3">
          {folioNumber !== undefined && (
            <FolioMarker number={folioNumber} label={folioLabel} />
          )}
          {topicLabel && (
            <TopicImprint variant={topicVariant}>{topicLabel}</TopicImprint>
          )}
        </div>
      )}

      <h1 className="max-w-3xl font-serif text-3xl leading-[1.14] font-medium tracking-tight text-[#242321] sm:text-4xl lg:text-5xl">
        {title}
      </h1>

      {deck && (
        <p className="max-w-2xl font-sans text-lg leading-relaxed text-[#5E5953] sm:text-xl">
          {deck}
        </p>
      )}

      {showSplitRule && <SplitRule className="pt-2 sm:pt-4" />}
    </div>
  );
}
