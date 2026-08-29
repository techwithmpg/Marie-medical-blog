import type { MetadataRoute } from "next";

export const STATIC_PUBLIC_SITEMAP_PATHS = [
  "/",
  "/about",
  "/blog",
  "/portfolio",
  "/contact",
  "/disclaimer",
] as const;

const CANONICAL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROVISIONAL_SLUG_PATTERN =
  /^draft-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PUBLIC_ARTICLE_IMAGE_PATH_PATTERN =
  /^articles\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/featured\/.+\.(?:jpe?g|png|webp)$/i;
const PUBLIC_ASSET_URL_SEGMENT = "/storage/v1/object/public/public-assets/";

export interface PublicDiscoveryImage {
  url: string;
  alt: string;
}

export interface PublicDiscoveryImageCandidate {
  storagePath?: string | null;
  alt?: string | null;
  publicUrl?: string | null;
}

export interface PublishedSitemapArticle {
  slug: string;
  status: string;
  published_at: string | null;
  updated_at: string | null;
  topic_slug: string | null;
}

export interface BlogPostingJsonLd {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  headline: string;
  description: string;
  url: string;
  mainEntityOfPage: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    "@type": "Person";
    name: string;
    url: string;
  };
  image?: string;
}

export interface BlogPostingJsonLdOptions {
  headline: string;
  description: string;
  canonicalUrl: URL;
  publishedAt?: string | null;
  updatedAt?: string | null;
  authorName?: string | null;
  authorUrl: URL;
  image?: PublicDiscoveryImage | null;
}

export function isValidDiscoverySlug(slug: string): boolean {
  const normalized = slug.trim();

  return (
    normalized.length > 0 &&
    normalized.length <= 80 &&
    !PROVISIONAL_SLUG_PATTERN.test(normalized) &&
    CANONICAL_SLUG_PATTERN.test(normalized)
  );
}

export function resolvePublicDiscoveryImage({
  storagePath,
  alt,
  publicUrl,
}: PublicDiscoveryImageCandidate): PublicDiscoveryImage | null {
  const normalizedPath = storagePath?.trim();
  const normalizedAlt = alt?.trim();
  const normalizedUrl = publicUrl?.trim();

  if (
    !normalizedPath ||
    !normalizedAlt ||
    !normalizedUrl ||
    !PUBLIC_ARTICLE_IMAGE_PATH_PATTERN.test(normalizedPath)
  ) {
    return null;
  }

  try {
    const parsedUrl = new URL(normalizedUrl);

    if (
      (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") ||
      parsedUrl.username ||
      parsedUrl.password ||
      parsedUrl.search ||
      parsedUrl.hash ||
      !parsedUrl.pathname.includes(PUBLIC_ASSET_URL_SEGMENT) ||
      !parsedUrl.pathname.endsWith(
        normalizedPath.split("/").map(encodeURIComponent).join("/"),
      )
    ) {
      return null;
    }

    return {
      url: parsedUrl.toString(),
      alt: normalizedAlt,
    };
  } catch {
    return null;
  }
}

function getTruthfulTimestamp(
  preferred: string | null,
  fallback: string | null,
): string | undefined {
  for (const candidate of [preferred, fallback]) {
    const normalized = candidate?.trim();
    if (normalized && !Number.isNaN(Date.parse(normalized))) {
      return normalized;
    }
  }

  return undefined;
}

export function buildDiscoverySitemap(
  articles: PublishedSitemapArticle[],
  getCanonicalUrl: (routePath: string) => URL,
): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PUBLIC_SITEMAP_PATHS.map(
    (routePath) => ({
      url: getCanonicalUrl(routePath).toString(),
    }),
  );
  const publishedArticles = articles
    .filter(
      (article) =>
        article.status === "published" && isValidDiscoverySlug(article.slug),
    )
    .sort((left, right) => left.slug.localeCompare(right.slug));
  const articleEntries: MetadataRoute.Sitemap = publishedArticles.map(
    (article) => {
      const lastModified = getTruthfulTimestamp(
        article.updated_at,
        article.published_at,
      );

      return {
        url: getCanonicalUrl(`/blog/${article.slug}`).toString(),
        ...(lastModified ? { lastModified } : {}),
      };
    },
  );
  const topicSlugs = [
    ...new Set(
      publishedArticles
        .map((article) => article.topic_slug?.trim() || "")
        .filter(isValidDiscoverySlug),
    ),
  ].sort((left, right) => left.localeCompare(right));
  const topicEntries: MetadataRoute.Sitemap = topicSlugs.map((slug) => ({
    url: getCanonicalUrl(`/topics/${slug}`).toString(),
  }));

  return [...staticEntries, ...articleEntries, ...topicEntries];
}

export async function buildDiscoverySitemapWithFallback(
  loadArticles: () => Promise<PublishedSitemapArticle[]>,
  getCanonicalUrl: (routePath: string) => URL,
  reportError: (error: unknown) => void = () => undefined,
): Promise<MetadataRoute.Sitemap> {
  try {
    return buildDiscoverySitemap(await loadArticles(), getCanonicalUrl);
  } catch (error) {
    reportError(error);
    return buildDiscoverySitemap([], getCanonicalUrl);
  }
}

export function buildDiscoveryRobots(
  isProduction: boolean,
  getCanonicalUrl: (routePath: string) => URL,
): MetadataRoute.Robots {
  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: getCanonicalUrl("/sitemap.xml").toString(),
  };
}

export function buildBlogPostingJsonLd({
  headline,
  description,
  canonicalUrl,
  publishedAt,
  updatedAt,
  authorName,
  authorUrl,
  image,
}: BlogPostingJsonLdOptions): BlogPostingJsonLd {
  const normalizedHeadline = headline.trim();
  const normalizedDescription = description.trim();
  const normalizedAuthorName = authorName?.trim();
  const datePublished = getTruthfulTimestamp(publishedAt ?? null, null);
  const dateModified = getTruthfulTimestamp(updatedAt ?? null, null);
  const canonicalUrlString = canonicalUrl.toString();

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: normalizedHeadline,
    description: normalizedDescription,
    url: canonicalUrlString,
    mainEntityOfPage: canonicalUrlString,
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(normalizedAuthorName
      ? {
          author: {
            "@type": "Person" as const,
            name: normalizedAuthorName,
            url: authorUrl.toString(),
          },
        }
      : {}),
    ...(image ? { image: image.url } : {}),
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
