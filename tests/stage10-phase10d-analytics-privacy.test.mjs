import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { sanitizeAnalyticsEvent } from "../src/lib/analytics-privacy.ts";

const ROOT = process.cwd();
const pageview = (url, extra = {}) => ({ type: "pageview", url, ...extra });
const readSource = (relativePath) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

test("all current canonical public route classes are permitted", () => {
  const paths = [
    "/",
    "/about",
    "/blog",
    "/blog/example-article",
    "/topics/cardiology",
    "/portfolio",
    "/contact",
    "/disclaimer",
  ];

  for (const pathname of paths) {
    assert.deepEqual(
      sanitizeAnalyticsEvent(pageview(`https://example.com${pathname}`)),
      pageview(`https://example.com${pathname}`),
    );
  }
});

test("the complete query string is removed for every public route", () => {
  const queryStrings = [
    "q=diabetes",
    "topic=cardiology",
    "page=2",
    "utm_source=test",
    "utm_medium=email",
    "unknown=future-value",
    "q=diabetes&topic=cardiology&page=2&utm_source=test&unknown=value",
  ];

  for (const query of queryStrings) {
    assert.equal(
      sanitizeAnalyticsEvent(pageview(`https://example.com/blog?${query}`))
        ?.url,
      "https://example.com/blog",
    );
  }
});

test("fragments are removed from permitted public URLs", () => {
  assert.equal(
    sanitizeAnalyticsEvent(
      pageview("https://example.com/blog/example-article#references"),
    )?.url,
    "https://example.com/blog/example-article",
  );
});

test("combined sensitive query and fragment data is fully removed", () => {
  assert.equal(
    sanitizeAnalyticsEvent(
      pageview(
        "https://example.com/blog?q=diabetes&page=2&utm_source=test#results",
      ),
    )?.url,
    "https://example.com/blog",
  );
});

test("origin is normalized and only origin plus pathname is returned", () => {
  assert.equal(
    sanitizeAnalyticsEvent(
      pageview("HTTPS://EXAMPLE.COM:443/about?secret=value#private"),
    )?.url,
    "https://example.com/about",
  );
});

test("fields unrelated to the URL are preserved without mutation", () => {
  const original = pageview("https://example.com/blog?q=private", {
    syntheticMarker: "preserved",
  });
  const sanitized = sanitizeAnalyticsEvent(original);

  assert.notEqual(sanitized, original);
  assert.equal(sanitized?.syntheticMarker, "preserved");
  assert.equal(sanitized?.type, "pageview");
  assert.equal(sanitized?.url, "https://example.com/blog");
  assert.equal(original.url, "https://example.com/blog?q=private");
});

test("admin and nested admin routes always fail closed", () => {
  const paths = [
    "/admin",
    "/admin/",
    "/admin/login",
    "/admin/articles",
    "/admin/articles/example",
    "/admin/settings/private",
  ];

  for (const pathname of paths) {
    assert.equal(
      sanitizeAnalyticsEvent(pageview(`https://example.com${pathname}`)),
      null,
    );
  }
});

test("future draft, private, and preview identifiers fail closed", () => {
  const paths = [
    "/preview/article",
    "/drafts/example",
    "/private/example",
    "/blog/draft-example",
    "/blog/example-private-copy",
    "/topics/preview-topic",
  ];

  for (const pathname of paths) {
    assert.equal(
      sanitizeAnalyticsEvent(pageview(`https://example.com${pathname}`)),
      null,
    );
  }
});

test("provisional draft UUID slugs fail closed", () => {
  assert.equal(
    sanitizeAnalyticsEvent(
      pageview(
        "https://example.com/blog/draft-80000000-0000-0000-0000-000000000001",
      ),
    ),
    null,
  );
});

test("malformed, relative, and empty URLs fail closed", () => {
  for (const url of ["not a url", "/about", "", "https://"]) {
    assert.equal(sanitizeAnalyticsEvent(pageview(url)), null);
  }
});

test("non-HTTP protocols and credential-bearing URLs fail closed", () => {
  const urls = [
    "javascript:alert(1)",
    "data:text/plain,private",
    "ftp://example.com/about",
    "https://user:password@example.com/about",
  ];

  for (const url of urls) {
    assert.equal(sanitizeAnalyticsEvent(pageview(url)), null);
  }
});

test("unrecognized, API, internal, and metadata routes fail closed", () => {
  const paths = [
    "/login",
    "/api/articles",
    "/_next/static/chunk.js",
    "/robots.txt",
    "/sitemap.xml",
    "/opengraph-image",
    "/unknown",
  ];

  for (const pathname of paths) {
    assert.equal(
      sanitizeAnalyticsEvent(pageview(`https://example.com${pathname}`)),
      null,
    );
  }
});

test("non-canonical slugs and extra path segments fail closed", () => {
  const paths = [
    "/blog/UPPERCASE",
    "/blog/double--hyphen",
    "/blog/article/extra",
    "/topics/topic/extra",
    "/about/",
  ];

  for (const pathname of paths) {
    assert.equal(
      sanitizeAnalyticsEvent(pageview(`https://example.com${pathname}`)),
      null,
    );
  }
});

test("custom Analytics events are suppressed", () => {
  assert.equal(
    sanitizeAnalyticsEvent({
      type: "event",
      url: "https://example.com/about",
    }),
    null,
  );
});

test("integration uses the official Next.js entry point and approved filter", () => {
  const wrapper = readSource(
    "src/components/analytics/privacy-safe-analytics.tsx",
  );

  assert.match(wrapper, /^"use client";/);
  assert.match(wrapper, /from "@vercel\/analytics\/next"/);
  assert.match(wrapper, /<Analytics beforeSend=\{sanitizeAnalyticsEvent\} \/>/);
  assert.doesNotMatch(wrapper, /\btrack\s*\(/);
});

test("root layout remains a Server Component with the narrow wrapper mounted", () => {
  const layout = readSource("src/app/layout.tsx");

  assert.doesNotMatch(layout, /^["']use client["'];/);
  assert.match(layout, /<PrivacySafeAnalytics \/>/);
});

test("only the exact official Analytics dependency is present", () => {
  const packageJson = JSON.parse(readSource("package.json"));
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  assert.equal(allDependencies["@vercel/analytics"], "2.0.1");
  for (const dependency of [
    "@vercel/speed-insights",
    "@next/third-parties",
    "analytics",
    "react-ga",
    "react-ga4",
  ]) {
    assert.equal(dependency in allDependencies, false);
  }
});

test("application source contains no custom Analytics tracking calls", () => {
  const source = ["app", "components", "lib"]
    .flatMap((base) =>
      fs
        .readdirSync(path.join(ROOT, "src", base), { recursive: true })
        .filter((entry) => /\.(?:ts|tsx)$/.test(entry))
        .map((entry) =>
          fs.readFileSync(path.join(ROOT, "src", base, entry), "utf8"),
        ),
    )
    .join("\n");

  assert.doesNotMatch(
    source,
    /import\s*\{[^}]*\btrack\b[^}]*\}\s*from\s*["']@vercel\/analytics/,
  );
  assert.doesNotMatch(source, /\btrack\s*\(/);
});
