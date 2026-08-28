import type { MetadataRoute } from "next";
import { buildDiscoverySitemapWithFallback } from "@/lib/discovery-artifacts";
import { getPublishedSitemapArticles } from "@/lib/public-articles";
import { getCanonicalUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildDiscoverySitemapWithFallback(
    getPublishedSitemapArticles,
    getCanonicalUrl,
    (error) => {
      console.error(
        "Unable to load dynamic sitemap entries; emitting the static public fallback.",
        error,
      );
    },
  );
}
