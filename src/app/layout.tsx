import type { Metadata } from "next";
import { Newsreader, Source_Sans_3 } from "next/font/google";
import { PrivacySafeAnalytics } from "@/components/analytics/privacy-safe-analytics";
import { getPublicSiteSettings } from "@/lib/public-data";
import {
  DEFAULT_PUBLIC_SITE_DESCRIPTION,
  getDeploymentRobots,
  getPublicRouteSocialMetadata,
  getSiteTitleMetadata,
  getSiteUrl,
} from "@/lib/site-url";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-source-sans-3",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();

  const siteTitle = settings.site_title.trim() || "Marie Medere";
  const tagline = settings.tagline?.trim() || null;
  const description =
    settings.default_seo_description?.trim() ||
    tagline ||
    DEFAULT_PUBLIC_SITE_DESCRIPTION;
  const title = getSiteTitleMetadata(siteTitle);

  return {
    metadataBase: getSiteUrl(),
    title,
    description,
    applicationName: siteTitle,
    ...getPublicRouteSocialMetadata("/", {
      title,
      description,
      useMetadataFileImage: true,
    }),
    robots: getDeploymentRobots({
      index: true,
      follow: true,
    }),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${sourceSans3.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-[#7B3F35]/15 selection:text-[#242321]">
        {children}
        <PrivacySafeAnalytics />
      </body>
    </html>
  );
}
