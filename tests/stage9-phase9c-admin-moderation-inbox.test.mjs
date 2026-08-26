import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

test("A. Comments admin data helper contract", async () => {
  const commentsModulePath = path.join(ROOT, "src/lib/admin/comments.ts");
  assert.ok(
    fs.existsSync(commentsModulePath),
    "src/lib/admin/comments.ts must exist",
  );

  const content = fs.readFileSync(commentsModulePath, "utf8");

  // Verify explicit column selection (No SELECT *)
  assert.ok(
    content.includes(
      "id, article_id, commenter_name, commenter_email, body, status, created_at, moderated_at",
    ),
    "Must explicitly select comment columns including admin-only commenter_email and moderated_at",
  );
  assert.ok(
    !content.includes('select("*")') && !content.includes("select('*')"),
    "Must not use SELECT * in comments helper",
  );

  // Verify status filtering support
  assert.ok(
    content.includes('"pending"') &&
      content.includes('"approved"') &&
      content.includes('"hidden"'),
    "Must support pending, approved, and hidden status filters",
  );

  // Verify descending chronological order
  assert.ok(
    content.includes('order("created_at", { ascending: false })'),
    "Must order comments newest first by created_at DESC",
  );

  // Verify server Supabase client usage without service role
  assert.ok(
    content.includes('import { createClient } from "@/lib/supabase/server"'),
    "Must use standard createClient from server helper",
  );
  assert.ok(
    !content.includes("service_role") && !content.includes("SERVICE_ROLE"),
    "Must not use service role in comments helper",
  );
});

test("B. Comment moderation Server Action security and allowlist", async () => {
  const actionModulePath = path.join(ROOT, "src/app/admin/comments/actions.ts");
  assert.ok(
    fs.existsSync(actionModulePath),
    "src/app/admin/comments/actions.ts must exist",
  );

  const content = fs.readFileSync(actionModulePath, "utf8");

  // Verify server action directive and admin authentication guard
  assert.ok(
    content.includes('"use server"') || content.includes("'use server'"),
    "Must declare 'use server'",
  );
  assert.ok(
    content.includes("await requireAdmin()"),
    "Must enforce admin authorization via requireAdmin()",
  );
  assert.ok(
    content.includes("createClient()"),
    "Must use authenticated server Supabase client",
  );
  assert.ok(
    !content.includes("service_role") && !content.includes("SERVICE_ROLE"),
    "Must not use service role in moderation action",
  );

  // Verify operation allowlist
  assert.ok(
    content.includes('"approve"') &&
      content.includes('"hide"') &&
      content.includes('"delete"'),
    "Must support approve, hide, and delete operations",
  );

  // Verify approve sets status = approved and moderated_at
  assert.ok(
    content.includes('status: "approved"') && content.includes("moderated_at:"),
    "Approve operation must set status='approved' and moderated_at timestamp",
  );

  // Verify hide sets status = hidden and moderated_at
  assert.ok(
    content.includes('status: "hidden"') && content.includes("moderated_at:"),
    "Hide operation must set status='hidden' and moderated_at timestamp",
  );

  // Verify delete performs hard delete
  assert.ok(
    content.includes(".delete()") && content.includes('.eq("id", commentId)'),
    "Delete operation must execute hard delete on target comment id",
  );
});

test("C. Comment moderation targeted cache revalidation", async () => {
  const actionModulePath = path.join(ROOT, "src/app/admin/comments/actions.ts");
  const content = fs.readFileSync(actionModulePath, "utf8");

  assert.ok(
    content.includes('revalidatePath("/admin/comments")'),
    "Must revalidate /admin/comments workspace",
  );
  assert.ok(
    content.includes("revalidatePath(`/blog/${articleSlug}`)"),
    "Must revalidate targeted public article page when slug is available",
  );
});

test("D. Comments moderation page UI contract", async () => {
  const pagePath = path.join(ROOT, "src/app/admin/comments/page.tsx");
  assert.ok(
    fs.existsSync(pagePath),
    "src/app/admin/comments/page.tsx must exist",
  );

  const content = fs.readFileSync(pagePath, "utf8");

  // Verify admin authorization call
  assert.ok(
    content.includes("await requireAdmin()"),
    "Page must call requireAdmin()",
  );

  // Verify robots metadata
  assert.ok(
    content.includes("index: false") && content.includes("follow: false"),
    "Must configure noindex/nofollow robots metadata",
  );

  // Verify tabs
  assert.ok(
    content.includes('role="tablist"') && content.includes('role="tab"'),
    "Must render accessible tabs with role tablist and tab",
  );
  assert.ok(
    content.includes('"pending"') &&
      content.includes('"approved"') &&
      content.includes('"hidden"') &&
      content.includes('"all"'),
    "Must support pending, approved, hidden, and all filter tabs",
  );

  // Verify plain text rendering without dangerous HTML
  assert.ok(
    content.includes("whitespace-pre-wrap"),
    "Must preserve comment formatting safely with CSS whitespace-pre-wrap",
  );
  assert.ok(
    !content.includes("dangerouslySetInnerHTML"),
    "Must never use dangerouslySetInnerHTML for comments",
  );

  // Verify action triggers
  assert.ok(
    content.includes("action={moderateCommentAction}") &&
      content.includes('name="operation"') &&
      content.includes('value="approve"') &&
      content.includes('value="hide"') &&
      content.includes('value="delete"'),
    "Must render moderation action forms with approve, hide, and delete operations",
  );
});

test("E. Contact messages admin data helper contract", async () => {
  const messagesModulePath = path.join(ROOT, "src/lib/admin/messages.ts");
  assert.ok(
    fs.existsSync(messagesModulePath),
    "src/lib/admin/messages.ts must exist",
  );

  const content = fs.readFileSync(messagesModulePath, "utf8");

  // Verify explicit column selection
  assert.ok(
    content.includes("id, name, email, subject, message, status, created_at"),
    "Must explicitly select message columns",
  );
  assert.ok(
    !content.includes('select("*")') && !content.includes("select('*')"),
    "Must not use SELECT * in messages helper",
  );

  // Verify status filtering support
  assert.ok(
    content.includes('"new"') &&
      content.includes('"read"') &&
      content.includes('"archived"'),
    "Must support new, read, and archived status filters",
  );

  // Verify descending chronological order
  assert.ok(
    content.includes('order("created_at", { ascending: false })'),
    "Must order messages newest first by created_at DESC",
  );

  // Verify server Supabase client usage without service role
  assert.ok(
    content.includes('import { createClient } from "@/lib/supabase/server"'),
    "Must use standard createClient from server helper",
  );
  assert.ok(
    !content.includes("service_role") && !content.includes("SERVICE_ROLE"),
    "Must not use service role in messages helper",
  );
});

test("F. Contact messages Server Action security and operation constraints", async () => {
  const actionModulePath = path.join(ROOT, "src/app/admin/messages/actions.ts");
  assert.ok(
    fs.existsSync(actionModulePath),
    "src/app/admin/messages/actions.ts must exist",
  );

  const content = fs.readFileSync(actionModulePath, "utf8");

  // Verify server action directive and admin guard
  assert.ok(
    content.includes('"use server"') || content.includes("'use server'"),
    "Must declare 'use server'",
  );
  assert.ok(
    content.includes("await requireAdmin()"),
    "Must enforce admin authorization via requireAdmin()",
  );

  // Verify allowed operations: read, archive, restore ONLY
  assert.ok(
    content.includes('"read"') &&
      content.includes('"archive"') &&
      content.includes('"restore"'),
    "Must support read, archive, and restore operations",
  );

  // Invariant: No delete operation for contact messages
  assert.ok(
    !content.includes(".delete()"),
    "Must not implement destructive delete on contact messages",
  );

  // Verify revalidation
  assert.ok(
    content.includes('revalidatePath("/admin/messages")'),
    "Must revalidate /admin/messages workspace",
  );
});

test("G. GET-side-effect guard on message retrieval and inbox view", async () => {
  const messagesPagePath = path.join(ROOT, "src/app/admin/messages/page.tsx");
  const messagesLibPath = path.join(ROOT, "src/lib/admin/messages.ts");

  const pageContent = fs.readFileSync(messagesPagePath, "utf8");
  const libContent = fs.readFileSync(messagesLibPath, "utf8");

  // Invariant: Simply reading or selecting a message must NOT mutate status
  assert.ok(
    !pageContent.includes(".update(") && !pageContent.includes(".upsert("),
    "Page rendering must not mutate database status",
  );
  assert.ok(
    !libContent.includes(".update(") && !libContent.includes(".upsert("),
    "Message data loader must not mutate database status",
  );
});

test("H. Contact inbox page UI and same-page reader contract", async () => {
  const pagePath = path.join(ROOT, "src/app/admin/messages/page.tsx");
  assert.ok(
    fs.existsSync(pagePath),
    "src/app/admin/messages/page.tsx must exist",
  );

  const content = fs.readFileSync(pagePath, "utf8");

  // Invariant: No dedicated /admin/messages/[id] route
  const subRoutePath = path.join(ROOT, "src/app/admin/messages/[id]");
  assert.ok(
    !fs.existsSync(subRoutePath),
    "Must not introduce /admin/messages/[id] route (must use same-page reader)",
  );

  // Verify query params support
  assert.ok(
    content.includes("searchParams") &&
      content.includes("status") &&
      content.includes("id"),
    "Page must support status and id searchParams",
  );

  // Verify status transition action triggers
  assert.ok(
    content.includes("action={updateContactMessageStatusAction}") &&
      content.includes('value="read"') &&
      content.includes('value="archive"') &&
      content.includes('value="restore"'),
    "Must render action forms with read, archive, and restore operations",
  );

  // Invariant: No message delete, reply, or forward buttons
  assert.ok(
    !content.includes('value="delete"') &&
      !content.includes("Reply") &&
      !content.includes("Forward"),
    "Must not expose message delete, reply, or forward controls",
  );

  // Plain text rendering without dangerouslySetInnerHTML
  assert.ok(
    content.includes("whitespace-pre-wrap"),
    "Must render message body safely with CSS whitespace-pre-wrap",
  );
  assert.ok(
    !content.includes("dangerouslySetInnerHTML"),
    "Must never use dangerouslySetInnerHTML for contact messages",
  );
});

test("I. Private data boundary and public confidentiality enforcement", async () => {
  const publicCommentsLib = path.join(ROOT, "src/lib/public-comments.ts");
  const publicCommentSection = path.join(
    ROOT,
    "src/components/public/comment-section.tsx",
  );
  const publicCommentForm = path.join(
    ROOT,
    "src/components/public/comment-form.tsx",
  );

  const publicCommentsContent = fs.readFileSync(publicCommentsLib, "utf8");
  const publicSectionContent = fs.readFileSync(publicCommentSection, "utf8");
  const publicFormContent = fs.readFileSync(publicCommentForm, "utf8");

  // Public comments reader must NEVER select commenter_email or moderated_at
  assert.ok(
    !publicCommentsContent.includes("commenter_email"),
    "Public comments reader must never select commenter_email",
  );
  assert.ok(
    !publicCommentsContent.includes("moderated_at"),
    "Public comments reader must never select moderated_at",
  );

  // Public comments UI components must NEVER render commenter_email
  assert.ok(
    !publicSectionContent.includes("commenter_email") &&
      !publicSectionContent.includes("email"),
    "Public comment section must never render commenter email",
  );

  // No client-side storage of private inbox or comment data
  assert.ok(
    !publicFormContent.includes("localStorage") &&
      !publicFormContent.includes("sessionStorage"),
    "Comment form must not store data in localStorage or sessionStorage",
  );
});

test("J. Scope drift guard: single-admin, no reader auth, no email send integrations", async () => {
  const adminLayoutPath = path.join(ROOT, "src/app/admin/layout.tsx");
  const adminLayoutContent = fs.readFileSync(adminLayoutPath, "utf8");

  assert.ok(
    adminLayoutContent.includes("requireAdmin"),
    "Admin layout must enforce requireAdmin",
  );
  assert.ok(
    !adminLayoutContent.includes("role === 'editor'") &&
      !adminLayoutContent.includes("permissions"),
    "Must not introduce multi-role RBAC",
  );

  // Check that no nodemailer, resend, sendgrid or email dispatchers are introduced
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
  );
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  assert.ok(!allDeps.nodemailer, "Must not introduce nodemailer");
  assert.ok(!allDeps.resend, "Must not introduce resend");
  assert.ok(!allDeps["@sendgrid/mail"], "Must not introduce sendgrid");
  assert.ok(
    !allDeps["@tanstack/react-query"],
    "Must not introduce react-query",
  );
});
