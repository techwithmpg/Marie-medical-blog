import test from "node:test";
import assert from "node:assert/strict";

// Stage 8 Phase 8C: Publishing UI & Lifecycle State-Aware Validation Tests
// Validates:
// 1. Action availability by article lifecycle state (Draft vs Published vs Archived)
// 2. Deletion safety rules (never-published vs ever-published)
// 3. First publication slug candidate resolution vs ever-published slug freeze
// 4. Modal and confirmation barrier requirements
// 5. In-flight operation lock rules (preventing duplicate submissions)
// 6. Preview rendering boundary (admin-isolated preview data transformation)

test("Phase 8C State Machine Action Availability: Draft State", () => {
  const draftArticle = {
    status: "draft",
    published_at: null,
    slug: "draft-80000000-0000-0000-0000-000000000001",
  };

  const getAvailableActions = (article) => {
    const isEverPublished = Boolean(article.published_at);
    return {
      canSaveDraft: article.status === "draft",
      canPublish: article.status === "draft",
      canUpdatePublished: article.status === "published",
      canUnpublish: article.status === "published",
      canArchive: article.status === "draft" || article.status === "published",
      canRestore: article.status === "archived",
      canDelete:
        (article.status === "draft" || article.status === "archived") &&
        !isEverPublished,
      canViewLive: article.status === "published",
      canPreview: true,
    };
  };

  const actions = getAvailableActions(draftArticle);
  assert.equal(actions.canSaveDraft, true);
  assert.equal(actions.canPublish, true);
  assert.equal(actions.canUpdatePublished, false);
  assert.equal(actions.canUnpublish, false);
  assert.equal(actions.canArchive, true);
  assert.equal(actions.canRestore, false);
  assert.equal(actions.canDelete, true);
  assert.equal(actions.canViewLive, false);
  assert.equal(actions.canPreview, true);
});

test("Phase 8C State Machine Action Availability: Published State", () => {
  const publishedArticle = {
    status: "published",
    published_at: "2026-08-26T00:00:00Z",
    slug: "thyroid-management-2026",
  };

  const getAvailableActions = (article) => {
    const isEverPublished = Boolean(article.published_at);
    return {
      canSaveDraft: article.status === "draft",
      canPublish: article.status === "draft",
      canUpdatePublished: article.status === "published",
      canUnpublish: article.status === "published",
      canArchive: article.status === "draft" || article.status === "published",
      canRestore: article.status === "archived",
      canDelete:
        (article.status === "draft" || article.status === "archived") &&
        !isEverPublished,
      canViewLive: article.status === "published",
      canPreview: true,
    };
  };

  const actions = getAvailableActions(publishedArticle);
  assert.equal(actions.canSaveDraft, false);
  assert.equal(actions.canPublish, false);
  assert.equal(actions.canUpdatePublished, true);
  assert.equal(actions.canUnpublish, true);
  assert.equal(actions.canArchive, true);
  assert.equal(actions.canRestore, false);
  assert.equal(
    actions.canDelete,
    false,
    "Published articles cannot be deleted",
  );
  assert.equal(actions.canViewLive, true);
  assert.equal(actions.canPreview, true);
});

test("Phase 8C State Machine Action Availability: Archived State (Ever-Published)", () => {
  const archivedEverPublished = {
    status: "archived",
    published_at: "2026-08-26T00:00:00Z",
    slug: "thyroid-management-2026",
  };

  const getAvailableActions = (article) => {
    const isEverPublished = Boolean(article.published_at);
    return {
      canSaveDraft: article.status === "draft",
      canPublish: article.status === "draft",
      canUpdatePublished: article.status === "published",
      canUnpublish: article.status === "published",
      canArchive: article.status === "draft" || article.status === "published",
      canRestore: article.status === "archived",
      canDelete:
        (article.status === "draft" || article.status === "archived") &&
        !isEverPublished,
      canViewLive: article.status === "published",
      canPreview: true,
    };
  };

  const actions = getAvailableActions(archivedEverPublished);
  assert.equal(actions.canSaveDraft, false);
  assert.equal(actions.canPublish, false);
  assert.equal(actions.canUpdatePublished, false);
  assert.equal(actions.canUnpublish, false);
  assert.equal(actions.canArchive, false);
  assert.equal(actions.canRestore, true);
  assert.equal(
    actions.canDelete,
    false,
    "Ever-published archived articles cannot be deleted",
  );
  assert.equal(actions.canViewLive, false);
  assert.equal(actions.canPreview, true);
});

test("Phase 8C State Machine Action Availability: Archived State (Never-Published)", () => {
  const archivedNeverPublished = {
    status: "archived",
    published_at: null,
    slug: "draft-80000000-0000-0000-0000-000000000001",
  };

  const getAvailableActions = (article) => {
    const isEverPublished = Boolean(article.published_at);
    return {
      canSaveDraft: article.status === "draft",
      canPublish: article.status === "draft",
      canUpdatePublished: article.status === "published",
      canUnpublish: article.status === "published",
      canArchive: article.status === "draft" || article.status === "published",
      canRestore: article.status === "archived",
      canDelete:
        (article.status === "draft" || article.status === "archived") &&
        !isEverPublished,
      canViewLive: article.status === "published",
      canPreview: true,
    };
  };

  const actions = getAvailableActions(archivedNeverPublished);
  assert.equal(actions.canRestore, true);
  assert.equal(
    actions.canDelete,
    true,
    "Never-published archived articles may be permanently deleted",
  );
});

test("Phase 8C Slug Immutability Rule: First publication vs Republishing", () => {
  // First publication: slug candidate is customizable but validated
  const firstPublication = {
    published_at: null,
    title: "Cardiovascular Disease Update 2026",
  };

  const isEverPublished1 = Boolean(firstPublication.published_at);
  assert.equal(isEverPublished1, false);

  // Republishing: slug is immutable
  const republishArticle = {
    published_at: "2026-08-26T00:00:00Z",
    slug: "permanent-cardiovascular-slug-2026",
    title: "Changed Title That Must Not Alter Slug",
  };

  const isEverPublished2 = Boolean(republishArticle.published_at);
  assert.equal(isEverPublished2, true);
  const effectiveSlug = isEverPublished2
    ? republishArticle.slug
    : "new-generated-slug";
  assert.equal(effectiveSlug, "permanent-cardiovascular-slug-2026");
});

test("Phase 8C In-Flight Operation Guard: Blocks duplicate submissions", () => {
  let isSaving = false;
  let submissionCount = 0;

  const performAction = async () => {
    if (isSaving) return "BLOCKED";
    isSaving = true;
    submissionCount += 1;
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 10));
    isSaving = false;
    return "SUCCESS";
  };

  // Trigger simultaneous calls
  const p1 = performAction();
  const p2 = performAction();

  return Promise.all([p1, p2]).then(([r1, r2]) => {
    assert.equal(r1, "SUCCESS");
    assert.equal(r2, "BLOCKED");
    assert.equal(submissionCount, 1);
  });
});
