import { test, expect } from "@playwright/test";
import { ensureLocalSupabaseTarget } from "./helpers/local-only";

test.beforeAll(() => {
  ensureLocalSupabaseTarget();
});

test.describe("Stage 9 Public Submissions E2E", () => {
  test.describe.configure({ mode: "serial" });

  test("1. Public comment reading, submission, moderation notice, and privacy boundary", async ({
    page,
  }) => {
    // Navigate to known published article
    await page.goto("/blog/plain-language-clinical-protocol-summaries");
    await page.waitForLoadState("domcontentloaded");

    // Verify discussion section exists
    const discussionHeading = page.getByRole("heading", { name: "Discussion" });
    await expect(discussionHeading).toBeVisible();

    // Verify approved seeded comment appears
    await expect(
      page.getByText(
        "Synthetic approved comment for local typography testing.",
      ),
    ).toBeVisible();

    // Verify pending seeded comment does NOT appear publicly
    await expect(
      page.getByText(
        "Synthetic pending comment submitted for moderation review testing.",
      ),
    ).not.toBeVisible();

    // Verify commenter email does NOT appear anywhere in the DOM
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("reader-alex@example.invalid");
    expect(bodyText).not.toContain("reader-jordan@example.invalid");

    // Verify moderation and privacy notices
    await expect(
      page.getByText("Comments are reviewed before they appear publicly."),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Your email is used only for moderation and is never published.",
      ),
    ).toBeVisible();

    // Fill comment form
    await page.locator("#commenter-name").fill("Synthetic E2E Commenter");
    await page
      .locator("#commenter-email")
      .fill("stage9e-comment-auto@example.invalid");
    await page
      .locator("#comment-body")
      .fill(
        "Synthetic Stage 9E browser comment for moderation workflow verification.",
      );

    // Submit comment
    await page.getByRole("button", { name: "Submit Comment" }).click();

    // Verify success feedback
    await expect(
      page.getByText(
        "Thank you. Your comment has been submitted for moderation and will appear only if approved.",
      ),
    ).toBeVisible({ timeout: 10000 });

    // Verify new comment is not yet displayed in the public approved list
    await expect(
      page.getByText(
        "Synthetic Stage 9E browser comment for moderation workflow verification.",
      ),
    ).not.toBeVisible();

    // Verify email is still absent from DOM
    const updatedBodyText = await page.textContent("body");
    expect(updatedBodyText).not.toContain(
      "stage9e-comment-auto@example.invalid",
    );
  });

  test("2. Public contact form validation, submission, live counters, and reset behavior", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");
    await page
      .locator('form[data-hydrated="true"]')
      .waitFor({ state: "attached" });

    // Verify form fields exist
    const nameInput = page.locator("#contact-name");
    const emailInput = page.locator("#contact-email");
    const subjectInput = page.locator("#contact-subject");
    const messageInput = page.locator("#contact-message");
    const submitBtn = page.getByRole("button", { name: "Send Inquiry" });

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(subjectInput).toBeVisible();
    await expect(messageInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Verify initial character counters
    await expect(page.getByText("0 / 200")).toBeVisible();
    await expect(page.getByText("0 / 5000")).toBeVisible();

    // Verify medical inquiry warning and compact disclaimer
    await expect(page.getByText("Personal medical inquiries")).toBeVisible();
    await expect(
      page.getByText(
        "The content published on this website is for educational and informational purposes only",
      ),
    ).toBeVisible();

    // Fill valid contact inquiry
    await nameInput.click();
    await nameInput.fill("Synthetic Stage 9E Inquirer");
    await emailInput.click();
    await emailInput.fill("stage9e-contact-auto@example.invalid");
    await subjectInput.click();
    await subjectInput.fill("Synthetic Stage 9E Professional Inquiry");
    await messageInput.click();
    await messageInput.fill(
      "Synthetic local browser message used only to verify the Stage 9 contact inbox.",
    );

    // Verify counter updates
    await expect(page.getByText("39 / 200")).toBeVisible();
    await expect(page.getByText("78 / 5000")).toBeVisible();

    // Submit inquiry
    await submitBtn.click();

    // Verify success feedback
    await expect(
      page.getByText("Your inquiry has been submitted."),
    ).toBeVisible({ timeout: 10000 });

    // Verify form and counters are reset
    await expect(nameInput).toHaveValue("");
    await expect(emailInput).toHaveValue("");
    await expect(subjectInput).toHaveValue("");
    await expect(messageInput).toHaveValue("");
    await expect(page.getByText("0 / 200")).toBeVisible();
    await expect(page.getByText("0 / 5000")).toBeVisible();

    // Type in subject to verify prior success banner clears upon new editing
    await subjectInput.fill("New Draft Subject");
    await expect(
      page.getByText(
        "Thank you for reaching out. Your message has been received.",
      ),
    ).not.toBeVisible();
  });
});
