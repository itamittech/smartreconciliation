# Testing Documentation

Comprehensive testing documentation for the Smart Reconciliation platform.

## Start Here

Use the standard TDD workflow for every session:
- [TDD Workflow](tdd-workflow.md)
- Project skill: `$smartrecon-tdd` (repo-scoped automation of the workflow)

## Overview

This folder contains all testing-related documentation including test strategies, test data specifications, and detailed test cases for all system components.
Each module folder under `test-cases/` contains its own `progress.json` for tracking TDD readiness.

> **Frontend E2E Tests**: Playwright specifications (77+ scenarios) and progress tracking are in [`frontend/test-specs/`](../../frontend/test-specs/) — that is the source of truth for all frontend E2E tests.

## Structure

```
docs/06-testing/
- README.md
- test-cases/
  - 01-file-management/
  - 02-reconciliation-engine/
  - 03-rule-management/
  - 04-exception-management/
  - 05-ai-integration/
  - 06-chat-system/
  - 07-dashboard/
  - 08-data-source-management/
  - 09-frontend-application/
  - 10-cross-cutting/
  - 11-future-improvements/
  - progress.json (per module folder)
  - test-data-specification.md
  - README.md
  - IMPLEMENTATION_SUMMARY.md
```

## Testing Strategy

### Test Levels

1. **Unit Tests** - Testing individual components in isolation
   - Service layer logic
   - Repository methods
   - Utility functions
   - Validation logic

2. **Integration Tests** - Testing component interactions
   - REST API endpoints with MockMvc
   - Database operations with TestContainers
   - Spring AI integration with mock providers
   - File parsing and validation flows

3. **Test Data** - Realistic test scenarios
   - Sample CSV and Excel files
   - Valid and invalid data formats
   - Edge cases and boundary conditions
   - Large dataset scenarios

### Test Organization

Test cases are organized by system module:

| Module | Focus Area | Test Cases |
|--------|-----------|------------|
| **01-file-management** | File upload, parsing, schema detection | [View](test-cases/01-file-management/) |
| **02-reconciliation-engine** | Matching logic, reconciliation execution | [View](test-cases/02-reconciliation-engine/) |
| **03-rule-management** | Rule creation, field mapping, validation | [View](test-cases/03-rule-management/) |
| **04-exception-management** | Exception detection, resolution workflow | [View](test-cases/04-exception-management/) |
| **05-ai-integration** | AI suggestions, field mapping, chat | [View](test-cases/05-ai-integration/) |
| **06-chat-system** | Chat interface, message history, context | [View](test-cases/06-chat-system/) |
| **07-dashboard** | Dashboard KPIs, statistics, aggregation | [View](test-cases/07-dashboard/) |
| **08-data-source-management** | Data source CRUD and connectivity | [View](test-cases/08-data-source-management/) |
| **Frontend E2E Tests** | UI flows and E2E specs (Playwright) | [View](../../frontend/test-specs/) |
| **10-cross-cutting** | Multi-tenancy, error handling, CORS, health, async | [View](test-cases/10-cross-cutting/) |
| **11-future-improvements** | TDD specs for not-yet-built features | [View](test-cases/11-future-improvements/) |

## Running Tests

### All Tests
```bash
# Windows
mvnw.cmd test

# Unix/Linux/macOS
./mvnw test
```

### Specific Test Class
```bash
# Windows
mvnw.cmd test -Dtest=FileControllerTest

# Unix/Linux/macOS
./mvnw test -Dtest=FileControllerTest
```

### Specific Test Method
```bash
# Windows
mvnw.cmd test -Dtest=FileControllerTest#testUploadValidCsvFile

# Unix/Linux/macOS
./mvnw test -Dtest=FileControllerTest#testUploadValidCsvFile
```

## Test Coverage Goals

- **Unit Test Coverage:** >= 80% for service and utility classes
- **Integration Test Coverage:** All REST endpoints and critical workflows
- **AI Feature Coverage:** Mock-based tests for all AI integration points
- **Database Coverage:** All repositories with TestContainers

## Related Documentation

- [Developer Guide](../03-development/developer-guide.md) - Development setup and workflow
- [API Reference](../03-development/api-reference.md) - REST API documentation
- [Test Data Specification](test-cases/test-data-specification.md) - Test data formats
- [TDD Workflow](tdd-workflow.md) - Default test-driven workflow for every session

## Quick Start for Testers

1. **Set up environment** - Follow the [Developer Guide](../03-development/developer-guide.md)
2. **Review test data** - Check [test-cases/test-data-specification.md](test-cases/test-data-specification.md)
3. **Explore test cases** - Navigate to specific module folders
4. **Run tests** - Execute tests using Maven commands above

---

For detailed test case documentation, see individual test case files in the [test-cases](test-cases/) folder.
