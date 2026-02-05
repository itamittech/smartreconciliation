---
name: playwright-test-skill
description: Write Playwright E2E tests, run them one by one, and iteratively fix failures until each test passes. Use when asked to convert UI test cases into Playwright, execute tests individually, debug failures, and re-run until green.
---

# Playwright Test Skill

## Overview

Write Playwright tests, execute them individually, fix failures, and re-run until each test passes before moving to the next.

## Core Principle: Tests Drive Implementation

**CRITICAL: DO NOT skip tests just because features are missing. Implement the features instead.**

- The purpose of E2E tests is to verify features work end-to-end
- If a test fails because a feature isn't implemented, IMPLEMENT THE FEATURE (frontend or backend)
- Skipping tests defeats the entire purpose of the exercise
- Only skip tests if the feature is explicitly out of scope or impossible to implement

## Workflow

1. **Write or update the Playwright test case**
   - Prefer a single spec file per module (for this repo: `frontend/tests/e2e/frontend-application.spec.ts`).
   - Name each test with the TC id in the title so `-g` filters work.

2. **Run exactly one test**
   - Use `npx playwright test <spec> -g "TC-FE-XXX" --reporter=line`.
   - If npm scripts are blocked in PowerShell, use `cmd /c npx ...`.
   - Do not run the full suite while fixing a specific case.

3. **If the test fails, fix the smallest cause**
   - Prefer narrowing selectors (e.g., `exact: true`, `getByLabel`, `getByRole` with clear names).
   - **If a feature is missing: IMPLEMENT IT** (create UI components, add backend endpoints, etc.)
   - Update the test or UI only when needed; keep changes minimal.
   - **ONLY skip if**: Feature is explicitly out of scope, requires external dependencies not available, or user confirms it should be skipped.

4. **Re-run the same test until it passes**
   - Repeat step 2 until green.
   - Then move to the next failing test.

5. **Update test progress tracking**
   - Record the completed/updated test case in `frontend/test-specs/progress.json`.

6. **Commit the changes to git**
   - Use a clear commit message following repo conventions (e.g., `test: add TC-FE-006 Playwright coverage`).

7. **When running against the real backend**
   - Do not mock API routes.
   - Create fixtures via API before UI steps (upload files, create rule sets, create reconciliations).
   - Use unique names to avoid collisions.
   - Clean up created data after each test (delete reconciliation, rule set, and files).
   - If a backend precondition cannot be created (e.g., status transitions), make the assertion conditional or document a skip.

## Repo-Specific Notes

- Frontend path: `frontend/`
- Spec file: `frontend/tests/e2e/frontend-application.spec.ts`
- Base URL: `http://localhost:5173` (Playwright config uses `webServer` to start Vite if needed)
- Backend health: `http://localhost:8080/api/v1/health`

## Commands

```bash
cd frontend
cmd /c npx playwright test tests/e2e/frontend-application.spec.ts -g "TC-FE-006" --reporter=line
```

## Lessons Learned

### Critical Principles
- **Never skip tests due to missing features** - implement the features instead. Skipping defeats the purpose of E2E testing.
- Tests should drive feature implementation, not be adjusted to skip missing functionality.

### Technical Details
- Mocked tests can hide real backend gaps; flip to real backend for critical flows.
- Ensure backend endpoints exist for UI actions (e.g., `DELETE /api/v1/reconciliations/{id}`).
- Confirm dialogs must be accepted or requests never fire.
- Scope action buttons to their row to avoid strict mode collisions.
- Add API-level assertions (`waitForRequest`) to verify requests are actually sent.

### Backend vs Frontend Implementation
When implementing missing features, prefer **backend API** implementation for:
- **Pagination**: `GET /api/resources?page=1&size=20` (use Spring Data `Pageable`)
- **Sorting**: `GET /api/resources?sort=name,asc` (use Spring Data `Sort`)
- **Filtering**: `GET /api/resources?status=completed` (query parameters)
- **Bulk operations**: `DELETE /api/resources/bulk` (single API call with ID list)

Benefits:
- Scalability (doesn't break with large datasets)
- Reusability (other clients can use the same API)
- Performance (database handles sorting/filtering efficiently)
- Standard REST practices

Only implement in frontend when:
- Pure UI interaction (modals, animations, client-state)
- Feature is truly client-specific and has no backend relevance
