import * as React from "react";
import Link from "next/link";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyEditorialStateProps {
  title?: string;
  description?: string;
  topicLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function EmptyEditorialState({
  title = "Selected Writing in Preparation",
  description = "Evidence-led clinical publications, regulatory writing samples, and educational monographs are currently in editorial curation. Published writing will appear here as entries are released.",
  topicLabel = "Editorial Pipeline",
  actionHref = "/contact",
  actionLabel = "Inquire About Writing Samples",
  className,
}: EmptyEditorialStateProps) {
  return (
    <div
      className={cn(
        "space-y-5 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-8 text-center sm:p-12",
        className,
      )}
    >
      <div className="flex justify-center">
        <TopicImprint variant="sage">{topicLabel}</TopicImprint>
      </div>

      <h2 className="font-serif text-2xl font-medium tracking-tight text-[#242321] sm:text-3xl">
        {title}
      </h2>

      <p className="mx-auto max-w-xl text-base leading-relaxed text-[#5E5953]">
        {description}
      </p>

      {actionHref && actionLabel && (
        <div className="pt-3">
          <Link
            href={actionHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
            )}
          >
            {actionLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
