import * as React from "react";
import { cn } from "@/lib/utils";

export interface ReferenceItem {
  id?: string | number;
  text: React.ReactNode;
  citation?: string;
  url?: string;
}

interface ReferenceLedgerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  items?: (ReferenceItem | string)[];
  children?: React.ReactNode;
}

export function ReferenceLedger({
  title = "References & Evidence Sources",
  items,
  children,
  className,
  ...props
}: ReferenceLedgerProps) {
  return (
    <section
      className={cn(
        "rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-5 text-sm text-[#5E5953] sm:p-7",
        className,
      )}
      aria-labelledby="reference-ledger-title"
      {...props}
    >
      <div className="mb-4 flex items-center justify-between border-b border-[#D2C9BC] pb-3">
        <h3
          id="reference-ledger-title"
          className="font-serif text-base font-medium tracking-tight text-[#242321]"
        >
          {title}
        </h3>
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

            return (
              <li
                key={item.id ?? index}
                className="pl-2 leading-relaxed text-[#242321]"
              >
                <span>{item.text}</span>
                {item.citation && (
                  <span className="ml-1 text-xs text-[#5E5953] italic">
                    — {item.citation}
                  </span>
                )}
                {item.url && (
                  <a
                    href={item.url}
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
