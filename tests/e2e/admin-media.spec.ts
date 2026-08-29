import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { ensureLocalSupabaseTarget } from "./helpers/local-only";
import { loginAsAdmin, SYNTHETIC_ADMIN_EMAIL, SYNTHETIC_ADMIN_PASSWORD } from "./helpers/auth";

const URL = "http://127.0.0.1:54321";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const ARTICLE_ID = "20000000-0000-0000-0000-000000000002";
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

test.beforeAll(() => ensureLocalSupabaseTarget());

test("Media upload, reuse, usage guard, keyboard focus, accessibility, and responsive layout", async ({ page }) => {
  test.setTimeout(90000);
  const run = Date.now().toString();
  const filename = `phase2-browser-${run}.png`;
  const admin = createClient(URL, ANON_KEY);
  expect((await admin.auth.signInWithPassword({ email: SYNTHETIC_ADMIN_EMAIL, password: SYNTHETIC_ADMIN_PASSWORD })).error).toBeNull();

  try {
    await loginAsAdmin(page);
    await page.goto("/admin/media");
    await expect(page.getByRole("heading", { name: "Media Management" })).toBeVisible();

    await page.locator("#media-upload-input").setInputFiles({ name: "not-an-image.txt", mimeType: "text/plain", buffer: Buffer.from("synthetic") });
    await expect(page.getByRole("alert").filter({ hasText: "Only JPEG, PNG, WebP, and AVIF" })).toBeVisible();

    await page.locator("#media-upload-input").setInputFiles({ name: "too-large.png", mimeType: "image/png", buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
    await expect(page.getByRole("alert").filter({ hasText: "must not exceed 5 MB" })).toBeVisible();

    await page.locator("#media-upload-input").setInputFiles({ name: filename, mimeType: "image/png", buffer: PNG });
    await expect(page.getByRole("status")).toContainText("Uploaded");
    await expect(page.getByText(new RegExp(filename), { exact: false }).first()).toBeVisible();

    await page.goto(`/admin/articles/${ARTICLE_ID}`);
    const pickerTrigger = page.getByRole("button", { name: "Choose from Media" }).first();
    await pickerTrigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Choose a featured image" })).toBeVisible();
    expect(await page.getByRole("dialog").evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
    const option = page.getByRole("option").filter({ hasText: filename });
    await expect(option).toBeVisible();
    await option.click();
    await page.getByRole("button", { name: "Use selected image" }).click();
    await expect(page.getByText("Alt text is required when a featured image is attached.")).toBeVisible();
    await page.getByLabel("Alt Text (Required) *").fill("Synthetic one-pixel image for local Media verification");
    await page.getByRole("button", { name: "Save Draft" }).click();
    await expect(page.getByText("Draft saved successfully.")).toBeVisible();

    const articleFolder = `articles/${ARTICLE_ID}/featured`;
    const copied = await admin.storage.from("draft-assets").list(articleFolder, { limit: 100 });
    expect(copied.error).toBeNull();
    expect((copied.data ?? []).filter((item) => item.name.includes(filename))).toHaveLength(1);

    await page.goto("/admin/media");
    const inUseCard = page.getByRole("button", { name: new RegExp(`Select asset .*${filename}`) }).filter({ hasText: "In Use" });
    await expect(inUseCard).toHaveCount(1);
    await inUseCard.click();
    await expect(page.locator("aside").getByText(/Cannot delete: Used in draft article/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete Asset" })).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin/media");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(accessibility.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  } finally {
    const articleFolder = `articles/${ARTICLE_ID}/featured`;
    const copied = await admin.storage.from("draft-assets").list(articleFolder, { limit: 100 });
    await admin.from("articles").update({ featured_image_path: null, featured_image_alt: null }).eq("id", ARTICLE_ID);
    const library = await admin.storage.from("draft-assets").list("library", { limit: 100, search: filename });
    await admin.storage.from("draft-assets").remove([
      ...(copied.data ?? []).filter((item) => item.name.includes(filename)).map((item) => `${articleFolder}/${item.name}`),
      ...(library.data ?? []).map((item) => `library/${item.name}`),
    ]);
  }
});
