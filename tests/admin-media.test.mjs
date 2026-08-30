import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const validation = await import(
  pathToFileURL(path.join(ROOT, "src/lib/admin/media-validation.ts")).href
);

const {
  MAX_MEDIA_FILE_SIZE,
  compensateImageSchema,
  copyMediaToArticleSchema,
  deleteMediaSchema,
  isValidStoragePath,
  prepareMediaUploadSchema,
  sanitizeFilename,
} = validation;

test("Media upload accepts only approved image facts within the 5 MB limit", () => {
  assert.equal(
    prepareMediaUploadSchema.safeParse({
      filename: "scan.png",
      mimeType: "image/png",
      size: 1,
    }).success,
    true,
  );
  assert.equal(
    prepareMediaUploadSchema.safeParse({
      filename: "scan.avif",
      mimeType: "image/avif",
      size: MAX_MEDIA_FILE_SIZE,
    }).success,
    true,
  );
  assert.equal(
    prepareMediaUploadSchema.safeParse({
      filename: "scan.pdf",
      mimeType: "application/pdf",
      size: 10,
    }).success,
    false,
  );
  assert.equal(
    prepareMediaUploadSchema.safeParse({
      filename: "scan.svg",
      mimeType: "image/svg+xml",
      size: 10,
    }).success,
    false,
  );
  assert.equal(
    prepareMediaUploadSchema.safeParse({
      filename: "large.jpg",
      mimeType: "image/jpeg",
      size: MAX_MEDIA_FILE_SIZE + 1,
    }).success,
    false,
  );
  assert.equal(
    prepareMediaUploadSchema.safeParse({
      filename: "empty.webp",
      mimeType: "image/webp",
      size: 0,
    }).success,
    false,
  );
});

test("Media schemas reject unknown fields and invalid buckets", () => {
  const base = { filename: "scan.png", mimeType: "image/png", size: 12 };
  assert.equal(
    prepareMediaUploadSchema.safeParse({ ...base, upsert: true }).success,
    false,
  );
  assert.equal(
    deleteMediaSchema.safeParse({
      bucket: "other-assets",
      path: "library/a.png",
    }).success,
    false,
  );
});

test("Storage paths reject traversal, ambiguous separators, escapes, and encoded input", () => {
  for (const candidate of [
    "../a.png",
    "a/../b.png",
    "a//b.png",
    "/a.png",
    "a.png/",
    "a\\b.png",
    "a/%2e%2e/b.png",
    "a/%ZZ/b.png",
    "a/./b.png",
  ]) {
    assert.equal(isValidStoragePath(candidate), false, candidate);
  }
  assert.equal(
    isValidStoragePath(
      "articles/20000000-0000-0000-0000-000000000001/featured/a.png",
    ),
    true,
  );
});

test("Filename sanitization removes path segments and dot-file hazards", () => {
  assert.equal(
    sanitizeFilename("../../Clinical Scan FINAL.PNG"),
    "clinical-scan-final.png",
  );
  assert.equal(sanitizeFilename(".env"), "env");
  assert.equal(sanitizeFilename("!!!.jpg"), "image.jpg");
});

test("Copy and compensation require UUID article ownership and safe exact paths", () => {
  const articleId = "20000000-0000-0000-0000-000000000001";
  assert.equal(
    copyMediaToArticleSchema.safeParse({
      articleId,
      sourceBucket: "public-assets",
      sourcePath: "library/source.webp",
    }).success,
    true,
  );
  assert.equal(
    copyMediaToArticleSchema.safeParse({
      articleId: "bad",
      sourceBucket: "draft-assets",
      sourcePath: "library/source.webp",
    }).success,
    false,
  );
  assert.equal(
    compensateImageSchema.safeParse({
      articleId,
      path: "articles/other/featured/a.png",
    }).success,
    true,
    "namespace ownership is enforced by the action after schema validation",
  );
});

test("Media server actions are authenticated, private-first, immutable, and exact-path", () => {
  const actions = fs.readFileSync(
    path.join(ROOT, "src/app/admin/media/actions.ts"),
    "utf8",
  );
  assert.ok(actions.includes('"use server"'));
  assert.ok((actions.match(/await requireAdmin\(\)/g) ?? []).length >= 5);
  assert.ok(actions.includes('.from("draft-assets")'));
  assert.ok(actions.includes("createSignedUploadUrl(storagePath)"));
  assert.ok(
    actions.includes("uploadToSignedUrl") === false,
    "browser owns upload after a server-issued token",
  );
  assert.match(
    actions,
    /getStorageObjectFacts\(\s*supabase,\s*sourceBucket,\s*sourcePath,?\s*\)/,
  );
  assert.ok(actions.includes('destinationBucket: "draft-assets"'));
  assert.ok(!actions.includes("service_role"));
  assert.ok(!actions.includes("upsert: true"));
});

test("Deletion validates object facts and performs two fail-closed usage checks", () => {
  const actions = fs.readFileSync(
    path.join(ROOT, "src/app/admin/media/actions.ts"),
    "utf8",
  );
  const deletion = actions.slice(
    actions.indexOf("export async function deleteMediaAction"),
    actions.indexOf(
      "export async function compensateUnsavedArticleImageAction",
    ),
  );
  assert.ok(deletion.includes("getStorageObjectFacts"));
  assert.equal(
    (deletion.match(/checkAssetUsage\(supabase, bucket, path\)/g) ?? []).length,
    2,
  );
  assert.ok(deletion.includes('error: "IN_USE"'));
  assert.ok(
    deletion.includes("Usage could not be rechecked. Nothing was deleted."),
  );
  assert.ok(deletion.includes(".remove([path])"));
});

test("Inventory does not infer trusted MIME facts and requires admin", () => {
  const inventory = fs.readFileSync(
    path.join(ROOT, "src/lib/admin/media.ts"),
    "utf8",
  );
  assert.ok(inventory.includes("await requireAdmin()"));
  assert.ok(inventory.includes(".info(path)"));
  assert.ok(
    inventory.includes(
      'throw new Error("Unable to establish exact media usage.")',
    ),
  );
  assert.ok(!inventory.includes("inferImageMime"));
  assert.ok(inventory.includes("createSignedUrls(privateDraftPaths, 3600)"));
  assert.ok(inventory.includes("getPublicUrl(item.path)"));
});

test("Editor reuse creates a private copy, clears global alt assumptions, and compensates failures", () => {
  const picker = fs.readFileSync(
    path.join(ROOT, "src/components/admin/media/media-picker-dialog.tsx"),
    "utf8",
  );
  const field = fs.readFileSync(
    path.join(ROOT, "src/components/admin/editor/featured-image-field.tsx"),
    "utf8",
  );
  const editor = fs.readFileSync(
    path.join(ROOT, "src/components/admin/editor/article-editor.tsx"),
    "utf8",
  );
  assert.ok(picker.includes("copyMediaToArticleAction"));
  assert.ok(picker.includes("A private article-owned copy will be created"));
  assert.ok(field.includes('onImageAltChange("")'));
  assert.ok(editor.includes("pendingMediaCopyPathRef"));
  assert.ok(editor.includes("compensateUnsavedArticleImageAction"));
  assert.ok(
    (editor.match(/await compensatePendingMediaCopy\(\)/g) ?? []).length >= 7,
  );
});

test("Media route provides protected loading and error boundaries", () => {
  for (const file of ["page.tsx", "loading.tsx", "error.tsx"]) {
    assert.equal(
      fs.existsSync(path.join(ROOT, "src/app/admin/media", file)),
      true,
      file,
    );
  }
  const page = fs.readFileSync(
    path.join(ROOT, "src/app/admin/media/page.tsx"),
    "utf8",
  );
  assert.ok(page.includes("await requireAdmin()"));
  assert.ok(page.includes("getAdminMediaInventory()"));
});
