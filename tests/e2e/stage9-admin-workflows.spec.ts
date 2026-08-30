import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { ensureLocalSupabaseTarget } from "./helpers/local-only";
import {
  loginAsAdmin,
  SYNTHETIC_ADMIN_EMAIL,
  SYNTHETIC_ADMIN_PASSWORD,
} from "./helpers/auth";

const URL = "http://127.0.0.1:54321";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const COMMENT_ARTICLE_ID = "20000000-0000-0000-0000-000000000001";

const CONTACT_MESSAGE_ID = "50000000-0000-0000-0000-000000000001";

test.beforeAll(() => {
  ensureLocalSupabaseTarget();
});

test.describe("Stage 9 Admin Moderation & Inbox Workflows E2E", () => {
  test.describe.configure({ mode: "serial" });

  test("1. Comment moderation lifecycle: Pending -> Approve -> Hide -> Delete", async ({
    page,
  }) => {
    // Create an isolated pending comment for this browser run so the
    // destructive moderation lifecycle is safely repeatable.
    const run = Date.now().toString();
    const commenterEmail = `stage9-admin-comment-${run}@example.invalid`;
    const commentBody = `Synthetic Stage 9 admin moderation lifecycle ${run}.`;

    const fixtureClient = createClient(URL, ANON_KEY);

    const { error: commentFixtureError } = await fixtureClient
      .from("comments")
      .insert({
        article_id: COMMENT_ARTICLE_ID,
        commenter_name: "Synthetic Stage 9 Moderation Reader",
        commenter_email: commenterEmail,
        body: commentBody,
      });

    expect(commentFixtureError).toBeNull();

    // 1. Verify anonymous user is redirected to login
    await page.goto("/admin/comments");
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/login/);

    // 2. Login as synthetic admin
    await loginAsAdmin(page);

    // 3. Open comment moderation workspace
    await page.goto("/admin/comments");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByRole("heading", { name: "Comment Moderation" }),
    ).toBeVisible();

    // Verify filter tabs exist (rendered with role="tab")
    await expect(
      page.getByRole("tab", { name: "Pending Review" }),
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "Approved" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Hidden" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "All Comments" })).toBeVisible();

    // Verify private commenter email is visible in admin
    await expect(page.getByText(commenterEmail)).toBeVisible();

    // Locate the pending comment
    const pendingCommentCard = page
      .locator("div.rounded-lg")
      .filter({
        hasText: commentBody,
      })
      .first();
    await expect(pendingCommentCard).toBeVisible();

    // Approve the pending comment
    const approveBtn = pendingCommentCard.getByRole("button", {
      name: "Approve",
    });
    await approveBtn.click();

    // Wait for reload and verify comment moves out of Pending
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(commentBody)).not.toBeVisible();

    // 4. Verify approved comment now displays publicly on the live article
    await page.goto("/blog/plain-language-clinical-protocol-summaries");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(commentBody)).toBeVisible();

    // Verify commenter email is still absent from public DOM
    const publicBodyText = await page.textContent("body");
    expect(publicBodyText).not.toContain(commenterEmail);

    // 5. Hide the comment in admin
    await page.goto("/admin/comments?status=approved");
    await page.waitForLoadState("domcontentloaded");

    const approvedCommentCard = page
      .locator("div.rounded-lg")
      .filter({
        hasText: commentBody,
      })
      .first();
    await expect(approvedCommentCard).toBeVisible();

    const hideBtn = approvedCommentCard.getByRole("button", { name: "Hide" });
    await hideBtn.click();
    await page.waitForLoadState("domcontentloaded");

    // Verify comment is no longer visible publicly
    await page.goto("/blog/plain-language-clinical-protocol-summaries");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(commentBody)).not.toBeVisible();

    // 6. Delete the comment in admin
    await page.goto("/admin/comments?status=hidden");
    await page.waitForLoadState("domcontentloaded");

    const hiddenCommentCard = page
      .locator("div.rounded-lg")
      .filter({
        hasText: commentBody,
      })
      .first();
    await expect(hiddenCommentCard).toBeVisible();

    const deleteBtn = hiddenCommentCard.getByRole("button", { name: "Delete" });
    await deleteBtn.click();
    await page.waitForLoadState("domcontentloaded");

    // Verify comment is completely removed from admin
    await page.goto("/admin/comments?status=all");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(commentBody)).not.toBeVisible();
  });

  test("2. Contact inbox lifecycle: New -> Mark Read -> Archive -> Restore to Read", async ({
    page,
  }) => {
    // Reset the durable synthetic inbox fixture because this test
    // intentionally finishes the lifecycle in the Read state.
    const adminFixtureClient = createClient(URL, ANON_KEY);

    const { error: fixtureLoginError } =
      await adminFixtureClient.auth.signInWithPassword({
        email: SYNTHETIC_ADMIN_EMAIL,
        password: SYNTHETIC_ADMIN_PASSWORD,
      });

    expect(fixtureLoginError).toBeNull();

    const { data: resetMessageRows, error: resetMessageError } =
      await adminFixtureClient
        .from("contact_messages")
        .update({ status: "new" })
        .eq("id", CONTACT_MESSAGE_ID)
        .select("id");

    expect(resetMessageError).toBeNull();
    expect(resetMessageRows).toHaveLength(1);

    await loginAsAdmin(page);

    await page.goto("/admin/messages");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByRole("heading", { name: "Contact Inbox" }),
    ).toBeVisible();

    // Verify filter tabs exist (rendered with role="tab")
    await expect(
      page.getByRole("tab", { name: "New Inquiries" }),
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "Read" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Archived" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "All Messages" })).toBeVisible();

    // Locate seeded contact message
    const messageSubject =
      "Synthetic Inquiry Regarding Medical Writing Collaboration";
    await expect(page.getByText(messageSubject).first()).toBeVisible();

    // Click on message to inspect it in reader pane
    const messageListItem = page.locator(
      `a[href="/admin/messages?status=new&id=${CONTACT_MESSAGE_ID}"]`,
    );

    await expect(messageListItem).toBeVisible();

    await Promise.all([
      page.waitForURL(
        (url) =>
          url.pathname === "/admin/messages" &&
          url.searchParams.get("status") === "new" &&
          url.searchParams.get("id") === CONTACT_MESSAGE_ID,
      ),
      messageListItem.click(),
    ]);

    // CRITICAL: Opening/viewing message must NOT automatically mutate status
    const statusBadge = page.locator("span", { hasText: "New" }).first();
    await expect(statusBadge).toBeVisible();

    // Verify sender email is visible in admin reader
    await expect(
      page.getByText("inquirer-sam@example.invalid").first(),
    ).toBeVisible();

    // Explicitly click Mark Read
    const markReadBtn = page.getByRole("button", { name: "Mark Read" });
    await markReadBtn.click();

    await expect
      .poll(
        async () => {
          const { data, error } = await adminFixtureClient
            .from("contact_messages")
            .select("status")
            .eq("id", CONTACT_MESSAGE_ID)
            .maybeSingle();

          if (error) throw error;
          return data?.status ?? null;
        },
        { timeout: 10000 },
      )
      .toBe("read");

    // Verify message is now in Read tab
    await page.goto("/admin/messages?status=read");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(messageSubject).first()).toBeVisible();

    // Click on message to inspect it in reader pane
    const readListItem = page.locator(
      `a[href="/admin/messages?status=read&id=${CONTACT_MESSAGE_ID}"]`,
    );

    await expect(readListItem).toBeVisible();

    await Promise.all([
      page.waitForURL(
        (url) =>
          url.pathname === "/admin/messages" &&
          url.searchParams.get("status") === "read" &&
          url.searchParams.get("id") === CONTACT_MESSAGE_ID,
      ),
      readListItem.click(),
    ]);

    // Click Archive Message
    const archiveBtn = page.getByRole("button", { name: "Archive Message" });
    await archiveBtn.click();

    await expect
      .poll(
        async () => {
          const { data, error } = await adminFixtureClient
            .from("contact_messages")
            .select("status")
            .eq("id", CONTACT_MESSAGE_ID)
            .maybeSingle();

          if (error) throw error;
          return data?.status ?? null;
        },
        { timeout: 10000 },
      )
      .toBe("archived");

    // Verify message is now in Archived tab
    await page.goto("/admin/messages?status=archived");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(messageSubject).first()).toBeVisible();

    // Click on message to inspect it in reader pane
    const archivedListItem = page.locator(
      `a[href="/admin/messages?status=archived&id=${CONTACT_MESSAGE_ID}"]`,
    );

    await expect(archivedListItem).toBeVisible();

    await Promise.all([
      page.waitForURL(
        (url) =>
          url.pathname === "/admin/messages" &&
          url.searchParams.get("status") === "archived" &&
          url.searchParams.get("id") === CONTACT_MESSAGE_ID,
      ),
      archivedListItem.click(),
    ]);

    // Click Restore to Read
    const restoreBtn = page.getByRole("button", { name: "Restore to Read" });
    await restoreBtn.click();

    await expect
      .poll(
        async () => {
          const { data, error } = await adminFixtureClient
            .from("contact_messages")
            .select("status")
            .eq("id", CONTACT_MESSAGE_ID)
            .maybeSingle();

          if (error) throw error;
          return data?.status ?? null;
        },
        { timeout: 10000 },
      )
      .toBe("read");

    // Verify message returns to Read tab
    await page.goto("/admin/messages?status=read");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(messageSubject).first()).toBeVisible();

    // Verify no Delete button exists in message reader
    await expect(
      page.locator("button", { hasText: "Delete Message" }),
    ).not.toBeVisible();
    await expect(
      page.locator("button", { hasText: "Delete" }),
    ).not.toBeVisible();
  });
});
