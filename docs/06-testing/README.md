# Testing Documentation

Comprehensive testing documentation for the Smart Reconciliation platform.

## Overview

This folder contains all testing-related documentation including test strategies, test data specifications, and detailed test cases for all system components.

## Structure

```
06-testing/
├── README.md                        # This file
├── test-data-specification.md       # Test data formats and samples
└── test-cases/                      # Detailed test cases by module
    ├── 01-file-management/
    ├── 02-reconciliation-engine/
    ├── 03-rule-management/
    ├── 04-exception-management/
    ├── 05-ai-integration/
    ├── 06-chat-system/
    ├── 07-dashboard/
    ├── README.md
    └── IMPLEMENTATION_SUMMARY.md
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

- **Unit Test Coverage:** ≥ 80% for service and utility classes
- **Integration Test Coverage:** All REST endpoints and critical workflows
- **AI Feature Coverage:** Mock-based tests for all AI integration points
- **Database Coverage:** All repositories with TestContainers

## Related Documentation

- [Developer Guide](../03-development/developer-guide.md) - Development setup and workflow
- [API Reference](../03-development/api-reference.md) - REST API documentation
- [Test Data Specification](test-data-specification.md) - Test data formats

## Quick Start for Testers

1. **Set up environment** - Follow the [Developer Guide](../03-development/developer-guide.md)
2. **Review test data** - Check [test-data-specification.md](test-data-specification.md)
3. **Explore test cases** - Navigate to specific module folders
4. **Run tests** - Execute tests using Maven commands above

---

For detailed test case documentation, see individual test case files in the [test-cases](test-cases/) folder.
