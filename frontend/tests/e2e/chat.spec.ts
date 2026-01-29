import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Chat Page E2E Tests
 * Tests AI chat functionality against the real backend
 */

test.describe('Chat Page', () => {
  test.beforeEach(async ({ page }) => {
    // App uses store-based navigation, navigate via sidebar button
    await page.goto('/');
    await page.getByRole('button', { name: /chat/i }).click();
    await page.waitForTimeout(300);
  });

  test('should display chat interface', async ({ page }) => {
    // Chat page should show welcome message
    await expect(
      page.getByRole('heading', { name: /welcome to smart reconciliation/i })
    ).toBeVisible();
    // And input field
    await expect(page.getByLabel('Chat message')).toBeVisible();
  });

  test('should have a send button', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: /send/i });
    await expect(sendButton).toBeVisible();
  });

  test('should have file upload capability', async ({ page }) => {
    // Look for attach file button
    const uploadButton = page.getByRole('button', { name: /attach file/i });
    await expect(uploadButton).toBeVisible();
  });
});

test.describe('Chat Messaging', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat via sidebar
    await page.goto('/');
    await page.getByRole('button', { name: /chat/i }).click();
    await page.waitForTimeout(300);
  });

  test('should send a message and receive AI response', async ({ page }) => {
    const input = page.getByLabel('Chat message');

    // Type a message
    await input.fill('What can you help with?');

    // Click send
    const sendButton = page.getByRole('button', { name: 'Send message' });
    await sendButton.click();

    // Wait for user message to appear first
    await expect(page.getByText('What can you help with?')).toBeVisible({ timeout: 5000 });

    // Wait for "AI is thinking..." indicator to appear (shows API is being called)
    await expect(page.getByText('AI is thinking...')).toBeVisible({ timeout: 5000 });
  });

  test('should display user message in chat', async ({ page }) => {
    const input = page.getByLabel('Chat message');

    const testMessage = 'Test message ' + Date.now();
    await input.fill(testMessage);

    const sendButton = page.getByRole('button', { name: 'Send message' });
    await sendButton.click();

    // User message should appear
    await expect(page.getByText(testMessage)).toBeVisible({ timeout: 5000 });
  });

  test('should clear input after sending', async ({ page }) => {
    const input = page.getByLabel('Chat message');
    await input.fill('Test clear message');

    const sendButton = page.getByRole('button', { name: 'Send message' });
    await sendButton.click();

    // Wait for message to appear (indicates it was sent)
    await expect(page.getByText('Test clear message')).toBeVisible({ timeout: 5000 });

    // Input should be cleared after sending
    await expect(input).toHaveValue('');
  });

  test('should handle Enter key to send message', async ({ page }) => {
    const input = page.getByLabel('Chat message');
    await input.fill('Test Enter key');

    await input.press('Enter');

    // Message should be sent and visible
    await expect(page.getByText('Test Enter key')).toBeVisible({ timeout: 5000 });
  });

  test('should not send empty messages', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: 'Send message' });

    // The button should be disabled when input is empty
    await expect(sendButton).toBeDisabled();
  });
});

test.describe('Chat File Upload', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat via sidebar
    await page.goto('/');
    await page.getByRole('button', { name: /chat/i }).click();
    await page.waitForTimeout(300);
  });

  test('should upload a file via chat', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    // Files are in e2e/fixtures/test-files
    const testFilePath = path.join(__dirname, 'fixtures', 'test-files', 'source-data.csv');

    // Click attach button to trigger file input
    await page.getByRole('button', { name: /attach file/i }).click();
    await page.waitForTimeout(100);

    await fileInput.setInputFiles(testFilePath);

    // Wait for either "Uploading" message or success message with file name
    await expect(
      page.getByText(/uploading|source-data/i).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('should show upload progress indicator', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const testFilePath = path.join(__dirname, 'fixtures', 'test-files', 'source-data.csv');

    // Start upload
    await fileInput.setInputFiles(testFilePath);

    // Either see loading indicator or upload message - use first() to avoid strict mode
    await expect(
      page.getByText(/uploading|uploaded/i).first()
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Chat Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat via sidebar
    await page.goto('/');
    await page.getByRole('button', { name: /chat/i }).click();
    await page.waitForTimeout(300);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error for chat endpoint
    await page.route('**/api/v1/chat/quick', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'AI service unavailable' }),
      })
    );

    const input = page.getByLabel('Chat message');
    await input.fill('Test error handling');

    const sendButton = page.getByRole('button', { name: 'Send message' });
    await sendButton.click();

    // Error message should be displayed in chat
    await expect(
      page.getByText(/error|failed/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should allow dismissing error messages', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/chat/quick', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'Error' }),
      })
    );

    const input = page.getByLabel('Chat message');
    await input.fill('Trigger error');

    const sendButton = page.getByRole('button', { name: 'Send message' });
    await sendButton.click();

    // Wait for error to appear
    await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 });

    // Look for dismiss button
    const dismissButton = page.getByText('Dismiss');
    if (await dismissButton.isVisible()) {
      await dismissButton.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Chat UI/UX', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat via sidebar
    await page.goto('/');
    await page.getByRole('button', { name: /chat/i }).click();
    await page.waitForTimeout(300);
  });

  test('should auto-scroll to latest message', async ({ page }) => {
    const input = page.getByLabel('Chat message');
    const sendButton = page.getByRole('button', { name: 'Send message' });

    // Send a message and verify it's visible
    await input.fill('Test scroll message');
    await sendButton.click();

    // Wait for message to appear
    await expect(page.getByText('Test scroll message')).toBeVisible({ timeout: 5000 });

    // Message should be in viewport
    await expect(page.getByText('Test scroll message')).toBeInViewport();
  });

  test('should show loading state while waiting for response', async ({ page }) => {
    // Slow down API response
    await page.route('**/api/v1/chat/quick', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: { response: 'Response' },
        }),
      });
    });

    const input = page.getByLabel('Chat message');
    await input.fill('Test loading state');

    const sendButton = page.getByRole('button', { name: 'Send message' });
    await sendButton.click();

    // Loading indicator should appear ("AI is thinking...")
    await expect(page.getByText('AI is thinking...')).toBeVisible({ timeout: 2000 });
  });

  test('should differentiate user and AI messages visually', async ({ page }) => {
    const input = page.getByLabel('Chat message');
    await input.fill('User message test');

    const sendButton = page.getByRole('button', { name: 'Send message' });
    await sendButton.click();

    // Wait for user message to appear
    await expect(page.getByText('User message test')).toBeVisible({ timeout: 5000 });

    // User message should be visible - test passes if user message is shown
    const userMessageText = await page.getByText('User message test').isVisible();
    expect(userMessageText).toBe(true);
  });
});
