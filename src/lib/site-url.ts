export interface SiteEnvironment {
  SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_ENV?: string;
}

export interface RouteIndexingPolicy {
  index: boolean;
  follow: boolean;
}

type VercelEnvironment = "production" | "preview" | "development";

const LOCAL_SITE_URL = "http://localhost:3000";

function getProcessSiteEnvironment(): SiteEnvironment {
  return {
    SITE_URL: process.env.SITE_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };
}

function getVercelEnvironment(
  env: SiteEnvironment,
): VercelEnvironment | undefined {
  const value = env.VERCEL_ENV?.trim();

  if (!value) {
    return undefined;
  }

  if (
    value !== "production" &&
    value !== "preview" &&
    value !== "development"
  ) {
    throw new Error(`Unsupported VERCEL_ENV value: ${value}`);
  }

  return value;
}

function parseOrigin(
  rawValue: string,
  label: string,
  requireHttps: boolean,
): URL {
  let parsed: URL;

  try {
    parsed = new URL(rawValue);
  } catch {
    throw new Error(`${label} must be a valid absolute URL origin.`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${label} must use http: or https:.`);
  }

  if (requireHttps && parsed.protocol !== "https:") {
    throw new Error(`${label} must use https: for a hosted deployment.`);
  }

  if (parsed.username || parsed.password) {
    throw new Error(`${label} must not contain credentials.`);
  }

  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error(
      `${label} must contain only an origin with no path, query, or fragment.`,
    );
  }

  return new URL(parsed.origin);
}

export function isProductionDeployment(
  env: SiteEnvironment = getProcessSiteEnvironment(),
): boolean {
  return getVercelEnvironment(env) === "production";
}

export function isPreviewDeployment(
  env: SiteEnvironment = getProcessSiteEnvironment(),
): boolean {
  return getVercelEnvironment(env) === "preview";
}

export function getSiteUrl(
  env: SiteEnvironment = getProcessSiteEnvironment(),
): URL {
  const vercelEnvironment = getVercelEnvironment(env);
  const siteUrlOverride = env.SITE_URL?.trim();

  if (siteUrlOverride) {
    return parseOrigin(
      siteUrlOverride,
      "SITE_URL",
      vercelEnvironment === "production" || vercelEnvironment === "preview",
    );
  }

  if (vercelEnvironment === "production" || vercelEnvironment === "preview") {
    const productionDomain = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

    if (!productionDomain) {
      throw new Error(
        "Hosted deployments require SITE_URL or VERCEL_PROJECT_PRODUCTION_URL for canonical URL authority.",
      );
    }

    return parseOrigin(
      `https://${productionDomain}`,
      "VERCEL_PROJECT_PRODUCTION_URL",
      true,
    );
  }

  return new URL(LOCAL_SITE_URL);
}

export function getCanonicalUrl(
  routePath: string,
  env: SiteEnvironment = getProcessSiteEnvironment(),
): URL {
  if (!routePath.startsWith("/") || routePath.startsWith("//")) {
    throw new Error(
      "Canonical route paths must be application-relative paths beginning with a single slash.",
    );
  }

  const siteUrl = getSiteUrl(env);
  const canonicalUrl = new URL(routePath, siteUrl);

  if (canonicalUrl.origin !== siteUrl.origin) {
    throw new Error("Canonical URL must remain on the canonical site origin.");
  }

  canonicalUrl.hash = "";

  return canonicalUrl;
}

export function getDeploymentRobots(
  routePolicy: RouteIndexingPolicy,
  env: SiteEnvironment = getProcessSiteEnvironment(),
): RouteIndexingPolicy {
  if (!isProductionDeployment(env)) {
    return {
      index: false,
      follow: false,
    };
  }

  return {
    index: routePolicy.index,
    follow: routePolicy.follow,
  };
}
