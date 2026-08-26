import * as React from "react";
import Link from "next/link";
import type { PublicSiteSocialLink } from "@/lib/public-data";

interface FooterLink {
  label: string;
  href: string;
}

const footerLinks: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/blog" },
  { label: "Selected Writing", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Disclaimer", href: "/disclaimer" },
];

interface SiteFooterProps {
  siteTitle?: string;
  tagline?: string | null;
  socialLinks?: PublicSiteSocialLink[];
}

export function SiteFooter({
  siteTitle = "Marie Medere",
  tagline = "Medical Writing Portfolio & Educational Blog",
  socialLinks = [],
}: SiteFooterProps) {
  return (
    <footer className="mt-auto w-full border-t border-[#D2C9BC] bg-[#FFFDF9]">
      <div className="mx-auto max-w-[1248px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-3">
          {/* Identity */}
          <div className="flex flex-col space-y-2">
            <span className="font-serif text-xl font-medium tracking-tight text-[#242321]">
              {siteTitle}
            </span>
            <p className="max-w-sm text-xs leading-relaxed text-[#5E5953]">
              {tagline || "Medical Writing Portfolio & Educational Blog"}
            </p>
          </div>

          {/* Navigation & Social */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <span className="font-sans text-xs font-semibold tracking-wider text-[#7B3F35] uppercase">
                Navigation
              </span>
              <nav
                aria-label="Footer Navigation"
                className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5E5953]"
              >
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xs transition-colors hover:text-[#7B3F35] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {socialLinks && socialLinks.length > 0 && (
              <div className="flex flex-col space-y-2 pt-2">
                <span className="font-sans text-xs font-semibold tracking-wider text-[#7B3F35] uppercase">
                  Connect
                </span>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#5E5953]">
                  {socialLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xs transition-colors hover:text-[#7B3F35] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="flex flex-col space-y-2">
            <span className="font-sans text-xs font-semibold tracking-wider text-[#7B3F35] uppercase">
              Medical Disclaimer
            </span>
            <p className="text-xs leading-relaxed text-[#5E5953]">
              This publication provides educational content only and does not
              constitute medical advice. Read the full{" "}
              <Link
                href="/disclaimer"
                className="text-[#704037] underline underline-offset-2 hover:text-[#582A22]"
              >
                medical disclaimer
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#D2C9BC] pt-6 text-xs text-[#5E5953] sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteTitle}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
