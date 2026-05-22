import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@hitu.edu');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display dashboard overview', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Total Courses')).toBeVisible();
    await expect(page.locator('text=Total Halls')).toBeVisible();
    await expect(page.locator('text=Total Doctors')).toBeVisible();
  });

  test('should navigate to schedules page', async ({ page }) => {
    await page.click('text=Schedules');
    await page.waitForURL('/schedules');
    await expect(page.locator('text=Schedules')).toBeVisible();
  });

  test('should navigate to courses page', async ({ page }) => {
    await page.click('text=Courses');
    await page.waitForURL('/courses');
    await expect(page.locator('text=Courses')).toBeVisible();
  });

  test('should navigate to halls page', async ({ page }) => {
    await page.click('text=Halls');
    await page.waitForURL('/halls');
    await expect(page.locator('text=Halls')).toBeVisible();
  });

  test('should navigate to doctors page', async ({ page }) => {
    await page.click('text=Doctors');
    await page.waitForURL('/doctors');
    await expect(page.locator('text=Doctors')).toBeVisible();
  });

  test('should navigate to analytics page', async ({ page }) => {
    await page.click('text=Analytics');
    await page.waitForURL('/analytics');
    await expect(page.locator('text=Analytics')).toBeVisible();
  });
});
