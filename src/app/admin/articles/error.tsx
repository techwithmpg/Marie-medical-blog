"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, ArrowLeft } from "lucide-react";

export default function AdminArticlesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <div className="rounded-lg border border-subtle-divider bg-paper p-8 shadow-xs sm:p-10">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </div>

        <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-ink">
          Article Workspace Unavailable
        </h2>

        <p className="mt-2 text-sm text-ink-muted">
          The article workspace encountered an unexpected error while loading or
          processing your request.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-md bg-oxide px-4 py-2.5 text-sm font-semibold text-paper shadow-xs transition-colors hover:bg-oxide-link focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
          >
            <RotateCcw className="size-4" />
            Try Again
          </button>

          <Link
            href="/admin"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-control-border bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-subtle-field focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
          >
            <ArrowLeft className="size-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
