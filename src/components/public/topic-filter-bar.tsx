import Link from "next/link";
import type { PublicCategory } from "@/lib/public-articles";

interface TopicFilterBarProps {
  categories: PublicCategory[];
  activeTopicSlug?: string;
  activeSearchQuery?: string;
  className?: string;
}

function buildFilterUrl(topicSlug?: string, searchQuery?: string): string {
  const params = new URLSearchParams();
  if (searchQuery) params.set("q", searchQuery);
  if (topicSlug) params.set("topic", topicSlug);

  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export function TopicFilterBar({
  categories,
  activeTopicSlug,
  activeSearchQuery,
  className = "",
}: TopicFilterBarProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Input Form */}
      <form
        method="GET"
        action="/blog"
        className="flex w-full items-center gap-2"
        role="search"
      >
        <label htmlFor="search-articles-input" className="sr-only">
          Search articles by title or keyword
        </label>
        {activeTopicSlug && (
          <input type="hidden" name="topic" value={activeTopicSlug} />
        )}
        <div className="relative flex-1">
          <input
            id="search-articles-input"
            type="search"
            name="q"
            defaultValue={activeSearchQuery || ""}
            placeholder="Search articles by title or excerpt..."
            maxLength={100}
            className="border-control-boundary bg-reading-surface placeholder:text-muted-ink/60 focus:border-brand-oxide w-full rounded border px-4 py-2.5 text-sm text-ink focus:ring-2 focus:ring-focus-slate focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-brand-oxide hover:bg-brand-oxide/90 rounded px-5 py-2.5 text-sm font-medium text-parchment transition-colors focus:ring-2 focus:ring-focus-slate focus:outline-none"
        >
          Search
        </button>
        {activeSearchQuery && (
          <Link
            href={buildFilterUrl(activeTopicSlug, undefined)}
            className="border-control-boundary bg-reading-surface text-muted-ink rounded border px-3 py-2.5 text-xs transition-colors hover:text-ink"
            aria-label="Clear active search query"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Topic Filter Pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-ink mr-1 font-semibold tracking-wider uppercase">
            Topics:
          </span>
          <Link
            href={buildFilterUrl(undefined, activeSearchQuery)}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              !activeTopicSlug
                ? "bg-brand-oxide text-parchment"
                : "border-control-boundary bg-reading-surface hover:border-brand-oxide hover:text-brand-oxide border text-ink"
            }`}
          >
            All Articles
          </Link>
          {categories.map((cat) => {
            const isActive = cat.slug === activeTopicSlug;
            return (
              <Link
                key={cat.id}
                href={buildFilterUrl(
                  isActive ? undefined : cat.slug,
                  activeSearchQuery,
                )}
                className={`rounded px-3 py-1.5 font-medium transition-colors ${
                  isActive
                    ? "bg-brand-oxide text-parchment"
                    : "border-control-boundary bg-reading-surface hover:border-brand-oxide hover:text-brand-oxide border text-ink"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
