import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_PUBLIC_SITE_DESCRIPTION,
  getCanonicalUrl,
  getDeploymentRobots,
  getPublicRouteDiscoveryMetadata,
  getPublicRouteSocialMetadata,
  getSiteUrl,
  getSiteTitleMetadata,
  isPreviewDeployment,
  isProductionDeployment,
  resolveArticleMetadataText,
  SOCIAL_FALLBACK_ALT,
} from "../src/lib/site-url.ts";

const ROOT = process.cwd();

test("local development uses deterministic localhost canonical authority", () => {
  const siteUrl = getSiteUrl({});

  assert.equal(siteUrl.origin, "http://localhost:3000");
  assert.equal(isProductionDeployment({}), false);
  assert.equal(isPreviewDeployment({}), false);
});

test("VERCEL_ENV development remains local even if a production URL variable exists", () => {
  const siteUrl = getSiteUrl({
    VERCEL_ENV: "development",
    VERCEL_PROJECT_PRODUCTION_URL: "ignored.example.test",
  });

  assert.equal(siteUrl.origin, "http://localhost:3000");
});

test("production uses VERCEL_PROJECT_PRODUCTION_URL with https", () => {
  const env = {
    VERCEL_ENV: "production",
    VERCEL_PROJECT_PRODUCTION_URL: "production.example.test",
  };

  assert.equal(getSiteUrl(env).origin, "https://production.example.test");
  assert.equal(isProductionDeployment(env), true);
});

test("preview keeps production canonical authority but is classified as preview", () => {
  const env = {
    VERCEL_ENV: "preview",
    VERCEL_PROJECT_PRODUCTION_URL: "production.example.test",
  };

  assert.equal(getSiteUrl(env).origin, "https://production.example.test");
  assert.equal(isPreviewDeployment(env), true);
  assert.equal(isProductionDeployment(env), false);
});

test("deployment-specific Vercel URLs never override production canonical authority", () => {
  const env = {
    VERCEL_ENV: "preview",
    VERCEL_PROJECT_PRODUCTION_URL: "production.example.test",
    VERCEL_URL: "generated-preview.example.test",
    VERCEL_BRANCH_URL: "branch-preview.example.test",
  };

  assert.equal(getSiteUrl(env).origin, "https://production.example.test");
});

test("SITE_URL has precedence when explicitly configured", () => {
  const env = {
    SITE_URL: "https://approved.example.test/",
    VERCEL_ENV: "production",
    VERCEL_PROJECT_PRODUCTION_URL: "production.example.test",
  };

  assert.equal(getSiteUrl(env).origin, "https://approved.example.test");
});

test("hosted production fails closed without canonical authority", () => {
  assert.throws(
    () =>
      getSiteUrl({
        VERCEL_ENV: "production",
        VERCEL_URL: "preview.example.test",
      }),
    /require SITE_URL or VERCEL_PROJECT_PRODUCTION_URL/,
  );
});

test("preview also fails closed without production canonical authority", () => {
  assert.throws(
    () =>
      getSiteUrl({
        VERCEL_ENV: "preview",
      }),
    /require SITE_URL or VERCEL_PROJECT_PRODUCTION_URL/,
  );
});

test("hosted SITE_URL must use https", () => {
  assert.throws(
    () =>
      getSiteUrl({
        SITE_URL: "http://approved.example.test",
        VERCEL_ENV: "production",
      }),
    /must use https/,
  );
});

test("configured origins reject paths, queries, fragments, and credentials", () => {
  assert.throws(
    () => getSiteUrl({ SITE_URL: "https://example.test/path" }),
    /only an origin/,
  );

  assert.throws(
    () => getSiteUrl({ SITE_URL: "https://example.test/?q=test" }),
    /only an origin/,
  );

  assert.throws(
    () => getSiteUrl({ SITE_URL: "https://example.test/#fragment" }),
    /only an origin/,
  );

  assert.throws(
    () => getSiteUrl({ SITE_URL: "https://user:pass@example.test" }),
    /must not contain credentials/,
  );
});

test("canonical URL helper preserves intentional pagination queries and strips fragments", () => {
  const env = {
    SITE_URL: "https://canonical.example.test",
  };

  assert.equal(
    getCanonicalUrl("/blog?page=2#section", env).toString(),
    "https://canonical.example.test/blog?page=2",
  );
});

test("canonical URL helper rejects absolute and protocol-relative destinations", () => {
  const env = {
    SITE_URL: "https://canonical.example.test",
  };

  assert.throws(
    () => getCanonicalUrl("https://other.example.test/blog", env),
    /application-relative/,
  );

  assert.throws(
    () => getCanonicalUrl("//other.example.test/blog", env),
    /application-relative/,
  );
});

test("deployment robots permit route policy only in verified production classification", () => {
  const routePolicy = {
    index: true,
    follow: true,
  };

  assert.deepEqual(
    getDeploymentRobots(routePolicy, {
      VERCEL_ENV: "production",
    }),
    {
      index: true,
      follow: true,
    },
  );

  assert.deepEqual(
    getDeploymentRobots(routePolicy, {
      VERCEL_ENV: "preview",
    }),
    {
      index: false,
      follow: false,
    },
  );

  assert.deepEqual(getDeploymentRobots(routePolicy, {}), {
    index: false,
    follow: false,
  });
});

test("production route-specific noindex follow policy is preserved", () => {
  assert.deepEqual(
    getDeploymentRobots(
      {
        index: false,
        follow: true,
      },
      {
        VERCEL_ENV: "production",
      },
    ),
    {
      index: false,
      follow: true,
    },
  );
});
test("public route discovery metadata emits absolute canonical and production indexing", () => {
  const metadata = getPublicRouteDiscoveryMetadata("/about", {
    env: {
      SITE_URL: "https://canonical.example.test",
      VERCEL_ENV: "production",
    },
  });

  assert.equal(
    String(metadata.alternates?.canonical),
    "https://canonical.example.test/about",
  );

  assert.deepEqual(metadata.robots, {
    index: true,
    follow: true,
  });
});

test("public route discovery metadata keeps production canonical but disables preview indexing", () => {
  const metadata = getPublicRouteDiscoveryMetadata("/portfolio", {
    env: {
      VERCEL_ENV: "preview",
      VERCEL_PROJECT_PRODUCTION_URL: "production.example.test",
    },
  });

  assert.equal(
    String(metadata.alternates?.canonical),
    "https://production.example.test/portfolio",
  );

  assert.deepEqual(metadata.robots, {
    index: false,
    follow: false,
  });
});

test("public route discovery metadata preserves production route-specific noindex follow policy", () => {
  const metadata = getPublicRouteDiscoveryMetadata("/blog", {
    routePolicy: {
      index: false,
      follow: true,
    },
    env: {
      SITE_URL: "https://canonical.example.test",
      VERCEL_ENV: "production",
    },
  });

  assert.deepEqual(metadata.robots, {
    index: false,
    follow: true,
  });
});

test("site title metadata derives the root default and child template from one setting", () => {
  assert.deepEqual(getSiteTitleMetadata("Marie Medere Editorial"), {
    default: "Marie Medere Editorial",
    template: "%s | Marie Medere Editorial",
  });
});

test("website social metadata uses the reviewed canonical identity without fabricated fields", () => {
  const metadata = getPublicRouteDiscoveryMetadata("/blog?page=2", {
    env: {
      SITE_URL: "https://canonical.example.test",
      VERCEL_ENV: "production",
    },
    social: {
      title: "Articles",
      description: "Published educational writing.",
    },
  });

  assert.deepEqual(metadata.openGraph, {
    type: "website",
    title: "Articles",
    description: "Published educational writing.",
    url: new URL("https://canonical.example.test/blog?page=2"),
    images: [
      {
        url: "https://canonical.example.test/opengraph-image",
        alt: SOCIAL_FALLBACK_ALT,
        width: 1200,
        height: 630,
      },
    ],
  });
  assert.deepEqual(metadata.twitter, {
    card: "summary_large_image",
    title: "Articles",
    description: "Published educational writing.",
    images: [
      {
        url: "https://canonical.example.test/opengraph-image",
        alt: SOCIAL_FALLBACK_ALT,
        width: 1200,
        height: 630,
      },
    ],
  });
  assert.equal("site" in metadata.twitter, false);
  assert.equal("creator" in metadata.twitter, false);
});

test("root social metadata accepts the settings-derived title template", () => {
  const title = getSiteTitleMetadata("Marie Medere Editorial");
  const metadata = getPublicRouteSocialMetadata(
    "/",
    {
      title,
      description: "A safe publication description.",
    },
    {
      SITE_URL: "https://canonical.example.test",
    },
  );

  assert.deepEqual(metadata.openGraph?.title, title);
  assert.deepEqual(metadata.twitter?.title, title);
  assert.equal(
    String(metadata.openGraph?.url),
    "https://canonical.example.test/",
  );
});

test("article social metadata emits truthful article fields and trims verified authors", () => {
  const metadata = getPublicRouteSocialMetadata(
    "/blog/synthetic-article",
    {
      title: "Synthetic Article",
      description: "A deterministic test description.",
      type: "article",
      publishedTime: "2026-08-20T10:00:00.000Z",
      modifiedTime: "2026-08-21T11:00:00.000Z",
      authors: ["  Marie Medere  ", "   "],
    },
    {
      SITE_URL: "https://canonical.example.test",
    },
  );

  assert.deepEqual(metadata.openGraph, {
    type: "article",
    title: "Synthetic Article",
    description: "A deterministic test description.",
    url: new URL("https://canonical.example.test/blog/synthetic-article"),
    publishedTime: "2026-08-20T10:00:00.000Z",
    modifiedTime: "2026-08-21T11:00:00.000Z",
    authors: ["Marie Medere"],
    images: [
      {
        url: "https://canonical.example.test/opengraph-image",
        alt: SOCIAL_FALLBACK_ALT,
        width: 1200,
        height: 630,
      },
    ],
  });
});

test("article metadata text follows the complete approved fallback chains", () => {
  const baseArticle = {
    title: "Stored Article Title",
    seoTitle: "  Reviewed SEO Title  ",
    excerpt: "  Article excerpt.  ",
    seoDescription: "  Reviewed SEO description.  ",
  };

  assert.deepEqual(
    resolveArticleMetadataText(baseArticle, {
      defaultDescription: "Site description.",
      tagline: "Site tagline.",
    }),
    {
      title: "Reviewed SEO Title",
      description: "Reviewed SEO description.",
    },
  );

  assert.equal(
    resolveArticleMetadataText(
      { ...baseArticle, seoTitle: "", seoDescription: "" },
      { defaultDescription: "Site description.", tagline: "Site tagline." },
    ).description,
    "Article excerpt.",
  );

  assert.equal(
    resolveArticleMetadataText(
      { ...baseArticle, seoDescription: null, excerpt: null },
      { defaultDescription: " Site description. ", tagline: "Site tagline." },
    ).description,
    "Site description.",
  );

  assert.equal(
    resolveArticleMetadataText(
      { ...baseArticle, seoDescription: null, excerpt: null },
      { defaultDescription: null, tagline: " Site tagline. " },
    ).description,
    "Site tagline.",
  );

  assert.equal(
    resolveArticleMetadataText(
      { ...baseArticle, seoDescription: null, excerpt: null },
      { defaultDescription: null, tagline: null },
    ).description,
    DEFAULT_PUBLIC_SITE_DESCRIPTION,
  );
});

test("static public routes declare unsuffixed titles, canonicals, and social metadata", () => {
  const cases = [
    ["src/app/about/page.tsx", "/about", "About", "About — Marie Medere"],
    [
      "src/app/portfolio/page.tsx",
      "/portfolio",
      "Selected Writing",
      "Selected Writing — Marie Medere",
    ],
    [
      "src/app/contact/page.tsx",
      "/contact",
      "Contact",
      "Contact — Marie Medere",
    ],
    [
      "src/app/disclaimer/page.tsx",
      "/disclaimer",
      "Medical Disclaimer",
      "Medical Disclaimer — Marie Medere",
    ],
  ];

  for (const [relativePath, canonicalPath, title, oldTitle] of cases) {
    const content = fs.readFileSync(path.join(ROOT, relativePath), "utf8");

    assert.match(content, new RegExp(`const PAGE_TITLE = "${title}";`));
    assert.ok(
      content.includes(`getPublicRouteDiscoveryMetadata("${canonicalPath}", {`),
      `${relativePath} must declare its canonical metadata helper`,
    );
    assert.match(
      content,
      /social:\s*\{\s*title: PAGE_TITLE,\s*description: PAGE_DESCRIPTION/s,
    );
    assert.equal(content.includes(oldTitle), false);
  }
});

test("root and homepage define settings-derived social defaults and canonical identity", () => {
  const rootLayout = fs.readFileSync(
    path.join(ROOT, "src/app/layout.tsx"),
    "utf8",
  );
  const homePage = fs.readFileSync(path.join(ROOT, "src/app/page.tsx"), "utf8");

  assert.match(rootLayout, /const title = getSiteTitleMetadata\(siteTitle\);/);
  assert.match(
    rootLayout,
    /getPublicRouteSocialMetadata\("\/", \{\s*title,\s*description,/s,
  );
  assert.match(
    rootLayout,
    /robots:\s*getDeploymentRobots\(\{\s*index:\s*true,\s*follow:\s*true,\s*\}\)/s,
  );
  assert.match(homePage, /getPublicRouteDiscoveryMetadata\("\/"\)/);
});

test("admin subtree suppresses inherited public canonical and social metadata", () => {
  const adminLayout = fs.readFileSync(
    path.join(ROOT, "src/app/admin/layout.tsx"),
    "utf8",
  );

  assert.match(
    adminLayout,
    /title:\s*\{\s*absolute:\s*"Marie Medere Workspace",\s*template:\s*"%s"/s,
  );
  assert.match(adminLayout, /alternates:\s*null/);
  assert.match(adminLayout, /openGraph:\s*null/);
  assert.match(adminLayout, /twitter:\s*null/);
  assert.match(
    adminLayout,
    /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/s,
  );

  assert.ok(
    !adminLayout.includes("getPublicRouteDiscoveryMetadata("),
    "Admin subtree must never receive a public canonical metadata helper.",
  );
});
