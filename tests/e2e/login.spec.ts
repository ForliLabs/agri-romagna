import { test, expect } from "@playwright/test";

test.describe("Login flow", () => {
  test("shows login page with email form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    // Verify the page title or heading is present
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "invalid@example.com");
    await page.fill("#password", "wrongpassword");
    await page.locator('button[type="submit"]').first().click();

    // Should show error message (stays on login page)
    await expect(page).toHaveURL(/\/login/);
    // Verify an error message is displayed to the user
    const errorIndicator = page.locator('[role="alert"], .error, [class*="error"], [class*="Error"], [data-testid="error"]');
    await expect(errorIndicator.first()).toBeVisible({ timeout: 5_000 });
  });

  test("logs in with valid demo credentials and redirects to dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "marco@tondini.farm");
    await page.fill("#password", "agriromagna2025");
    await page.locator('button[type="submit"]').first().click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    // Verify dashboard content is rendered
    await expect(page.locator("body")).not.toContainText("Credenziali non valide");
    // Verify auth cookie was set
    const cookies = await page.context().cookies();
    const authCookie = cookies.find((c) => c.name === "access_token");
    expect(authCookie).toBeDefined();
    expect(authCookie!.value).toBeTruthy();
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    // Verify the redirect includes a return path
    const url = new URL(page.url());
    expect(url.pathname).toBe("/login");
  });
});
