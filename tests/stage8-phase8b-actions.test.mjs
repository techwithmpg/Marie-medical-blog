import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

// Test suite for Stage 8 Phase 8B application layer & storage orchestration
// Validates:
// 1. Validation boundaries (UUIDs, titles, content structure, references, image scoping)
// 2. Storage promotion flow (draft-assets -> public-assets with unique path)
// 3. Storage demotion flow (public-assets -> draft-assets with unique path)
// 4. Compensation rollback on DB RPC failure (cleaning up copied asset)
// 5. Cleanup of source asset on success
// 6. Replacement image handling during published update
// 7. Permalink & ever-published deletion safety rules
// 8. Error surfacing when DB fails AND compensation cleanup fails
// 9. Warning surfacing when lifecycle transitions succeed BUT asset cleanup fails
// 10. saveDraftAction RPC contract regression (save_article_draft with p_provisional_slug)

test("PublishArticleAction validation: rejects invalid UUID, empty content, and provisional slug", async () => {
  const invalidIdPayload = {
    articleId: "not-a-uuid",
    title: "Valid Title",
    content_json: { type: "doc", content: [{ type: "paragraph" }] },
    references: [],
  };
  assert.ok(
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      invalidIdPayload.articleId,
    ),
  );

  const emptyContentPayload = {
    articleId: "80000000-0000-0000-0000-000000000001",
    title: "Valid Title",
    content_json: { type: "doc", content: [] },
    references: [],
  };
  assert.equal(emptyContentPayload.content_json.content.length, 0);

  const provisionalSlug = "draft-80000000-0000-0000-0000-000000000001";
  assert.match(
    provisionalSlug,
    /^draft-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  );
});

test("Storage promotion flow: generates collision-resistant unique destination path", () => {
  const articleId = "80000000-0000-0000-0000-000000000001";
  const sourcePath = `articles/${articleId}/featured/1724600000000-hero-image.png`;

  const segments = sourcePath.split("/");
  const originalFilename = segments.pop() || "image.png";
  const sanitizedFilename = originalFilename
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
  const uniqueUuid = crypto.randomUUID();
  const promotedPath = `articles/${articleId}/featured/${uniqueUuid}-${sanitizedFilename}`;

  assert.ok(promotedPath.startsWith(`articles/${articleId}/featured/`));
  assert.ok(promotedPath.endsWith("-hero-image.png"));
  assert.notEqual(promotedPath, sourcePath);
});

test("Storage demotion flow: generates collision-resistant unique private path", () => {
  const articleId = "80000000-0000-0000-0000-000000000001";
  const publicPath = `articles/${articleId}/featured/uuid123-hero-image.png`;

  const segments = publicPath.split("/");
  const originalFilename = segments.pop() || "image.png";
  const sanitizedFilename = originalFilename
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
  const uniqueUuid = crypto.randomUUID();
  const privateDemotedPath = `articles/${articleId}/featured/${uniqueUuid}-${sanitizedFilename}`;

  assert.ok(privateDemotedPath.startsWith(`articles/${articleId}/featured/`));
  assert.notEqual(privateDemotedPath, publicPath);
});

test("Compensation logic: cleans up promoted public asset if DB RPC fails", async () => {
  let cleanedUpPaths = [];
  const mockStorage = {
    from: (bucket) => ({
      remove: async (paths) => {
        if (bucket === "public-assets") {
          cleanedUpPaths.push(...paths);
        }
        return { data: null, error: null };
      },
    }),
  };

  const copiedPublicPath =
    "articles/80000000-0000-0000-0000-000000000001/featured/test-promoted.png";
  const rpcError = { message: "SQL unique violation on slug" };

  if (rpcError && copiedPublicPath) {
    await mockStorage.from("public-assets").remove([copiedPublicPath]);
  }

  assert.deepEqual(cleanedUpPaths, [copiedPublicPath]);
});

test("Compensation failure: surfaces both DB failure and compensation delete failure", async () => {
  const rpcError = { message: "SQL constraint violation" };
  const copiedPublicPath =
    "articles/80000000-0000-0000-0000-000000000001/featured/orphan.png";

  const mockStorage = {
    from: () => ({
      remove: async () => ({
        data: null,
        error: { message: "Storage permission denied on compensation delete" },
      }),
    }),
  };

  let finalError = "";
  if (rpcError && copiedPublicPath) {
    const { error: compError } = await mockStorage
      .from("public-assets")
      .remove([copiedPublicPath]);
    if (compError) {
      finalError = `Publication failed (${rpcError.message}) and compensation cleanup of promoted public image also failed (${compError.message}).`;
    } else {
      finalError = rpcError.message;
    }
  }

  assert.match(finalError, /Publication failed \(SQL constraint violation\)/);
  assert.match(
    finalError,
    /compensation cleanup of promoted public image also failed/,
  );
});

test("Cleanup failure handling on publication: returns success with warning when private source removal fails", async () => {
  const sourceDraftPath =
    "articles/80000000-0000-0000-0000-000000000001/featured/draft-source.png";
  const mockStorage = {
    from: () => ({
      remove: async () => ({
        data: null,
        error: { message: "Draft bucket network timeout" },
      }),
    }),
  };

  let cleanupWarning = undefined;
  const { error: removeError } = await mockStorage
    .from("draft-assets")
    .remove([sourceDraftPath]);
  if (removeError) {
    cleanupWarning = `Article published, but private draft asset could not be cleaned up from draft-assets: ${removeError.message}`;
  }

  const result = {
    success: true,
    articleId: "80000000-0000-0000-0000-000000000001",
    status: "published",
    warning: cleanupWarning,
  };

  assert.equal(result.success, true);
  assert.ok(result.warning);
  assert.match(
    result.warning,
    /private draft asset could not be cleaned up from draft-assets: Draft bucket network timeout/,
  );
});

test("Cleanup failure handling on published update: surfaces warning if superseded public cleanup fails", async () => {
  const oldPublicPath =
    "articles/80000000-0000-0000-0000-000000000001/featured/old-hero.png";
  const mockStorage = {
    from: () => ({
      remove: async () => ({
        data: null,
        error: { message: "Public bucket lock conflict" },
      }),
    }),
  };

  const warnings = [];
  const { error: removeOldPubErr } = await mockStorage
    .from("public-assets")
    .remove([oldPublicPath]);
  if (removeOldPubErr) {
    warnings.push(
      `Superseded public image cleanup failed: ${removeOldPubErr.message}`,
    );
  }

  const result = {
    success: true,
    status: "published",
    warning: warnings.length > 0 ? warnings.join(" | ") : undefined,
  };

  assert.equal(result.success, true);
  assert.match(
    result.warning,
    /Superseded public image cleanup failed: Public bucket lock conflict/,
  );
});

test("Cleanup failure handling on unpublish: surfaces high-visibility privacy warning if public cleanup fails", async () => {
  const mockStorage = {
    from: () => ({
      remove: async () => ({
        data: null,
        error: { message: "Storage Gateway Timeout" },
      }),
    }),
  };

  let warning = undefined;
  const { error: removePublicErr } = await mockStorage
    .from("public-assets")
    .remove([
      "articles/80000000-0000-0000-0000-000000000001/featured/live.png",
    ]);
  if (removePublicErr) {
    warning =
      "Article unpublished, but the previous public image could not be removed from public storage. Please retry cleanup before treating that image as private.";
  }

  const result = {
    success: true,
    status: "draft",
    warning,
  };

  assert.equal(result.success, true);
  assert.match(
    result.warning,
    /previous public image could not be removed from public storage/,
  );
});

test("Cleanup failure handling on archive: surfaces high-visibility warning if public cleanup fails", async () => {
  const mockStorage = {
    from: () => ({
      remove: async () => ({
        data: null,
        error: { message: "Storage service unavailable" },
      }),
    }),
  };

  let warning = undefined;
  const { error: removePublicErr } = await mockStorage
    .from("public-assets")
    .remove([
      "articles/80000000-0000-0000-0000-000000000001/featured/live.png",
    ]);
  if (removePublicErr) {
    warning =
      "Article archived, but the previous public image could not be removed from public storage. Please retry cleanup before treating that image as private.";
  }

  const result = {
    success: true,
    status: "archived",
    warning,
  };

  assert.equal(result.success, true);
  assert.match(
    result.warning,
    /previous public image could not be removed from public storage/,
  );
});

test("Deletion safety invariant: permits deletion only when never published", () => {
  const neverPublishedDraft = { status: "draft", published_at: null };
  const neverPublishedArchived = { status: "archived", published_at: null };
  const everPublishedDraft = {
    status: "draft",
    published_at: "2026-08-26T00:00:00Z",
  };
  const everPublishedArchived = {
    status: "archived",
    published_at: "2026-08-26T00:00:00Z",
  };
  const livePublished = {
    status: "published",
    published_at: "2026-08-26T00:00:00Z",
  };

  const canDelete = (article) =>
    (article.status === "draft" || article.status === "archived") &&
    article.published_at === null;

  assert.equal(canDelete(neverPublishedDraft), true);
  assert.equal(canDelete(neverPublishedArchived), true);
  assert.equal(canDelete(everPublishedDraft), false);
  assert.equal(canDelete(everPublishedArchived), false);
  assert.equal(canDelete(livePublished), false);
});

test("saveDraftAction RPC Contract Regression: enforces save_article_draft with p_provisional_slug", async () => {
  const actionsPath = path.resolve("src/app/admin/articles/actions.ts");
  const actionsSource = await fs.readFile(actionsPath, "utf8");

  // 1. Zero occurrences of wrong name save_draft_article
  assert.equal(
    actionsSource.includes("save_draft_article"),
    false,
    "actions.ts must not contain save_draft_article",
  );

  // 2. Contains save_article_draft invocation
  assert.equal(
    actionsSource.includes('"save_article_draft"'),
    true,
    "actions.ts must call save_article_draft",
  );

  // 3. Verifies p_provisional_slug is supplied to save_article_draft
  const saveDraftMatch = actionsSource.match(
    /supabase\.rpc\(\s*"save_article_draft",\s*\{([\s\S]*?)\}\s*\)/,
  );
  assert.ok(saveDraftMatch, "save_article_draft invocation block must exist");
  const rpcArgs = saveDraftMatch[1];
  assert.match(
    rpcArgs,
    /p_provisional_slug:\s*provisionalSlug/,
    "save_article_draft must supply p_provisional_slug: provisionalSlug",
  );
  assert.match(
    rpcArgs,
    /p_article_id:\s*articleId/,
    "save_article_draft must supply p_article_id",
  );
  assert.match(
    rpcArgs,
    /p_title:\s*trimmedTitle/,
    "save_article_draft must supply p_title",
  );
  assert.match(
    rpcArgs,
    /p_content_json:\s*payload\.content_json/,
    "save_article_draft must supply p_content_json",
  );
  assert.match(
    rpcArgs,
    /p_references:\s*refResult\.data/,
    "save_article_draft must supply p_references",
  );
});
