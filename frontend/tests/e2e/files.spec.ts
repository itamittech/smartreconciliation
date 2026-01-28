import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Files Page E2E Tests
 * Tests file upload, listing, preview, and deletion against the real backend
 */

test.describe('Files Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/files');
  });

  test('should display files page with upload button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /files/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /upload/i })).toBeVisible();
  });

  test('should load files list from backend', async ({ page }) => {
    // Wait for files API call
    const filesResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/files') &&
        response.status() === 200
    );

    await page.goto('/files');
    const response = await filesResponse;
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('should display file table with correct columns', async ({ page }) => {
    // Check table headers
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /size/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /rows/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /columns/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
  });

  test('should upload a CSV file successfully', async ({ page }) => {
    // Prepare file input
    const fileInput = page.locator('input[type="file"]');

    // Create test file path
    const testFilePath = path.join(__dirname, '..', 'fixtures', 'test-files', 'source-data.csv');

    // Wait for upload API response
    const uploadPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/files/upload') &&
        (response.status() === 200 || response.status() === 201)
    );

    // Click upload button and select file
    await page.getByRole('button', { name: /upload/i }).click();
    await fileInput.setInputFiles(testFilePath);

    // Wait for upload to complete
    const response = await uploadPromise;
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data).toHaveProperty('filename');

    // Verify file appears in list (may need to wait for refetch)
    await page.waitForTimeout(1000);
    await expect(page.getByText('source-data.csv')).toBeVisible();
  });

  test('should show file preview when clicking preview button', async ({ page }) => {
    // First ensure there are files
    const filesResponse = await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/files') &&
        response.status() === 200
    );
    const filesData = await filesResponse.json();

    if (filesData.data && filesData.data.length > 0) {
      // Click preview on first file
      const previewButton = page.locator('[data-testid="preview-button"]').first()
        .or(page.getByRole('button', { name: /preview/i }).first())
        .or(page.locator('button').filter({ hasText: /eye/i }).first());

      await previewButton.click();

      // Wait for preview modal and API call
      const previewResponse = page.waitForResponse(
        (response) =>
          response.url().includes('/preview') &&
          response.status() === 200
      );

      await previewResponse;

      // Modal should be visible with data
      await expect(page.getByRole('dialog').or(page.locator('[role="dialog"]'))).toBeVisible();
    }
  });

  test('should delete a file', async ({ page }) => {
    // Wait for files to load
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/files') &&
        response.status() === 200
    );

    // Check if there are files to delete
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Click delete on first file
      const deleteButton = page.locator('[data-testid="delete-button"]').first()
        .or(page.getByRole('button', { name: /delete/i }).first())
        .or(page.locator('button').filter({ hasText: /trash/i }).first());

      // Wait for delete API call
      const deletePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/files/') &&
          response.request().method() === 'DELETE'
      );

      await deleteButton.click();

      // May need to confirm deletion
      const confirmButton = page.getByRole('button', { name: /confirm/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      const response = await deletePromise;
      expect(response.status()).toBe(200);
    }
  });

  test('should search files by name', async ({ page }) => {
    // Wait for files to load
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/files') &&
        response.status() === 200
    );

    // Type in search box
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('source');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Verify filtered results
    const rows = page.locator('tbody tr');
    const visibleRows = await rows.count();

    // All visible rows should contain 'source' in filename
    for (let i = 0; i < visibleRows; i++) {
      const rowText = await rows.nth(i).textContent();
      // Either contains search term or no results message
      expect(rowText?.toLowerCase().includes('source') || visibleRows === 0).toBe(true);
    }
  });

  test('should display file size in human-readable format', async ({ page }) => {
    // Wait for files to load
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/files') &&
        response.status() === 200
    );

    // Check that file sizes are displayed with units (KB, MB, etc.)
    const sizeCell = page.locator('td').filter({ hasText: /(KB|MB|GB|B)/i }).first();
    if (await sizeCell.isVisible()) {
      const sizeText = await sizeCell.textContent();
      expect(sizeText).toMatch(/\d+(\.\d+)?\s*(B|KB|MB|GB)/i);
    }
  });

  test('should show appropriate status badges', async ({ page }) => {
    // Wait for files to load
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/files') &&
        response.status() === 200
    );

    // Check for status badges
    const statusBadges = page.locator('[class*="badge"]').or(page.locator('[data-testid="status-badge"]'));
    if (await statusBadges.first().isVisible()) {
      const badgeText = await statusBadges.first().textContent();
      expect(['PROCESSED', 'PROCESSING', 'FAILED', 'READY']).toContain(badgeText?.toUpperCase());
    }
  });
});

test.describe('File Upload Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/files');
  });

  test('should accept CSV files', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const acceptAttribute = await fileInput.getAttribute('accept');

    expect(acceptAttribute).toContain('.csv');
  });

  test('should accept Excel files', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const acceptAttribute = await fileInput.getAttribute('accept');

    expect(acceptAttribute).toContain('.xlsx');
    expect(acceptAttribute).toContain('.xls');
  });
});
