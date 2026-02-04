# TDD Workflow (Project Standard)

This workflow is the default way we implement features in this repository. Follow it in every session.

## 1) Pick One Test

Choose a single test case from the module’s `progress.json`:

- Example: `docs/06-testing/test-cases/02-reconciliation-engine/progress.json`
- Pick one `testCases[]` item with `"implemented": false`

Rule: **one test per cycle**.

---

## 2) Write the Test (Red)

Create or update the corresponding test class and add **one test method** that matches the ID and title.

Use:
- `@DisplayName("TC-XXX-NNN: ...")`
- Given/When/Then structure

Run the test and confirm it fails:

```bash
./mvnw test -Dtest=ClassName#testMethod
```

---

## 3) Implement the Minimum (Green)

Add only the code needed to make the test pass:

- Smallest possible change
- No extra features
- No speculative refactors

Re-run the test until it passes.

---

## 4) Refactor (Clean)

If needed:

- Improve naming
- Reduce duplication
- Keep behavior identical

Run the test again.

---

## 5) Update Progress

Update the module’s `progress.json`:

- Set the test case to `"implemented": true`
- If a new test was added, adjust totals and summary

Example path:
- `docs/06-testing/test-cases/02-reconciliation-engine/progress.json`

---

## Naming & Structure Standards

### Test Method Naming

Use the test case ID in the method name for easy traceability:

- `testTcRs007_getResults_returnsStatistics()`
- `testTcFus014_uuidPrefixedFileNaming()`

### DisplayName Template

```java
@DisplayName("TC-RC-007: GET /api/v1/reconciliations/{id}/results - Get Results")
```

### Given/When/Then Skeleton

```java
// Given
// setup test data and mocks

// When
// execute the method or API call

// Then
// assert behavior and response
```

---

## Data & Environment Rules

1. Use **TestContainers** for integration tests where DB is required.
2. Mock external services (AI providers, HTTP calls) by default.
3. Keep fixtures in `src/test/resources/testdata/`.
4. Use `/api/v1` for all API tests.

---

## Progress Update Checklist

When you complete a test:

1. Mark `"implemented": true` for the test case.
2. If it’s a new test, increment:
   - `totalTestCases`
   - `pendingTestCases`
3. Recalculate `completionPercentage`.

---

## 6) Commit in Small Steps (Optional)

Use small, descriptive commits:

```
test: Add TC-RC-007 results endpoint test
feat: Implement reconciliation results endpoint
```

---

## Quick Decision Rules

- If a test spec is missing, **add it first** under `docs/06-testing/test-cases/<module>/`.
- If behavior is unclear, **update the test case doc** before coding.
- If multiple modules change, **finish one test cycle fully** before starting another.

---

## Recommended Starting Tests

Pick one small, low-dependency test:

- `TC-FC-012` (File preview custom row count)
- `TC-RC-007` (Reconciliation results endpoint)
- `TC-RUC-008` (Rule set detail retrieval)
- `TC-EC-007` (Exception AI suggestion endpoint)

---

## Example (One Full TDD Cycle)

**Target test**: `TC-RC-007` (Reconciliation results endpoint)

1. Open spec:
   - `docs/06-testing/test-cases/02-reconciliation-engine/TC-ReconciliationController.md`

2. Write failing test:
   - `src/test/java/com/amit/smartreconciliation/controller/ReconciliationControllerTest.java`
   - Add a method:
     - `@DisplayName("TC-RC-007: GET /api/v1/reconciliations/{id}/results - Get Results")`
     - Expect HTTP 200 and statistics in response

3. Run just the test:
```bash
./mvnw test -Dtest=ReconciliationControllerTest#testGetResults
```

4. Implement minimum:
   - Add controller method for `/api/v1/reconciliations/{id}/results`
   - Return stored statistics JSON

5. Refactor if needed, re-run test.

6. Update module progress:
   - `docs/06-testing/test-cases/02-reconciliation-engine/progress.json`
   - Set `TC-RC-007` to `"implemented": true`

---

## Example (Unit Test Cycle)

**Target test**: `TC-FUS-014` (UUID-prefixed file naming)

1. Open spec:
   - `docs/06-testing/test-cases/01-file-management/TC-FileUploadService.md`

2. Write failing test:
   - `src/test/java/com/amit/smartreconciliation/service/FileUploadServiceTest.java`
   - Add a method:
     - `@DisplayName("TC-FUS-014: UUID-Prefixed File Naming")`
     - Expect stored filename to start with UUID and original name preserved

3. Run just the test:
```bash
./mvnw test -Dtest=FileUploadServiceTest#testUuidPrefixedFileNaming
```

4. Implement minimum:
   - Update file naming logic in `FileUploadService`
   - Preserve original filename in metadata

5. Refactor if needed, re-run test.

6. Update module progress:
   - `docs/06-testing/test-cases/01-file-management/progress.json`
   - Set `TC-FUS-014` to `"implemented": true`

---

## Session Checklist

1. Choose one test case
2. Red: failing test
3. Green: minimum code
4. Refactor
5. Update `progress.json`

Repeat.
