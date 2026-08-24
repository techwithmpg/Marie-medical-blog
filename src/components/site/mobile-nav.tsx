"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/blog" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border border-[#D2C9BC] bg-card text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:ring-offset-2 focus-visible:outline-none md:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col justify-between">
        <div>
          <SheetHeader>
            <SheetTitle className="text-xl">Marie Medere</SheetTitle>
            <p className="text-xs tracking-wider text-[#5E5953] uppercase">
              Medical Writing Portfolio
            </p>
          </SheetHeader>

          <nav
            aria-label="Mobile Navigation"
            className="mt-8 flex flex-col space-y-1"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex h-12 items-center rounded-md px-3 font-sans text-base font-medium text-[#242321] transition-colors hover:bg-[#E8E2D7] hover:text-[#7B3F35] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[#D2C9BC] pt-6">
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full justify-center",
            )}
          >
            Contact
          </Link>
          <p className="text-center text-xs text-[#5E5953]">
            Medical Writing Portfolio &amp; Educational Blog
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
