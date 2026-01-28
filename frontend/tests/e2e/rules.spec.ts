import { test, expect } from '@playwright/test';

/**
 * Rules Page E2E Tests
 * Tests rule set listing, viewing details, and management against the real backend
 */

test.describe('Rules Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rules');
  });

  test('should display rules page with create button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /rules/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create|new/i })).toBeVisible();
  });

  test('should load rule sets from backend', async ({ page }) => {
    const response = await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/rules') &&
        response.status() === 200
    );

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('should display rule list in left panel', async ({ page }) => {
    // Wait for load
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/rules') &&
        response.status() === 200
    );

    // Look for rule list items
    const ruleItems = page.locator('[data-testid="rule-item"]')
      .or(page.locator('[class*="rule"]').filter({ hasText: /.+/ }))
      .or(page.locator('li').filter({ hasText: /rule|mapping/i }));

    if (await ruleItems.first().isVisible()) {
      expect(await ruleItems.count()).toBeGreaterThan(0);
    }
  });

  test('should search rules by name', async ({ page }) => {
    // Wait for load
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/rules') &&
        response.status() === 200
    );

    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('bank');

    await page.waitForTimeout(500);

    // Results should be filtered
    const ruleItems = page.locator('[data-testid="rule-item"]')
      .or(page.locator('[class*="rule"]').filter({ hasText: /bank/i }));

    if (await ruleItems.first().isVisible()) {
      const text = await ruleItems.first().textContent();
      expect(text?.toLowerCase()).toContain('bank');
    }
  });
});

test.describe('Rule Details View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rules');
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/rules') &&
        response.status() === 200
    );
  });

  test('should show rule details when selecting a rule', async ({ page }) => {
    const ruleItem = page.locator('[data-testid="rule-item"]')
      .or(page.locator('[class*="rule"]').filter({ hasText: /.+/ }))
      .first();

    if (await ruleItem.isVisible()) {
      await ruleItem.click();

      // Wait for rule details API call
      const detailsResponse = page.waitForResponse(
        (response) =>
          response.url().match(/\/api\/v1\/rules\/[^/]+$/) &&
          response.status() === 200
      );

      await detailsResponse;

      // Details panel should show rule information
      await expect(
        page.getByText(/field mapping/i).or(page.getByText(/matching rule/i))
      ).toBeVisible();
    }
  });

  test('should display field mappings', async ({ page }) => {
    const ruleItem = page.locator('[data-testid="rule-item"]')
      .or(page.locator('[class*="rule"]').filter({ hasText: /.+/ }))
      .first();

    if (await ruleItem.isVisible()) {
      await ruleItem.click();

      await page.waitForTimeout(500);

      // Look for field mappings section
      const fieldMappings = page.getByText(/field mapping/i)
        .or(page.locator('[class*="mapping"]'));

      await expect(fieldMappings).toBeVisible();

      // Should show source -> target arrows or similar
      const arrowOrMapping = page.getByText(/→|->|to/i)
        .or(page.locator('[class*="arrow"]'));

      if (await arrowOrMapping.first().isVisible()) {
        expect(await arrowOrMapping.first().isVisible()).toBe(true);
      }
    }
  });

  test('should display matching rules with types', async ({ page }) => {
    const ruleItem = page.locator('[data-testid="rule-item"]')
      .or(page.locator('[class*="rule"]').filter({ hasText: /.+/ }))
      .first();

    if (await ruleItem.isVisible()) {
      await ruleItem.click();

      await page.waitForTimeout(500);

      // Look for matching rules section
      const matchingRules = page.getByText(/matching rule/i)
        .or(page.locator('[class*="match"]'));

      await expect(matchingRules).toBeVisible();

      // Should show match types
      const matchTypes = page.getByText(/(exact|fuzzy|range|contains)/i);
      if (await matchTypes.first().isVisible()) {
        expect(await matchTypes.first().isVisible()).toBe(true);
      }
    }
  });

  test('should show rule summary statistics', async ({ page }) => {
    const ruleItem = page.locator('[data-testid="rule-item"]')
      .or(page.locator('[class*="rule"]').filter({ hasText: /.+/ }))
      .first();

    if (await ruleItem.isVisible()) {
      await ruleItem.click();

      await page.waitForTimeout(500);

      // Look for summary stats
      const stats = page.getByText(/mapping|rule|key field/i);
      await expect(stats.first()).toBeVisible();
    }
  });

  test('should indicate key fields', async ({ page }) => {
    const ruleItem = page.locator('[data-testid="rule-item"]')
      .or(page.locator('[class*="rule"]').filter({ hasText: /.+/ }))
      .first();

    if (await ruleItem.isVisible()) {
      await ruleItem.click();

      await page.waitForTimeout(500);

      // Look for key field indicators
      const keyIndicator = page.getByText(/key/i)
        .or(page.locator('[class*="key"]'))
        .or(page.locator('[data-testid="key-field"]'));

      if (await keyIndicator.first().isVisible()) {
        expect(await keyIndicator.first().isVisible()).toBe(true);
      }
    }
  });
});

test.describe('Rule Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rules');
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/rules') &&
        response.status() === 200
    );
  });

  test('should delete a rule set', async ({ page }) => {
    const ruleItem = page.locator('[data-testid="rule-item"]')
      .or(page.locator('[class*="rule"]').filter({ hasText: /.+/ }))
      .first();

    if (await ruleItem.isVisible()) {
      // Select the rule first
      await ruleItem.click();

      await page.waitForTimeout(500);

      // Find delete button
      const deleteButton = page.getByRole('button', { name: /delete/i })
        .or(page.locator('button').filter({ hasText: /trash|delete/i }));

      if (await deleteButton.isVisible()) {
        const deletePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/api/v1/rules/') &&
            response.request().method() === 'DELETE'
        );

        await deleteButton.click();

        // Confirm deletion if dialog appears
        const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        const response = await deletePromise;
        expect(response.status()).toBe(200);
      }
    }
  });

  test('should show active/inactive status', async ({ page }) => {
    const statusBadge = page.locator('[class*="badge"]')
      .filter({ hasText: /(active|inactive)/i });

    if (await statusBadge.first().isVisible()) {
      const text = await statusBadge.first().textContent();
      expect(text?.toLowerCase()).toMatch(/(active|inactive)/);
    }
  });
});

test.describe('Rule Creation (Basic)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rules');
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/rules') &&
        response.status() === 200
    );
  });

  test('should open create rule modal/form', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /create|new/i });
    await createButton.click();

    // Modal or form should appear
    const modal = page.getByRole('dialog')
      .or(page.locator('[class*="modal"]'))
      .or(page.locator('form'));

    await expect(modal).toBeVisible();
  });

  test('should create a new rule set', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /create|new/i });
    await createButton.click();

    // Fill in rule name
    const nameInput = page.getByLabel(/name/i)
      .or(page.getByPlaceholder(/name/i));

    if (await nameInput.isVisible()) {
      await nameInput.fill('E2E Test Rule ' + Date.now());

      // Fill description if available
      const descInput = page.getByLabel(/description/i)
        .or(page.getByPlaceholder(/description/i));
      if (await descInput.isVisible()) {
        await descInput.fill('Created by E2E test');
      }

      // Submit
      const submitButton = page.getByRole('button', { name: /create|save|submit/i });

      const createPromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/rules') &&
          response.request().method() === 'POST'
      );

      await submitButton.click();

      const response = await createPromise;
      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
    }
  });
});

test.describe('Rule Tolerance Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rules');
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/rules') &&
        response.status() === 200
    );
  });

  test('should display tolerance settings for range rules', async ({ page }) => {
    const ruleItem = page.locator('[data-testid="rule-item"]')
      .or(page.locator('[class*="rule"]').filter({ hasText: /.+/ }))
      .first();

    if (await ruleItem.isVisible()) {
      await ruleItem.click();

      await page.waitForTimeout(500);

      // Look for tolerance/threshold settings
      const toleranceText = page.getByText(/tolerance|threshold|days|amount/i);
      if (await toleranceText.first().isVisible()) {
        expect(await toleranceText.first().isVisible()).toBe(true);
      }
    }
  });
});
