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

  test("3. Automated WCAG A/AA accessibility scan of representative public and admin surfaces", async ({
    page,
  }) => {
    test.setTimeout(60000);

    const publicRoutes = [
      "/",
      "/contact",
      "/portfolio",
      "/blog/plain-language-clinical-protocol-summaries",
    ];

    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === "critical",
      );

      expect(
        criticalViolations.length,
        `Route ${route} has critical accessibility violations: ${JSON.stringify(criticalViolations, null, 2)}`,
      ).toBe(0);
    }

    // Admin surfaces scan
    await loginAsAdmin(page);
    const adminRoutes = [
      "/admin/comments",
      "/admin/messages",
      "/admin/settings",
      "/admin/portfolio",
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === "critical",
      );

      expect(
        criticalViolations.length,
        `Admin route ${route} has critical accessibility violations: ${JSON.stringify(criticalViolations, null, 2)}`,
      ).toBe(0);
    }
  });

  test("4. Runtime error and unhandled exception guard", async ({ page }) => {
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
