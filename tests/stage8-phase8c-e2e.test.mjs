import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

// Stage 8 Phase 8C: Automated End-to-End Publishing Lifecycle & Invariants Test Suite
// Executes against local Supabase instance
const SUPABASE_URL = "http://127.0.0.1:54321";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

test("Full End-to-End Publishing Lifecycle & Permalinks Invariants", async () => {
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);
  const adminClient = createClient(SUPABASE_URL, ANON_KEY);

  // 1. Admin Login
  const { data: authData, error: authError } =
    await adminClient.auth.signInWithPassword({
      email: "synthetic-admin@example.invalid",
      password: "password",
    });
  assert.equal(authError, null, "Admin authentication must succeed");
  assert.ok(authData?.user, "User session must be established");

  // 2. Fetch category
  const { data: categories } = await adminClient
    .from("categories")
    .select("id, name, slug")
    .limit(1);
  const testCategoryId = categories?.[0]?.id || null;

  const testArticleId = crypto.randomUUID();
  const provisionalSlug = `draft-${testArticleId}`;
  const runSuffix = Math.random().toString(36).substring(2, 7);
  const canonicalSlugCandidate = `synthetic-test-article-suite-${runSuffix}`;

  // STEP 1: Save Draft
  const { error: draftError } = await adminClient.rpc("save_article_draft", {
    p_article_id: testArticleId,
    p_provisional_slug: provisionalSlug,
    p_title: "Synthetic Test Article for Lifecycle Suite",
    p_excerpt: "Synthetic excerpt for automated testing.",
    p_content_json: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Synthetic body text for testing." }],
        },
      ],
    },
    p_category_id: testCategoryId,
    p_featured_image_path: null,
    p_featured_image_alt: null,
    p_seo_title: "Synthetic SEO Title",
    p_seo_description: "Synthetic SEO Description",
    p_references: [
      {
        title: "Synthetic Reference #1",
        source_name: "Lancet 2026",
        url: "https://example.com/ref1",
        citation_details: "Vol 10, pp 1-5",
      },
    ],
  });
  assert.equal(draftError, null, "Draft save must succeed");

  // Security check: Anonymous visitor cannot see draft
  const { data: anonDraft } = await anonClient
    .from("articles")
    .select("id")
    .eq("id", testArticleId);
  assert.equal(
    anonDraft?.length,
    0,
    "Draft must be invisible to anonymous visitors",
  );

  // STEP 2: First Publication
  const { data: publishData, error: publishError } = await adminClient.rpc(
    "publish_article",
    {
      p_article_id: testArticleId,
      p_slug: canonicalSlugCandidate,
      p_title: "Synthetic Test Article for Lifecycle Suite",
      p_excerpt: "Synthetic excerpt for automated testing.",
      p_content_json: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Synthetic body text for testing." },
            ],
          },
        ],
      },
      p_category_id: testCategoryId,
      p_featured_image_path: null,
      p_featured_image_alt: null,
      p_seo_title: "Synthetic SEO Title",
      p_seo_description: "Synthetic SEO Description",
      p_references: [],
    },
  );
  assert.equal(publishError, null, "Publication must succeed");
  const publishedRow = Array.isArray(publishData)
    ? publishData[0]
    : publishData;
  assert.equal(publishedRow.status, "published");
  assert.equal(publishedRow.slug, canonicalSlugCandidate);
  assert.ok(publishedRow.published_at, "published_at must be populated");
  const initialPublishedAt = publishedRow.published_at;

  // Verify public visibility
  const { data: anonPublished } = await anonClient
    .from("articles")
    .select("id, status, slug")
    .eq("id", testArticleId)
    .maybeSingle();
  assert.equal(anonPublished?.status, "published");
  assert.equal(anonPublished?.slug, canonicalSlugCandidate);

  // STEP 3: Update Published Article
  const { data: updateData, error: updateError } = await adminClient.rpc(
    "update_published_article",
    {
      p_article_id: testArticleId,
      p_title: "Updated Title for Published Article",
      p_excerpt: "Updated excerpt text.",
      p_content_json: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Updated body content." }],
          },
        ],
      },
      p_category_id: testCategoryId,
      p_featured_image_path: null,
      p_featured_image_alt: null,
      p_seo_title: "Updated SEO Title",
      p_seo_description: "Updated SEO Description",
      p_references: [],
    },
  );
  assert.equal(updateError, null, "Update published must succeed");
  const updatedRow = Array.isArray(updateData) ? updateData[0] : updateData;
  assert.equal(
    updatedRow.slug,
    canonicalSlugCandidate,
    "Slug must remain frozen on update",
  );
  assert.equal(
    updatedRow.published_at,
    initialPublishedAt,
    "published_at must remain preserved on update",
  );

  // STEP 4: Unpublish Article
  const { data: unpublishData, error: unpublishError } = await adminClient.rpc(
    "unpublish_article",
    {
      p_article_id: testArticleId,
      p_private_image_path: null,
    },
  );
  assert.equal(unpublishError, null, "Unpublish must succeed");
  const unpublishRow = Array.isArray(unpublishData)
    ? unpublishData[0]
    : unpublishData;
  assert.equal(unpublishRow.status, "draft");
  assert.equal(unpublishRow.slug, canonicalSlugCandidate);
  assert.equal(unpublishRow.published_at, initialPublishedAt);

  // Verify public disappearance
  const { data: anonAfterUnpublish } = await anonClient
    .from("articles")
    .select("id")
    .eq("id", testArticleId);
  assert.equal(
    anonAfterUnpublish?.length,
    0,
    "Unpublished article must be hidden publicly",
  );

  // STEP 5: Republish Article
  // A: Attempt to alter canonical slug -> must fail
  const { error: republishMismatchError } = await adminClient.rpc(
    "publish_article",
    {
      p_article_id: testArticleId,
      p_slug: "illegal-altered-slug",
      p_title: "Republished Article",
      p_excerpt: null,
      p_content_json: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Text" }] },
        ],
      },
      p_category_id: null,
      p_featured_image_path: null,
      p_featured_image_alt: null,
      p_seo_title: null,
      p_seo_description: null,
      p_references: [],
    },
  );
  assert.ok(republishMismatchError, "Republish with altered slug must fail");

  // B: Republish with frozen canonical slug -> must succeed
  const { data: republishData, error: republishError } = await adminClient.rpc(
    "publish_article",
    {
      p_article_id: testArticleId,
      p_slug: canonicalSlugCandidate,
      p_title: "Republished Article",
      p_excerpt: null,
      p_content_json: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Text" }] },
        ],
      },
      p_category_id: null,
      p_featured_image_path: null,
      p_featured_image_alt: null,
      p_seo_title: null,
      p_seo_description: null,
      p_references: [],
    },
  );
  assert.equal(republishError, null, "Republish must succeed");
  const republishRow = Array.isArray(republishData)
    ? republishData[0]
    : republishData;
  assert.equal(republishRow.status, "published");
  assert.equal(republishRow.slug, canonicalSlugCandidate);
  assert.equal(republishRow.published_at, initialPublishedAt);

  // STEP 6: Archive Published Article
  const { data: archiveData, error: archiveError } = await adminClient.rpc(
    "archive_article",
    {
      p_article_id: testArticleId,
      p_private_image_path: null,
    },
  );
  assert.equal(archiveError, null, "Archive must succeed");
  const archiveRow = Array.isArray(archiveData) ? archiveData[0] : archiveData;
  assert.equal(archiveRow.status, "archived");

  // Verify public disappearance
  const { data: anonArchived } = await anonClient
    .from("articles")
    .select("id")
    .eq("id", testArticleId);
  assert.equal(
    anonArchived?.length,
    0,
    "Archived article must be hidden publicly",
  );

  // STEP 7: Restore to Draft
  const { data: restoreData, error: restoreError } = await adminClient.rpc(
    "restore_article",
    {
      p_article_id: testArticleId,
    },
  );
  assert.equal(restoreError, null, "Restore must succeed");
  const restoreRow = Array.isArray(restoreData) ? restoreData[0] : restoreData;
  assert.equal(restoreRow.status, "draft");

  // STEP 8: Deletion Invariants
  // A: Attempt to delete ever-published record -> must fail
  const { error: everPublishedDeleteError } = await adminClient.rpc(
    "delete_article",
    {
      p_article_id: testArticleId,
    },
  );
  assert.ok(
    everPublishedDeleteError,
    "Deleting ever-published article must be rejected",
  );
  assert.match(
    everPublishedDeleteError.message,
    /Cannot delete ever-published article/i,
  );

  // B: Delete never-published draft -> must succeed
  const neverPublishedId = crypto.randomUUID();
  await adminClient.rpc("save_article_draft", {
    p_article_id: neverPublishedId,
    p_provisional_slug: `draft-${neverPublishedId}`,
    p_title: "Never Published Draft",
    p_excerpt: null,
    p_content_json: {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Draft" }] },
      ],
    },
    p_category_id: null,
    p_featured_image_path: null,
    p_featured_image_alt: null,
    p_seo_title: null,
    p_seo_description: null,
    p_references: [],
  });

  const { error: neverPublishedDeleteError } = await adminClient.rpc(
    "delete_article",
    {
      p_article_id: neverPublishedId,
    },
  );
  assert.equal(
    neverPublishedDeleteError,
    null,
    "Deleting never-published draft must succeed",
  );

  const { data: checkDeleted } = await adminClient
    .from("articles")
    .select("id")
    .eq("id", neverPublishedId);
  assert.equal(checkDeleted?.length, 0, "Record must be deleted");
});
