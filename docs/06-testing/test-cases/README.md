# Smart Reconciliation Backend - Test Case Documentation

This directory contains comprehensive test case documentation in plain English for the Smart Reconciliation backend application.

## Overview

All test cases are documented using the **Given-When-Then** format for clarity and consistency. This documentation serves as:
- A blueprint for implementing actual JUnit tests
- Requirements specification for each component
- Coverage validation checklist
- Onboarding material for new developers

## Directory Structure

```
docs/test-cases/
├── 01-file-management/              # File upload, parsing, schema detection
│   ├── TC-FileParserService.md      # Unit tests (8 test cases)
│   ├── TC-SchemaDetectionService.md # Unit tests (13 test cases)
│   ├── TC-FileUploadService.md      # Unit tests (12 test cases)
│   └── TC-FileController.md         # Integration tests (9 test cases)
│
├── 02-reconciliation-engine/        # Core matching algorithms
│   ├── TC-ReconciliationService.md  # Unit tests (30 test cases)
│   ├── TC-ReconciliationController.md # Integration tests (6 test cases)
│   └── TC-ReconciliationRepository.md # Repository tests (3 test cases)
│
├── 03-rule-management/              # Rule sets, field mappings, matching rules
│   ├── TC-RuleService.md            # Unit tests (14 test cases)
│   └── TC-RuleController.md         # Integration tests (7 test cases)
│
├── 04-exception-management/         # Exception filtering, updates, AI suggestions
│   ├── TC-ExceptionService.md       # Unit tests (15 test cases)
│   ├── TC-ExceptionController.md    # Integration tests (5 test cases)
│   └── TC-ReconciliationExceptionRepository.md # Repository tests (3 test cases)
│
├── 05-ai-integration/               # AI-powered suggestions and chat
│   ├── TC-AiService.md              # Unit tests (12 test cases)
│   └── TC-AiController.md           # Integration tests (2 test cases)
│
├── 06-chat-system/                  # Chat sessions and messaging
│   ├── TC-ChatService.md            # Unit tests (11 test cases)
│   └── TC-ChatController.md         # Integration tests (6 test cases)
│
├── 07-dashboard/                    # Analytics and summaries
│   └── TC-DashboardService.md       # Unit tests (3 test cases)
│
├── test-data-specification.md       # Detailed test data definitions
└── README.md                        # This file
```

## Test Case Summary

| Module | Component | Test Level | Test Cases |
|--------|-----------|------------|------------|
| **File Management** | FileParserService | Unit | 8 |
| | SchemaDetectionService | Unit | 13 |
| | FileUploadService | Unit | 12 |
| | FileController | Integration | 9 |
| **Reconciliation Engine** | ReconciliationService | Unit | 30 |
| | ReconciliationController | Integration | 6 |
| | ReconciliationRepository | Repository | 3 |
| **Rule Management** | RuleService | Unit | 14 |
| | RuleController | Integration | 7 |
| **Exception Management** | ExceptionService | Unit | 15 |
| | ExceptionController | Integration | 5 |
| | ReconciliationExceptionRepository | Repository | 3 |
| **AI Integration** | AiService | Unit | 12 |
| | AiController | Integration | 2 |
| **Chat System** | ChatService | Unit | 11 |
| | ChatController | Integration | 6 |
| **Dashboard** | DashboardService | Unit | 3 |
| **TOTAL** | | | **~140** |

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

#### 1. Reconciliation Algorithms
- **Exact matching**: String equality, null handling
- **Fuzzy matching**: Levenshtein distance algorithm, threshold validation
- **Range matching**: Numeric tolerance, floating point precision
- **Pattern matching**: CONTAINS, STARTS_WITH, ENDS_WITH

#### 2. Exception Categorization
- **Type detection**: VALUE_MISMATCH, MISSING_SOURCE, MISSING_TARGET, DUPLICATE
- **Severity assignment**: CRITICAL (key fields), HIGH, MEDIUM, LOW
- **Status workflow**: OPEN → RESOLVED/ACKNOWLEDGED

#### 3. File Processing
- **CSV parsing**: Special characters, quoted fields, empty cells
- **Excel parsing**: Mixed data types, formulas, formatting
- **Schema detection**: Type inference, confidence scores, null handling

#### 4. AI Integration
- **Response parsing**: Markdown-wrapped JSON extraction
- **Suggestion generation**: Field mappings, matching rules, exception resolutions
- **Chat context**: Reconciliation stats, conversation history

### Edge Cases and Error Handling

1. **Empty datasets**: 0 rows, 0 columns
2. **Large datasets**: 10,000+ rows, performance validation
3. **Null/empty values**: Database nulls, empty strings, missing fields
4. **Special characters**: Unicode, symbols, newlines in CSV
5. **Concurrent operations**: Multiple reconciliations, race conditions
6. **Service failures**: AI unavailable, database timeout, file system errors
7. **Data precision**: Floating point comparisons, currency rounding
8. **Transaction integrity**: Rollback scenarios, partial updates

## Test Data Files

### CSV Files (Location: `src/test/resources/testdata/`)

1. **source_data_exact_match.csv** + **target_data_exact_match.csv**
   - 3 rows, 4 columns (id, name, amount, date)
   - 100% matching records

2. **source_data_with_mismatches.csv** + **target_data_missing_records.csv**
   - Value mismatches and missing records
   - Tests: VALUE_MISMATCH, MISSING_TARGET

3. **source_fuzzy_matching.csv** + **target_fuzzy_matching.csv**
   - Name variations for fuzzy matching tests

4. **source_numeric_tolerance.csv** + **target_numeric_tolerance.csv**
   - Amount variations within tolerance range

5. **large_dataset_source.csv** + **large_dataset_target.csv**
   - 10,000 rows each, 95% match rate
   - Performance and scalability testing

6. **data_with_special_chars.csv**
   - Quoted fields with commas, quotes, newlines

7. **empty_cells.csv**
   - Rows with missing values in various positions

8. **mixed_data_types.xlsx**
   - All data types: integer, text, currency, date, boolean, percentage

See `test-data-specification.md` for complete details and sample data.

## Coverage Targets

### Unit Tests
- **Line Coverage**: 80%
- **Branch Coverage**: 70%
- **Focus**: Business logic, algorithms, data transformations
- **Tools**: JUnit 5, Mockito, AssertJ

### Integration Tests
- **Endpoint Coverage**: 100%
- **Focus**: HTTP contracts, request/response mapping, error handling
- **Tools**: MockMvc or RestAssured, TestContainers

### Repository Tests
- **Custom Query Coverage**: 100%
- **Focus**: Complex JPA queries, filters, pagination
- **Tools**: @DataJpaTest, Spring Data Test

## Implementation Guidelines

### Step 1: Read Test Case Documentation
Review the test case file for the component you're implementing:
```bash
docs/test-cases/01-file-management/TC-FileParserService.md
```

### Step 2: Create Test Class
```java
@ExtendWith(MockitoExtension.class)
class FileParserServiceTest {

    @Mock
    private FileRepository fileRepository;

    @InjectMocks
    private FileParserService fileParserService;

    // Test methods follow...
}
```

### Step 3: Implement Test Cases
Use the Given-When-Then format from documentation:

```java
@Test
@DisplayName("TC-FPS-001: Parse Valid CSV File with Standard Data")
void testParseValidCsvFile() {
    // Given
    File csvFile = new File("src/test/resources/testdata/source_data_exact_match.csv");

    // When
    List<Map<String, String>> result = fileParserService.parseFile(csvFile);

    // Then
    assertThat(result).hasSize(3);
    assertThat(result.get(0)).containsKeys("id", "name", "amount", "date");
    assertThat(result.get(0).get("name")).isEqualTo("John Smith");
}
```

### Step 4: Validate Coverage
Run tests with coverage report:
```bash
mvnw.cmd test jacoco:report
```

Check coverage report: `target/site/jacoco/index.html`

## Running Tests

### All Tests
```bash
mvnw.cmd test
```

### Specific Module
```bash
# File Management tests only
mvnw.cmd test -Dtest=*FileParser*,*SchemaDetection*,*FileUpload*,*FileController*

# Reconciliation Engine tests only
mvnw.cmd test -Dtest=*Reconciliation*
```

### Single Test Class
```bash
mvnw.cmd test -Dtest=FileParserServiceTest
```

### Single Test Method
```bash
mvnw.cmd test -Dtest=ReconciliationServiceTest#testExactMatchReconciliation
```

### With Coverage
```bash
mvnw.cmd clean test jacoco:report
```

## Test Environment Setup

### Prerequisites
1. Java 21 installed
2. Maven wrapper (included in project)
3. Docker (for TestContainers PostgreSQL)

### Configuration
Test configuration: `src/test/resources/application-test.properties`

```properties
spring.datasource.url=jdbc:tc:postgresql:15:///testdb
spring.jpa.hibernate.ddl-auto=create-drop
spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY_TEST}
spring.ai.openai.api-key=${OPENAI_API_KEY_TEST}
```

### TestContainers
Integration tests automatically start PostgreSQL container:

```java
@Container
static PostgreSQLContainer<?> postgres =
    new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("testdb");
```

## Mapping Documentation to Code

### Example: ReconciliationService Test

**Documentation** (`TC-ReconciliationService.md`):
```markdown
### TC-RS-002: Exact Match Reconciliation - 100% Match

**Given** source file with 3 rows: [{id:1, name:"John", amount:100}, ...]
**And** target file with identical 3 rows
**And** rule set with key field "id" and EXACT match on "amount"
**When** executeReconciliation() is called
**Then** status is updated to COMPLETED
**And** matchedRecords = 3, unmatchedRecords = 0
**And** matchRate = 100.0
**And** no exceptions are created
```

**Implementation** (`ReconciliationServiceTest.java`):
```java
@Test
@DisplayName("TC-RS-002: Exact Match Reconciliation - 100% Match")
void testExactMatchReconciliation_100PercentMatch() {
    // Given
    List<Map<String, String>> sourceData = List.of(
        Map.of("id", "1", "name", "John", "amount", "100"),
        Map.of("id", "2", "name", "Jane", "amount", "200"),
        Map.of("id", "3", "name", "Bob", "amount", "300")
    );
    List<Map<String, String>> targetData = new ArrayList<>(sourceData);

    RuleSet ruleSet = createRuleSet("id", MatchType.EXACT, "amount");
    Reconciliation recon = createReconciliation(sourceData, targetData, ruleSet);

    // When
    reconciliationService.executeReconciliation(recon.getId());

    // Then
    Reconciliation result = reconciliationRepository.findById(recon.getId()).get();
    assertThat(result.getStatus()).isEqualTo(ReconciliationStatus.COMPLETED);
    assertThat(result.getMatchedRecords()).isEqualTo(3);
    assertThat(result.getUnmatchedRecords()).isEqualTo(0);
    assertThat(result.getMatchRate()).isEqualTo(100.0);

    List<ReconciliationException> exceptions = exceptionRepository
        .findByReconciliationId(recon.getId());
    assertThat(exceptions).isEmpty();
}
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `@BeforeEach` to set up fresh test data
- Clean up resources in `@AfterEach`

### 2. Descriptive Test Names
```java
// Good
@DisplayName("TC-RS-009: Fuzzy Match with High Similarity (Threshold 0.85)")
void testFuzzyMatchWithHighSimilarity() { }

// Bad
@Test
void test1() { }
```

### 3. Clear Assertions
```java
// Good
assertThat(result.getMatchRate())
    .as("Match rate should be 95.5%")
    .isEqualTo(95.5);

// Bad
assertEquals(95.5, result.getMatchRate());
```

### 4. Mock External Dependencies
```java
@MockBean
private AiService aiService;

when(aiService.suggestFieldMappings(any(), any()))
    .thenReturn(expectedMappings);
```

### 5. Test Data Builders
```java
private Reconciliation createReconciliation(
    List<Map<String, String>> source,
    List<Map<String, String>> target,
    RuleSet ruleSet
) {
    // Builder logic...
}
```

## Documentation Maintenance

### When to Update
1. **New Feature**: Add test cases to relevant module
2. **Bug Fix**: Add regression test case
3. **API Change**: Update integration test cases
4. **Algorithm Change**: Update unit test cases

### Update Process
1. Modify test case markdown file
2. Update test case count in README
3. Implement corresponding test code
4. Verify coverage targets are met

## Questions or Issues?

- Check `test-data-specification.md` for data format details
- Review existing test case files for examples
- Refer to project CLAUDE.md for build commands
- Report issues at: https://github.com/anthropics/claude-code/issues

---

**Last Updated**: 2026-01-30
**Total Test Cases**: ~140
**Coverage Target**: 80% line coverage, 70% branch coverage
