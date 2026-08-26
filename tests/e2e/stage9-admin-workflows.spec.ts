import { test, expect } from "@playwright/test";
import { ensureLocalSupabaseTarget } from "./helpers/local-only";
import { loginAsAdmin } from "./helpers/auth";

test.beforeAll(() => {
  ensureLocalSupabaseTarget();
});

test.describe("Stage 9 Admin Moderation & Inbox Workflows E2E", () => {
  test.describe.configure({ mode: "serial" });

  test("1. Comment moderation lifecycle: Pending -> Approve -> Hide -> Delete", async ({
    page,
  }) => {
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
    await expect(page.getByText("reader-jordan@example.invalid")).toBeVisible();

    // Locate the pending comment
    const pendingCommentCard = page
      .locator("div.rounded-lg")
      .filter({
        hasText:
          "Synthetic pending comment submitted for moderation review testing.",
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
    await expect(
      page.getByText(
        "Synthetic pending comment submitted for moderation review testing.",
      ),
    ).not.toBeVisible();

    // 4. Verify approved comment now displays publicly on the live article
    await page.goto("/blog/plain-language-clinical-protocol-summaries");
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByText(
        "Synthetic pending comment submitted for moderation review testing.",
      ),
    ).toBeVisible();

    // Verify commenter email is still absent from public DOM
    const publicBodyText = await page.textContent("body");
    expect(publicBodyText).not.toContain("reader-jordan@example.invalid");

    // 5. Hide the comment in admin
    await page.goto("/admin/comments?status=approved");
    await page.waitForLoadState("domcontentloaded");

    const approvedCommentCard = page
      .locator("div.rounded-lg")
      .filter({
        hasText:
          "Synthetic pending comment submitted for moderation review testing.",
      })
      .first();
    await expect(approvedCommentCard).toBeVisible();

    const hideBtn = approvedCommentCard.getByRole("button", { name: "Hide" });
    await hideBtn.click();
    await page.waitForLoadState("domcontentloaded");

    // Verify comment is no longer visible publicly
    await page.goto("/blog/plain-language-clinical-protocol-summaries");
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByText(
        "Synthetic pending comment submitted for moderation review testing.",
      ),
    ).not.toBeVisible();

    // 6. Delete the comment in admin
    await page.goto("/admin/comments?status=hidden");
    await page.waitForLoadState("domcontentloaded");

    const hiddenCommentCard = page
      .locator("div.rounded-lg")
      .filter({
        hasText:
          "Synthetic pending comment submitted for moderation review testing.",
      })
      .first();
    await expect(hiddenCommentCard).toBeVisible();

    const deleteBtn = hiddenCommentCard.getByRole("button", { name: "Delete" });
    await deleteBtn.click();
    await page.waitForLoadState("domcontentloaded");

    // Verify comment is completely removed from admin
    await page.goto("/admin/comments?status=all");
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByText(
        "Synthetic pending comment submitted for moderation review testing.",
      ),
    ).not.toBeVisible();
  });

  test("2. Contact inbox lifecycle: New -> Mark Read -> Archive -> Restore to Read", async ({
    page,
  }) => {
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
    const messageListItem = page.getByRole("link", {
      name: new RegExp(messageSubject),
    });
    await messageListItem.click();
    await page.waitForLoadState("domcontentloaded");

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
    await page.waitForLoadState("networkidle");

    // Verify message is now in Read tab
    await page.goto("/admin/messages?status=read");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(messageSubject).first()).toBeVisible();

    // Click on message to inspect it in reader pane
    const readListItem = page.getByRole("link", {
      name: new RegExp(messageSubject),
    });
    await readListItem.click();
    await page.waitForLoadState("domcontentloaded");

    // Click Archive Message
    const archiveBtn = page.getByRole("button", { name: "Archive Message" });
    await archiveBtn.click();
    await page.waitForLoadState("networkidle");

    // Verify message is now in Archived tab
    await page.goto("/admin/messages?status=archived");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(messageSubject).first()).toBeVisible();

    // Click on message to inspect it in reader pane
    const archivedListItem = page.getByRole("link", {
      name: new RegExp(messageSubject),
    });
    await archivedListItem.click();
    await page.waitForLoadState("domcontentloaded");

    // Click Restore to Read
    const restoreBtn = page.getByRole("button", { name: "Restore to Read" });
    await restoreBtn.click();
    await page.waitForLoadState("networkidle");

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
