# Smart Reconciliation Frontend Tests

Comprehensive test suite for the Smart Reconciliation frontend application.

## Test Structure

```
tests/
├── e2e/                          # End-to-End tests (Playwright)
│   ├── api/                      # API integration tests
│   │   └── api-integration.spec.ts
│   ├── flows/                    # Complete user flow tests
│   │   └── complete-reconciliation-flow.spec.ts
│   ├── dashboard.spec.ts         # Dashboard page tests
│   ├── files.spec.ts             # Files page tests
│   ├── reconciliations.spec.ts   # Reconciliations page tests
│   ├── exceptions.spec.ts        # Exceptions page tests
│   ├── rules.spec.ts             # Rules page tests
│   ├── chat.spec.ts              # Chat page tests
│   ├── navigation.spec.ts        # Navigation & layout tests
│   ├── global-setup.ts           # Global test setup
│   └── app.setup.ts              # Application setup tests
├── unit/                         # Unit tests (Vitest)
│   ├── components/               # Component tests
│   │   ├── Button.test.tsx
│   │   ├── Badge.test.tsx
│   │   └── Card.test.tsx
│   ├── hooks/                    # Hook tests
│   │   └── useAppStore.test.ts
│   └── pages/                    # Page component tests
│       └── HomePage.test.tsx
├── fixtures/                     # Test data
│   ├── data.ts                   # Mock data for unit tests
│   └── test-files/               # Test files for E2E (generated)
├── mocks/                        # MSW mock handlers
│   ├── handlers.ts               # API mock handlers
│   └── server.ts                 # MSW server setup
├── utils/                        # Test utilities
│   └── test-utils.tsx            # Custom render & helpers
├── setup.ts                      # Vitest setup
└── README.md                     # This file
```

## Prerequisites

### For E2E Tests (Real Backend Testing)

1. **PostgreSQL Database** must be running:
   ```bash
   cd ..
   docker-compose up -d
   ```

2. **Backend** must be running:
   ```bash
   cd ..
   mvnw.cmd spring-boot:run
   ```

3. **Frontend** will be started automatically by Playwright

### For Unit Tests (Mocked)

No backend required - tests use MSW (Mock Service Worker) for API mocking.

## Running Tests

### Install Dependencies

```bash
npm install
npx playwright install  # Install browsers for E2E
```

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run with UI
npm run test:ui

# Run once (no watch)
npm run test:run

# Run with coverage
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with UI mode (recommended for debugging)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug
```

### Running Specific Tests

```bash
# Run specific E2E test file
npx playwright test dashboard.spec.ts

# Run tests matching a pattern
npx playwright test --grep "upload"

# Run API tests only
npx playwright test api/

# Run a specific unit test file
npx vitest tests/unit/components/Button.test.tsx
```

## Test Categories

### 1. E2E Tests (tests/e2e/)

These tests run against the **real backend** and test complete user flows:

- **Dashboard**: Loading metrics, displaying stats
- **Files**: Upload, preview, delete files
- **Reconciliations**: Create via wizard, start, view results
- **Exceptions**: Filter, resolve, bulk actions
- **Rules**: View, create, delete rule sets
- **Chat**: Send messages, receive AI responses
- **Navigation**: Sidebar, routing, responsive layout
- **Complete Flows**: End-to-end reconciliation workflow

### 2. API Integration Tests (tests/e2e/api/)

Direct API endpoint testing to verify frontend-backend contract:

- Health check
- Dashboard metrics
- Files CRUD
- Reconciliations CRUD
- Exceptions CRUD + bulk operations
- Rules CRUD
- Chat messaging
- AI suggestions
- Error handling

### 3. Unit Tests (tests/unit/)

Component and logic isolation tests using mocks:

- UI components (Button, Badge, Card)
- Zustand store (useAppStore)
- Page components (HomePage)

## Writing New Tests

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Wait for API call
    const response = await page.waitForResponse(
      (r) => r.url().includes('/api/v1/endpoint')
    );

    // Interact with page
    await page.getByRole('button', { name: /click me/i }).click();

    // Assert results
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import MyComponent from '../../../src/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Test Configuration

### Playwright (playwright.config.ts)

- Runs on Chromium, Firefox, and WebKit
- Mobile viewport testing (Pixel 5)
- Screenshots on failure
- Video on retry
- Auto-starts frontend dev server

### Vitest (vitest.config.ts)

- JSdom environment for React testing
- MSW for API mocking
- Coverage reporting with v8
- Global test utilities

## CI/CD Integration

For GitHub Actions:

```yaml
- name: Run Unit Tests
  run: npm run test:run

- name: Start Backend
  run: |
    cd ..
    docker-compose up -d
    mvnw.cmd spring-boot:run &
    sleep 30

- name: Run E2E Tests
  run: npm run test:e2e
```

## Troubleshooting

### E2E tests fail with "Backend not accessible"

Make sure:
1. Docker is running: `docker-compose up -d`
2. Backend is running: `mvnw.cmd spring-boot:run`
3. Backend is healthy: `curl http://localhost:8080/api/v1/health`

### Unit tests fail with "Cannot find module"

Run `npm install` to ensure all dependencies are installed.

### Playwright browsers not installed

Run `npx playwright install` to download browsers.

### Tests are flaky

- Increase timeouts in `playwright.config.ts`
- Add more specific locators
- Use `waitForResponse` for API calls
- Use `waitForTimeout` sparingly (prefer explicit waits)

## Coverage Goals

- **E2E Coverage**: All major user flows and features
- **Unit Coverage**: >80% for components and utilities
- **API Coverage**: All endpoints used by frontend

## Best Practices

1. **Test real behavior**: E2E tests should test against the real backend
2. **Use semantic locators**: Prefer `getByRole`, `getByText` over `getByTestId`
3. **Wait for API calls**: Always wait for network requests to complete
4. **Clean up test data**: Delete created data at the end of tests
5. **Isolate unit tests**: Use mocks to test components in isolation
6. **Descriptive test names**: Test names should describe the expected behavior
