import { test, expect } from "@playwright/test";
import { ensureLocalSupabaseTarget } from "./helpers/local-only";
import { loginAsAdmin } from "./helpers/auth";

test.beforeAll(() => {
  ensureLocalSupabaseTarget();
});

test.describe("Stage 11 admin quality hardening", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("dashboard exposes operational content, attention, and recency summaries", async ({
    page,
  }) => {
    await page.goto("/admin");

    await expect(
      page.getByRole("heading", { name: "Editorial Overview" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Content summary" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Needs attention" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Recently edited" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "New Article" })).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Dashboard", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("admin skip link reaches the workspace main region", async ({
    page,
  }) => {
    await page.goto("/admin/articles");

    const skipLink = page.getByRole("link", { name: "Skip to admin content" });
    // WebKit follows Safari's platform preference for whether Tab focuses links,
    // so focus the semantic link directly before verifying keyboard activation.
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await skipLink.press("Enter");
    await expect(page.locator("#admin-main-content")).toBeFocused();
  });

  test("dirty article editor warns before internal navigation and restores focus on stay", async ({
    page,
  }) => {
    await page.goto("/admin/articles/new");
    await page.locator('[contenteditable="true"]').waitFor();
    const title = page.locator("#article-title");
    await title.fill("Synthetic unsaved navigation guard check");
    await expect(
      page.getByText("Unsaved changes", { exact: true }),
    ).toBeVisible();

    const articlesLink = page
      .getByRole("link", { name: "Articles", exact: true })
      .first();
    await articlesLink.click();

    const dialog = page.getByRole("dialog", {
      name: "Leave with unsaved changes?",
    });
    await expect(dialog).toBeVisible();
    await dialog
      .getByRole("button", { name: "Stay and continue editing" })
      .click();
    await expect(page).toHaveURL(/\/admin\/articles\/new$/);
    await expect(articlesLink).toBeFocused();

    await articlesLink.click();
    await dialog.getByRole("button", { name: "Leave without saving" }).click();
    await expect(page).toHaveURL(/\/admin\/articles$/);
  });

  test("media placement clear requires confirmation and can be cancelled safely", async ({
    page,
  }) => {
    await page.goto("/admin/media");
    const clearButton = page.getByRole("button", { name: "Clear" }).first();

    if (await clearButton.isVisible()) {
      await clearButton.click();
      const dialog = page.getByRole("dialog", { name: /Clear .+\?/ });
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Cancel" }).click();
      await expect(dialog).not.toBeVisible();
      await expect(clearButton).toBeFocused();
    }
  });
});
