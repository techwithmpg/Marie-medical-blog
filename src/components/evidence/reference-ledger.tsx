import * as React from "react";
import { cn } from "@/lib/utils";

export interface ReferenceItem {
  id?: string | number;
  title?: string;
  source_name?: string;
  text?: React.ReactNode;
  citation?: string;
  citation_details?: string | null;
  url?: string | null;
}

interface ReferenceLedgerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  headingLevel?: "h2" | "h3";
  items?: (ReferenceItem | string)[];
  children?: React.ReactNode;
}

function getSafeExternalUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return trimmed;
    }
  } catch {
    return null;
  }
  return null;
}

export function ReferenceLedger({
  title = "References & Evidence Sources",
  headingLevel = "h2",
  items,
  children,
  className,
  ...props
}: ReferenceLedgerProps) {
  const generatedId = React.useId();
  const titleId = `${generatedId}-title`;

  const HeadingTag = headingLevel;

  return (
    <section
      className={cn(
        "rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-5 text-sm text-[#5E5953] sm:p-7",
        className,
      )}
      aria-labelledby={titleId}
      {...props}
    >
      <div className="mb-4 flex items-center justify-between border-b border-[#D2C9BC] pb-3">
        <HeadingTag
          id={titleId}
          className="font-serif text-base font-medium tracking-tight text-[#242321]"
        >
          {title}
        </HeadingTag>
        <span className="font-sans text-xs font-semibold tracking-wider text-[#7B3F35] uppercase">
          Ledger
        </span>
      </div>

      {items && items.length > 0 ? (
        <ol className="list-decimal space-y-3 pl-4 marker:font-serif marker:font-medium marker:text-[#7B3F35]">
          {items.map((item, index) => {
            if (typeof item === "string") {
              return (
                <li key={index} className="pl-2 leading-relaxed text-[#242321]">
                  {item}
                </li>
              );
            }

            const itemTitle = item.title || item.text;
            const sourceName = item.source_name;
            const citation = item.citation_details || item.citation;
            const safeUrl = getSafeExternalUrl(item.url);

            return (
              <li
                key={item.id ?? index}
                className="pl-2 leading-relaxed text-[#242321]"
              >
                <span className="font-medium text-[#242321]">{itemTitle}</span>
                {sourceName && (
                  <span className="ml-1 text-xs text-[#5E5953] italic">
                    — {sourceName}
                  </span>
                )}
                {citation && (
                  <span className="text-xs text-[#5E5953]">
                    {sourceName ? `, ${citation}` : ` — ${citation}`}
                  </span>
                )}
                {safeUrl && (
                  <a
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-xs font-medium text-[#704037] underline underline-offset-2 hover:text-[#582A22]"
                  >
                    [Source]
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        children
      )}
    </section>
  );
}
