---
name: smartrecon-tdd
description: Enforce the Smart Reconciliation test-driven workflow, including picking one test case, writing a failing test first, implementing minimal code, refactoring, updating module progress.json, and using /api/v1 endpoints for API tests. Use when working on this repository’s features or tests.
---

# Smart Reconciliation TDD Workflow

Follow the repository’s TDD workflow on every change.

## Required Steps

1. Pick exactly one test case from `docs/06-testing/test-cases/<module>/progress.json` with `"implemented": false`.
2. Write the failing test first (red) using the matching test case ID and title.
3. Implement the minimum code to pass (green).
4. Refactor without changing behavior.
5. Update the same module’s `progress.json` for that test case.

## Batch Requests (Module Completion)

If the user asks to complete all pending test cases for a module:
1. Continue executing the required steps in strict one-test-per-cycle order without asking between cycles.
2. Keep iterating until the module has zero pending test cases.
3. Only after the module is fully complete, ask the user what to do next.

## Must-Use Conventions

- Use `/api/v1` for all API tests and references.
- Use `@DisplayName("TC-XXX-NNN: ...")`.
- Use Given/When/Then structure in tests.
- Keep changes in micro-steps (one test per cycle).

## References

Read the workflow details here when needed:
- `references/tdd-workflow.md`
