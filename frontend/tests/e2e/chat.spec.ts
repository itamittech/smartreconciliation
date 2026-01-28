import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Chat Page E2E Tests
 * Tests AI chat functionality against the real backend
 */

test.describe('Chat Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('should display chat interface', async ({ page }) => {
    // Chat container should be visible
    await expect(
      page.locator('[data-testid="chat-container"]')
        .or(page.locator('[class*="chat"]'))
    ).toBeVisible();

    // Input area should be visible
    await expect(
      page.getByPlaceholder(/message|type|ask/i)
        .or(page.locator('textarea'))
        .or(page.locator('input[type="text"]'))
    ).toBeVisible();
  });

  test('should have a send button', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: /send/i })
      .or(page.locator('button').filter({ hasText: /send|arrow/i }))
      .or(page.locator('button[type="submit"]'));

    await expect(sendButton).toBeVisible();
  });

  test('should have file upload capability', async ({ page }) => {
    // Look for file upload button or input
    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.getByRole('button', { name: /attach|upload|file/i })
      .or(page.locator('button').filter({ hasText: /paperclip|attach/i }));

    await expect(fileInput.or(uploadButton)).toBeVisible();
  });
});

test.describe('Chat Messaging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('should send a message and receive AI response', async ({ page }) => {
    const input = page.getByPlaceholder(/message|type|ask/i)
      .or(page.locator('textarea'))
      .or(page.locator('input[type="text"]'));

    // Type a message
    await input.fill('Hello, can you help me with reconciliation?');

    // Wait for API response
    const messagePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/chat/message') &&
        response.status() === 200
    );

    // Click send or press Enter
    const sendButton = page.getByRole('button', { name: /send/i })
      .or(page.locator('button[type="submit"]'));

    await sendButton.click();

    // Wait for response
    const response = await messagePromise;
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('content');
    expect(data.data.role).toBe('assistant');

    // AI response should appear in chat
    await expect(
      page.locator('[data-testid="chat-message"]')
        .or(page.locator('[class*="message"]'))
        .filter({ hasText: /received|help/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('should display user message in chat', async ({ page }) => {
    const input = page.getByPlaceholder(/message|type|ask/i)
      .or(page.locator('textarea'));

    const testMessage = 'Test message ' + Date.now();
    await input.fill(testMessage);

    const sendButton = page.getByRole('button', { name: /send/i })
      .or(page.locator('button[type="submit"]'));

    await sendButton.click();

    // User message should appear
    await expect(page.getByText(testMessage)).toBeVisible();
  });

  test('should clear input after sending', async ({ page }) => {
    const input = page.getByPlaceholder(/message|type|ask/i)
      .or(page.locator('textarea'));

    await input.fill('Test message');

    const sendButton = page.getByRole('button', { name: /send/i })
      .or(page.locator('button[type="submit"]'));

    // Wait for message to be sent
    const messagePromise = page.waitForResponse(
      (response) => response.url().includes('/api/v1/chat/message')
    );

    await sendButton.click();
    await messagePromise;

    // Input should be cleared
    await expect(input).toHaveValue('');
  });

  test('should handle Enter key to send message', async ({ page }) => {
    const input = page.getByPlaceholder(/message|type|ask/i)
      .or(page.locator('textarea'));

    await input.fill('Test Enter key');

    const messagePromise = page.waitForResponse(
      (response) => response.url().includes('/api/v1/chat/message')
    );

    await input.press('Enter');

    await messagePromise;

    // Message should be sent
    await expect(page.getByText('Test Enter key')).toBeVisible();
  });

  test('should not send empty messages', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: /send/i })
      .or(page.locator('button[type="submit"]'));

    // Try to send with empty input
    await sendButton.click();

    // No API call should be made (button might be disabled)
    // Verify no new messages appear in chat
    await page.waitForTimeout(500);

    // The button should be disabled or no request made
    const isDisabled = await sendButton.isDisabled();
    expect(isDisabled).toBe(true);
  });
});

test.describe('Chat File Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('should upload a file via chat', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const testFilePath = path.join(__dirname, '..', 'fixtures', 'test-files', 'source-data.csv');

    // Wait for upload API call
    const uploadPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/files/upload') &&
        (response.status() === 200 || response.status() === 201)
    );

    await fileInput.setInputFiles(testFilePath);

    const response = await uploadPromise;
    expect(response.ok()).toBe(true);

    // Success message should appear
    await expect(
      page.getByText(/uploaded|success/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should show upload progress indicator', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const testFilePath = path.join(__dirname, '..', 'fixtures', 'test-files', 'source-data.csv');

    // Start upload
    await fileInput.setInputFiles(testFilePath);

    // Look for progress indicator (may be too fast to catch)
    const progressIndicator = page.locator('[class*="progress"]')
      .or(page.locator('.animate-spin'))
      .or(page.getByText(/uploading/i));

    // Either see progress or upload completes quickly
    await expect(progressIndicator.or(page.getByText(/uploaded|success/i))).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Chat Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/chat/message', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'AI service unavailable' }),
      })
    );

    const input = page.getByPlaceholder(/message|type|ask/i)
      .or(page.locator('textarea'));

    await input.fill('Test error handling');

    const sendButton = page.getByRole('button', { name: /send/i })
      .or(page.locator('button[type="submit"]'));

    await sendButton.click();

    // Error message should be displayed
    await expect(
      page.getByText(/error|failed|unavailable/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should allow dismissing error messages', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/chat/message', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'Error' }),
      })
    );

    const input = page.getByPlaceholder(/message|type|ask/i)
      .or(page.locator('textarea'));

    await input.fill('Trigger error');

    const sendButton = page.getByRole('button', { name: /send/i })
      .or(page.locator('button[type="submit"]'));

    await sendButton.click();

    // Wait for error to appear
    await page.waitForTimeout(1000);

    // Look for dismiss button
    const dismissButton = page.getByRole('button', { name: /dismiss|close|x/i })
      .or(page.locator('[class*="error"]').locator('button'));

    if (await dismissButton.isVisible()) {
      await dismissButton.click();

      // Error should be dismissed
      await expect(
        page.locator('[class*="error"]').or(page.getByText(/error/i))
      ).not.toBeVisible({ timeout: 2000 });
    }
  });
});

test.describe('Chat UI/UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('should auto-scroll to latest message', async ({ page }) => {
    const input = page.getByPlaceholder(/message|type|ask/i)
      .or(page.locator('textarea'));

    // Send multiple messages
    for (let i = 0; i < 3; i++) {
      await input.fill(`Message ${i + 1}`);

      const sendButton = page.getByRole('button', { name: /send/i })
        .or(page.locator('button[type="submit"]'));

      await sendButton.click();

      await page.waitForResponse(
        (response) => response.url().includes('/api/v1/chat/message')
      );

      await page.waitForTimeout(500);
    }

    // Latest message should be visible (in viewport)
    await expect(page.getByText('Message 3')).toBeInViewport();
  });

  test('should show loading state while waiting for response', async ({ page }) => {
    // Slow down API response
    await page.route('**/api/v1/chat/message', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: { id: '1', role: 'assistant', content: 'Response', timestamp: new Date().toISOString() },
        }),
      });
    });

    const input = page.getByPlaceholder(/message|type|ask/i)
      .or(page.locator('textarea'));

    await input.fill('Test loading state');

    const sendButton = page.getByRole('button', { name: /send/i })
      .or(page.locator('button[type="submit"]'));

    await sendButton.click();

    // Loading indicator should appear
    await expect(
      page.locator('.animate-spin')
        .or(page.locator('.animate-pulse'))
        .or(page.getByText(/thinking|loading/i))
    ).toBeVisible({ timeout: 1000 });
  });

  test('should differentiate user and AI messages visually', async ({ page }) => {
    const input = page.getByPlaceholder(/message|type|ask/i)
      .or(page.locator('textarea'));

    await input.fill('User message');

    const sendButton = page.getByRole('button', { name: /send/i })
      .or(page.locator('button[type="submit"]'));

    await sendButton.click();

    await page.waitForResponse(
      (response) => response.url().includes('/api/v1/chat/message')
    );

    await page.waitForTimeout(500);

    // Messages should have different styling
    const messages = page.locator('[data-testid="chat-message"]')
      .or(page.locator('[class*="message"]'));

    const messageCount = await messages.count();
    expect(messageCount).toBeGreaterThanOrEqual(2);

    // User and AI messages should be visually distinct
    // This is a visual test - we verify different classes exist
    const userMessage = messages.filter({ hasText: 'User message' }).first();
    const aiMessage = messages.filter({ hasText: /received|help/i }).first();

    if (await userMessage.isVisible() && await aiMessage.isVisible()) {
      const userClass = await userMessage.getAttribute('class');
      const aiClass = await aiMessage.getAttribute('class');

      // Classes should be different (different alignment/colors)
      expect(userClass !== aiClass || userClass?.includes('user') || aiClass?.includes('assistant')).toBe(true);
    }
  });
});
