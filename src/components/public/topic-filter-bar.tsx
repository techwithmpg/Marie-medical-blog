import Link from "next/link";
import { Search } from "lucide-react";

import type { PublicCategory } from "@/lib/public-articles";

interface TopicFilterBarProps {
  categories: PublicCategory[];
  activeTopicSlug?: string;
  activeSearchQuery?: string;
  className?: string;
}

export function TopicFilterBar({
  categories,
  activeTopicSlug,
  activeSearchQuery,
  className = "",
}: TopicFilterBarProps) {
  const hasActiveFilters = Boolean(activeTopicSlug || activeSearchQuery);

  return (
    <form
      method="GET"
      action="/blog"
      role="search"
      className={`space-y-3 ${className}`}
    >
      <label htmlFor="search-articles-input" className="sr-only">
        Search articles
      </label>

      <div className="relative">
        <Search
          aria-hidden="true"
          strokeWidth={1.5}
          className="text-muted-ink absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
        />

        <input
          id="search-articles-input"
          type="search"
          name="q"
          defaultValue={activeSearchQuery || ""}
          placeholder="Search articles..."
          maxLength={100}
          className="placeholder:text-muted-ink/70 focus:border-brand-oxide h-12 w-full border border-subtle-divider bg-[#FFFDF9]/55 pr-4 pl-11 text-sm text-ink focus:ring-2 focus:ring-focus-slate focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="article-topic-filter" className="sr-only">
          Filter by topic
        </label>

        <select
          id="article-topic-filter"
          name="topic"
          defaultValue={activeTopicSlug || ""}
          className="focus:border-brand-oxide h-11 min-w-0 flex-1 border border-subtle-divider bg-[#FFFDF9]/55 px-3 text-sm text-ink focus:ring-2 focus:ring-focus-slate focus:outline-none"
        >
          <option value="">All Topics</option>

          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="border-brand-oxide bg-brand-oxide hover:bg-brand-oxide/90 h-11 border px-5 text-sm font-semibold text-parchment transition-colors focus:ring-2 focus:ring-focus-slate focus:outline-none"
        >
          Apply
        </button>

        {hasActiveFilters && (
          <Link
            href="/blog"
            className="border-control-boundary hover:border-brand-oxide hover:text-brand-oxide inline-flex h-11 items-center justify-center border bg-transparent px-5 text-sm text-ink transition-colors focus:ring-2 focus:ring-focus-slate focus:outline-none"
          >
            Clear Filters
          </Link>
        )}
      </div>
    </form>
  );
}
