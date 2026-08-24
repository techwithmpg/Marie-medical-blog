import * as React from "react";
import { cn } from "@/lib/utils";

interface SplitRuleProps extends React.HTMLAttributes<HTMLDivElement> {
  oxideWidthClass?: string;
  decorative?: boolean;
}

export function SplitRule({
  oxideWidthClass = "w-8 sm:w-12",
  decorative = true,
  className,
  ...props
}: SplitRuleProps) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      className={cn("flex w-full items-center", className)}
      {...props}
    >
      <div className={cn("h-[2px] shrink-0 bg-[#7B3F35]", oxideWidthClass)} />
      <div className="h-[1px] w-full bg-[#D2C9BC]" />
    </div>
  );
}
