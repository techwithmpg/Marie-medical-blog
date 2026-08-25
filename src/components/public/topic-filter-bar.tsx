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
      {/* Search Input Form (44px min height) */}
      <form
        method="GET"
        action="/blog"
        className="flex w-full flex-wrap items-center gap-2 sm:flex-nowrap"
        role="search"
      >
        <label htmlFor="search-articles-input" className="sr-only">
          Search articles by title or keyword
        </label>
        {activeTopicSlug && (
          <input type="hidden" name="topic" value={activeTopicSlug} />
        )}
        <div className="relative min-w-0 flex-1">
          <input
            id="search-articles-input"
            type="search"
            name="q"
            defaultValue={activeSearchQuery || ""}
            placeholder="Search articles by title or excerpt..."
            maxLength={100}
            className="h-11 min-h-[44px] w-full rounded border border-control-border bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-oxide focus:ring-2 focus:ring-focus-slate focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="inline-flex h-11 min-h-[44px] cursor-pointer items-center justify-center rounded bg-oxide px-5 py-2.5 text-sm font-medium text-parchment transition-colors hover:bg-oxide/90 focus:ring-2 focus:ring-focus-slate focus:outline-none"
          >
            Search
          </button>
          {activeSearchQuery && (
            <Link
              href={buildFilterUrl(activeTopicSlug, undefined)}
              className="inline-flex h-11 min-h-[44px] items-center justify-center rounded border border-control-border bg-paper px-3.5 py-2.5 text-xs text-ink-muted transition-colors hover:text-ink focus:ring-2 focus:ring-focus-slate focus:outline-none"
              aria-label="Clear active search query"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Topic Filter Pills (44px min height per interactive target) */}
      {categories.length > 0 && (
        <nav
          aria-label="Filter articles by topic"
          className="flex flex-wrap items-center gap-2 text-xs"
        >
          <span className="mr-1 font-semibold tracking-wider text-ink-muted uppercase">
            Topics:
          </span>
          <Link
            href={buildFilterUrl(undefined, activeSearchQuery)}
            aria-current={!activeTopicSlug ? "page" : undefined}
            className={`inline-flex min-h-[44px] items-center justify-center rounded px-4 py-2.5 font-medium transition-colors focus:ring-2 focus:ring-focus-slate focus:outline-none ${
              !activeTopicSlug
                ? "bg-oxide text-parchment"
                : "border border-control-border bg-paper text-ink hover:border-oxide hover:text-oxide"
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
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-[44px] items-center justify-center rounded px-4 py-2.5 font-medium transition-colors focus:ring-2 focus:ring-focus-slate focus:outline-none ${
                  isActive
                    ? "bg-oxide text-parchment"
                    : "border border-control-border bg-paper text-ink hover:border-oxide hover:text-oxide"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
