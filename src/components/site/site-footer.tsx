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
  { label: "Portfolio", href: "/portfolio" },
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
      <div className="w-full min-w-0 px-5 py-8 sm:px-8 sm:py-9 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-3 md:gap-10 lg:gap-14">
          {/* Identity */}
          <div className="space-y-2 md:justify-self-start">
            <p className="font-serif text-xl font-medium tracking-tight text-[#242321]">
              {siteTitle}
            </p>

            <p className="max-w-xs text-xs leading-5 text-[#5E5953]">
              {tagline || "Medical Writing Portfolio & Educational Blog"}
            </p>
          </div>

          {/* Navigation + Social */}
          <div className="space-y-4 md:max-w-md md:justify-self-center">
            <div className="space-y-2">
              <p className="font-sans text-[11px] font-semibold tracking-[0.16em] text-[#7B3F35] uppercase">
                Navigation
              </p>

              <nav
                aria-label="Footer Navigation"
                className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[#4F4A45]"
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

            {socialLinks.length > 0 && (
              <div className="space-y-2">
                <p className="font-sans text-[11px] font-semibold tracking-[0.16em] text-[#7B3F35] uppercase">
                  Connect
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[#5E5953]">
                  {socialLinks.map((link, index) => (
                    <a
                      key={`${link.url}-${index}`}
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
          <div className="max-w-sm space-y-2 md:justify-self-end">
            <p className="font-sans text-[11px] font-semibold tracking-[0.16em] text-[#7B3F35] uppercase">
              Medical Disclaimer
            </p>

            <p className="max-w-md text-xs leading-5 text-[#5E5953]">
              This publication provides educational content only and does not
              constitute medical advice. Read the full{" "}
              <Link
                href="/disclaimer"
                className="text-[#704037] underline underline-offset-2 transition-colors hover:text-[#582A22]"
              >
                medical disclaimer
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2 border-t border-[#D2C9BC] pt-5 text-xs text-[#5E5953] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteTitle}. All rights reserved.
          </p>

          <p>
            Built by{" "}
            <span className="font-semibold text-[#7B3F35]">
              MPG Technologies
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
