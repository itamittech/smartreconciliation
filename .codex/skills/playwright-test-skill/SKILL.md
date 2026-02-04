---
name: playwright-test-skill
description: Write Playwright E2E tests, run them one by one, and iteratively fix failures until each test passes. Use when asked to convert UI test cases into Playwright, execute tests individually, debug failures, and re-run until green.
---

# Playwright Test Skill

## Overview

Write Playwright tests, execute them individually, fix failures, and re-run until each test passes before moving to the next.

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
   - Update the test or UI only when needed; keep changes minimal.
   - If a requirement is not implemented, mark that test as skipped with an inline `test.skip(true, "reason")` inside a `test(...)` block.

4. **Re-run the same test until it passes**
   - Repeat step 2 until green.
   - Then move to the next failing test.

5. **When running against the real backend**
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

## Lessons Learned (Delete Flow)

- Mocked tests can hide real backend gaps; flip to real backend for critical flows.
- Ensure backend endpoints exist for UI actions (e.g., `DELETE /api/v1/reconciliations/{id}`).
- Confirm dialogs must be accepted or requests never fire.
- Scope action buttons to their row to avoid strict mode collisions.
- Add API-level assertions (`waitForRequest`) to verify requests are actually sent.
