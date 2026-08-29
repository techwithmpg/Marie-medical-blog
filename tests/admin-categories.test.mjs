import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const validationModule = await import(
  pathToFileURL(path.join(ROOT, "src/lib/admin/category-validation.ts")).href
);

const {
  createCategorySchema,
  deleteCategorySchema,
  generateCategorySlug,
  isCategoryReferenceError,
  isDuplicateCategorySlugError,
  updateCategorySchema,
} = validationModule;

test("Category validation accepts normalized V1 input and generated slugs", () => {
  assert.equal(
    generateCategorySlug("  Evidence & Health Literacy  "),
    "evidence-health-literacy",
  );

  const parsed = createCategorySchema.safeParse({
    name: "  Health Literacy  ",
    slug: "health-literacy",
    description: "  Synthetic editorial topic.  ",
  });

  assert.equal(parsed.success, true);
  assert.deepEqual(parsed.data, {
    name: "Health Literacy",
    slug: "health-literacy",
    description: "Synthetic editorial topic.",
  });
});

test("Category validation permits a manual create-time slug", () => {
  const parsed = createCategorySchema.safeParse({
    name: "Clinical Communication",
    slug: "plain-language-clinical-writing",
    description: "",
  });

  assert.equal(parsed.success, true);
  assert.equal(parsed.data.slug, "plain-language-clinical-writing");
  assert.equal(parsed.data.description, null);
});

test("Category validation rejects malformed, empty, and over-length fields", () => {
  assert.equal(
    createCategorySchema.safeParse({
      name: "Valid",
      slug: "Bad_Slug",
      description: "",
    }).success,
    false,
  );
  assert.equal(
    createCategorySchema.safeParse({
      name: "   ",
      slug: "valid",
      description: "",
    }).success,
    false,
  );
  assert.equal(
    createCategorySchema.safeParse({
      name: "n".repeat(81),
      slug: "valid",
      description: "",
    }).success,
    false,
  );
  assert.equal(
    createCategorySchema.safeParse({
      name: "Valid",
      slug: "s".repeat(81),
      description: "",
    }).success,
    false,
  );
  assert.equal(
    createCategorySchema.safeParse({
      name: "Valid",
      slug: "valid",
      description: "d".repeat(501),
    }).success,
    false,
  );
});

test("Category update and delete contracts validate UUIDs and exclude slug", () => {
  const categoryId = "10000000-0000-0000-0000-000000000001";

  assert.equal(
    updateCategorySchema.safeParse({
      categoryId,
      name: "Renamed Category",
      description: "Updated description",
    }).success,
    true,
  );
  assert.equal(
    updateCategorySchema.safeParse({
      categoryId,
      name: "Renamed Category",
      description: "Updated description",
      slug: "forbidden-change",
    }).success,
    false,
  );
  assert.equal(
    deleteCategorySchema.safeParse({ categoryId: "not-a-uuid" }).success,
    false,
  );
});

test("Category database errors map to safe duplicate and reference states", () => {
  assert.equal(
    isDuplicateCategorySlugError({
      code: "23505",
      details: "Key (slug) violates uq_categories_slug",
    }),
    true,
  );
  assert.equal(
    isCategoryReferenceError({
      code: "23503",
      details: "articles_category_id_fkey is still referenced",
    }),
    true,
  );
});

test("Category loader uses explicit fields, live usage aggregate, and stable order", () => {
  const content = fs.readFileSync(
    path.join(ROOT, "src/lib/admin/categories.ts"),
    "utf8",
  );

  assert.match(
    content,
    /id, name, slug, description, created_at, updated_at, articles\(count\)/,
  );
  assert.ok(!content.includes('select("*")'));
  assert.ok(content.includes('.order("name", { ascending: true })'));
  assert.ok(!content.includes("service_role"));
});

test("Category actions enforce admin auth, immutable update payload, and guarded deletion", () => {
  const content = fs.readFileSync(
    path.join(ROOT, "src/app/admin/categories/actions.ts"),
    "utf8",
  );

  assert.equal((content.match(/await requireAdmin\(\)/g) ?? []).length, 3);
  assert.ok(content.includes('"use server"'));
  assert.ok(!content.includes("service_role"));
  assert.match(
    content,
    /getCategoryFormFields\(formData, \[\s*"categoryId",\s*"name",\s*"description",?\s*\]\)/,
  );
  assert.ok(!content.includes('name: "slug"'));
  assert.ok(content.includes('.select("id", { count: "exact", head: true })'));
  assert.ok(content.includes('error: "CATEGORY_IN_USE"'));
  assert.ok(content.includes("isCategoryReferenceError(deleteError)"));
});

test("Category actions revalidate only real authoring and public consumers", () => {
  const content = fs.readFileSync(
    path.join(ROOT, "src/app/admin/categories/actions.ts"),
    "utf8",
  );

  for (const expected of [
    'revalidatePath("/admin/categories")',
    'revalidatePath("/admin/articles/new")',
    'revalidatePath("/admin/articles/[id]", "page")',
    'revalidatePath("/blog")',
    'revalidatePath("/portfolio")',
    "revalidatePath(`/topics/${categorySlug}`)",
    "revalidatePath(`/blog/${article.slug}`)",
  ]) {
    assert.ok(content.includes(expected), `Missing revalidation: ${expected}`);
  }

  assert.ok(!content.includes('revalidatePath("/topics")'));
  assert.ok(!content.includes('revalidatePath("/sitemap")'));
});

test("Category UI and public integration preserve the frozen contract", () => {
  const page = fs.readFileSync(
    path.join(ROOT, "src/app/admin/categories/page.tsx"),
    "utf8",
  );
  const manager = fs.readFileSync(
    path.join(ROOT, "src/components/admin/category-manager.tsx"),
    "utf8",
  );
  const publicArticles = fs.readFileSync(
    path.join(ROOT, "src/lib/public-articles.ts"),
    "utf8",
  );
  const topicPage = fs.readFileSync(
    path.join(ROOT, "src/app/topics/[slug]/page.tsx"),
    "utf8",
  );
  const sitemap = fs.readFileSync(
    path.join(ROOT, "src/app/sitemap.ts"),
    "utf8",
  );

  assert.ok(page.includes("await requireAdmin()"));
  assert.ok(page.includes("getAdminCategoryRecords()"));
  assert.ok(manager.includes("Category URLs are permanent after creation"));
  assert.ok(manager.includes("readOnly"));
  assert.ok(manager.includes("article_count"));
  assert.ok(publicArticles.includes("getCategoryBySlug"));
  assert.ok(topicPage.includes("getPublicRouteDiscoveryMetadata"));
  assert.ok(sitemap.includes("buildDiscoverySitemapWithFallback"));
});

test("Existing pgTAP coverage preserves anonymous and non-admin Category denial", () => {
  const anonymousTests = fs.readFileSync(
    path.join(ROOT, "supabase/tests/database/02_anonymous_access.test.sql"),
    "utf8",
  );
  const nonAdminTests = fs.readFileSync(
    path.join(
      ROOT,
      "supabase/tests/database/05_authenticated_non_admin.test.sql",
    ),
    "utf8",
  );

  assert.ok(anonymousTests.includes("Anon cannot insert categories"));
  assert.ok(nonAdminTests.includes("Non-admin cannot insert categories"));
});
