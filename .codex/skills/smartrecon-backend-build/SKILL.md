---
name: smartrecon-backend-build
description: Build, run, and stabilize the SmartReconciliation backend with Maven. Use when asked to compile the backend, fix build errors, run the Spring Boot app, or validate/repair failing tests.
---

# SmartRecon Backend Build Loop

## Quick Start

1. Build: `./mvnw clean package` (Windows: `mvnw.cmd clean package`).
2. Run: `./mvnw spring-boot:run` and confirm startup in logs. If something is already bound to port 8080, stop that Java process and restart with a long timeout so logs can be inspected. Verify `/api/v1/health` returns success.
3. Test: `./mvnw test` or a specific class/method.
4. Fix failures and repeat until green.

Reference commands: `references/backend-build-commands.md`.

## Build-Run-Validate Workflow

1. Compile/package with `./mvnw clean package`.
2. If the build fails, fix the root cause (compile errors, missing deps, misconfig) and re-run the build.
3. Start the app using `./mvnw spring-boot:run` and confirm it stays up (no crash loop, startup banner visible). If a prior instance is running, stop it first, then restart with a long timeout so startup logs are visible. Verify `/api/v1/health` returns success.
4. Run tests:
   - Full suite: `./mvnw test`
   - Single test: `./mvnw test -Dtest=ClassName#methodName`
5. If tests fail, fix the smallest change needed and re-run the failing test first, then re-run the full suite.

## Error Triage Rules

- Always address the first failure in Maven output; downstream failures are often cascades.
- Prefer minimal fixes that restore compilation and test stability.
- If a failure appears environment-related (missing env var, DB, or port), document the assumption and update config defaults when safe.

## Completion Criteria

- `./mvnw clean package` succeeds.
- `./mvnw spring-boot:run` reaches a stable running state.
- `./mvnw test` (or the target test set) passes without compile or runtime failures.
