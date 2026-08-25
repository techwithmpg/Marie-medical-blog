import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

// Stage 8: Real Local Supabase Storage Lifecycle & Cross-Bucket Invariants E2E Test
// Executes against local Supabase instance only (http://127.0.0.1:54321)
const SUPABASE_URL = "http://127.0.0.1:54321";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

// Synthetic 1x1 transparent PNG buffer
const SYNTHETIC_PNG_BUFFER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

test("Real Local Storage Cross-Bucket Promotion, Demotion, Replacement, and Invariant Verification", async () => {
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);
  const adminClient = createClient(SUPABASE_URL, ANON_KEY);

  // 1. Admin Authentication
  const { data: authData, error: authError } =
    await adminClient.auth.signInWithPassword({
      email: "synthetic-admin@example.invalid",
      password: "password",
    });
  assert.equal(authError, null, "Admin login must succeed");
  assert.ok(authData?.user, "User session must be established");

  const articleId = crypto.randomUUID();
  const runId = Math.random().toString(36).substring(2, 7);
  const canonicalSlug = `storage-lifecycle-test-${runId}`;

  const draftFilename = `draft-image-${runId}.png`;
  const initialDraftPath = `articles/${articleId}/featured/${draftFilename}`;
  const promotedPublicPath = `articles/${articleId}/featured/public-${crypto.randomUUID()}-${draftFilename}`;
  const demotedPrivatePath = `articles/${articleId}/featured/private-${crypto.randomUUID()}-${draftFilename}`;

  // STEP A: Upload initial draft image into private draft-assets
  const { error: uploadError } = await adminClient.storage
    .from("draft-assets")
    .upload(initialDraftPath, SYNTHETIC_PNG_BUFFER, {
      contentType: "image/png",
      upsert: true,
    });
  assert.equal(uploadError, null, "Upload to draft-assets must succeed");

  // STEP B: Verify anonymous visitor CANNOT read private draft asset
  const { data: anonDraftDownload, error: anonDraftError } =
    await anonClient.storage.from("draft-assets").download(initialDraftPath);
  assert.ok(
    anonDraftError || !anonDraftDownload,
    "Anonymous download of private draft asset must fail",
  );

  // Save draft article referencing draft image
  const { error: saveDraftError } = await adminClient.rpc(
    "save_article_draft",
    {
      p_article_id: articleId,
      p_provisional_slug: `draft-${articleId}`,
      p_title: "Storage Lifecycle Test Article",
      p_excerpt:
        "Testing real storage cross-bucket lifecycle promotion and demotion.",
      p_content_json: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Clinical research content with real storage assets.",
              },
            ],
          },
        ],
      },
      p_featured_image_path: initialDraftPath,
      p_featured_image_alt: "Synthetic thyroid histological section",
    },
  );
  assert.equal(saveDraftError, null, "save_article_draft must succeed");

  // STEP C: Cross-bucket copy: draft-assets -> public-assets
  const { error: copyToPublicError } = await adminClient.storage
    .from("draft-assets")
    .copy(initialDraftPath, promotedPublicPath, {
      destinationBucket: "public-assets",
    });
  assert.equal(
    copyToPublicError,
    null,
    "Cross-bucket copy to public-assets must succeed",
  );

  // STEP D: Publish article with new public path
  const { data: publishData, error: publishError } = await adminClient.rpc(
    "publish_article",
    {
      p_article_id: articleId,
      p_slug: canonicalSlug,
      p_title: "Storage Lifecycle Test Article",
      p_excerpt:
        "Testing real storage cross-bucket lifecycle promotion and demotion.",
      p_content_json: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Clinical research content with real storage assets.",
              },
            ],
          },
        ],
      },
      p_featured_image_path: promotedPublicPath,
      p_featured_image_alt: "Synthetic thyroid histological section",
    },
  );
  assert.equal(publishError, null, "publish_article must succeed");
  const publishedRow = Array.isArray(publishData)
    ? publishData[0]
    : publishData;
  assert.equal(publishedRow.status, "published");
  assert.equal(publishedRow.slug, canonicalSlug);

  // STEP E: Remove private source from draft-assets
  const { error: removeDraftError } = await adminClient.storage
    .from("draft-assets")
    .remove([initialDraftPath]);
  assert.equal(
    removeDraftError,
    null,
    "Removal of private draft asset post-publish must succeed",
  );

  // STEP F: Verify public destination is anonymously retrievable & private source is gone
  const { data: publicDownload, error: publicDownloadError } =
    await anonClient.storage.from("public-assets").download(promotedPublicPath);
  assert.equal(
    publicDownloadError,
    null,
    "Public asset must be downloadable anonymously",
  );
  assert.ok(publicDownload, "Public asset download data must exist");

  const { error: verifyDraftGoneError } = await adminClient.storage
    .from("draft-assets")
    .download(initialDraftPath);
  assert.ok(
    verifyDraftGoneError,
    "Private draft source must no longer exist in draft-assets",
  );

  // STEP G & H: Unpublish article & demote image to draft-assets
  const { error: copyToDraftError } = await adminClient.storage
    .from("public-assets")
    .copy(promotedPublicPath, demotedPrivatePath, {
      destinationBucket: "draft-assets",
    });
  assert.equal(
    copyToDraftError,
    null,
    "Cross-bucket copy to draft-assets must succeed",
  );

  const { data: unpublishData, error: unpublishError } = await adminClient.rpc(
    "unpublish_article",
    {
      p_article_id: articleId,
      p_private_image_path: demotedPrivatePath,
    },
  );
  assert.equal(unpublishError, null, "unpublish_article RPC must succeed");
  const unpublishRow = Array.isArray(unpublishData)
    ? unpublishData[0]
    : unpublishData;
  assert.equal(unpublishRow.status, "draft");

  // STEP I: Remove public source
  const { error: removePublicError } = await adminClient.storage
    .from("public-assets")
    .remove([promotedPublicPath]);
  assert.equal(
    removePublicError,
    null,
    "Removal of old public asset post-unpublish must succeed",
  );

  // STEP J: Invariants check
  // 1. Article invisible to anon
  const { data: anonCheckArticle } = await anonClient
    .from("articles")
    .select("id")
    .eq("id", articleId);
  assert.equal(
    anonCheckArticle?.length,
    0,
    "Unpublished article must be hidden from anon",
  );

  // 2. Old public raw object is no longer retrievable
  const { error: anonPublicGoneError } = await anonClient.storage
    .from("public-assets")
    .download(promotedPublicPath);
  assert.ok(
    anonPublicGoneError,
    "Superseded public asset must not be downloadable anonymously",
  );

  // 3. Demoted private object is admin-readable and anon-denied
  const { data: adminDemotedDownload, error: adminDemotedError } =
    await adminClient.storage.from("draft-assets").download(demotedPrivatePath);
  assert.equal(
    adminDemotedError,
    null,
    "Admin must be able to download demoted private asset",
  );
  assert.ok(adminDemotedDownload, "Demoted private asset must exist");

  const { error: anonDemotedDenied } = await anonClient.storage
    .from("draft-assets")
    .download(demotedPrivatePath);
  assert.ok(
    anonDemotedDenied,
    "Anonymous access to demoted private asset must be denied",
  );

  // STEP K: Published Replacement Flow
  // 1. Republish article first
  const { error: republishError } = await adminClient.rpc("publish_article", {
    p_article_id: articleId,
    p_slug: canonicalSlug,
    p_title: "Storage Lifecycle Test Article",
    p_content_json: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Republished content text." }],
        },
      ],
    },
    p_featured_image_path: promotedPublicPath,
    p_featured_image_alt: "Initial alt",
  });
  assert.equal(republishError, null, "Republish must succeed");

  // 2. Upload a replacement image to draft-assets
  const replacementDraftPath = `articles/${articleId}/featured/replacement-${runId}.png`;
  const replacementPublicPath = `articles/${articleId}/featured/public-replacement-${crypto.randomUUID()}.png`;

  await adminClient.storage
    .from("draft-assets")
    .upload(replacementDraftPath, SYNTHETIC_PNG_BUFFER, {
      contentType: "image/png",
    });

  // 3. Cross-bucket promote replacement
  await adminClient.storage
    .from("draft-assets")
    .copy(replacementDraftPath, replacementPublicPath, {
      destinationBucket: "public-assets",
    });

  // 4. Update published article with replacement
  const { error: updateError } = await adminClient.rpc(
    "update_published_article",
    {
      p_article_id: articleId,
      p_title: "Updated Storage Article",
      p_content_json: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Updated content text with replacement asset.",
              },
            ],
          },
        ],
      },
      p_featured_image_path: replacementPublicPath,
      p_featured_image_alt: "Replacement alt text",
    },
  );
  assert.equal(
    updateError,
    null,
    "update_published_article with replacement image must succeed",
  );

  // 5. Cleanup replacement draft source & old public asset
  await adminClient.storage.from("draft-assets").remove([replacementDraftPath]);
  await adminClient.storage.from("public-assets").remove([promotedPublicPath]);

  // 6. Verify new public replacement is retrievable anonymously
  const { data: newPublicData, error: newPublicError } =
    await anonClient.storage
      .from("public-assets")
      .download(replacementPublicPath);
  assert.equal(
    newPublicError,
    null,
    "New replacement public asset must be retrievable",
  );
  assert.ok(newPublicData, "New replacement data must exist");

  // 7. Cleanup test assets
  await adminClient.storage
    .from("public-assets")
    .remove([replacementPublicPath]);
  await adminClient.storage.from("draft-assets").remove([demotedPrivatePath]);
});
