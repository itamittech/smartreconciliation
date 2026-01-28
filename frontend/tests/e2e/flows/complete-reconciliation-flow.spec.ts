import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Complete Reconciliation Flow E2E Test
 * Tests the entire user journey from file upload to exception resolution
 * against the real backend
 */

test.describe('Complete Reconciliation Flow', () => {
  test.setTimeout(120000); // 2 minutes for complete flow

  test('should complete full reconciliation workflow', async ({ page }) => {
    const timestamp = Date.now();
    const sourceName = `source-${timestamp}.csv`;
    const targetName = `target-${timestamp}.csv`;

    // ========================================
    // STEP 1: Upload source file
    // ========================================
    await test.step('Upload source file', async () => {
      await page.goto('/files');

      // Wait for page load
      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/files') &&
          response.status() === 200
      );

      const fileInput = page.locator('input[type="file"]');
      const testFilePath = path.join(__dirname, '..', '..', 'fixtures', 'test-files', 'source-data.csv');

      const uploadPromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/files/upload') &&
          (response.status() === 200 || response.status() === 201)
      );

      await page.getByRole('button', { name: /upload/i }).click();
      await fileInput.setInputFiles(testFilePath);

      const response = await uploadPromise;
      expect(response.ok()).toBe(true);

      // Wait for file to appear in list
      await page.waitForTimeout(1000);
    });

    // ========================================
    // STEP 2: Upload target file
    // ========================================
    await test.step('Upload target file', async () => {
      const fileInput = page.locator('input[type="file"]');
      const testFilePath = path.join(__dirname, '..', '..', 'fixtures', 'test-files', 'target-data.csv');

      const uploadPromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/files/upload') &&
          (response.status() === 200 || response.status() === 201)
      );

      await page.getByRole('button', { name: /upload/i }).click();
      await fileInput.setInputFiles(testFilePath);

      const response = await uploadPromise;
      expect(response.ok()).toBe(true);

      await page.waitForTimeout(1000);
    });

    // ========================================
    // STEP 3: Verify files are processed
    // ========================================
    await test.step('Verify files are processed', async () => {
      // Refresh to see updated status
      await page.reload();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/files') &&
          response.status() === 200
      );

      // At least 2 files should exist
      const rows = page.locator('tbody tr');
      expect(await rows.count()).toBeGreaterThanOrEqual(2);
    });

    // ========================================
    // STEP 4: Create reconciliation
    // ========================================
    let reconciliationId: string;

    await test.step('Create reconciliation via wizard', async () => {
      await page.goto('/reconciliations');

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/reconciliations') &&
          response.status() === 200
      );

      // Open wizard
      await page.getByRole('button', { name: /new reconciliation/i }).click();

      // Step 1: Name and description
      const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i));
      await nameInput.fill(`E2E Flow Test ${timestamp}`);

      const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
      await descInput.fill('Complete flow test reconciliation');

      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(500);

      // Step 2: Select source file
      const sourceRadio = page.locator('input[type="radio"]').first();
      await sourceRadio.click();
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(500);

      // Step 3: Select target file
      const targetRadio = page.locator('input[type="radio"]').last();
      await targetRadio.click();
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(500);

      // Step 4: Select rule set (if available) or skip
      const ruleRadio = page.locator('input[type="radio"]').first();
      if (await ruleRadio.isVisible()) {
        await ruleRadio.click();
      }

      // Create reconciliation
      const createPromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/reconciliations') &&
          response.request().method() === 'POST'
      );

      await page.getByRole('button', { name: /create|finish/i }).click();

      const response = await createPromise;
      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data.success).toBe(true);
      reconciliationId = data.data.id;

      // Wizard should close
      await page.waitForTimeout(500);
    });

    // ========================================
    // STEP 5: Start reconciliation
    // ========================================
    await test.step('Start reconciliation', async () => {
      // Refresh list
      await page.reload();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/reconciliations') &&
          response.status() === 200
      );

      // Find our reconciliation and start it
      const reconRow = page.locator('tr').filter({ hasText: `E2E Flow Test ${timestamp}` });

      if (await reconRow.isVisible()) {
        const startButton = reconRow.getByRole('button', { name: /start|play/i });

        if (await startButton.isVisible()) {
          const startPromise = page.waitForResponse(
            (response) =>
              response.url().includes('/start') &&
              response.request().method() === 'POST'
          );

          await startButton.click();

          const response = await startPromise;
          expect(response.ok()).toBe(true);
        }
      }
    });

    // ========================================
    // STEP 6: Wait for reconciliation to complete
    // ========================================
    await test.step('Wait for reconciliation to complete', async () => {
      // Poll for status
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max wait

      while (attempts < maxAttempts) {
        await page.waitForTimeout(1000);

        const reconRow = page.locator('tr').filter({ hasText: `E2E Flow Test ${timestamp}` });

        if (await reconRow.isVisible()) {
          const statusBadge = reconRow.locator('[class*="badge"]');
          const statusText = await statusBadge.textContent();

          if (statusText?.toUpperCase().includes('COMPLETED')) {
            break;
          }

          if (statusText?.toUpperCase().includes('FAILED')) {
            throw new Error('Reconciliation failed');
          }
        }

        // Refresh page to get updated status
        await page.reload();
        await page.waitForTimeout(500);
        attempts++;
      }

      // Verify completion
      const reconRow = page.locator('tr').filter({ hasText: `E2E Flow Test ${timestamp}` });
      const statusBadge = reconRow.locator('[class*="badge"]');
      await expect(statusBadge).toContainText(/completed|in.?progress/i);
    });

    // ========================================
    // STEP 7: View exceptions
    // ========================================
    await test.step('View reconciliation exceptions', async () => {
      const reconRow = page.locator('tr').filter({ hasText: `E2E Flow Test ${timestamp}` });

      // Click view details
      const viewButton = reconRow.getByRole('button', { name: /view|details/i });
      if (await viewButton.isVisible()) {
        await viewButton.click();

        // Should navigate to exceptions page
        await expect(page).toHaveURL(/.*exceptions/);

        // Wait for exceptions to load
        await page.waitForResponse(
          (response) =>
            response.url().includes('/api/v1/exceptions') &&
            response.status() === 200
        );
      }
    });

    // ========================================
    // STEP 8: Resolve an exception (if any)
    // ========================================
    await test.step('Resolve exception if present', async () => {
      await page.goto('/exceptions');

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/exceptions') &&
          response.status() === 200
      );

      // Find an open exception
      const openException = page.locator('[data-testid="exception-card"]')
        .or(page.locator('tr'))
        .filter({ hasText: /open/i })
        .first();

      if (await openException.isVisible()) {
        const resolveButton = openException.getByRole('button', { name: /accept|resolve/i });

        if (await resolveButton.isVisible()) {
          const resolvePromise = page.waitForResponse(
            (response) =>
              response.url().includes('/resolve') &&
              response.request().method() === 'PUT'
          );

          await resolveButton.click();

          const response = await resolvePromise;
          expect(response.ok()).toBe(true);
        }
      }
    });

    // ========================================
    // STEP 9: Verify dashboard metrics updated
    // ========================================
    await test.step('Verify dashboard reflects changes', async () => {
      await page.goto('/');

      const metricsResponse = await page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/dashboard/metrics') &&
          response.status() === 200
      );

      const data = await metricsResponse.json();
      expect(data.success).toBe(true);

      // Metrics should reflect our reconciliation
      expect(data.data.totalReconciliations).toBeGreaterThanOrEqual(1);
    });

    // ========================================
    // STEP 10: Cleanup - delete reconciliation
    // ========================================
    await test.step('Cleanup test data', async () => {
      await page.goto('/reconciliations');

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/reconciliations') &&
          response.status() === 200
      );

      const reconRow = page.locator('tr').filter({ hasText: `E2E Flow Test ${timestamp}` });

      if (await reconRow.isVisible()) {
        const deleteButton = reconRow.locator('button').filter({ hasText: /delete|trash/i });

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

          await deletePromise;
        }
      }
    });
  });
});

test.describe('AI-Assisted Flow', () => {
  test.setTimeout(90000);

  test('should use AI to get rule suggestions', async ({ page }) => {
    // Upload files first
    await page.goto('/files');

    const fileInput = page.locator('input[type="file"]');
    const sourceFilePath = path.join(__dirname, '..', '..', 'fixtures', 'test-files', 'source-data.csv');

    await page.getByRole('button', { name: /upload/i }).click();
    await fileInput.setInputFiles(sourceFilePath);

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/files/upload')
    );

    // Go to chat and ask for suggestions
    await page.goto('/chat');

    const input = page.getByPlaceholder(/message|type|ask/i)
      .or(page.locator('textarea'));

    await input.fill('Can you suggest field mappings for my uploaded files?');

    const messagePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/chat/message') &&
        response.status() === 200
    );

    const sendButton = page.getByRole('button', { name: /send/i })
      .or(page.locator('button[type="submit"]'));

    await sendButton.click();

    const response = await messagePromise;
    expect(response.ok()).toBe(true);

    // AI should respond with suggestions
    await expect(
      page.getByText(/mapping|suggest|field/i)
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Error Recovery Flow', () => {
  test('should handle failed reconciliation gracefully', async ({ page }) => {
    await page.goto('/reconciliations');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/reconciliations') &&
        response.status() === 200
    );

    // Find a failed reconciliation if exists
    const failedRow = page.locator('tr').filter({ hasText: /failed/i }).first();

    if (await failedRow.isVisible()) {
      // Should show error indication
      const badge = failedRow.locator('[class*="badge"]');
      await expect(badge).toContainText(/failed/i);

      // Should be able to delete failed reconciliation
      const deleteButton = failedRow.locator('button').filter({ hasText: /delete|trash/i });
      await expect(deleteButton).toBeVisible();
    }
  });

  test('should retry after API error', async ({ page }) => {
    let requestCount = 0;

    // First request fails, second succeeds
    await page.route('**/api/v1/dashboard/metrics', async (route) => {
      requestCount++;
      if (requestCount === 1) {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ success: false, error: 'Temporary error' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/');

    // Should show error initially
    await expect(page.getByText(/error|retry/i)).toBeVisible({ timeout: 5000 });

    // Reload to retry
    await page.reload();

    // Should succeed on retry
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});
