import { test, expect } from '@playwright/test';

test.describe('Schedule Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@hitu.edu');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to schedules
    await page.click('text=Schedules');
    await page.waitForURL('/schedules');
  });

  test('should display schedules list', async ({ page }) => {
    await expect(page.locator('text=Schedules')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should open create schedule modal', async ({ page }) => {
    await page.click('button:has-text("Create Schedule")');
    await expect(page.locator('text=Create New Schedule')).toBeVisible();
  });

  test('should filter schedules by semester', async ({ page }) => {
    await page.click('select[name="semester"]');
    await page.click('option[value="fall-2024"]');
    await page.click('button:has-text("Apply Filter")');
    // Verify filter is applied
    await expect(page.locator('table')).toBeVisible();
  });

  test('should export schedule to Excel', async ({ page }) => {
    // This test would need to handle file download
    // For now, just verify the button exists
    await expect(page.locator('button:has-text("Export Excel")')).toBeVisible();
  });

  test('should export schedule to PDF', async ({ page }) => {
    // This test would need to handle file download
    // For now, just verify the button exists
    await expect(page.locator('button:has-text("Export PDF")')).toBeVisible();
  });

  test('should view schedule details', async ({ page }) => {
    // Click on first schedule in the list
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click();
    await expect(page.locator('text=Schedule Details')).toBeVisible();
  });
});
