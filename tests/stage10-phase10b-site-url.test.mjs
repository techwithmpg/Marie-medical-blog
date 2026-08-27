import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getCanonicalUrl,
  getDeploymentRobots,
  getPublicRouteDiscoveryMetadata,
  getSiteUrl,
  isPreviewDeployment,
  isProductionDeployment,
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

test("static public routes declare their reviewed canonical paths", () => {
  const cases = [
    ["src/app/page.tsx", 'getPublicRouteDiscoveryMetadata("/")'],
    ["src/app/about/page.tsx", 'getPublicRouteDiscoveryMetadata("/about")'],
    [
      "src/app/portfolio/page.tsx",
      'getPublicRouteDiscoveryMetadata("/portfolio")',
    ],
    ["src/app/contact/page.tsx", 'getPublicRouteDiscoveryMetadata("/contact")'],
    [
      "src/app/disclaimer/page.tsx",
      'getPublicRouteDiscoveryMetadata("/disclaimer")',
    ],
  ];

  for (const [relativePath, expectedCall] of cases) {
    const content = fs.readFileSync(path.join(ROOT, relativePath), "utf8");

    assert.ok(
      content.includes(expectedCall),
      `${relativePath} must declare ${expectedCall}`,
    );
  }
});

test("root layout and admin subtree enforce deployment/private robots boundaries", () => {
  const rootLayout = fs.readFileSync(
    path.join(ROOT, "src/app/layout.tsx"),
    "utf8",
  );

  assert.match(
    rootLayout,
    /robots:\s*getDeploymentRobots\(\{\s*index:\s*true,\s*follow:\s*true,\s*\}\)/s,
  );

  const adminLayout = fs.readFileSync(
    path.join(ROOT, "src/app/admin/layout.tsx"),
    "utf8",
  );

  assert.match(
    adminLayout,
    /export const metadata: Metadata = \{\s*robots:\s*\{\s*index:\s*false,\s*follow:\s*false,\s*\},\s*\};/s,
  );

  assert.ok(
    !adminLayout.includes("getPublicRouteDiscoveryMetadata("),
    "Admin subtree must never receive a public canonical metadata helper.",
  );
});
