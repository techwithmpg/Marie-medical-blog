"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function AdminMediaError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error("Unable to render Media management.", error), [error]);
  return (
    <div role="alert" className="rounded-lg border border-warning/30 bg-paper p-6 shadow-xs">
      <AlertCircle className="size-6 text-warning" aria-hidden="true" />
      <h2 className="mt-3 font-serif text-xl font-semibold text-ink">Media management is unavailable</h2>
      <p className="mt-1 max-w-xl text-sm text-ink-muted">The Media inventory could not be loaded. No files were changed. Please retry the request.</p>
      <button type="button" onClick={reset} className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink/90 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:ring-offset-2 focus-visible:outline-none">
        <RotateCcw className="size-4" aria-hidden="true" /> Try again
      </button>
    </div>
  );
}
