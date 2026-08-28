import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getSingleQueryParam,
  hasQueryParam,
  parsePageQuery,
  resolveBlogDiscovery,
  resolvePaginationDiscovery,
  resolveTopicDiscovery,
} from "../src/lib/discovery-query.ts";

const readSource = (relativePath) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

test("single query parameters reject repeated array values", () => {
  assert.equal(getSingleQueryParam(undefined), undefined);
  assert.equal(getSingleQueryParam("medical-writing"), "medical-writing");
  assert.equal(getSingleQueryParam(["one", "two"]), undefined);

  assert.equal(hasQueryParam(undefined), false);
  assert.equal(hasQueryParam(""), true);
  assert.equal(hasQueryParam(["one", "two"]), true);
});

test("page query defaults cleanly to page one", () => {
  assert.deepEqual(parsePageQuery(undefined), {
    page: 1,
    hasPageParam: false,
    isMalformed: false,
  });

  assert.deepEqual(parsePageQuery(""), {
    page: 1,
    hasPageParam: true,
    isMalformed: false,
  });

  assert.deepEqual(parsePageQuery("1"), {
    page: 1,
    hasPageParam: true,
    isMalformed: false,
  });
});

test("valid positive integer pagination is normalized", () => {
  assert.deepEqual(parsePageQuery("2"), {
    page: 2,
    hasPageParam: true,
    isMalformed: false,
  });

  assert.deepEqual(parsePageQuery("02"), {
    page: 2,
    hasPageParam: true,
    isMalformed: false,
  });
});

test("malformed pagination fails closed to page one", () => {
  for (const value of ["0", "-1", "1.5", "2.0", "abc"]) {
    assert.deepEqual(parsePageQuery(value), {
      page: 1,
      hasPageParam: true,
      isMalformed: true,
    });
  }

  assert.deepEqual(parsePageQuery(["2", "3"]), {
    page: 1,
    hasPageParam: true,
    isMalformed: true,
  });
});

test("clean first page canonicalizes to the base listing", () => {
  assert.deepEqual(
    resolvePaginationDiscovery("/blog", parsePageQuery(undefined), 3),
    {
      canonicalPath: "/blog",
      index: true,
    },
  );

  assert.deepEqual(
    resolvePaginationDiscovery("/blog", parsePageQuery("1"), 3),
    {
      canonicalPath: "/blog",
      index: true,
    },
  );
});

test("valid later pagination self-canonicalizes", () => {
  assert.deepEqual(
    resolvePaginationDiscovery("/blog", parsePageQuery("2"), 4),
    {
      canonicalPath: "/blog?page=2",
      index: true,
    },
  );
});

test("out-of-range and malformed pagination never becomes indexable", () => {
  assert.deepEqual(
    resolvePaginationDiscovery("/blog", parsePageQuery("5"), 2),
    {
      canonicalPath: "/blog",
      index: false,
    },
  );

  assert.deepEqual(
    resolvePaginationDiscovery("/blog", parsePageQuery("-2"), 10),
    {
      canonicalPath: "/blog",
      index: false,
    },
  );
});

test("blog search variants take precedence over topic and pagination", () => {
  assert.deepEqual(
    resolveBlogDiscovery({
      q: "blood pressure",
      topic: "cardiology",
      page: "2",
      totalPages: 5,
      canonicalTopicSlug: "cardiology",
    }),
    {
      canonicalPath: "/blog",
      index: false,
    },
  );
});

test("verified blog topic filters canonicalize to the canonical topic route", () => {
  assert.deepEqual(
    resolveBlogDiscovery({
      q: undefined,
      topic: "heart-health",
      page: "4",
      totalPages: 8,
      canonicalTopicSlug: "heart-health",
    }),
    {
      canonicalPath: "/topics/heart-health",
      index: false,
    },
  );
});

test("invalid and repeated blog topic filters canonicalize to clean blog", () => {
  for (const topic of ["", "missing-topic", ["one", "two"]]) {
    assert.deepEqual(
      resolveBlogDiscovery({
        q: undefined,
        topic,
        page: "2",
        totalPages: 8,
        canonicalTopicSlug: null,
      }),
      {
        canonicalPath: "/blog",
        index: false,
      },
    );
  }
});

test("blog pagination indexes verified pages and rejects malformed or out-of-range pages", () => {
  assert.deepEqual(
    resolveBlogDiscovery({
      q: undefined,
      topic: undefined,
      page: "2",
      totalPages: 3,
    }),
    {
      canonicalPath: "/blog?page=2",
      index: true,
    },
  );

  for (const page of ["2.0", "9", ["2", "3"]]) {
    assert.deepEqual(
      resolveBlogDiscovery({
        q: undefined,
        topic: undefined,
        page,
        totalPages: 3,
      }),
      {
        canonicalPath: "/blog",
        index: false,
      },
    );
  }
});

test("topic discovery noindexes empty topics", () => {
  assert.deepEqual(
    resolveTopicDiscovery({
      basePath: "/topics/heart-health",
      page: undefined,
      totalPages: 0,
      hasPublishedArticles: false,
    }),
    {
      canonicalPath: "/topics/heart-health",
      index: false,
    },
  );
});

test("topic discovery indexes verified later pages and rejects out-of-range pages", () => {
  assert.deepEqual(
    resolveTopicDiscovery({
      basePath: "/topics/heart-health",
      page: "2",
      totalPages: 3,
      hasPublishedArticles: true,
    }),
    {
      canonicalPath: "/topics/heart-health?page=2",
      index: true,
    },
  );
  assert.deepEqual(
    resolveTopicDiscovery({
      basePath: "/topics/heart-health",
      page: "4",
      totalPages: 3,
      hasPublishedArticles: true,
    }),
    {
      canonicalPath: "/topics/heart-health",
      index: false,
    },
  );
});

test("dynamic routes reference the shared discovery metadata contract", () => {
  const blogRoute = readSource("src/app/blog/page.tsx");
  const topicRoute = readSource("src/app/topics/[slug]/page.tsx");
  const articleRoute = readSource("src/app/blog/[slug]/page.tsx");

  assert.match(blogRoute, /export async function generateMetadata/);
  assert.match(blogRoute, /resolveBlogDiscovery\(/);
  assert.match(blogRoute, /getPublicRouteDiscoveryMetadata\(/);
  assert.match(topicRoute, /resolveTopicDiscovery\(/);
  assert.match(topicRoute, /getPublicRouteDiscoveryMetadata\(/);
  assert.match(topicRoute, /notFound\(\)/);
  assert.match(articleRoute, /getPublicRouteDiscoveryMetadata\(/);
  assert.match(articleRoute, /notFound\(\)/);
});

test("published public helpers are request memoized without weakening publication filters", () => {
  const publicArticles = readSource("src/lib/public-articles.ts");

  assert.match(publicArticles, /import \{ cache \} from "react";/);
  assert.match(publicArticles, /export const getCategoryBySlug = cache\(/);
  assert.match(
    publicArticles,
    /export const getPublishedArticleBySlug = cache\(/,
  );
  assert.match(
    publicArticles,
    /export const getMemoizedBlogViewData = cache\(/,
  );
  assert.match(
    publicArticles,
    /export const getMemoizedTopicArticles = cache\(/,
  );
  assert.match(
    publicArticles,
    /getPublishedArticleBySlugUncached[\s\S]*?\.eq\("status", "published"\)/,
  );
  assert.match(publicArticles, /\.eq\("status", "published"\)/);
});
