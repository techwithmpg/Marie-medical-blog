import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const URL = "http://127.0.0.1:54321";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

test("Phase 2 local Storage supports private signed upload, exact facts, immutable reuse, and RLS", async () => {
  const admin = createClient(URL, ANON_KEY);
  const reader = createClient(URL, ANON_KEY);
  assert.equal((await admin.auth.signInWithPassword({ email: "synthetic-admin@example.invalid", password: "password" })).error, null);
  assert.equal((await reader.auth.signInWithPassword({ email: "synthetic-reader@example.invalid", password: "password" })).error, null);

  const run = crypto.randomUUID();
  const articleId = "20000000-0000-0000-0000-000000000001";
  const privateSource = `library/${run}-same-name.png`;
  const publicSource = `library/${run}/same-name.png`;
  const privateCopy = `articles/${articleId}/featured/${run}-private.png`;
  const publicCopy = `articles/${articleId}/featured/${run}-public.png`;
  const cleanup = [
    ["draft-assets", [privateSource, privateCopy, publicCopy]],
    ["public-assets", [publicSource]],
  ];

  try {
    const prepared = await admin.storage.from("draft-assets").createSignedUploadUrl(privateSource);
    assert.equal(prepared.error, null, "admin can prepare private signed upload");
    assert.ok(prepared.data?.token);
    const uploaded = await admin.storage.from("draft-assets").uploadToSignedUrl(privateSource, prepared.data.token, PNG, { contentType: "image/png", upsert: false });
    assert.equal(uploaded.error, null, "signed upload succeeds without overwrite");

    const publicUpload = await admin.storage.from("public-assets").upload(publicSource, PNG, { contentType: "image/png", upsert: false });
    assert.equal(publicUpload.error, null);

    const facts = await admin.storage.from("draft-assets").info(privateSource);
    assert.equal(facts.error, null);
    assert.equal(facts.data?.contentType, "image/png");
    assert.equal(facts.data?.size, PNG.byteLength);

    const privateReuse = await admin.storage.from("draft-assets").copy(privateSource, privateCopy);
    assert.equal(privateReuse.error, null, "private-to-private copy succeeds");
    const publicReuse = await admin.storage.from("public-assets").copy(publicSource, publicCopy, { destinationBucket: "draft-assets" });
    assert.equal(publicReuse.error, null, "public-to-private copy succeeds");

    assert.equal((await admin.storage.from("draft-assets").download(privateSource)).error, null, "private source remains after copy");
    assert.equal((await admin.storage.from("public-assets").download(publicSource)).error, null, "public source remains after copy");
    assert.equal((await admin.storage.from("draft-assets").download(privateCopy)).error, null);
    assert.equal((await admin.storage.from("draft-assets").download(publicCopy)).error, null);

    assert.ok((await reader.storage.from("draft-assets").download(privateSource)).error, "non-admin cannot read private assets");
    const deniedInventory = await reader.storage.from("draft-assets").list("library");
    assert.equal(deniedInventory.error, null, "RLS-hidden listings may return an empty success response");
    assert.equal(deniedInventory.data?.length, 0, "non-admin inventory reveals no private objects");
    await reader.storage.from("draft-assets").remove([privateSource]);
    assert.equal((await admin.storage.from("draft-assets").download(privateSource)).error, null, "non-admin delete attempt leaves the private object intact");

    const duplicate = await admin.storage.from("draft-assets").upload(privateSource, PNG, { contentType: "image/png", upsert: false });
    assert.ok(duplicate.error, "immutable upload rejects an existing path");
  } finally {
    for (const [bucket, paths] of cleanup) await admin.storage.from(bucket).remove(paths);
  }
});
