import * as React from "react";
import { cn } from "@/lib/utils";

interface FolioMarkerProps extends React.HTMLAttributes<HTMLSpanElement> {
  number: string | number;
  label?: string;
  decorative?: boolean;
}

export function FolioMarker({
  number,
  label,
  decorative = true,
  className,
  ...props
}: FolioMarkerProps) {
  const formattedNumber =
    typeof number === "number" ? String(number).padStart(2, "0") : number;

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2 font-serif text-sm font-medium tracking-tight text-[#7B3F35]",
        className,
      )}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      <span className="tabular-nums">{formattedNumber}</span>
      {label && (
        <span className="font-sans text-xs font-semibold tracking-widest text-[#5E5953] uppercase">
          {label}
        </span>
      )}
    </span>
  );
}
