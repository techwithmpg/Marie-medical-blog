import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { ensureLocalSupabaseTarget } from "./helpers/local-only";
import { loginAsAdmin } from "./helpers/auth";

function readLocalEnvValue(name: string): string {
  const processValue = process.env[name]?.trim();

  if (processValue) {
    return processValue;
  }

  const envPath = path.resolve(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error(
      "Local E2E configuration error: " +
        name +
        " is unavailable and .env.local does not exist.",
    );
  }

  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(new RegExp("^" + name + "=(.+)$", "m"));
  const value = match?.[1]?.trim().replace(/^["']|["']$/g, "");

  if (!value) {
    throw new Error(
      "Local E2E configuration error: " + name + " is not configured.",
    );
  }

  return value;
}

function createLocalPublicSupabaseClient() {
  const url = readLocalEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = readLocalEnvValue(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );

  const parsed = new URL(url);

  if (
    parsed.protocol !== "http:" ||
    (parsed.hostname !== "127.0.0.1" && parsed.hostname !== "localhost") ||
    parsed.port !== "54321"
  ) {
    throw new Error(
      "HARD LOCAL GUARD: fallback verification may only query local Supabase.",
    );
  }

  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

test.beforeAll(() => {
  ensureLocalSupabaseTarget();
});

test.describe("Stage 9 Settings & Portfolio Featurings E2E", () => {
  test.describe.configure({ mode: "serial" });

  test("1. Settings validation, saving, and public site propagation", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/settings");
    await page.waitForLoadState("domcontentloaded");
    await page
      .locator('form[data-hydrated="true"]')
      .waitFor({ state: "attached", timeout: 10000 });

    await expect(
      page.getByRole("heading", { name: "Site Settings" }),
    ).toBeVisible();

    const titleInput = page.locator("#site_title");
    const taglineInput = page.locator("#tagline");
    const introInput = page.locator("#homepage_intro");
    const disclaimerInput = page.locator("#disclaimer_text");
    const seoInput = page.locator("#default_seo_description");

    await expect(titleInput).toBeVisible();

    // 1a. Test invalid partial social row (Label filled, URL blank)
    const addLinkBtn = page.getByRole("button", { name: "Add Link" });
    await expect(addLinkBtn).toBeVisible();
    await addLinkBtn.click();

    const labelInputs = page.locator('input[name="socialLabel"]');
    const urlInputs = page.locator('input[name="socialUrl"]');

    const lastLabelInput = labelInputs.last();
    const lastUrlInput = urlInputs.last();
    const addedSocialRowNumber = await labelInputs.count();

    await expect(lastLabelInput).toBeVisible();
    await lastLabelInput.fill("Synthetic Profile");
    await lastUrlInput.fill("");

    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(
      page.getByText(
        `Social link #${addedSocialRowNumber} ("Synthetic Profile") is missing a URL.`,
      ),
    ).toBeVisible();

    // 1b. Test non-HTTPS insecure URL
    await lastUrlInput.fill("http://example.invalid/stage9e");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(
      page.getByText(
        `Social link #${addedSocialRowNumber} ("Synthetic Profile") must use a secure HTTPS URL.`,
      ),
    ).toBeVisible();

    // 1c. Fill valid synthetic settings
    await titleInput.fill("Synthetic Stage 9E Publication");
    await taglineInput.fill("Synthetic browser verification tagline");
    await introInput.fill(
      "Synthetic Stage 9E homepage introduction used only for local browser testing.",
    );
    await disclaimerInput.fill(
      "Synthetic Stage 9E educational disclaimer for local browser verification only.",
    );
    await seoInput.fill(
      "Synthetic Stage 9E metadata placeholder for local verification.",
    );
    await lastUrlInput.fill("https://example.invalid/stage9e-profile");

    // Save valid settings
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(
      page.getByText("Site settings saved successfully."),
    ).toBeVisible({ timeout: 10000 });

    // 2. Verify public propagation on Homepage (/)
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Header site title
    await expect(
      page.getByText("Synthetic Stage 9E Publication").first(),
    ).toBeVisible();

    // Homepage intro
    await expect(
      page.getByText(
        "Synthetic Stage 9E homepage introduction used only for local browser testing.",
      ),
    ).toBeVisible();

    // Footer site title & social link
    const footerLink = page
      .locator('footer a[href="https://example.invalid/stage9e-profile"]')
      .filter({ hasText: "Synthetic Profile" })
      .first();

    await expect(footerLink).toBeVisible();
    await expect(footerLink).toHaveAttribute(
      "href",
      "https://example.invalid/stage9e-profile",
    );

    // Compact disclaimer on homepage
    await expect(
      page
        .getByText(
          "Synthetic Stage 9E educational disclaimer for local browser verification only.",
        )
        .first(),
    ).toBeVisible();

    // 3a. Verify the compact disclaimer on the approved contextual surfaces
    const disclaimerPagesToCheck = [
      "/contact",
      "/blog/plain-language-clinical-protocol-summaries",
    ];

    for (const route of disclaimerPagesToCheck) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await expect(
        page
          .getByText(
            "Synthetic Stage 9E educational disclaimer for local browser verification only.",
          )
          .first(),
      ).toBeVisible();
    }

    // 3b. About and Portfolio intentionally omit a standalone compact
    // disclaimer, while shared settings still propagate through the shell.
    const shellPagesToCheck = ["/about", "/portfolio"];

    for (const route of shellPagesToCheck) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await expect(
        page.getByText("Synthetic Stage 9E Publication").first(),
      ).toBeVisible();
    }

    // 4. Verify /disclaimer full page remains independent
    await page.goto("/disclaimer");
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByRole("heading", { name: "Medical & Educational Disclaimer" }),
    ).toBeVisible();
    // It should have full legal sections
    await expect(
      page.getByText("No Doctor-Patient Relationship"),
    ).toBeVisible();
  });

  test("2. Admin article preview fidelity with verified profile and settings disclaimer", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    // Open existing published synthetic article in admin editor
    await page.goto("/admin/articles/20000000-0000-0000-0000-000000000001");
    await page.waitForLoadState("domcontentloaded");

    // Click Preview button
    const previewBtn = page.getByRole("button", { name: "Preview" }).first();
    await expect(previewBtn).toBeVisible();
    await previewBtn.click();

    // Verify preview modal dialog opens
    const previewDialog = page.getByRole("dialog");
    await expect(previewDialog).toBeVisible();

    // Verify verified public author profile is rendered
    await expect(
      previewDialog.getByText("Synthetic Stage 6 Author").first(),
    ).toBeVisible();

    // Verify NO fabricated clinical credentials wording exists
    const previewContent = await previewDialog.textContent();
    expect(previewContent).not.toContain("Clinical pharmacist");
    expect(previewContent).not.toContain("clinical research synthesis");

    // Verify preview disclaimer displays the saved settings disclaimer value
    await expect(
      previewDialog.getByText(
        "Synthetic Stage 9E educational disclaimer for local browser verification only.",
      ),
    ).toBeVisible();

    // Test viewport switcher buttons in preview modal
    await previewDialog.getByRole("button", { name: "Tablet" }).click();
    await previewDialog.getByRole("button", { name: "Mobile" }).click();
    await previewDialog.getByRole("button", { name: "Desktop" }).click();

    // Close preview modal via Escape key
    await page.keyboard.press("Escape");
    await expect(previewDialog).not.toBeVisible();
  });

  test("3. Selected Writing curation and lead article fallback lifecycle", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/portfolio");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByRole("heading", { name: "Portfolio & Featuring" }),
    ).toBeVisible();

    // Verify draft and archived articles are NOT present in portfolio admin
    await expect(
      page.getByText("Draft Regulatory Document Structuring"),
    ).not.toBeVisible();
    await expect(
      page.getByText("Archived Historical Editorial Guidelines"),
    ).not.toBeVisible();

    // 1. Add "Synthetic — Comparative Analysis of Editorial Consistency in Trial Reports" to Selected Writing
    const articleTitle =
      "Synthetic — Comparative Analysis of Editorial Consistency in Trial Reports";

    const articleRow = page
      .locator("tr")
      .filter({ hasText: articleTitle })
      .first();
    await expect(articleRow).toBeVisible();

    const addBtn = articleRow.getByRole("button", {
      name: "Feature in Portfolio",
    });
    await addBtn.click();
    await page.waitForLoadState("networkidle");

    // Verify public /portfolio page now displays it
    await page.goto("/portfolio");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(articleTitle)).toBeVisible();

    // 2. Remove it from Selected Writing
    await page.goto("/admin/portfolio");
    await page.waitForLoadState("domcontentloaded");

    const updatedRow = page
      .locator("tr")
      .filter({ hasText: articleTitle })
      .first();
    const removeBtn = updatedRow.getByRole("button", {
      name: "Remove",
    });
    await removeBtn.click();
    await page.waitForLoadState("networkidle");

    // Verify public /portfolio no longer displays it
    await page.goto("/portfolio");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(articleTitle)).not.toBeVisible();

    // 3. Lead Article: Select explicit lead article
    await page.goto("/admin/portfolio");
    await page.waitForLoadState("domcontentloaded");

    const leadSelect = page.locator("#lead-article-select");
    const patientEduArticleId = "20000000-0000-0000-0000-000000000004";
    await leadSelect.selectOption(patientEduArticleId);

    await page.getByRole("button", { name: "Update Lead Article" }).click();
    await page.waitForLoadState("networkidle");

    // Verify public homepage highlights the selected lead article
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByRole("link", {
        name: "Synthetic — Structured Methods for Patient Education Materials",
        exact: true,
      }),
    ).toBeVisible();

    // 4. Lead Article: Reset to no explicit lead (fallback to newest published)
    await page.goto("/admin/portfolio");
    await page.waitForLoadState("domcontentloaded");

    await leadSelect.selectOption("");
    await page.getByRole("button", { name: "Update Lead Article" }).click();
    await page.waitForLoadState("networkidle");

    // Resolve the current newest public article instead of assuming mutable
    // local development data still has a specific synthetic seed as newest.
    const publicSupabase = createLocalPublicSupabaseClient();

    const { data: fallbackArticles, error: fallbackError } =
      await publicSupabase
        .from("articles")
        .select("title, slug")
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(1);

    expect(fallbackError).toBeNull();
    expect(fallbackArticles).toHaveLength(1);

    const fallbackArticle = fallbackArticles![0];

    // Verify the homepage uses the actual newest public article as fallback.
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const latestBadge = page.getByText("Latest", { exact: true }).first();
    await expect(latestBadge).toBeVisible();

    const latestLeadCard = latestBadge.locator("xpath=ancestor::article[1]");
    const fallbackSelector = 'a[href="/blog/' + fallbackArticle.slug + '"]';
    const fallbackLink = latestLeadCard.locator(fallbackSelector);

    await expect(fallbackLink).toBeVisible();
    await expect(fallbackLink).toContainText(fallbackArticle.title);
  });
});
