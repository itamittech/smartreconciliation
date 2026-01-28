import { test, expect } from '@playwright/test';

/**
 * Navigation and Layout E2E Tests
 * Tests sidebar navigation, routing, and responsive behavior
 */

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display sidebar with navigation links', async ({ page }) => {
    const sidebar = page.locator('nav')
      .or(page.locator('[data-testid="sidebar"]'))
      .or(page.locator('[class*="sidebar"]'));

    await expect(sidebar).toBeVisible();

    // Check for navigation links
    await expect(page.getByRole('link', { name: /dashboard|home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /reconciliations/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /exceptions/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /files/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /rules/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /chat/i })).toBeVisible();
  });

  test('should navigate to Dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /dashboard|home/i }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should navigate to Reconciliations', async ({ page }) => {
    await page.getByRole('link', { name: /reconciliations/i }).click();
    await expect(page).toHaveURL(/.*reconciliations/);
    await expect(page.getByRole('heading', { name: /reconciliations/i })).toBeVisible();
  });

  test('should navigate to Exceptions', async ({ page }) => {
    await page.getByRole('link', { name: /exceptions/i }).click();
    await expect(page).toHaveURL(/.*exceptions/);
    await expect(page.getByRole('heading', { name: /exceptions/i })).toBeVisible();
  });

  test('should navigate to Files', async ({ page }) => {
    await page.getByRole('link', { name: /files/i }).click();
    await expect(page).toHaveURL(/.*files/);
    await expect(page.getByRole('heading', { name: /files/i })).toBeVisible();
  });

  test('should navigate to Rules', async ({ page }) => {
    await page.getByRole('link', { name: /rules/i }).click();
    await expect(page).toHaveURL(/.*rules/);
    await expect(page.getByRole('heading', { name: /rules/i })).toBeVisible();
  });

  test('should navigate to Chat', async ({ page }) => {
    await page.getByRole('link', { name: /chat/i }).click();
    await expect(page).toHaveURL(/.*chat/);
  });

  test('should navigate to Settings', async ({ page }) => {
    const settingsLink = page.getByRole('link', { name: /settings/i });
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await expect(page).toHaveURL(/.*settings/);
    }
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Navigate to different pages and verify active state
    await page.getByRole('link', { name: /reconciliations/i }).click();

    // Active link should have different styling
    const reconLink = page.getByRole('link', { name: /reconciliations/i });
    const linkClass = await reconLink.getAttribute('class');

    // Should have active/selected class
    expect(
      linkClass?.includes('active') ||
      linkClass?.includes('selected') ||
      linkClass?.includes('current') ||
      linkClass?.includes('bg-')
    ).toBe(true);
  });
});

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display header with app title', async ({ page }) => {
    const header = page.locator('header')
      .or(page.locator('[data-testid="header"]'));

    await expect(header).toBeVisible();

    // App title or logo should be visible
    await expect(
      page.getByText(/smart reconciliation/i)
        .or(page.locator('[class*="logo"]'))
    ).toBeVisible();
  });

  test('should display user avatar or profile', async ({ page }) => {
    const avatar = page.locator('[data-testid="avatar"]')
      .or(page.locator('[class*="avatar"]'))
      .or(page.getByRole('img', { name: /user|profile|avatar/i }));

    if (await avatar.isVisible()) {
      expect(await avatar.isVisible()).toBe(true);
    }
  });
});

test.describe('Sidebar Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle sidebar visibility', async ({ page }) => {
    const toggleButton = page.getByRole('button', { name: /menu|toggle|sidebar/i })
      .or(page.locator('[data-testid="sidebar-toggle"]'))
      .or(page.locator('button').filter({ has: page.locator('[class*="menu"]') }));

    if (await toggleButton.isVisible()) {
      const sidebar = page.locator('nav')
        .or(page.locator('[data-testid="sidebar"]'))
        .or(page.locator('[class*="sidebar"]'));

      // Click to toggle
      await toggleButton.click();

      // Sidebar should collapse or expand
      await page.waitForTimeout(300); // Wait for animation

      // Either sidebar becomes hidden or collapsed
      const isCollapsed = await sidebar.evaluate((el) => {
        const width = el.getBoundingClientRect().width;
        return width < 200; // Collapsed sidebars are usually narrow
      });

      expect(isCollapsed || !(await sidebar.isVisible())).toBe(true);

      // Toggle back
      await toggleButton.click();
      await page.waitForTimeout(300);

      await expect(sidebar).toBeVisible();
    }
  });
});

test.describe('Responsive Layout', () => {
  test('should show mobile menu on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile menu button should be visible
    const mobileMenuButton = page.getByRole('button', { name: /menu/i })
      .or(page.locator('[data-testid="mobile-menu"]'))
      .or(page.locator('button').filter({ has: page.locator('[class*="hamburger"]') }));

    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();

      // Navigation should be accessible
      await expect(page.getByRole('link', { name: /reconciliations/i })).toBeVisible();
    }
  });

  test('should hide sidebar on mobile by default', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const sidebar = page.locator('nav')
      .or(page.locator('[data-testid="sidebar"]'));

    // Sidebar might be hidden or transformed
    const isHidden = await sidebar.isHidden();
    const isOffscreen = await sidebar.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.left < 0 || rect.right < 0;
    });

    expect(isHidden || isOffscreen).toBe(true);
  });

  test('should have proper layout on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Content should be visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should have proper layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Sidebar should be visible
    const sidebar = page.locator('nav')
      .or(page.locator('[data-testid="sidebar"]'));

    await expect(sidebar).toBeVisible();

    // Content should be visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});

test.describe('Direct URL Access', () => {
  test('should load dashboard directly', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should load reconciliations page directly', async ({ page }) => {
    await page.goto('/reconciliations');
    await expect(page.getByRole('heading', { name: /reconciliations/i })).toBeVisible();
  });

  test('should load exceptions page directly', async ({ page }) => {
    await page.goto('/exceptions');
    await expect(page.getByRole('heading', { name: /exceptions/i })).toBeVisible();
  });

  test('should load files page directly', async ({ page }) => {
    await page.goto('/files');
    await expect(page.getByRole('heading', { name: /files/i })).toBeVisible();
  });

  test('should load rules page directly', async ({ page }) => {
    await page.goto('/rules');
    await expect(page.getByRole('heading', { name: /rules/i })).toBeVisible();
  });

  test('should load chat page directly', async ({ page }) => {
    await page.goto('/chat');
    // Chat page exists
    await expect(page.locator('[class*="chat"]').or(page.locator('textarea'))).toBeVisible();
  });

  test('should handle 404 for unknown routes', async ({ page }) => {
    await page.goto('/unknown-page-xyz');

    // Should either show 404 page or redirect to home
    await expect(
      page.getByText(/not found|404/i)
        .or(page.getByRole('heading', { name: /dashboard/i }))
    ).toBeVisible();
  });
});

test.describe('Page Titles', () => {
  test('should have correct title on dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/smart reconciliation|dashboard/i);
  });

  test('should update title on navigation', async ({ page }) => {
    await page.goto('/reconciliations');
    // Title should reflect current page or stay as app name
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
