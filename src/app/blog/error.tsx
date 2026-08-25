"use client";

import * as React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BlogError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-8 py-12 text-center">
      <div className="bg-reading-surface mx-auto max-w-xl space-y-4 rounded-md border border-subtle-divider p-8 sm:p-12">
        <span className="text-brand-oxide font-sans text-xs font-semibold tracking-wider uppercase">
          Editorial Notice
        </span>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          Unable to Load Published Writing
        </h1>
        <p className="text-muted-ink text-sm leading-relaxed sm:text-base">
          An unexpected error occurred while loading published articles. Please
          try again later.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => reset()}
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
            )}
          >
            Try Again
          </button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
            )}
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
