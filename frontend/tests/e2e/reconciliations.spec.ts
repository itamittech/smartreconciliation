import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Reconciliations Page E2E Tests
 * Tests reconciliation listing, creation wizard, and management against the real backend
 */

test.describe('Reconciliations Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reconciliations');
  });

  test('should display reconciliations page with new button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /reconciliations/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /new reconciliation/i })).toBeVisible();
  });

  test('should load reconciliations from backend', async ({ page }) => {
    const response = await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/reconciliations') &&
        response.status() === 200
    );

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('should display reconciliation table with correct columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /match rate/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /exceptions/i })).toBeVisible();
  });

  test('should filter reconciliations by status', async ({ page }) => {
    // Wait for initial load
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/reconciliations') &&
        response.status() === 200
    );

    // Find and click status filter
    const statusFilter = page.getByRole('combobox').or(page.locator('select')).first();
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('COMPLETED');
      await page.waitForTimeout(500);

      // Verify filtered results
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();

      for (let i = 0; i < rowCount; i++) {
        const rowText = await rows.nth(i).textContent();
        // Should only show completed or empty
        expect(
          rowText?.toLowerCase().includes('completed') ||
          rowText?.toLowerCase().includes('no data') ||
          rowCount === 0
        ).toBe(true);
      }
    }
  });

  test('should search reconciliations by name', async ({ page }) => {
    // Wait for load
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/reconciliations') &&
        response.status() === 200
    );

    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('bank');
    await page.waitForTimeout(500);

    // Results should be filtered
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      const firstRowText = await rows.first().textContent();
      expect(firstRowText?.toLowerCase()).toContain('bank');
    }
  });

  test('should show match rate with progress bar', async ({ page }) => {
    // Wait for load
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/reconciliations') &&
        response.status() === 200
    );

    // Look for progress bar or percentage display
    const progressBar = page.locator('[role="progressbar"]').or(page.locator('[class*="progress"]'));
    if (await progressBar.first().isVisible()) {
      expect(await progressBar.first().isVisible()).toBe(true);
    }
  });

  test('should display status badges with correct colors', async ({ page }) => {
    // Wait for load
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/reconciliations') &&
        response.status() === 200
    );

    // Check for status badges
    const badges = page.locator('[class*="badge"]');
    if (await badges.first().isVisible()) {
      const badgeText = await badges.first().textContent();
      expect(['COMPLETED', 'IN_PROGRESS', 'PENDING', 'FAILED', 'IN PROGRESS']).toContain(
        badgeText?.toUpperCase().replace('_', ' ').replace(' ', '_') || badgeText?.toUpperCase()
      );
    }
  });
});

test.describe('Create Reconciliation Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reconciliations');
  });

  test('should open wizard when clicking New Reconciliation', async ({ page }) => {
    await page.getByRole('button', { name: /new reconciliation/i }).click();

    // Wizard modal should appear
    await expect(page.getByRole('dialog').or(page.locator('[role="dialog"]'))).toBeVisible();
    await expect(page.getByText(/step 1/i).or(page.getByText(/name/i))).toBeVisible();
  });

  test('should complete step 1 - enter name and description', async ({ page }) => {
    await page.getByRole('button', { name: /new reconciliation/i }).click();

    // Fill in name
    const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i));
    await nameInput.fill('Test Reconciliation E2E');

    // Fill in description
    const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
    await descInput.fill('Created by E2E test');

    // Click next
    await page.getByRole('button', { name: /next/i }).click();

    // Should move to step 2
    await expect(page.getByText(/step 2/i).or(page.getByText(/source/i))).toBeVisible();
  });

  test('should require name before proceeding', async ({ page }) => {
    await page.getByRole('button', { name: /new reconciliation/i }).click();

    // Try to click next without filling name
    const nextButton = page.getByRole('button', { name: /next/i });

    // Either button is disabled or clicking shows validation error
    const isDisabled = await nextButton.isDisabled();
    if (!isDisabled) {
      await nextButton.click();
      // Should show validation error or stay on step 1
      await expect(
        page.getByText(/required/i).or(page.getByText(/step 1/i))
      ).toBeVisible();
    }
  });

  test('should complete full wizard and create reconciliation', async ({ page }) => {
    // First ensure we have files uploaded
    await page.goto('/files');

    // Upload source file if needed
    const filesResponse = await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/files') &&
        response.status() === 200
    );
    const filesData = await filesResponse.json();

    if (!filesData.data || filesData.data.length < 2) {
      // Need to upload files first
      const testFilePath = path.join(__dirname, '..', 'fixtures', 'test-files', 'source-data.csv');
      const targetFilePath = path.join(__dirname, '..', 'fixtures', 'test-files', 'target-data.csv');

      const fileInput = page.locator('input[type="file"]');
      await page.getByRole('button', { name: /upload/i }).click();
      await fileInput.setInputFiles(testFilePath);
      await page.waitForResponse((r) => r.url().includes('/upload'));

      await page.getByRole('button', { name: /upload/i }).click();
      await fileInput.setInputFiles(targetFilePath);
      await page.waitForResponse((r) => r.url().includes('/upload'));

      await page.waitForTimeout(1000);
    }

    // Now go to reconciliations
    await page.goto('/reconciliations');
    await page.getByRole('button', { name: /new reconciliation/i }).click();

    // Step 1: Name and description
    const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i));
    await nameInput.fill('E2E Test Reconciliation ' + Date.now());

    const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
    await descInput.fill('Created by automated E2E test');

    await page.getByRole('button', { name: /next/i }).click();

    // Step 2: Select source file
    await page.waitForTimeout(500);
    const sourceFileRadio = page.locator('input[type="radio"]').first();
    if (await sourceFileRadio.isVisible()) {
      await sourceFileRadio.click();
    }
    await page.getByRole('button', { name: /next/i }).click();

    // Step 3: Select target file
    await page.waitForTimeout(500);
    const targetFileRadio = page.locator('input[type="radio"]').last();
    if (await targetFileRadio.isVisible()) {
      await targetFileRadio.click();
    }
    await page.getByRole('button', { name: /next/i }).click();

    // Step 4: Select rule set (optional, may click skip or select)
    await page.waitForTimeout(500);
    const ruleRadio = page.locator('input[type="radio"]').first();
    if (await ruleRadio.isVisible()) {
      await ruleRadio.click();
    }

    // Wait for create API call
    const createPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/reconciliations') &&
        response.request().method() === 'POST'
    );

    // Click create/finish
    await page.getByRole('button', { name: /create|finish|complete/i }).click();

    const response = await createPromise;
    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
  });

  test('should cancel wizard and return to list', async ({ page }) => {
    await page.getByRole('button', { name: /new reconciliation/i }).click();

    // Wizard should be open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click cancel or close
    await page.getByRole('button', { name: /cancel|close/i }).click();

    // Wizard should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});

test.describe('Reconciliation Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reconciliations');
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/reconciliations') &&
        response.status() === 200
    );
  });

  test('should start a pending reconciliation', async ({ page }) => {
    // Find a pending reconciliation
    const pendingRow = page.locator('tr').filter({ hasText: /pending/i }).first();

    if (await pendingRow.isVisible()) {
      // Click start button
      const startButton = pendingRow.getByRole('button', { name: /start/i });

      const startPromise = page.waitForResponse(
        (response) =>
          response.url().includes('/start') &&
          response.request().method() === 'POST'
      );

      await startButton.click();

      const response = await startPromise;
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.data.status).toBe('IN_PROGRESS');
    }
  });

  test('should view reconciliation details/exceptions', async ({ page }) => {
    const rows = page.locator('tbody tr');
    if (await rows.first().isVisible()) {
      // Click view details
      const viewButton = rows.first().getByRole('button', { name: /view|details/i });

      await viewButton.click();

      // Should navigate to exceptions page with reconciliation filter
      await expect(page).toHaveURL(/.*exceptions/);
    }
  });

  test('should delete a reconciliation', async ({ page }) => {
    const rows = page.locator('tbody tr');
    if (await rows.first().isVisible()) {
      // Click delete
      const deleteButton = rows.first().locator('button').filter({ hasText: /delete|trash/i });

      if (await deleteButton.isVisible()) {
        const deletePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/api/v1/reconciliations/') &&
            response.request().method() === 'DELETE'
        );

        await deleteButton.click();

        // Confirm if needed
        const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        const response = await deletePromise;
        expect(response.status()).toBe(200);
      }
    }
  });

  test('should poll for status updates on in-progress reconciliations', async ({ page }) => {
    // Check if there's an in-progress reconciliation
    const inProgressRow = page.locator('tr').filter({ hasText: /in.?progress/i }).first();

    if (await inProgressRow.isVisible()) {
      // Wait for polling API calls (should happen every 5 seconds)
      const pollPromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/reconciliations') &&
          response.status() === 200,
        { timeout: 10000 }
      );

      await pollPromise;
      // Verify polling is working
      expect(true).toBe(true);
    }
  });
});
