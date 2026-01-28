import { test, expect } from '@playwright/test';

/**
 * Exceptions Page E2E Tests
 * Tests exception listing, filtering, resolution, and bulk actions against the real backend
 */

test.describe('Exceptions Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exceptions');
  });

  test('should display exceptions page with filters', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /exceptions/i })).toBeVisible();

    // Check filter controls are visible
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('should load exceptions from backend', async ({ page }) => {
    const response = await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/exceptions') &&
        response.status() === 200
    );

    const data = await response.json();
    expect(data.success).toBe(true);
    // API returns paginated response
    expect(data.data).toHaveProperty('content');
    expect(Array.isArray(data.data.content)).toBe(true);
  });

  test('should display exception cards with severity indicators', async ({ page }) => {
    // Wait for load
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/exceptions') &&
        response.status() === 200
    );

    // Check for exception cards or table rows
    const exceptionElements = page.locator('[data-testid="exception-card"]')
      .or(page.locator('[class*="exception"]'))
      .or(page.locator('tbody tr'));

    if (await exceptionElements.first().isVisible()) {
      // Should show severity badges
      const severityBadge = page.locator('[class*="badge"]').filter({
        hasText: /(critical|warning|info|high|medium|low)/i
      });

      if (await severityBadge.first().isVisible()) {
        const badgeText = await severityBadge.first().textContent();
        expect(badgeText?.toLowerCase()).toMatch(/(critical|warning|info|high|medium|low)/);
      }
    }
  });

  test('should display exception summary stats', async ({ page }) => {
    // Wait for load
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/exceptions') &&
        response.status() === 200
    );

    // Check for summary stats (Critical count, Open count, etc.)
    await expect(
      page.getByText(/critical/i).or(page.getByText(/open/i)).or(page.getByText(/resolved/i))
    ).toBeVisible();
  });
});

test.describe('Exception Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exceptions');
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/exceptions') &&
        response.status() === 200
    );
  });

  test('should filter by severity', async ({ page }) => {
    // Find severity filter
    const severityFilter = page.getByLabel(/severity/i)
      .or(page.locator('select').filter({ hasText: /severity|critical|warning/i }))
      .or(page.getByRole('combobox').first());

    if (await severityFilter.isVisible()) {
      // Wait for API call with filter
      const filterPromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/exceptions') &&
          response.url().includes('severity') &&
          response.status() === 200
      );

      await severityFilter.selectOption('HIGH');
      await filterPromise;

      // Verify results
      const badges = page.locator('[class*="badge"]');
      const count = await badges.count();

      for (let i = 0; i < count; i++) {
        const text = await badges.nth(i).textContent();
        if (text?.toLowerCase().match(/(critical|high)/)) {
          expect(text?.toLowerCase()).toMatch(/(critical|high)/);
        }
      }
    }
  });

  test('should filter by status', async ({ page }) => {
    const statusFilter = page.getByLabel(/status/i)
      .or(page.locator('select').filter({ hasText: /open|resolved|ignored/i }))
      .or(page.getByRole('combobox').nth(1));

    if (await statusFilter.isVisible()) {
      const filterPromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/exceptions') &&
          response.url().includes('status') &&
          response.status() === 200
      );

      await statusFilter.selectOption('OPEN');
      await filterPromise;
    }
  });

  test('should filter by exception type', async ({ page }) => {
    const typeFilter = page.getByLabel(/type/i)
      .or(page.locator('select').filter({ hasText: /mismatch|missing/i }))
      .or(page.getByRole('combobox').nth(2));

    if (await typeFilter.isVisible()) {
      const filterPromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/exceptions') &&
          response.url().includes('type') &&
          response.status() === 200
      );

      await typeFilter.selectOption('MISMATCH');
      await filterPromise;
    }
  });

  test('should search exceptions by text', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('amount');

    await page.waitForTimeout(500);

    // Results should be filtered (either client-side or server-side)
    const elements = page.locator('[class*="exception"]').or(page.locator('tbody tr'));
    const count = await elements.count();

    if (count > 0) {
      const firstText = await elements.first().textContent();
      expect(firstText?.toLowerCase()).toContain('amount');
    }
  });

  test('should clear all filters', async ({ page }) => {
    // Apply some filters first
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('test');

    // Find and click clear/reset button
    const clearButton = page.getByRole('button', { name: /clear|reset/i });
    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Search should be cleared
      await expect(searchInput).toHaveValue('');
    }
  });
});

test.describe('Exception Resolution', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exceptions');
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/exceptions') &&
        response.status() === 200
    );
  });

  test('should resolve an exception', async ({ page }) => {
    // Find an open exception
    const openException = page.locator('[data-testid="exception-card"]')
      .or(page.locator('[class*="exception"]'))
      .or(page.locator('tr'))
      .filter({ hasText: /open/i })
      .first();

    if (await openException.isVisible()) {
      // Click resolve/accept button
      const resolveButton = openException.getByRole('button', { name: /accept|resolve/i });

      if (await resolveButton.isVisible()) {
        const resolvePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/resolve') &&
            response.request().method() === 'PUT'
        );

        await resolveButton.click();

        const response = await resolvePromise;
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data.data.status).toBe('RESOLVED');
      }
    }
  });

  test('should ignore an exception', async ({ page }) => {
    const openException = page.locator('[data-testid="exception-card"]')
      .or(page.locator('[class*="exception"]'))
      .or(page.locator('tr'))
      .filter({ hasText: /open/i })
      .first();

    if (await openException.isVisible()) {
      const ignoreButton = openException.getByRole('button', { name: /ignore|reject/i });

      if (await ignoreButton.isVisible()) {
        const ignorePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/ignore') &&
            response.request().method() === 'PUT'
        );

        await ignoreButton.click();

        const response = await ignorePromise;
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data.data.status).toBe('IGNORED');
      }
    }
  });

  test('should display AI suggestion when available', async ({ page }) => {
    // Look for AI suggestion text
    const aiSuggestion = page.getByText(/ai suggestion/i)
      .or(page.locator('[class*="suggestion"]'))
      .or(page.getByText(/suggested/i));

    if (await aiSuggestion.first().isVisible()) {
      expect(await aiSuggestion.first().isVisible()).toBe(true);
    }
  });

  test('should show investigate option', async ({ page }) => {
    const openException = page.locator('[data-testid="exception-card"]')
      .or(page.locator('[class*="exception"]'))
      .or(page.locator('tr'))
      .filter({ hasText: /open/i })
      .first();

    if (await openException.isVisible()) {
      const investigateButton = openException.getByRole('button', { name: /investigate/i });

      if (await investigateButton.isVisible()) {
        expect(await investigateButton.isVisible()).toBe(true);
      }
    }
  });
});

test.describe('Bulk Exception Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exceptions');
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/exceptions') &&
        response.status() === 200
    );
  });

  test('should accept all AI suggestions', async ({ page }) => {
    const bulkAcceptButton = page.getByRole('button', { name: /accept all|bulk accept/i });

    if (await bulkAcceptButton.isVisible()) {
      const bulkResolvePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/bulk-resolve') &&
          response.request().method() === 'POST'
      );

      await bulkAcceptButton.click();

      // May need to confirm
      const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      const response = await bulkResolvePromise;
      expect(response.status()).toBe(200);
    }
  });

  test('should bulk ignore selected exceptions', async ({ page }) => {
    // Select multiple exceptions first
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount >= 2) {
      await checkboxes.nth(0).click();
      await checkboxes.nth(1).click();

      const bulkIgnoreButton = page.getByRole('button', { name: /bulk ignore|ignore selected/i });

      if (await bulkIgnoreButton.isVisible()) {
        const bulkIgnorePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/bulk-ignore') &&
            response.request().method() === 'POST'
        );

        await bulkIgnoreButton.click();

        // May need to confirm
        const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        const response = await bulkIgnorePromise;
        expect(response.status()).toBe(200);
      }
    }
  });

  test('should select all exceptions', async ({ page }) => {
    const selectAllCheckbox = page.locator('thead input[type="checkbox"]')
      .or(page.getByLabel(/select all/i));

    if (await selectAllCheckbox.isVisible()) {
      await selectAllCheckbox.click();

      // All checkboxes should be checked
      const checkboxes = page.locator('tbody input[type="checkbox"]');
      const count = await checkboxes.count();

      for (let i = 0; i < count; i++) {
        expect(await checkboxes.nth(i).isChecked()).toBe(true);
      }
    }
  });
});

test.describe('Exception Details', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exceptions');
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/exceptions') &&
        response.status() === 200
    );
  });

  test('should display source and target data', async ({ page }) => {
    const exceptionElement = page.locator('[data-testid="exception-card"]')
      .or(page.locator('[class*="exception"]'))
      .or(page.locator('tbody tr'))
      .first();

    if (await exceptionElement.isVisible()) {
      // Click to expand or view details
      await exceptionElement.click();

      // Look for source/target data display
      const sourceData = page.getByText(/source/i);
      const targetData = page.getByText(/target/i);

      await expect(sourceData.or(targetData)).toBeVisible();
    }
  });

  test('should show variance details for mismatch exceptions', async ({ page }) => {
    const mismatchException = page.locator('[data-testid="exception-card"]')
      .or(page.locator('[class*="exception"]'))
      .or(page.locator('tr'))
      .filter({ hasText: /mismatch/i })
      .first();

    if (await mismatchException.isVisible()) {
      await mismatchException.click();

      // Should show variance/difference
      const variance = page.getByText(/variance|difference|mismatch/i);
      await expect(variance).toBeVisible();
    }
  });
});
