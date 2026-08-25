import Link from "next/link";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  searchQuery?: string;
  topicSlug?: string;
  className?: string;
}

function buildPageUrl(
  basePath: string,
  page: number,
  searchQuery?: string,
  topicSlug?: string,
): string {
  const params = new URLSearchParams();
  if (searchQuery) params.set("q", searchQuery);
  if (topicSlug) params.set("topic", topicSlug);
  if (page > 1) params.set("page", String(page));

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function PaginationControls({
  currentPage,
  totalPages,
  basePath = "/blog",
  searchQuery,
  topicSlug,
  className = "",
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const prevUrl = hasPrev
    ? buildPageUrl(basePath, currentPage - 1, searchQuery, topicSlug)
    : null;
  const nextUrl = hasNext
    ? buildPageUrl(basePath, currentPage + 1, searchQuery, topicSlug)
    : null;

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-between border-t border-subtle-divider pt-6 text-sm font-medium ${className}`}
    >
      <div>
        {hasPrev && prevUrl ? (
          <Link
            href={prevUrl}
            className="border-control-boundary bg-reading-surface hover:border-brand-oxide hover:text-brand-oxide inline-flex items-center gap-1.5 rounded border px-4 py-2 text-ink transition-colors focus:ring-2 focus:ring-focus-slate focus:outline-none"
            aria-label={`Go to page ${currentPage - 1}`}
          >
            ← Previous
          </Link>
        ) : (
          <span
            className="text-muted-ink/40 inline-flex cursor-not-allowed items-center gap-1.5 rounded border border-subtle-divider bg-transparent px-4 py-2"
            aria-disabled="true"
          >
            ← Previous
          </span>
        )}
      </div>

      <div className="text-muted-ink text-xs">
        Page <span className="font-semibold text-ink">{currentPage}</span> of{" "}
        <span className="font-semibold text-ink">{totalPages}</span>
      </div>

      <div>
        {hasNext && nextUrl ? (
          <Link
            href={nextUrl}
            className="border-control-boundary bg-reading-surface hover:border-brand-oxide hover:text-brand-oxide inline-flex items-center gap-1.5 rounded border px-4 py-2 text-ink transition-colors focus:ring-2 focus:ring-focus-slate focus:outline-none"
            aria-label={`Go to page ${currentPage + 1}`}
          >
            Next →
          </Link>
        ) : (
          <span
            className="text-muted-ink/40 inline-flex cursor-not-allowed items-center gap-1.5 rounded border border-subtle-divider bg-transparent px-4 py-2"
            aria-disabled="true"
          >
            Next →
          </span>
        )}
      </div>
    </nav>
  );
}
