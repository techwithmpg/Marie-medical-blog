import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AdminFilterItem {
  label: string;
  value: string;
  href: string;
}

export function AdminFilterNav({
  label,
  items,
  activeValue,
}: {
  label: string;
  items: AdminFilterItem[];
  activeValue: string;
}) {
  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const isActive = activeValue === item.value;
        return (
          <Link
            key={item.value}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-md px-3.5 py-2 text-xs font-semibold transition-colors duration-[var(--admin-motion-fast)] ease-[var(--admin-ease-standard)] focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none",
              isActive
                ? "bg-subtle-field font-bold text-oxide shadow-2xs"
                : "border border-subtle-divider bg-paper text-ink-muted hover:bg-subtle-field/50 hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-subtle-divider pb-5 sm:flex-row sm:items-center">
      <div>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-ink-muted">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

type StatusTone = "warning" | "success" | "muted" | "oxide";

const statusToneClasses: Record<StatusTone, string> = {
  warning: "border-warning/20 bg-warning/10 text-warning [&>span]:bg-warning",
  success: "border-success/20 bg-success/10 text-success [&>span]:bg-success",
  muted:
    "border-ink-muted/20 bg-ink-muted/10 text-ink-muted [&>span]:bg-ink-muted",
  oxide: "border-oxide/30 bg-oxide/10 text-oxide [&>span]:bg-oxide",
};

export function AdminStatusBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: StatusTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        statusToneClasses[tone],
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full" />
      {children}
    </span>
  );
}
