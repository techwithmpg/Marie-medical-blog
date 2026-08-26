import { test, expect } from "@playwright/test";
import { ensureLocalSupabaseTarget } from "./helpers/local-only";
import { loginAsAdmin } from "./helpers/auth";

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

    await expect(lastLabelInput).toBeVisible();
    await lastLabelInput.fill("Synthetic Profile");
    await lastUrlInput.fill("");

    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(
      page.getByText('Social link #1 ("Synthetic Profile") is missing a URL.'),
    ).toBeVisible();

    // 1b. Test non-HTTPS insecure URL
    await lastUrlInput.fill("http://example.invalid/stage9e");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(
      page.getByText(
        'Social link #1 ("Synthetic Profile") must use a secure HTTPS URL.',
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
    const footerLink = page.getByRole("link", { name: "Synthetic Profile" });
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

    // 3. Verify compact disclaimer propagation to other public pages
    const pagesToCheck = [
      "/about",
      "/contact",
      "/portfolio",
      "/blog/plain-language-clinical-protocol-summaries",
    ];

    for (const route of pagesToCheck) {
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
      page.getByText(
        "Synthetic — Structured Methods for Patient Education Materials",
      ),
    ).toBeVisible();

    // 4. Lead Article: Reset to no explicit lead (fallback to newest published)
    await page.goto("/admin/portfolio");
    await page.waitForLoadState("domcontentloaded");

    await leadSelect.selectOption("");
    await page.getByRole("button", { name: "Update Lead Article" }).click();
    await page.waitForLoadState("networkidle");

    // Verify public homepage falls back to newest published article
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByText(
        "Synthetic — Methodologies for Scientific Typography in Editorial Layouts",
      ),
    ).toBeVisible();
  });
});
