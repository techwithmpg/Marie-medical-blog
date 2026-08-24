import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopicImprintProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  href?: string;
  variant?: "default" | "oxide" | "sage" | "muted";
}

export function TopicImprint({
  children,
  href,
  variant = "default",
  className,
  ...props
}: TopicImprintProps) {
  const variantStyles = {
    default: "text-[#7B3F35] bg-[#E8E2D7]/50 hover:bg-[#E8E2D7]",
    oxide: "text-[#7B3F35] bg-[#7B3F35]/10 hover:bg-[#7B3F35]/15",
    sage: "text-[#3F5E52] bg-[#3F5E52]/10 hover:bg-[#3F5E52]/15",
    muted: "text-[#5E5953] bg-[#E8E2D7]/40 hover:bg-[#E8E2D7]/70",
  };

  const baseStyles =
    "inline-flex items-center px-2 py-0.5 rounded-xs font-sans text-xs font-semibold uppercase tracking-wider transition-colors duration-150";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          baseStyles,
          variantStyles[variant],
          "cursor-pointer",
          className,
        )}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
