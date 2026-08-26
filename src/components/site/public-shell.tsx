import * as React from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import {
  getPublicSiteSettings,
  type PublicSiteSettings,
} from "@/lib/public-data";
import { cn } from "@/lib/utils";

interface PublicShellProps {
  children: React.ReactNode;
  className?: string;
  settings?: PublicSiteSettings;
}

export async function PublicShell({
  children,
  className,
  settings: providedSettings,
}: PublicShellProps) {
  const settings = providedSettings || (await getPublicSiteSettings());

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-[#7B3F35] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#FFFDF9] focus:shadow-lg focus:ring-2 focus:ring-[#265D7A] focus:ring-offset-2 focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Header */}
      <SiteHeader siteTitle={settings.site_title} tagline={settings.tagline} />

      {/* Main content container */}
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          "mx-auto w-full max-w-[1248px] flex-1 px-5 py-8 focus:outline-none sm:px-8 sm:py-12 lg:px-12 lg:py-16",
          className,
        )}
      >
        {children}
      </main>

      {/* Footer */}
      <SiteFooter
        siteTitle={settings.site_title}
        tagline={settings.tagline}
        socialLinks={settings.social_links}
      />
    </div>
  );
}
