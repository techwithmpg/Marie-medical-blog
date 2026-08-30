import { BookOpen, ChevronRight } from "lucide-react";

import type { ArticleOutlineItem } from "@/lib/article-outline";

interface ArticleReadingRailProps {
  items: ArticleOutlineItem[];
  hasReferences: boolean;
}

export function ArticleReadingRail({
  items,
  hasReferences,
}: ArticleReadingRailProps) {
  return (
    <nav
      aria-label="Article contents"
      className="w-full rounded-lg border border-[#DED4C7] bg-[#FFFDF9]/90 px-5 py-6"
    >
      <div className="flex items-center gap-2.5">
        <BookOpen
          aria-hidden="true"
          strokeWidth={1.35}
          className="text-brand-oxide h-4 w-4 shrink-0"
        />

        <h2 className="font-serif text-lg font-medium text-ink">
          On this page
        </h2>
      </div>

      <div className="mt-4 flex items-center">
        <span className="bg-brand-oxide h-[2px] w-7" />
        <span className="h-px flex-1 bg-[#DED4C7]" />
      </div>

      <ol className="mt-4 space-y-1">
        {items.length > 0 ? (
          items.slice(0, 8).map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="group hover:text-brand-oxide flex min-h-10 items-start gap-2.5 py-2 text-[0.73rem] leading-snug text-[#45413D] transition-colors"
              >
                <ChevronRight
                  aria-hidden="true"
                  strokeWidth={1.8}
                  className="text-brand-oxide mt-[1px] h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                />

                <span>{item.label}</span>
              </a>
            </li>
          ))
        ) : (
          <li>
            <a
              href="#article-content"
              className="group hover:text-brand-oxide flex min-h-10 items-center gap-2.5 py-2 text-[0.73rem] text-[#45413D]"
            >
              <ChevronRight
                aria-hidden="true"
                className="text-brand-oxide h-3.5 w-3.5"
              />
              Article
            </a>
          </li>
        )}

        {hasReferences && (
          <li>
            <a
              href="#references"
              className="group hover:text-brand-oxide flex min-h-10 items-start gap-2.5 py-2 text-[0.73rem] leading-snug text-[#45413D] transition-colors"
            >
              <ChevronRight
                aria-hidden="true"
                strokeWidth={1.8}
                className="text-brand-oxide mt-[1px] h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
              />

              <span>References</span>
            </a>
          </li>
        )}
      </ol>
    </nav>
  );
}
