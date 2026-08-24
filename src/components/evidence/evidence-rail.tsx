import * as React from "react";
import { cn } from "@/lib/utils";

interface EvidenceRailProps extends React.HTMLAttributes<HTMLDivElement> {
  marker?: string;
  label?: string;
  children?: React.ReactNode;
  orientation?: "vertical" | "horizontal";
}

export function EvidenceRail({
  marker,
  label,
  children,
  orientation = "vertical",
  className,
  ...props
}: EvidenceRailProps) {
  if (orientation === "horizontal") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 border-t border-[#D2C9BC] pt-3 text-xs tracking-wider text-[#5E5953] uppercase",
          className,
        )}
        {...props}
      >
        {marker && (
          <span className="font-serif font-medium text-[#7B3F35]">
            {marker}
          </span>
        )}
        {label && <span className="font-sans font-semibold">{label}</span>}
        {children}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "relative hidden flex-col gap-4 border-l border-[#D2C9BC] py-1 pl-4 text-xs text-[#5E5953] lg:flex",
        className,
      )}
      aria-label={label || "Evidence rail"}
      {...props}
    >
      {(marker || label) && (
        <div className="flex items-center gap-2 tracking-wider uppercase">
          {marker && (
            <span className="font-serif font-medium text-[#7B3F35]">
              {marker}
            </span>
          )}
          {label && (
            <span className="font-sans font-semibold text-[#242321]">
              {label}
            </span>
          )}
        </div>
      )}
      {children}
    </aside>
  );
}
