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
