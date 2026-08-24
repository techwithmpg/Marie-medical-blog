import * as React from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { cn } from "@/lib/utils";

interface PublicShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PublicShell({ children, className }: PublicShellProps) {
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
      <SiteHeader />

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
      <SiteFooter />
    </div>
  );
}
