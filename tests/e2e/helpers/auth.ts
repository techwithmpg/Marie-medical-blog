import { type Page, expect } from "@playwright/test";

export const SYNTHETIC_ADMIN_EMAIL = "synthetic-admin@example.invalid";
export const SYNTHETIC_ADMIN_PASSWORD = "password";

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.waitForLoadState("domcontentloaded");

  // Fill synthetic admin credentials
  await page.locator("#admin-email").fill(SYNTHETIC_ADMIN_EMAIL);
  await page.locator("#admin-password").fill(SYNTHETIC_ADMIN_PASSWORD);

  // Submit login form
  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for an authenticated admin destination.
  // The login page itself must not satisfy this navigation wait.
  await page.waitForURL(
    (url) =>
      url.pathname.startsWith("/admin") && url.pathname !== "/admin/login",
    { timeout: 15000 },
  );

  await expect(page).not.toHaveURL(/\/admin\/login/);
}
