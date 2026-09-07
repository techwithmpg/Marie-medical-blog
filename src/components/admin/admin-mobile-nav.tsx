"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, LogOut } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { logoutAction } from "@/app/admin/login/actions";
import { cn } from "@/lib/utils";
import {
  adminNavGroups,
  type AdminModule,
} from "@/components/admin/admin-navigation";

interface AdminMobileNavProps {
  activeModule?: AdminModule;
}

export function AdminMobileNav({ activeModule }: AdminMobileNavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border border-subtle-divider bg-card text-ink transition-colors duration-[var(--admin-motion-fast)] hover:bg-subtle-field focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none xl:hidden"
            aria-label="Open admin navigation menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col justify-between">
        <div>
          <SheetHeader>
            <SheetTitle className="font-serif text-lg">Workspace</SheetTitle>
            <p className="text-xs tracking-wider text-[#5E5953] uppercase">
              Marie Medere
            </p>
          </SheetHeader>

          <nav
            aria-label="Admin Mobile Navigation"
            className="mt-6 flex flex-col space-y-1"
          >
            {adminNavGroups.map((group) => (
              <div key={group.label} className="not-first:mt-5">
                <p className="px-3 pb-1.5 text-[0.625rem] font-semibold tracking-[0.14em] text-ink-muted uppercase">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.id;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-[var(--admin-motion-fast)] focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none",
                          isActive
                            ? "bg-subtle-field font-semibold text-oxide"
                            : "text-ink-muted hover:bg-subtle-field/60 hover:text-ink",
                        )}
                      >
                        <Icon className="size-4 shrink-0 text-oxide" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center justify-between border-t border-[#D2C9BC] pt-4 text-xs text-[#5E5953]">
          <div>
            <p className="font-semibold text-[#242321]">Marie Medere</p>
            <p>Writer / Admin</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className="cursor-pointer rounded-xs p-1.5 text-[#5E5953] transition-colors hover:text-[#7B3F35] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
