import * as React from "react";
import Link from "next/link";
import { MobileNav } from "@/components/site/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Selected Writing", href: "/portfolio" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  return (
    <header className="w-full border-b border-[#D2C9BC] bg-[#F6F1E8]/90 backdrop-blur-xs">
      <div className="mx-auto flex max-w-[1248px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        {/* Brand identity wordmark */}
        <Link
          href="/"
          className="group flex flex-col rounded-xs focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
        >
          <span className="font-serif text-2xl font-medium tracking-tight text-[#242321] transition-colors group-hover:text-[#7B3F35] sm:text-[1.65rem]">
            Marie Medere
          </span>
          <span className="font-sans text-[0.6875rem] font-semibold tracking-widest text-[#5E5953] uppercase sm:text-xs">
            Medical Writing Portfolio &amp; Educational Blog
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden items-center space-x-6 md:flex lg:space-x-8"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xs py-1 font-sans text-sm font-medium text-[#5E5953] transition-colors hover:text-[#7B3F35] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA & Mobile Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              Contact
            </Link>
          </div>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
