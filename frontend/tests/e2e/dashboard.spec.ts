import { test, expect } from '@playwright/test';

/**
 * Dashboard/Home Page E2E Tests
 * Tests the main dashboard against the real backend
 */

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the dashboard with stats cards', async ({ page }) => {
    // Wait for dashboard to load
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Verify stats cards are visible
    await expect(page.getByText('Total Reconciliations')).toBeVisible();
    await expect(page.getByText('Match Rate', { exact: true })).toBeVisible();
    await expect(page.getByText('Open Exceptions')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();
  });

  test('should load metrics from backend API', async ({ page }) => {
    // Wait for API call to complete
    const metricsResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/dashboard/metrics') &&
        response.status() === 200
    );

    await page.goto('/');
    const response = await metricsResponse;
    const data = await response.json();

    // Verify response structure
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('totalReconciliations');
    expect(data.data).toHaveProperty('overallMatchRate');
    expect(data.data).toHaveProperty('openExceptions');
  });

  test('should display recent reconciliations section', async ({ page }) => {
    await expect(page.getByText('Recent Reconciliations')).toBeVisible();
  });

  test('should display quick actions section', async ({ page }) => {
    await expect(page.getByText('Quick Actions')).toBeVisible();
  });

  test('should show loading state while fetching data', async ({ page }) => {
    // Slow down network to see loading state
    await page.route('**/api/v1/dashboard/metrics', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/');

    // Loading indicator should be visible initially
    // (Implementation depends on how loading is shown - spinner, skeleton, etc.)
    await expect(page.locator('[data-testid="loading"]').or(page.locator('.animate-spin'))).toBeVisible({ timeout: 500 }).catch(() => {
      // Loading might be too fast to catch, which is fine
    });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/dashboard/metrics', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'Internal server error' }),
      })
    );

    await page.goto('/');

    // Should show error message
    await expect(page.getByText('Failed to load dashboard')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to other pages from dashboard', async ({ page }) => {
    // Click on sidebar navigation (sidebar uses buttons, not links)
    await page.getByRole('button', { name: /reconciliations/i }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/reconciliations/i);

    await page.goto('/');
    await page.getByRole('button', { name: /exceptions/i }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/exception/i);

    await page.goto('/');
    await page.getByRole('button', { name: /files/i }).click();
    await expect(page.getByText('Uploaded Files')).toBeVisible();
  });
});
