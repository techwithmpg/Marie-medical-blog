import { test, expect } from "@playwright/test";
import { ensureLocalSupabaseTarget } from "./helpers/local-only";

test.beforeAll(() => {
  ensureLocalSupabaseTarget();
});

test.describe("Stage 9 Security & Private Data Boundaries E2E", () => {
  test("1. Anonymous visitor cannot access admin routes", async ({ page }) => {
    const adminRoutes = [
      "/admin",
      "/admin/comments",
      "/admin/messages",
      "/admin/settings",
      "/admin/portfolio",
      "/admin/articles",
      "/admin/articles/new",
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/admin\/login/);
    }
  });

  test("2. Public draft and archived articles return 404 and do not leak content", async ({
    page,
  }) => {
    // Draft article
    const draftResponse = await page.goto(
      "/blog/draft-regulatory-document-structuring",
    );
    expect(draftResponse?.status()).toBe(404);
    await expect(
      page.getByText("Unpublished Regulatory Drafting Guidelines"),
    ).not.toBeVisible();

    // Archived article
    const archivedResponse = await page.goto(
      "/blog/archived-historical-editorial-guidelines",
    );
    expect(archivedResponse?.status()).toBe(404);
    await expect(
      page.getByText("Historical Editorial Guidelines and Practice Archive"),
    ).not.toBeVisible();
  });

  test("3. Private emails and contact messages are never present in public DOM", async ({
    page,
  }) => {
    const publicRoutes = [
      "/",
      "/about",
      "/contact",
      "/portfolio",
      "/blog",
      "/blog/plain-language-clinical-protocol-summaries",
    ];

    const privateTokens = [
      "reader-jordan@example.invalid",
      "reader-alex@example.invalid",
      "inquirer-sam@example.invalid",
      "stage9e-comment-auto@example.invalid",
      "stage9e-contact-auto@example.invalid",
      "Synthetic contact message for local inbox testing.",
    ];

    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const bodyText = await page.textContent("body");
      for (const token of privateTokens) {
        expect(bodyText).not.toContain(token);
      }
    }
  });
});
