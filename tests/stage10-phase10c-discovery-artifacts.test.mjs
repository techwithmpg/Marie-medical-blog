import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  STATIC_PUBLIC_SITEMAP_PATHS,
  buildBlogPostingJsonLd,
  buildDiscoveryRobots,
  buildDiscoverySitemap,
  buildDiscoverySitemapWithFallback,
  resolvePublicDiscoveryImage,
  serializeJsonLd,
} from "../src/lib/discovery-artifacts.ts";
import {
  SOCIAL_FALLBACK_ALT,
  getCanonicalUrl,
  getPublicRouteSocialMetadata,
  resolveArticleMetadataText,
} from "../src/lib/site-url.ts";

const ROOT = process.cwd();
const ARTICLE_ID = "80000000-0000-0000-0000-000000000001";
const IMAGE_PATH = `articles/${ARTICLE_ID}/featured/folio-card.png`;
const PUBLIC_IMAGE_URL = `https://project.supabase.co/storage/v1/object/public/public-assets/${IMAGE_PATH}`;
const PRODUCTION_ENV = {
  VERCEL_ENV: "production",
  VERCEL_PROJECT_PRODUCTION_URL: "publication.example.test",
};
const canonical = (routePath) => getCanonicalUrl(routePath, PRODUCTION_ENV);
const readSource = (relativePath) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

test("Evidence Folio fallback declares the required image contract", () => {
  const source = readSource("src/app/opengraph-image.tsx");

  assert.match(source, /ImageResponse/);
  assert.match(source, /width:\s*1200/);
  assert.match(source, /height:\s*630/);
  assert.match(source, /contentType = "image\/png"/);
  for (const color of [
    "#F6F1E8",
    "#FFFDF9",
    "#242321",
    "#5E5953",
    "#7B3F35",
    "#3F5E52",
  ]) {
    assert.match(source, new RegExp(color));
  }
});

test("fallback card uses only approved truthful publication language", () => {
  const source = readSource("src/app/opengraph-image.tsx");

  assert.match(source, /Evidence Folio/);
  assert.match(source, /Marie Medere/);
  assert.match(source, /Medical Writing Portfolio &amp; Educational Blog/);
  assert.doesNotMatch(
    source,
    /Dr\. Marie|MBBS|PhD|award|testimonial|followers|clients|@[a-z]|https?:\/\//i,
  );
});

test("child social metadata receives one canonical generated fallback", () => {
  const metadata = getPublicRouteSocialMetadata(
    "/about",
    { title: "About", description: "About the publication." },
    PRODUCTION_ENV,
  );
  const expected = {
    url: "https://publication.example.test/opengraph-image",
    alt: SOCIAL_FALLBACK_ALT,
    width: 1200,
    height: 630,
  };

  assert.deepEqual(metadata.openGraph.images, [expected]);
  assert.deepEqual(metadata.twitter.images, [expected]);
});

test("root metadata can defer image resolution to the native metadata file", () => {
  const metadata = getPublicRouteSocialMetadata(
    "/",
    {
      title: "Marie Medere",
      description: "Medical Writing Portfolio & Educational Blog.",
      useMetadataFileImage: true,
    },
    PRODUCTION_ENV,
  );

  assert.equal("images" in metadata.openGraph, false);
  assert.equal("images" in metadata.twitter, false);
});

test("valid public article media is preferred over the root fallback", () => {
  const image = resolvePublicDiscoveryImage({
    storagePath: IMAGE_PATH,
    alt: "Synthetic editorial diagram",
    publicUrl: PUBLIC_IMAGE_URL,
  });
  const metadata = getPublicRouteSocialMetadata(
    "/blog/synthetic-article",
    {
      title: "Synthetic Article",
      description: "Synthetic test description.",
      type: "article",
      image,
    },
    PRODUCTION_ENV,
  );

  assert.deepEqual(metadata.openGraph.images, [image]);
  assert.deepEqual(metadata.twitter.images, [image]);
});

test("private, signed, unsupported, and inaccessible image candidates fail closed", () => {
  const candidates = [
    { storagePath: IMAGE_PATH, alt: "", publicUrl: PUBLIC_IMAGE_URL },
    {
      storagePath: IMAGE_PATH.replace(".png", ".avif"),
      alt: "Synthetic alt",
      publicUrl: PUBLIC_IMAGE_URL.replace(".png", ".avif"),
    },
    {
      storagePath: IMAGE_PATH,
      alt: "Synthetic alt",
      publicUrl: PUBLIC_IMAGE_URL.replace("public-assets", "draft-assets"),
    },
    {
      storagePath: IMAGE_PATH,
      alt: "Synthetic alt",
      publicUrl: `${PUBLIC_IMAGE_URL}?token=secret`,
    },
    {
      storagePath: IMAGE_PATH,
      alt: "Synthetic alt",
      publicUrl: "data:image/png;base64,AAAA",
    },
  ];

  for (const candidate of candidates) {
    assert.equal(resolvePublicDiscoveryImage(candidate), null);
  }
});

test("sitemap contains the exact approved static public route set", () => {
  const sitemap = buildDiscoverySitemap([], canonical);

  assert.deepEqual(
    sitemap.map((entry) => entry.url),
    STATIC_PUBLIC_SITEMAP_PATHS.map(
      (routePath) => `https://publication.example.test${routePath}`,
    ).map((url) => (url.endsWith("/") ? url : url)),
  );
});

test("sitemap includes published articles and rejects non-public or invalid slugs", () => {
  const sitemap = buildDiscoverySitemap(
    [
      {
        slug: "published-article",
        status: "published",
        published_at: "2026-08-20T10:00:00.000Z",
        updated_at: "2026-08-21T10:00:00.000Z",
        topic_slug: null,
      },
      {
        slug: "draft-article",
        status: "draft",
        published_at: null,
        updated_at: null,
        topic_slug: null,
      },
      {
        slug: "invalid/slug",
        status: "published",
        published_at: null,
        updated_at: null,
        topic_slug: null,
      },
    ],
    canonical,
  );
  const urls = sitemap.map((entry) => entry.url);

  assert.ok(
    urls.includes("https://publication.example.test/blog/published-article"),
  );
  assert.ok(!urls.some((url) => url.includes("draft-article")));
  assert.ok(!urls.some((url) => url.includes("invalid")));
});

test("topics are emitted once only when represented by a published article", () => {
  const sitemap = buildDiscoverySitemap(
    [
      {
        slug: "article-one",
        status: "published",
        published_at: null,
        updated_at: null,
        topic_slug: "public-health",
      },
      {
        slug: "article-two",
        status: "published",
        published_at: null,
        updated_at: null,
        topic_slug: "public-health",
      },
      {
        slug: "draft-three",
        status: "draft",
        published_at: null,
        updated_at: null,
        topic_slug: "empty-topic",
      },
    ],
    canonical,
  );
  const topicUrls = sitemap
    .map((entry) => entry.url)
    .filter((url) => url.includes("/topics/"));

  assert.deepEqual(topicUrls, [
    "https://publication.example.test/topics/public-health",
  ]);
});

test("sitemap has no admin, query, tracking, search, or pagination URLs", () => {
  const sitemap = buildDiscoverySitemap([], canonical);

  for (const entry of sitemap) {
    assert.doesNotMatch(entry.url, /\/admin|[?&](?:q|topic|page|utm_)=/);
  }
});

test("article lastModified prefers updated_at and falls back to published_at", () => {
  const sitemap = buildDiscoverySitemap(
    [
      {
        slug: "updated-article",
        status: "published",
        published_at: "2026-08-20T10:00:00.000Z",
        updated_at: "2026-08-22T11:00:00.000Z",
        topic_slug: null,
      },
      {
        slug: "published-article",
        status: "published",
        published_at: "2026-08-19T09:00:00.000Z",
        updated_at: null,
        topic_slug: null,
      },
    ],
    canonical,
  );

  assert.equal(
    sitemap.find((entry) => entry.url.endsWith("/updated-article"))
      .lastModified,
    "2026-08-22T11:00:00.000Z",
  );
  assert.equal(
    sitemap.find((entry) => entry.url.endsWith("/published-article"))
      .lastModified,
    "2026-08-19T09:00:00.000Z",
  );
});

test("invalid timestamps are omitted rather than fabricated", () => {
  const sitemap = buildDiscoverySitemap(
    [
      {
        slug: "undated-article",
        status: "published",
        published_at: "not-a-date",
        updated_at: "also-not-a-date",
        topic_slug: null,
      },
    ],
    canonical,
  );

  assert.equal(
    "lastModified" in
      sitemap.find((entry) => entry.url.endsWith("/undated-article")),
    false,
  );
});

test("preview deployments retain production canonical sitemap authority", () => {
  const previewCanonical = (routePath) =>
    getCanonicalUrl(routePath, {
      VERCEL_ENV: "preview",
      VERCEL_PROJECT_PRODUCTION_URL: "publication.example.test",
      VERCEL_URL: "preview-branch.example.test",
    });
  const sitemap = buildDiscoverySitemap([], previewCanonical);

  assert.ok(
    sitemap.every((entry) =>
      entry.url.startsWith("https://publication.example.test/"),
    ),
  );
  assert.ok(sitemap.every((entry) => !entry.url.includes("preview-branch")));
});

test("dynamic sitemap failure reports the error and returns static public routes", async () => {
  const failure = new Error("synthetic unavailable data source");
  let reported = null;
  const sitemap = await buildDiscoverySitemapWithFallback(
    async () => {
      throw failure;
    },
    canonical,
    (error) => {
      reported = error;
    },
  );

  assert.equal(reported, failure);
  assert.equal(sitemap.length, STATIC_PUBLIC_SITEMAP_PATHS.length);
  assert.ok(sitemap.every((entry) => !entry.url.includes("/admin")));
  assert.match(
    readSource("src/app/sitemap.ts"),
    /export const dynamic = "force-dynamic"/,
  );
});

test("production robots allows public crawling and protects the admin path", () => {
  const robots = buildDiscoveryRobots(true, canonical);

  assert.deepEqual(robots.rules, {
    userAgent: "*",
    allow: "/",
    disallow: ["/admin", "/admin/"],
  });
  assert.equal(robots.sitemap, "https://publication.example.test/sitemap.xml");
});

test("preview robots disallows all crawling without sitemap or host", () => {
  const robots = buildDiscoveryRobots(false, () => {
    throw new Error("preview must not resolve a sitemap URL");
  });

  assert.deepEqual(robots, {
    rules: { userAgent: "*", disallow: "/" },
  });
  assert.equal("sitemap" in robots, false);
  assert.equal("host" in robots, false);
});

test("robots remains narrow crawl guidance and does not block render assets", () => {
  const robots = buildDiscoveryRobots(true, canonical);
  const serialized = JSON.stringify(robots);

  assert.equal("host" in robots, false);
  assert.doesNotMatch(serialized, /_next|\?q=|\?topic=|\?page=/);
});

test("BlogPosting JSON-LD contains only truthful visible article facts", () => {
  const image = resolvePublicDiscoveryImage({
    storagePath: IMAGE_PATH,
    alt: "Synthetic editorial diagram",
    publicUrl: PUBLIC_IMAGE_URL,
  });
  const jsonLd = buildBlogPostingJsonLd({
    headline: "Synthetic Published Article",
    description: "A clearly synthetic description.",
    canonicalUrl: canonical("/blog/synthetic-published-article"),
    publishedAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-21T11:00:00.000Z",
    authorName: "Marie Medere",
    authorUrl: canonical("/about"),
    image,
  });

  assert.deepEqual(jsonLd, {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Synthetic Published Article",
    description: "A clearly synthetic description.",
    url: "https://publication.example.test/blog/synthetic-published-article",
    mainEntityOfPage:
      "https://publication.example.test/blog/synthetic-published-article",
    datePublished: "2026-08-20T10:00:00.000Z",
    dateModified: "2026-08-21T11:00:00.000Z",
    author: {
      "@type": "Person",
      name: "Marie Medere",
      url: "https://publication.example.test/about",
    },
    image: PUBLIC_IMAGE_URL,
  });
});

test("BlogPosting omits unavailable image, dates, author, and unverified fields", () => {
  const jsonLd = buildBlogPostingJsonLd({
    headline: "Synthetic Published Article",
    description: "Synthetic description.",
    canonicalUrl: canonical("/blog/synthetic-published-article"),
    authorName: " ",
    authorUrl: canonical("/about"),
    image: null,
  });
  const serialized = JSON.stringify(jsonLd);

  for (const field of [
    "image",
    "datePublished",
    "dateModified",
    "author",
    "publisher",
    "organization",
    "logo",
    "sameAs",
    "credentials",
    "occupation",
    "affiliation",
    "specialty",
    "awards",
    "ratings",
    "comments",
  ]) {
    assert.equal(field in jsonLd, false);
    assert.doesNotMatch(serialized, new RegExp(`"${field}"`, "i"));
  }
  assert.equal(jsonLd["@type"], "BlogPosting");
  assert.doesNotMatch(serialized, /MedicalWebPage|MedicalScholarlyArticle/);
});

test("BlogPosting uses the same approved article description fallback", () => {
  const metadataText = resolveArticleMetadataText(
    {
      title: "Synthetic Article",
      seoDescription: " ",
      excerpt: "Synthetic article excerpt.",
    },
    {
      defaultDescription: "Safe site description.",
    },
  );
  const jsonLd = buildBlogPostingJsonLd({
    headline: "Synthetic Article",
    description: metadataText.description,
    canonicalUrl: canonical("/blog/synthetic-article"),
    authorUrl: canonical("/about"),
  });

  assert.equal(jsonLd.description, "Synthetic article excerpt.");
});

test("JSON-LD serialization escapes less-than characters safely", () => {
  const serialized = serializeJsonLd({
    headline: "Synthetic </script><script>alert(1)</script>",
  });

  assert.doesNotMatch(serialized, /</);
  assert.match(serialized, /\\u003c\/script>/);
});

test("article discovery remains behind the published-only helper and notFound", () => {
  const publicArticles = readSource("src/lib/public-articles.ts");
  const articlePage = readSource("src/app/blog/[slug]/page.tsx");

  assert.match(publicArticles, /\.eq\("slug", slug\)/);
  assert.match(publicArticles, /\.eq\("status", "published"\)/);
  assert.match(articlePage, /if \(!article\) \{\s*notFound\(\);\s*\}/);
  assert.doesNotMatch(articlePage, /^\s*["']use client["']/m);
});

test("sitemap data helper selects only minimal published discovery fields", () => {
  const publicArticles = readSource("src/lib/public-articles.ts");
  const sitemapHelper = publicArticles.slice(
    publicArticles.indexOf("export async function getPublishedSitemapArticles"),
    publicArticles.indexOf("export async function getFeaturedPublishedArticle"),
  );

  assert.match(
    sitemapHelper,
    /"slug, status, published_at, updated_at, categories \( slug \)"/,
  );
  assert.match(sitemapHelper, /\.eq\("status", "published"\)/);
  assert.doesNotMatch(
    sitemapHelper,
    /content_json|seo_description|article_references|service_role|admin/,
  );
});

test("article JSON-LD is server-rendered without reader or private fields", () => {
  const articlePage = readSource("src/app/blog/[slug]/page.tsx");
  const builder = readSource("src/lib/discovery-artifacts.ts");
  const publicData = readSource("src/lib/public-data.ts");

  assert.match(articlePage, /type="application\/ld\+json"/);
  assert.match(articlePage, /serializeJsonLd\(articleJsonLd\)/);
  assert.match(publicData, /export const getPublicArticleAssetData = cache\(/);
  assert.doesNotMatch(
    builder,
    /commenter|contact_message|contact message|email|admin_settings|draft_content/i,
  );
});

test("Phase 10C discovery modules remain decoupled from Analytics", () => {
  const discoverySources = [
    "src/app/opengraph-image.tsx",
    "src/app/robots.ts",
    "src/app/sitemap.ts",
    "src/app/blog/[slug]/page.tsx",
    "src/lib/discovery-artifacts.ts",
  ]
    .map(readSource)
    .join("\n");

  assert.doesNotMatch(
    discoverySources,
    /@vercel\/analytics|<Analytics|beforeSend|\btrack\s*\(/,
  );
});
