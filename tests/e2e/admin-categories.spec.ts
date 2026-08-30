import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ensureLocalSupabaseTarget } from "./helpers/local-only";
import { loginAsAdmin } from "./helpers/auth";

test.beforeAll(() => {
  ensureLocalSupabaseTarget();
});

test.describe("D035 Phase 1 Category Management", () => {
  test.describe.configure({ mode: "serial" });

  test("admin creates, edits, protects, and deletes Categories accessibly", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/categories");
    await expect(
      page.getByRole("heading", { name: "Category Management" }),
    ).toBeVisible();

    const newCategoryButton = page.getByRole("button", {
      name: "New Category",
    });
    await newCategoryButton.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: "New Category" }),
    ).toBeFocused();

    const uniqueSuffix = Date.now().toString();
    const originalName = `Synthetic — Phase 1 Category ${uniqueSuffix}`;
    const updatedName = `Synthetic — Updated Category ${uniqueSuffix}`;
    const manualSlug = `synthetic-phase-1-${uniqueSuffix}`;

    await page.getByLabel("Name *", { exact: true }).fill(originalName);
    await page.getByLabel("Slug *", { exact: true }).fill(manualSlug);
    await page
      .getByLabel("Description", { exact: true })
      .fill("Synthetic Category used only for local Phase 1 verification.");
    await page.getByRole("button", { name: "Create Category" }).click();
    await expect(page.getByRole("status")).toContainText("created");
    await expect(
      page.getByRole("button", { name: new RegExp(originalName) }),
    ).toBeVisible();

    await newCategoryButton.click();
    await page
      .getByLabel("Name *", { exact: true })
      .fill("Synthetic Duplicate");
    await page.getByLabel("Slug *", { exact: true }).fill(manualSlug);
    await page.getByRole("button", { name: "Create Category" }).click();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "Category URL is already in use" }),
    ).toBeVisible();

    await page.getByRole("button", { name: new RegExp(originalName) }).click();
    const permanentSlug = page.getByLabel("Permanent slug");
    await expect(permanentSlug).toHaveValue(manualSlug);
    await expect(permanentSlug).toHaveAttribute("readonly", "");
    await expect(
      page.getByText(
        "Category URLs are permanent after creation to preserve public topic links.",
      ),
    ).toBeVisible();

    await page.getByLabel("Name *", { exact: true }).fill(updatedName);
    await page
      .getByLabel("Description", { exact: true })
      .fill("Updated synthetic description for Category verification.");
    await page.getByRole("button", { name: "Save Category" }).click();
    await expect(page.getByRole("status")).toContainText("updated");
    await expect(permanentSlug).toHaveValue(manualSlug);

    await page.goto("/admin/articles/new");
    await expect(page.locator("#article-category")).toContainText(updatedName);

    await page.goto(`/topics/${manualSlug}`);
    await expect(
      page.getByRole("heading", { name: updatedName }),
    ).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/topics/${manualSlug}$`),
    );

    await page.goto("/admin/categories");
    await page
      .getByRole("button", {
        name: /Synthetic — Clinical Communications/,
      })
      .click();
    await page.getByRole("button", { name: "Review deletion" }).click();
    await expect(
      page.getByRole("heading", {
        name: "Delete Synthetic — Clinical Communications?",
      }),
    ).toBeFocused();
    await expect(page.getByText(/cannot be deleted/)).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "Delete Synthetic — Clinical Communications",
      }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: new RegExp(updatedName) }).click();
    await page.getByRole("button", { name: "Review deletion" }).click();
    await page.getByRole("button", { name: `Delete ${updatedName}` }).click();
    await expect(page.getByRole("status")).toContainText("deleted");
    await expect(
      page.getByRole("button", { name: new RegExp(updatedName) }),
    ).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin/categories");
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);

    const accessibility = await new AxeBuilder({ page }).analyze();
    const seriousOrCritical = accessibility.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );
    expect(seriousOrCritical).toEqual([]);
  });
});
