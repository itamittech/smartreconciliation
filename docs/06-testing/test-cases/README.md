# Smart Reconciliation Backend - Test Case Documentation

This directory contains comprehensive test case documentation in plain English for the Smart Reconciliation backend and supporting UI flows. Each module folder includes a `progress.json` to track TDD readiness.

## Overview

All test cases are documented using the **Given-When-Then** format for clarity and consistency. This documentation serves as:
- A blueprint for implementing actual JUnit/E2E tests
- Requirements specification for each component
- Coverage validation checklist
- Onboarding material for new developers

## Directory Structure

```
docs/06-testing/test-cases/
- 01-file-management/               # File upload, parsing, schema detection
  - TC-FileParserService.md          # Unit tests (8 test cases)
  - TC-SchemaDetectionService.md     # Unit tests (13 test cases)
  - TC-FileUploadService.md          # Unit tests (12 test cases)
  - TC-FileController.md             # Integration tests (9 test cases)
  - progress.json                    # Module progress tracking
- 02-reconciliation-engine/          # Core matching algorithms
  - TC-ReconciliationService.md      # Unit tests (30 test cases)
  - TC-ReconciliationController.md   # Integration tests (6 test cases)
  - TC-ReconciliationRepository.md   # Repository tests (3 test cases)
  - progress.json
- 03-rule-management/                # Rule sets, field mappings, matching rules
  - TC-RuleService.md                # Unit tests (14 test cases)
  - TC-RuleController.md             # Integration tests (7 test cases)
  - progress.json
- 04-exception-management/           # Exception filtering, updates, AI suggestions
  - TC-ExceptionService.md           # Unit tests (15 test cases)
  - TC-ExceptionController.md        # Integration tests (5 test cases)
  - TC-ReconciliationExceptionRepository.md # Repository tests (3 test cases)
  - progress.json
- 05-ai-integration/                 # AI-powered suggestions and chat
  - TC-AiService.md                  # Unit tests (12 test cases)
  - TC-AiController.md               # Integration tests (2 test cases)
  - progress.json
- 06-chat-system/                    # Chat sessions and messaging
  - TC-ChatService.md                # Unit tests (11 test cases)
  - TC-ChatController.md             # Integration tests (6 test cases)
  - progress.json
- 07-dashboard/                      # Analytics and summaries
  - TC-DashboardService.md           # Unit tests (3 test cases)
  - progress.json
- 08-data-source-management/         # Data source CRUD and connectivity
  - TC-DataSourceService.md          # Unit tests (12 test cases)
  - TC-DataSourceController.md       # Integration tests (8 test cases)
  - TC-DataSourceRepository.md       # Repository tests (2 test cases)
  - progress.json
- 09-frontend-application/           # UI and E2E coverage
  - TC-FrontendApplication.md        # E2E tests (32 test cases)
  - progress.json
- 10-cross-cutting/                  # Org scope, errors, CORS, health, async
  - TC-OrganizationService.md        # Unit tests (3 test cases)
  - TC-GlobalExceptionHandler.md     # Integration tests (6 test cases)
  - TC-HealthController.md           # Integration tests (2 test cases)
  - TC-WebConfig.md                  # Integration tests (3 test cases)
  - TC-AsyncConfig.md                # Unit tests (2 test cases)
  - TC-ApiVersioning.md              # Integration tests (2 test cases)
  - progress.json
- 11-future-improvements/            # TDD specs for not-yet-built features
  - TC-FutureImprovements.md         # Mixed levels (55 test cases)
  - progress.json
- test-data-specification.md         # Detailed test data definitions
- README.md                          # This file
```

## Test Case Summary

| Module | Component | Test Level | Test Cases |
|--------|-----------|------------|------------|
| **File Management** | FileParserService | Unit | 8 |
| | SchemaDetectionService | Unit | 13 |
| | FileUploadService | Unit | 15 |
| | FileController | Integration | 14 |
| **Reconciliation Engine** | ReconciliationService | Unit | 33 |
| | ReconciliationController | Integration | 8 |
| | ReconciliationRepository | Repository | 3 |
| **Rule Management** | RuleService | Unit | 15 |
| | RuleController | Integration | 8 |
| **Exception Management** | ExceptionService | Unit | 18 |
| | ExceptionController | Integration | 7 |
| | ReconciliationExceptionRepository | Repository | 3 |
| **AI Integration** | AiService | Unit | 13 |
| | AiController | Integration | 2 |
| **Chat System** | ChatService | Unit | 12 |
| | ChatController | Integration | 7 |
| **Dashboard** | DashboardService | Unit | 3 |
| **Data Source Management** | DataSourceService | Unit | 12 |
| | DataSourceController | Integration | 8 |
| | DataSourceRepository | Repository | 2 |
| **Frontend Application** | Frontend UI Flows | E2E / UI | 32 |
| **Cross-Cutting Concerns** | OrganizationService | Unit | 3 |
| | GlobalExceptionHandler | Integration | 6 |
| | HealthController | Integration | 2 |
| | WebConfig (CORS) | Integration | 3 |
| | AsyncConfig | Unit | 2 |
| | API Versioning | Integration | 2 |
| **Future Improvements** | Multiple (see file) | Mixed | 55 |
| **TOTAL** | | | **309** |

## Test Case Format

Each test case follows this structure:

```markdown
### TC-XXX-NNN: Test Case Title

**Given** [preconditions and test data setup]
**And** [additional context if needed]
**When** [action/method being tested]
**Then** [expected outcome #1]
**And** [expected outcome #2]
**And** [expected outcome #3]
```

### Test Case ID Convention

- **TC**: Test Case prefix
- **XXX**: Component abbreviation (e.g., FPS = FileParserService, RS = ReconciliationService)
- **NNN**: Sequential number within component (001, 002, etc.)

Examples:
- `TC-FPS-001`: FileParserService test case #1
- `TC-RS-015`: ReconciliationService test case #15
- `TC-FC-003`: FileController test case #3

## Critical Test Scenarios

### Core Business Logic

1. Reconciliation Algorithms
- Exact matching: String equality, null handling
- Fuzzy matching: Levenshtein distance algorithm, threshold validation
- Range matching: Numeric tolerance, floating point precision
- Pattern matching: CONTAINS, STARTS_WITH, ENDS_WITH

2. Exception Categorization
- Type detection: VALUE_MISMATCH, MISSING_SOURCE, MISSING_TARGET, DUPLICATE
- Severity assignment: CRITICAL (key fields), HIGH, MEDIUM, LOW
- Status workflow: OPEN -> RESOLVED/ACKNOWLEDGED

3. File Processing
- CSV parsing: Special characters, quoted fields, empty cells
- Excel parsing: Mixed data types, formulas, formatting
- Schema detection: Type inference, confidence scores, null handling

4. AI Integration
- Response parsing: Markdown-wrapped JSON extraction
- Suggestion generation: Field mappings, matching rules, exception resolutions
- Chat context: Reconciliation stats, conversation history

### Edge Cases and Error Handling

1. Empty datasets: 0 rows, 0 columns
2. Large datasets: 10,000+ rows, performance validation
3. Null/empty values: Database nulls, empty strings, missing fields
4. Special characters: Unicode, symbols, newlines in CSV
5. Concurrent operations: Multiple reconciliations, race conditions
6. Service failures: AI unavailable, database timeout, file system errors
7. Data precision: Floating point comparisons, currency rounding
8. Transaction integrity: Rollback scenarios, partial updates

## Test Data Files

See `test-data-specification.md` for complete details and sample data.

## Coverage Targets

### Unit Tests
- Line Coverage: 80%
- Branch Coverage: 70%
- Focus: Business logic, algorithms, data transformations

### Integration Tests
- Endpoint Coverage: 100%
- Focus: HTTP contracts, request/response mapping, error handling

### Repository Tests
- Custom Query Coverage: 100%
- Focus: Complex JPA queries, filters, pagination

## Documentation Maintenance

### When to Update
1. New Feature: Add test cases to relevant module
2. Bug Fix: Add regression test case
3. API Change: Update integration test cases
4. Algorithm Change: Update unit test cases

### Update Process
1. Modify test case markdown file
2. Update test case count in this README
3. Implement corresponding test code
4. Verify coverage targets are met

---

**Last Updated**: 2026-02-04
**Total Test Cases**: 309
**Coverage Target**: 80% line coverage, 70% branch coverage
