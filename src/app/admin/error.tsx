"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section
      aria-labelledby="admin-error-heading"
      className="mx-auto max-w-xl rounded-lg border border-destructive/25 bg-paper p-6 shadow-xs sm:p-8"
    >
      <span className="inline-flex rounded-md bg-destructive/10 p-2 text-destructive">
        <AlertCircle className="size-5" aria-hidden="true" />
      </span>
      <h2
        id="admin-error-heading"
        className="mt-4 font-serif text-2xl font-semibold text-ink"
      >
        The workspace could not load
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Your changes were not submitted. Try loading this workspace view again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-oxide px-4 py-2 text-sm font-semibold text-paper transition-colors duration-[var(--admin-motion-fast)] hover:bg-oxide-link focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Try again
      </button>
    </section>
  );
}
