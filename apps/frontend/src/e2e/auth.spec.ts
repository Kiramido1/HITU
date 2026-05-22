import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/HITU Platform/);
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@hitu.edu');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@hitu.edu');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Click logout
    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL('/');
  });
});
