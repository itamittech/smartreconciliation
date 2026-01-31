# Test Data Specification

This document provides detailed specifications for all test data files and mock objects used in Smart Reconciliation backend testing.

---

## CSV Test Files

### 1. Exact Match Test Files

**source_data_exact_match.csv**
```csv
id,name,amount,date
1,John Smith,100.00,2024-01-15
2,Jane Doe,200.50,2024-01-16
3,Bob Johnson,300.75,2024-01-17
```

**target_data_exact_match.csv**
```csv
id,name,amount,date
1,John Smith,100.00,2024-01-15
2,Jane Doe,200.50,2024-01-16
3,Bob Johnson,300.75,2024-01-17
```

**Purpose**: Test 100% exact matching scenario
**Expected Results**: 3 matched records, 0 exceptions, 100% match rate

---

### 2. Mismatch and Missing Records Test Files

**source_data_with_mismatches.csv**
```csv
id,name,amount,date
1,John Smith,100.00,2024-01-15
2,Jane Doe,250.00,2024-01-16
3,Bob Johnson,300.75,2024-01-17
4,Alice Williams,400.00,2024-01-18
```

**target_data_missing_records.csv**
```csv
id,name,amount,date
1,John Smith,100.00,2024-01-15
2,Jane Doe,200.50,2024-01-16
```

**Purpose**: Test value mismatches and missing records
**Expected Results**:
- Row 1: Exact match
- Row 2: VALUE_MISMATCH on amount (250.00 vs 200.50)
- Row 3: MISSING_TARGET exception
- Row 4: MISSING_TARGET exception
- Match rate: 25% (1 of 4)

---

### 3. Fuzzy Matching Test Files

**source_fuzzy_matching.csv**
```csv
id,name,company,amount
1,John Smith,Acme Corporation,1000.00
2,Jane Doe,TechCorp Industries,2000.00
3,Bob Johnson,Global Solutions Ltd,3000.00
4,Alice Williams,MegaSoft Systems,4000.00
```

**target_fuzzy_matching.csv**
```csv
id,name,company,amount
1,Jon Smith,Acme Corp,1000.00
2,Jane Dough,TechCorp Inds,2000.00
3,Bob Jonson,Global Solutions,3000.00
4,Alice Williams,MegaSoft Sys,4000.00
```

**Purpose**: Test fuzzy matching with name variations
**Expected Results with threshold 0.85**:
- Row 1: Match (similarity ~0.91)
- Row 2: Match (similarity ~0.89)
- Row 3: Match (similarity ~0.92)
- Row 4: Exact match (similarity 1.0)

---

### 4. Numeric Tolerance Test Files

**source_numeric_tolerance.csv**
```csv
id,reference,amount,quantity
1,INV-001,100.00,10
2,INV-002,200.30,20
3,INV-003,300.00,30
4,INV-004,400.75,40
```

**target_numeric_tolerance.csv**
```csv
id,reference,amount,quantity
1,INV-001,100.20,10
2,INV-002,200.50,20
3,INV-003,301.00,30
4,INV-004,400.80,40
```

**Purpose**: Test range matching with numeric tolerance
**Expected Results with tolerance ±0.50**:
- Row 1: Match (diff 0.20, within tolerance)
- Row 2: Match (diff 0.20, within tolerance)
- Row 3: VALUE_MISMATCH (diff 1.00, exceeds tolerance)
- Row 4: Match (diff 0.05, within tolerance)

---

### 5. Large Dataset Test Files

**large_dataset_source.csv**
- **Rows**: 10,000
- **Columns**: id, reference, description, amount, category, date
- **Match Distribution**:
  - 9,500 exact matches (95%)
  - 300 value mismatches (3%)
  - 200 missing in target (2%)
- **Sample Data**:
```csv
id,reference,description,amount,category,date
1,REF-00001,Payment for Q1 services,1250.50,Services,2024-01-15
2,REF-00002,Product purchase - Widget A,340.00,Products,2024-01-15
3,REF-00003,Consulting fees - January,2500.00,Consulting,2024-01-16
...
10000,REF-10000,Annual subscription,9999.99,Subscription,2024-03-31
```

**large_dataset_target.csv**
- **Rows**: 9,800 (200 missing from source)
- Same structure as source
- Introduces value mismatches in ~300 rows

**Purpose**: Test performance and scalability
**Expected Results**: Processing completes within 60 seconds, 95% match rate

---

### 6. Special Characters Test File

**data_with_special_chars.csv**
```csv
id,name,description,notes
1,"Smith, John","Invoice for ""Q1"" services","Contains
newline"
2,"O'Brien, Mary","Payment with €500.00 amount","Unicode: ñ, ü, é"
3,"Tech-Corp™","Contract #123 & addendum","Symbols: @#$%"
4,"Doe, ""Jane""","Quote: She said ""Hello""","Nested quotes"
```

**Purpose**: Test CSV parser robustness with edge cases
**Expected Results**: All special characters preserved, no data corruption

---

### 7. Empty Cells Test File

**empty_cells.csv**
```csv
id,name,amount,date,notes
1,John Smith,100.00,2024-01-15,
2,,200.00,2024-01-16,Missing name
3,Bob Johnson,,2024-01-17,Missing amount
4,Alice Williams,400.00,,No date
5,Charlie Brown,500.00,2024-01-19,Complete
```

**Purpose**: Test null/empty value handling
**Expected Results**: Empty cells as empty strings, no NullPointerException

---

## Excel Test File

### 8. Mixed Data Types Excel File

**mixed_data_types.xlsx**

| ID (Integer) | Name (Text) | Amount (Currency) | Date (Date) | Active (Boolean) | Percentage (%) |
|-------------|-------------|-------------------|-------------|------------------|----------------|
| 1           | John Smith  | $1,234.56         | 2024-01-15  | TRUE             | 15.5%          |
| 2           | Jane Doe    | $2,500.00         | 2024-01-16  | FALSE            | 20.0%          |
| 3           | Bob Johnson | $999.99           | 2024-01-17  | TRUE             | 10.25%         |
| 4           | Alice W.    | €500.00           | 2024-01-18  | TRUE             | 100%           |

**Purpose**: Test schema detection for all supported types
**Expected Schema**:
- ID: INTEGER (100% integers detected)
- Name: TEXT
- Amount: CURRENCY ($ and € symbols detected)
- Date: DATE (ISO 8601 or Excel date format)
- Active: BOOLEAN (true/false values)
- Percentage: PERCENTAGE (% symbol detected)

---

## Mock Data Objects

### Reconciliation Test Data

**Status Variations**:
```java
PENDING    // Just created, not started
IN_PROGRESS // Currently processing
COMPLETED  // Successfully finished
FAILED     // Processing error
CANCELLED  // User cancelled
```

**Match Rates**:
- 0%: All records mismatched or missing
- 50%: Half matched
- 85.0%: Good match rate with some exceptions
- 95.5%: Excellent match rate
- 100%: Perfect match

**Record Counts**:
- Empty: 0 rows (edge case)
- Small: 10 rows
- Medium: 100-500 rows
- Large: 10,000 rows (performance test)

**Sample Entity**:
```java
Reconciliation {
  id: "recon-123",
  name: "Q1 2024 Invoice Reconciliation",
  status: COMPLETED,
  matchRate: 95.5,
  totalSourceRecords: 1000,
  totalTargetRecords: 980,
  matchedRecords: 955,
  unmatchedRecords: 45,
  organizationId: "org-123",
  createdDate: LocalDateTime,
  completedDate: LocalDateTime
}
```

---

### Exception Test Data

**Exception Types**:
```java
VALUE_MISMATCH  // Values don't match
MISSING_SOURCE  // In target but not source
MISSING_TARGET  // In source but not target
DUPLICATE       // Duplicate key detected
```

**Severities**:
```java
CRITICAL // Key field mismatch
HIGH     // Important field mismatch
MEDIUM   // Non-critical field mismatch
LOW      // Minor discrepancy
```

**Statuses**:
```java
OPEN         // Needs attention
RESOLVED     // Fixed
ACKNOWLEDGED // Noted but not fixed
```

**Sample Entities**:
```java
// Value Mismatch Exception
ReconciliationException {
  id: "exc-001",
  reconciliationId: "recon-123",
  type: VALUE_MISMATCH,
  severity: HIGH,
  status: OPEN,
  field: "amount",
  sourceValue: "100.00",
  targetValue: "150.00",
  description: "Amount mismatch detected",
  aiSuggestion: "Review source transaction #123"
}

// Missing Target Exception
ReconciliationException {
  id: "exc-002",
  type: MISSING_TARGET,
  severity: HIGH,
  sourceRecord: "{id:3, name:'Bob', amount:300}",
  description: "Record in source but not in target"
}
```

---

### Rule Set Test Data

**Match Types**:
```java
EXACT       // Exact string match
FUZZY       // Levenshtein similarity (threshold 0.7-0.95)
RANGE       // Numeric tolerance (±0.1 to ±10.0)
PATTERN     // CONTAINS, STARTS_WITH, ENDS_WITH
```

**Field Mappings**:
```java
FieldMapping {
  sourceField: "invoice_id",
  targetField: "id",
  isKeyField: true,
  transform: UPPERCASE
}
```

**Matching Rules**:
```java
// Fuzzy Rule
MatchingRule {
  field: "customer_name",
  matchType: FUZZY,
  threshold: 0.85
}

// Range Rule
MatchingRule {
  field: "total_amount",
  matchType: RANGE,
  tolerance: 0.50
}

// Pattern Rule
MatchingRule {
  field: "reference",
  matchType: PATTERN,
  patternType: STARTS_WITH,
  pattern: "INV-"
}
```

---

### Schema Detection Test Data

**Type Detection Samples**:

**INTEGER**:
```
["123", "456", "789", "0", "-100"]
Expected: type=INTEGER, confidence=1.0
```

**NUMBER** (Decimal):
```
["12.34", "56.78", "-90.12", "0.5"]
Expected: type=NUMBER, confidence=1.0
```

**CURRENCY**:
```
["$1,234.56", "$500.00", "€250.99", "¥10000"]
Expected: type=CURRENCY, confidence=1.0
```

**DATE**:
```
ISO: ["2024-01-15", "2024-02-20", "2024-03-10"]
US: ["01/15/2024", "02/20/2024", "12/31/2024"]
European: ["15-Jan-2024", "20-Feb-2024", "10-Mar-2024"]
Expected: type=DATE, format detected
```

**EMAIL**:
```
["user@example.com", "test.user@domain.co.uk", "admin@company.org"]
Expected: type=EMAIL, confidence=1.0
```

**PERCENTAGE**:
```
["15.5%", "100%", "0.5%", "99.99%"]
Expected: type=PERCENTAGE, confidence=1.0
```

**BOOLEAN**:
```
["true", "false", "yes", "no", "1", "0"]
Expected: type=BOOLEAN, confidence=1.0
```

**TEXT** (default):
```
["John Smith", "Jane Doe", "Bob Johnson"]
Expected: type=TEXT, confidence=1.0
```

---

## Test File Locations

### Source Code Structure
```
src/test/
├── java/com/amit/smartreconciliation/
│   ├── service/           # Unit tests
│   ├── controller/        # Integration tests
│   └── repository/        # Repository tests
└── resources/
    ├── testdata/          # CSV and Excel files
    │   ├── source_data_exact_match.csv
    │   ├── target_data_exact_match.csv
    │   ├── source_fuzzy_matching.csv
    │   ├── large_dataset_source.csv
    │   └── mixed_data_types.xlsx
    └── application-test.properties
```

### Test Configuration
**application-test.properties**:
```properties
spring.datasource.url=jdbc:tc:postgresql:15:///testdb
spring.jpa.hibernate.ddl-auto=create-drop
spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY_TEST}
spring.ai.openai.api-key=${OPENAI_API_KEY_TEST}
```

---

## Coverage Targets

### Unit Tests
- **Line Coverage**: 80%
- **Branch Coverage**: 70%
- **Focus**: Business logic, algorithms, data transformations

### Integration Tests
- **Endpoint Coverage**: 100%
- **Focus**: HTTP contracts, request/response validation

### Repository Tests
- **Custom Query Coverage**: 100%
- **Focus**: Complex JPA queries, filters

---

## Critical Test Scenarios

### High Priority
1. Levenshtein distance algorithm accuracy
2. All reconciliation comparison logic (exact, fuzzy, range, pattern)
3. Exception type and severity categorization
4. CSV/Excel parsing with edge cases
5. Schema detection accuracy
6. AI response JSON parsing (markdown-wrapped and plain)

### Edge Cases to Cover
1. Empty files (0 rows)
2. Large files (10,000+ rows)
3. Null/empty cell handling
4. Special characters and Unicode
5. Concurrent operations
6. Service unavailability (AI, database)
7. Numeric precision (floating point)
8. Timezone handling
9. Memory usage under load
10. Transaction rollback scenarios

---

## Test Execution Commands

### Run All Tests
```bash
mvnw.cmd test
```

### Run Specific Test Class
```bash
mvnw.cmd test -Dtest=FileParserServiceTest
```

### Run Single Test Method
```bash
mvnw.cmd test -Dtest=ReconciliationServiceTest#testExactMatchReconciliation
```

### Run with Coverage
```bash
mvnw.cmd test jacoco:report
```

---

## Mock Configuration

### Mock AI Service
```java
@MockBean
private AiService aiService;

when(aiService.suggestFieldMappings(any(), any()))
    .thenReturn(mockMappings);
```

### Mock File System
```java
@MockBean
private FileStorageService fileStorage;

when(fileStorage.save(any())).thenReturn("file-123");
```

### TestContainers PostgreSQL
```java
@Container
static PostgreSQLContainer<?> postgres =
    new PostgreSQLContainer<>("postgres:15");
```

---

This test data specification provides comprehensive coverage for all Smart Reconciliation backend testing scenarios.
