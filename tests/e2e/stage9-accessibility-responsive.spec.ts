import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ensureLocalSupabaseTarget } from "./helpers/local-only";
import { loginAsAdmin } from "./helpers/auth";

test.beforeAll(() => {
  ensureLocalSupabaseTarget();
});

test.describe("Stage 9 Accessibility, Responsive & Runtime Verification", () => {
  test("1. Responsive matrix and horizontal overflow check across viewports", async ({
    page,
  }) => {
    test.setTimeout(60000);
    const viewports = [
      { name: "Desktop", width: 1440, height: 900 },
      { name: "Tablet", width: 768, height: 1024 },
      { name: "Mobile", width: 390, height: 844 },
    ];

    const publicRoutes = [
      "/",
      "/about",
      "/contact",
      "/portfolio",
      "/blog",
      "/blog/plain-language-clinical-protocol-summaries",
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of publicRoutes) {
        await page.goto(route);
        await page.waitForLoadState("domcontentloaded");

        const hasHorizontalOverflow = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 1
          );
        });

        expect(
          hasHorizontalOverflow,
          `Route ${route} has horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`,
        ).toBe(false);
      }
    }

    // Check admin pages under all viewports
    await loginAsAdmin(page);
    const adminRoutes = [
      "/admin/comments",
      "/admin/messages",
      "/admin/settings",
      "/admin/portfolio",
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of adminRoutes) {
        await page.goto(route);
        await page.waitForLoadState("domcontentloaded");

        const hasHorizontalOverflow = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 1
          );
        });

        expect(
          hasHorizontalOverflow,
          `Admin route ${route} has horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`,
        ).toBe(false);
      }
    }
  });

  test("2. Keyboard navigation and focus flow in public contact and comment forms", async ({
    page,
  }) => {
    // 2a. Public contact keyboard navigation
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#contact-name").focus();
    await expect(page.locator("#contact-name")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("#contact-email")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("#contact-subject")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("#contact-message")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Send Inquiry" }),
    ).toBeFocused();

    // 2b. Public comment form keyboard navigation
    await page.goto("/blog/plain-language-clinical-protocol-summaries");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#commenter-name").focus();
    await expect(page.locator("#commenter-name")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("#commenter-email")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("#comment-body")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Submit Comment" }),
    ).toBeFocused();
  });

  test("3. Keyboard navigation and focus flow across admin surfaces & article preview", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    // 3a. Admin Settings keyboard focus & interactive controls
    await page.goto("/admin/settings");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector('form[data-hydrated="true"]');

    // Focus form fields
    await page.locator("#site_title").focus();
    await expect(page.locator("#site_title")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("#tagline")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("#homepage_intro")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("#disclaimer_text")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("#default_seo_description")).toBeFocused();

    const initialCount = await page
      .locator("input[name='socialLabel']")
      .count();

    // Add Link button keyboard focus and activation via Space
    const addLinkBtn = page.getByRole("button", { name: "Add Link" });
    await addLinkBtn.focus();
    await expect(addLinkBtn).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.locator("input[name='socialLabel']")).toHaveCount(
      initialCount + 1,
    );

    // Social link label and URL inputs
    const newSocialLabel = page.locator("input[name='socialLabel']").last();
    await expect(newSocialLabel).toBeVisible();
    await newSocialLabel.focus();
    await expect(newSocialLabel).toBeFocused();

    await page.keyboard.press("Tab");
    const newSocialUrl = page.locator("input[name='socialUrl']").last();
    await expect(newSocialUrl).toBeFocused();

    // Remove link button keyboard focus and activation via Space
    const removeLinkBtn = page.getByRole("button", { name: "Remove" }).last();
    await removeLinkBtn.focus();
    await expect(removeLinkBtn).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.locator("input[name='socialLabel']")).toHaveCount(
      initialCount,
    );

    // Save Settings button keyboard focus and activation via Enter
    const saveSettingsBtn = page.getByRole("button", { name: "Save Settings" });
    await saveSettingsBtn.focus();
    await expect(saveSettingsBtn).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(
      page.getByText(/Site settings saved successfully|saved successfully/i),
    ).toBeVisible();

    // 3b. Admin Comments moderation action button keyboard reachability via Tab
    await page.goto("/admin/comments");
    await page.waitForLoadState("domcontentloaded");

    const commentModerationBtn = page
      .getByRole("button", { name: /Approve|Hide|Delete/i })
      .first();
    if (await commentModerationBtn.isVisible()) {
      let isFocused = false;
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press("Tab");
        isFocused = await commentModerationBtn.evaluate(
          (el) => document.activeElement === el,
        );
        if (isFocused) break;
      }
      expect(isFocused).toBe(true);
    }

    // 3c. Admin Messages message list & reader pane keyboard focus
    await page.goto("/admin/messages");
    await page.waitForLoadState("domcontentloaded");

    const messageItem = page
      .locator("a[href*='messageId='], button[name='messageId']")
      .first();
    if (await messageItem.isVisible()) {
      await messageItem.focus();
      await expect(messageItem).toBeFocused();
      await page.keyboard.press("Enter");
      await page.waitForLoadState("domcontentloaded");

      const lifecycleBtn = page
        .getByRole("button", { name: /Mark Read|Archive|Restore/i })
        .first();
      if (await lifecycleBtn.isVisible()) {
        await lifecycleBtn.focus();
        await expect(lifecycleBtn).toBeFocused();
      }
    }

    // 3d. Article Preview keyboard open, Escape close, and focus return
    await page.goto("/admin/articles");
    await page.waitForLoadState("domcontentloaded");

    // Open first article editor
    const firstEditLink = page.locator("a[href^='/admin/articles/']").first();
    await firstEditLink.click();
    await page.waitForLoadState("domcontentloaded");

    const previewBtn = page.getByRole("button", { name: "Preview" });
    await expect(previewBtn).toBeVisible();

    await previewBtn.focus();
    await expect(previewBtn).toBeFocused();

    // Open preview via Space
    await page.keyboard.press("Space");
    await expect(page.getByText("Admin-Local Preview")).toBeVisible();

    // Close preview via Escape
    await page.keyboard.press("Escape");
    await expect(page.getByText("Admin-Local Preview")).not.toBeVisible();

    // Focus returns to Preview trigger button
    await expect(previewBtn).toBeFocused();
  });

  test("4. Automated WCAG A/AA/2.2 AA accessibility scan of representative public and admin surfaces", async ({
    page,
  }) => {
    test.setTimeout(90000);

    const publicRoutes = [
      "/",
      "/about",
      "/contact",
      "/portfolio",
      "/blog",
      "/blog/plain-language-clinical-protocol-summaries",
      "/disclaimer",
    ];

    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      const blockingViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );

      expect(
        blockingViolations,
        `Route ${route} has serious/critical accessibility violations: ${JSON.stringify(blockingViolations, null, 2)}`,
      ).toEqual([]);
    }

    // Admin surfaces scan
    await loginAsAdmin(page);
    const adminRoutes = [
      "/admin",
      "/admin/comments",
      "/admin/messages",
      "/admin/settings",
      "/admin/portfolio",
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      const blockingViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );

      expect(
        blockingViolations,
        `Admin route ${route} has serious/critical accessibility violations: ${JSON.stringify(blockingViolations, null, 2)}`,
      ).toEqual([]);
    }
  });

  test("5. Runtime error and unhandled exception guard", async ({ page }) => {
    const pageErrors: Error[] = [];
    const consoleErrors: string[] = [];

    page.on("pageerror", (err) => pageErrors.push(err));
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const routes = [
      "/",
      "/about",
      "/contact",
      "/portfolio",
      "/blog",
      "/blog/plain-language-clinical-protocol-summaries",
      "/disclaimer",
    ];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
    }

    expect(pageErrors.length, `Uncaught page errors: ${pageErrors}`).toBe(0);
    const filteredErrors = consoleErrors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("downloadable font") &&
        !e.includes("Failed to load resource") &&
        !e.includes("404") &&
        !e.includes("status of 404") &&
        !e.includes("WebSocket") &&
        !e.includes("_next/hmr"),
    );
    expect(
      filteredErrors,
      `Unexpected console errors: ${JSON.stringify(filteredErrors)}`,
    ).toEqual([]);
  });
});
