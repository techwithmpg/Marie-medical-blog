import type { BeforeSendEvent } from "@vercel/analytics/next";

const STATIC_PUBLIC_PATHS = new Set([
  "/",
  "/about",
  "/blog",
  "/portfolio",
  "/contact",
  "/disclaimer",
]);

const CANONICAL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PRIVATE_SLUG_TOKEN_PATTERN = /(?:^|-)(?:draft|private|preview)(?:-|$)/;

function isPublicPath(pathname: string): boolean {
  if (STATIC_PUBLIC_PATHS.has(pathname)) return true;

  const match = pathname.match(/^\/(blog|topics)\/([^/]+)$/);
  if (!match) return false;

  const slug = match[2];

  return (
    slug.length <= 80 &&
    CANONICAL_SLUG_PATTERN.test(slug) &&
    !PRIVATE_SLUG_TOKEN_PATTERN.test(slug)
  );
}

/**
 * Applies the D034 Analytics privacy boundary before a page view is sent.
 * Only current canonical public routes may pass, and their URLs retain only
 * normalized origin plus pathname. Every unclassifiable input fails closed.
 */
export function sanitizeAnalyticsEvent(
  event: BeforeSendEvent,
): BeforeSendEvent | null {
  if (event.type !== "pageview") return null;

  try {
    const url = new URL(event.url);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username !== "" ||
      url.password !== "" ||
      !isPublicPath(url.pathname)
    ) {
      return null;
    }

    return {
      ...event,
      url: `${url.origin}${url.pathname}`,
    };
  } catch {
    return null;
  }
}
