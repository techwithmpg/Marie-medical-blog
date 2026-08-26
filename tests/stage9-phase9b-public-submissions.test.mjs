import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {
  commentSubmissionSchema,
  contactSubmissionSchema,
  isHoneypotTriggered,
} from "../src/lib/public-submissions.ts";

const REPO_ROOT = process.cwd();

// ============================================================================
// Section A: Validation Contract Tests
// ============================================================================

test("Comment validation: accepts valid inputs and normalizes whitespace/casing", () => {
  const validPayload = {
    articleId: "90000000-0000-0000-0000-000000000001",
    commenterName: "  Synthetic Commenter  ",
    commenterEmail: "  SYNTHETIC-COMMENTER@EXAMPLE.INVALID  ",
    body: "  This is a valid synthetic comment for testing.  ",
    website: "",
  };

  const parsed = commentSubmissionSchema.safeParse(validPayload);
  assert.ok(parsed.success, "Valid comment payload should parse successfully");
  assert.equal(parsed.data.commenterName, "Synthetic Commenter");
  assert.equal(
    parsed.data.commenterEmail,
    "synthetic-commenter@example.invalid",
  );
  assert.equal(
    parsed.data.body,
    "This is a valid synthetic comment for testing.",
  );
  assert.equal(parsed.data.articleId, "90000000-0000-0000-0000-000000000001");
});

test("Comment validation: rejects invalid UUID, empty fields, and length boundaries", () => {
  // 1. Invalid UUID
  const invalidUuid = commentSubmissionSchema.safeParse({
    articleId: "not-a-valid-uuid",
    commenterName: "Synthetic User",
    commenterEmail: "user@example.invalid",
    body: "Valid body",
  });
  assert.ok(!invalidUuid.success);

  // 2. Blank / whitespace-only name
  const blankName = commentSubmissionSchema.safeParse({
    articleId: "90000000-0000-0000-0000-000000000001",
    commenterName: "   ",
    commenterEmail: "user@example.invalid",
    body: "Valid body",
  });
  assert.ok(!blankName.success);

  // 3. Invalid email format
  const invalidEmail = commentSubmissionSchema.safeParse({
    articleId: "90000000-0000-0000-0000-000000000001",
    commenterName: "Synthetic User",
    commenterEmail: "not-an-email",
    body: "Valid body",
  });
  assert.ok(!invalidEmail.success);

  // 4. Name > 100 characters
  const longName = commentSubmissionSchema.safeParse({
    articleId: "90000000-0000-0000-0000-000000000001",
    commenterName: "A".repeat(101),
    commenterEmail: "user@example.invalid",
    body: "Valid body",
  });
  assert.ok(!longName.success);

  // 5. Email > 255 characters
  const longEmail = commentSubmissionSchema.safeParse({
    articleId: "90000000-0000-0000-0000-000000000001",
    commenterName: "Synthetic User",
    commenterEmail: `${"a".repeat(245)}@example.invalid`,
    body: "Valid body",
  });
  assert.ok(!longEmail.success);

  // 6. Body > 2000 characters
  const longBody = commentSubmissionSchema.safeParse({
    articleId: "90000000-0000-0000-0000-000000000001",
    commenterName: "Synthetic User",
    commenterEmail: "user@example.invalid",
    body: "A".repeat(2001),
  });
  assert.ok(!longBody.success);
});

test("Contact validation: accepts valid inputs and normalizes whitespace/casing", () => {
  const validPayload = {
    name: "  Synthetic Inquirer  ",
    email: "  SYNTHETIC-INQUIRER@EXAMPLE.INVALID  ",
    subject: "  Editorial Inquiry Subject  ",
    message: "  Synthetic message content for testing purposes.  ",
    website: "",
  };

  const parsed = contactSubmissionSchema.safeParse(validPayload);
  assert.ok(parsed.success, "Valid contact payload should parse successfully");
  assert.equal(parsed.data.name, "Synthetic Inquirer");
  assert.equal(parsed.data.email, "synthetic-inquirer@example.invalid");
  assert.equal(parsed.data.subject, "Editorial Inquiry Subject");
  assert.equal(
    parsed.data.message,
    "Synthetic message content for testing purposes.",
  );
});

test("Contact validation: rejects blank fields, invalid emails, and length boundaries", () => {
  // 1. Blank name
  const blankName = contactSubmissionSchema.safeParse({
    name: "   ",
    email: "user@example.invalid",
    subject: "Valid Subject",
    message: "Valid message body",
  });
  assert.ok(!blankName.success);

  // 2. Invalid email
  const invalidEmail = contactSubmissionSchema.safeParse({
    name: "Synthetic User",
    email: "invalid-email-string",
    subject: "Valid Subject",
    message: "Valid message body",
  });
  assert.ok(!invalidEmail.success);

  // 3. Name > 100 characters
  const longName = contactSubmissionSchema.safeParse({
    name: "A".repeat(101),
    email: "user@example.invalid",
    subject: "Valid Subject",
    message: "Valid message body",
  });
  assert.ok(!longName.success);

  // 4. Email > 255 characters
  const longEmail = contactSubmissionSchema.safeParse({
    name: "Synthetic User",
    email: `${"a".repeat(245)}@example.invalid`,
    subject: "Valid Subject",
    message: "Valid message body",
  });
  assert.ok(!longEmail.success);

  // 5. Subject > 200 characters
  const longSubject = contactSubmissionSchema.safeParse({
    name: "Synthetic User",
    email: "user@example.invalid",
    subject: "A".repeat(201),
    message: "Valid message body",
  });
  assert.ok(!longSubject.success);

  // 6. Message > 5000 characters
  const longMessage = contactSubmissionSchema.safeParse({
    name: "Synthetic User",
    email: "user@example.invalid",
    subject: "Valid Subject",
    message: "A".repeat(5001),
  });
  assert.ok(!longMessage.success);
});

test("Honeypot detection helper correctly identifies bot submissions", () => {
  assert.equal(isHoneypotTriggered(""), false);
  assert.equal(isHoneypotTriggered("   "), false);
  assert.equal(isHoneypotTriggered(undefined), false);
  assert.equal(isHoneypotTriggered(null), false);
  assert.equal(isHoneypotTriggered("http://spam-link.invalid"), true);
  assert.equal(isHoneypotTriggered("spambot"), true);
});

// ============================================================================
// Section B: Server Action Source Contract Verification
// ============================================================================

test("Comment Server Action source contract: uses createClient, inserts only 4 columns, no service-role, safe errors", async () => {
  const actionPath = path.join(REPO_ROOT, "src/app/blog/[slug]/actions.ts");
  const actionContent = await fs.readFile(actionPath, "utf-8");

  // 1. "use server" directive
  assert.match(actionContent, /"use server"/);

  // 2. Uses createClient from @/lib/supabase/server
  assert.match(actionContent, /createClient\(\)/);
  assert.ok(!actionContent.includes("createAdminClient"));
  assert.ok(!actionContent.includes("SUPABASE_SERVICE_ROLE_KEY"));

  // 3. Extract the exact insert payload block
  const insertMatch = actionContent.match(
    /\.from\(["']comments["']\)\.insert\(\{([\s\S]*?)\}\)/,
  );
  assert.ok(insertMatch, "Must contain .from('comments').insert({ ... }) call");
  const insertBody = insertMatch[1];

  // 4. Narrow insert columns check: only article_id, commenter_name, commenter_email, body
  assert.match(insertBody, /article_id\s*:/);
  assert.match(insertBody, /commenter_name\s*:/);
  assert.match(insertBody, /commenter_email\s*:/);
  assert.match(insertBody, /body\s*:/);

  // 5. Explicitly verify forbidden system-managed fields are NOT in insert payload
  assert.ok(
    !/(?<!article_)id\s*:/.test(insertBody),
    "Comment insert must NOT supply id",
  );
  assert.ok(
    !/created_at\s*:/.test(insertBody),
    "Comment insert must NOT supply created_at",
  );
  assert.ok(
    !/status\s*:/.test(insertBody),
    "Comment insert must NOT supply status",
  );
  assert.ok(
    !/moderated_at\s*:/.test(insertBody),
    "Comment insert must NOT supply moderated_at",
  );

  // 6. Honeypot check present
  assert.match(actionContent, /isHoneypotTriggered/);

  // 7. Raw SQL/database errors not leaked
  assert.ok(
    actionContent.includes(
      "We couldn't submit your comment right now. Please wait a little and try again.",
    ),
  );
  assert.ok(!actionContent.includes("error.message"));
  assert.ok(!actionContent.includes("error.details"));
  assert.ok(!actionContent.includes("error.hint"));
});

test("Contact Server Action source contract: uses createClient, inserts only 4 columns, no service-role, safe errors", async () => {
  const actionPath = path.join(REPO_ROOT, "src/app/contact/actions.ts");
  const actionContent = await fs.readFile(actionPath, "utf-8");

  // 1. "use server" directive
  assert.match(actionContent, /"use server"/);

  // 2. Uses createClient from @/lib/supabase/server
  assert.match(actionContent, /createClient\(\)/);
  assert.ok(!actionContent.includes("createAdminClient"));
  assert.ok(!actionContent.includes("SUPABASE_SERVICE_ROLE_KEY"));

  // 3. Extract the exact insert payload block
  const insertMatch = actionContent.match(
    /\.from\(["']contact_messages["']\)\.insert\(\{([\s\S]*?)\}\)/,
  );
  assert.ok(
    insertMatch,
    "Must contain .from('contact_messages').insert({ ... }) call",
  );
  const insertBody = insertMatch[1];

  // 4. Narrow insert columns check: only name, email, subject, message
  assert.match(insertBody, /\bname\b/);
  assert.match(insertBody, /\bemail\b/);
  assert.match(insertBody, /\bsubject\b/);
  assert.match(insertBody, /\bmessage\b/);

  // 5. Explicitly verify forbidden system-managed fields are NOT in insert payload
  assert.ok(!/\bid\b/.test(insertBody), "Contact insert must NOT supply id");
  assert.ok(
    !/\bcreated_at\b/.test(insertBody),
    "Contact insert must NOT supply created_at",
  );
  assert.ok(
    !/\bstatus\b/.test(insertBody),
    "Contact insert must NOT supply status",
  );

  // 6. Honeypot check present
  assert.match(actionContent, /isHoneypotTriggered/);

  // 7. Raw SQL/database errors not leaked
  assert.ok(
    actionContent.includes(
      "We couldn't submit your inquiry right now. Please wait a little and try again.",
    ),
  );
  assert.ok(!actionContent.includes("error.message"));
  assert.ok(!actionContent.includes("error.details"));
});

// ============================================================================
// Section C: Public Comment Privacy & Query Invariants
// ============================================================================

test("Public comment query helper: selects ONLY safe public columns and filters status=approved", async () => {
  const helperPath = path.join(REPO_ROOT, "src/lib/public-comments.ts");
  const helperContent = await fs.readFile(helperPath, "utf-8");

  // 1. Selects only id, article_id, commenter_name, body, created_at
  assert.match(
    helperContent,
    /\.select\(\s*["']id,\s*article_id,\s*commenter_name,\s*body,\s*created_at["']\s*\)/,
  );

  // 2. Never selects commenter_email or moderated_at
  assert.ok(!helperContent.includes("commenter_email"));
  assert.ok(!helperContent.includes("moderated_at"));

  // 3. Explicitly filters status = 'approved' and orders created_at ascending
  assert.match(helperContent, /\.eq\(["']status["'],\s*["']approved["']\)/);
  assert.match(
    helperContent,
    /\.order\(["']created_at["'],\s*\{\s*ascending:\s*true\s*\}\)/,
  );
});

// ============================================================================
// Section D: Public UI Contract & Reset/Counter Regression Tests
// ============================================================================

test("Contact UI contract: form is active with live counters, reset on success, and medical disclaimer preserved", async () => {
  const contactFormPath = path.join(
    REPO_ROOT,
    "src/components/public/contact-form-shell.tsx",
  );
  const contactFormContent = await fs.readFile(contactFormPath, "utf-8");

  // 1. Form is active (not disabled, no unavailable placeholder notice)
  assert.ok(
    !contactFormContent.includes(
      "currently not accepting direct online submissions",
    ),
  );
  assert.ok(!contactFormContent.includes("Submit (Currently Unavailable)"));

  // 2. Form fields present
  assert.match(contactFormContent, /name="name"/);
  assert.match(contactFormContent, /name="email"/);
  assert.match(contactFormContent, /name="subject"/);
  assert.match(contactFormContent, /name="message"/);
  assert.match(contactFormContent, /name="website"/); // honeypot

  // 3. Character counters render from live state (not permanently zeroed by state.success ? 0 : ...)
  assert.match(contactFormContent, /\{subjectLen\}\s*\/\s*200/);
  assert.match(contactFormContent, /\{messageLen\}\s*\/\s*5000/);
  assert.ok(!contactFormContent.includes("displayedSubjectLen"));
  assert.ok(!contactFormContent.includes("state.success ? 0 :"));

  // 4. Counter resets to 0 when state transitions on success
  assert.match(contactFormContent, /setSubjectLen\(0\)/);
  assert.match(contactFormContent, /setMessageLen\(0\)/);

  // 5. Stale result feedback cleared when user starts editing a new submission
  assert.match(contactFormContent, /onInput=\{/);
  assert.match(contactFormContent, /setHasEditedSinceResult\(true\)/);
  assert.match(contactFormContent, /showFeedback/);

  // 6. Contact page retains medical inquiry warning
  const contactPagePath = path.join(REPO_ROOT, "src/app/contact/page.tsx");
  const contactPageContent = await fs.readFile(contactPagePath, "utf-8");
  assert.match(contactPageContent, /Personal medical inquiries/);
  assert.match(contactPageContent, /MedicalDisclaimer/);
});

test("Comment UI contract: rendered on article page after related writing with stale feedback reset", async () => {
  const articlePagePath = path.join(REPO_ROOT, "src/app/blog/[slug]/page.tsx");
  const articlePageContent = await fs.readFile(articlePagePath, "utf-8");

  // 1. CommentSection is placed after Related Writing
  const relatedIndex = articlePageContent.indexOf("Related Writing");
  const commentSectionIndex = articlePageContent.indexOf("<CommentSection");
  assert.ok(relatedIndex !== -1, "Related Writing section should exist");
  assert.ok(commentSectionIndex !== -1, "CommentSection should exist");
  assert.ok(
    commentSectionIndex > relatedIndex,
    "CommentSection must be placed after Related Writing",
  );

  // 2. Comment form includes notices & stale feedback clear on input
  const commentFormPath = path.join(
    REPO_ROOT,
    "src/components/public/comment-form.tsx",
  );
  const commentFormContent = await fs.readFile(commentFormPath, "utf-8");

  assert.match(
    commentFormContent,
    /Comments are reviewed before they appear publicly/,
  );
  assert.match(
    commentFormContent,
    /Your email is used[\s\n]+only for moderation and is never published/,
  );
  assert.match(commentFormContent, /name="website"/); // honeypot
  assert.match(commentFormContent, /onInput=\{/);
  assert.match(commentFormContent, /setHasEditedSinceResult\(true\)/);
  assert.match(commentFormContent, /showFeedback/);

  // 3. Comment section plain text rendering (no dangerouslySetInnerHTML)
  const commentSectionPath = path.join(
    REPO_ROOT,
    "src/components/public/comment-section.tsx",
  );
  const commentSectionContent = await fs.readFile(commentSectionPath, "utf-8");
  assert.ok(!commentSectionContent.includes("dangerouslySetInnerHTML"));
  assert.ok(!commentSectionContent.includes("commenter_email"));
  assert.match(commentSectionContent, /Discussion/);
});

// ============================================================================
// Section E: Scope Drift Guard (Zero Unauthorized Features)
// ============================================================================

test("Scope drift guard: no reader auth, captcha, email providers, or client Supabase writes", async () => {
  const filesToCheck = [
    "src/app/blog/[slug]/actions.ts",
    "src/app/contact/actions.ts",
    "src/lib/public-submissions.ts",
    "src/lib/public-comments.ts",
    "src/components/public/comment-form.tsx",
    "src/components/public/comment-section.tsx",
    "src/components/public/contact-form-shell.tsx",
  ];

  for (const relPath of filesToCheck) {
    const fullPath = path.join(REPO_ROOT, relPath);
    const content = await fs.readFile(fullPath, "utf-8");

    assert.ok(
      !content.includes("recaptcha"),
      `${relPath} must not use recaptcha`,
    );
    assert.ok(
      !content.includes("turnstile"),
      `${relPath} must not use turnstile`,
    );
    assert.ok(
      !content.includes("hcaptcha"),
      `${relPath} must not use hcaptcha`,
    );
    assert.ok(!content.includes("resend"), `${relPath} must not use resend`);
    assert.ok(
      !content.includes("sendgrid"),
      `${relPath} must not use sendgrid`,
    );
    assert.ok(
      !content.includes("createBrowserClient"),
      `${relPath} must not use client supabase writes`,
    );
    assert.ok(
      !content.includes("SUPABASE_SERVICE_ROLE_KEY"),
      `${relPath} must not use service role`,
    );
  }
});
