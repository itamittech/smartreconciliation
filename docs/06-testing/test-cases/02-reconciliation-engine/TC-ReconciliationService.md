# TC-ReconciliationService - Unit Tests

**Module**: Reconciliation Engine
**Component**: ReconciliationService
**Test Level**: Unit Test
**Total Test Cases**: 33

---

## Reconciliation Creation Tests

### TC-RS-001: Create Reconciliation with Valid Inputs

**Given** two uploaded files: source (ID: file-001) and target (ID: file-002)
**And** a rule set (ID: rule-001) with field mappings and matching rules
**And** user belongs to organization "org-123"
**When** createReconciliation() is called with name "Q1 2024 Reconciliation", sourceFileId, targetFileId, ruleSetId
**Then** Reconciliation entity is created with status PENDING
**And** entity has unique ID and creation timestamp
**And** entity references are set: sourceFile, targetFile, ruleSet, organization

---

## Exact Match Tests

### TC-RS-002: Exact Match Reconciliation - 100% Match

**Given** source file with 3 rows: [{id:1, name:"John", amount:100}, {id:2, name:"Jane", amount:200}, {id:3, name:"Bob", amount:300}]
**And** target file with identical 3 rows
**And** rule set with key field "id" and EXACT match on "amount"
**When** executeReconciliation() is called
**Then** status is updated to IN_PROGRESS, then COMPLETED
**And** totalSourceRecords = 3, totalTargetRecords = 3
**And** matchedRecords = 3, unmatchedRecords = 0
**And** matchRate = 100.0
**And** no exceptions are created

---

### TC-RS-003: Exact Match with Null Key Fields

**Given** source file with row: {id:null, name:"John", amount:100}
**And** target file with matching data
**And** rule set with key field "id"
**When** executeReconciliation() is called
**Then** row with null key is flagged as exception
**And** exception type is MISSING_SOURCE with severity CRITICAL
**And** error details indicate "Key field 'id' is null"

---

## Missing Record Detection Tests

### TC-RS-004: Detect Missing Target Records

**Given** source file with 4 rows (ids: 1, 2, 3, 4)
**And** target file with 2 rows (ids: 1, 2)
**And** rule set with key field "id"
**When** executeReconciliation() is called
**Then** 2 MISSING_TARGET exceptions are created for ids 3 and 4
**And** each exception has severity HIGH
**And** unmatchedRecords = 2
**And** matchRate = 50.0

---

### TC-RS-005: Detect Missing Source Records

**Given** source file with 2 rows (ids: 1, 2)
**And** target file with 4 rows (ids: 1, 2, 3, 4)
**And** rule set with key field "id"
**When** executeReconciliation() is called
**Then** 2 MISSING_SOURCE exceptions are created for ids 3 and 4
**And** exceptions indicate records exist in target but not in source
**And** unmatchedRecords = 2

---

## Value Mismatch Detection Tests

### TC-RS-006: Detect Value Mismatch in Key Field

**Given** source row: {id:1, name:"John", amount:100}
**And** target row: {id:1, name:"John", amount:150}
**And** rule set with key field "id" and EXACT match on "amount" (key field)
**When** executeReconciliation() is called
**Then** VALUE_MISMATCH exception is created with severity CRITICAL
**And** exception details show: field="amount", sourceValue="100", targetValue="150"

---

### TC-RS-007: Detect Value Mismatch in Non-Key Field

**Given** source row: {id:1, name:"John", amount:100}
**And** target row: {id:1, name:"Jane", amount:100}
**And** rule set with key field "id" and EXACT match on "name" (non-key field)
**When** executeReconciliation() is called
**Then** VALUE_MISMATCH exception is created with severity MEDIUM
**And** exception details show: field="name", sourceValue="John", targetValue="Jane"

---

### TC-RS-008: Multiple Value Mismatches in Single Row

**Given** source row: {id:1, name:"John", amount:100, date:"2024-01-01"}
**And** target row: {id:1, name:"Jane", amount:150, date:"2024-02-01"}
**And** rule set requires exact match on name, amount, date
**When** executeReconciliation() is called
**Then** 3 separate VALUE_MISMATCH exceptions are created
**And** each exception references the same source and target records
**And** severity varies based on field type (key vs non-key)

---

## Fuzzy Matching Tests

### TC-RS-009: Fuzzy Match with High Similarity (Threshold 0.85)

**Given** source row: {id:1, name:"John Smith", amount:100}
**And** target row: {id:1, name:"Jon Smith", amount:100}
**And** rule set with FUZZY match on "name" field, threshold 0.85
**When** executeReconciliation() is called
**Then** Levenshtein distance algorithm calculates similarity
**And** similarity score is 0.91 (above threshold)
**And** records are matched successfully
**And** no VALUE_MISMATCH exception is created

---

### TC-RS-010: Fuzzy Match Below Threshold

**Given** source row: {id:1, name:"John Smith", amount:100}
**And** target row: {id:1, name:"Jane Doe", amount:100}
**And** rule set with FUZZY match on "name" field, threshold 0.85
**When** executeReconciliation() is called
**Then** Levenshtein distance similarity score is 0.20 (below threshold)
**And** VALUE_MISMATCH exception is created
**And** exception details include: similarity score, threshold

---

### TC-RS-011: Fuzzy Match with Case Insensitivity

**Given** source row: {id:1, name:"JOHN SMITH", amount:100}
**And** target row: {id:1, name:"john smith", amount:100}
**And** rule set with FUZZY match on "name" field, threshold 0.95
**When** executeReconciliation() is called
**Then** strings are normalized to lowercase before comparison
**And** similarity score is 1.0 (exact match after normalization)
**And** records are matched successfully

---

### TC-RS-012: Levenshtein Distance Algorithm Accuracy

**Given** source value "kitten"
**And** target value "sitting"
**When** Levenshtein distance is calculated
**Then** edit distance is 3 (k→s, e→i, insert g)
**And** similarity score is calculated as: 1 - (3 / max(6, 7)) = 0.57

---

## Range Matching Tests

### TC-RS-013: Range Match Within Tolerance

**Given** source row: {id:1, amount:100.00}
**And** target row: {id:1, amount:100.30}
**And** rule set with RANGE match on "amount" field, tolerance 0.50
**When** executeReconciliation() is called
**Then** difference is 0.30 (within tolerance)
**And** records are matched successfully
**And** no VALUE_MISMATCH exception is created

---

### TC-RS-014: Range Match Exceeding Tolerance

**Given** source row: {id:1, amount:100.00}
**And** target row: {id:1, amount:101.00}
**And** rule set with RANGE match on "amount" field, tolerance 0.50
**When** executeReconciliation() is called
**Then** difference is 1.00 (exceeds tolerance)
**And** VALUE_MISMATCH exception is created
**And** exception details show: expectedValue=100.00, actualValue=101.00, tolerance=0.50, difference=1.00

---

### TC-RS-015: Range Match with Negative Numbers

**Given** source row: {id:1, amount:-100.00}
**And** target row: {id:1, amount:-99.70}
**And** rule set with RANGE match on "amount", tolerance 0.50
**When** executeReconciliation() is called
**Then** absolute difference is calculated: |-100.00 - (-99.70)| = 0.30
**And** difference is within tolerance
**And** records are matched successfully

---

## Pattern Matching Tests

### TC-RS-016: Pattern Match - CONTAINS

**Given** source row: {id:1, description:"Invoice for January"}
**And** target row: {id:1, description:"INV-January-2024"}
**And** rule set with PATTERN match (CONTAINS) on "description", pattern "January"
**When** executeReconciliation() is called
**Then** both values contain "January"
**And** records are matched successfully

---

### TC-RS-017: Pattern Match - STARTS_WITH

**Given** source row: {id:1, ref:"INV-12345"}
**And** target row: {id:1, ref:"INV-67890"}
**And** rule set with PATTERN match (STARTS_WITH) on "ref", pattern "INV-"
**When** executeReconciliation() is called
**Then** both values start with "INV-"
**And** records are matched successfully

---

### TC-RS-018: Pattern Match - ENDS_WITH

**Given** source row: {id:1, email:"user@example.com"}
**And** target row: {id:1, email:"admin@example.com"}
**And** rule set with PATTERN match (ENDS_WITH) on "email", pattern "@example.com"
**When** executeReconciliation() is called
**Then** both values end with "@example.com"
**And** records are matched successfully

---

### TC-RS-019: Pattern Match Failure

**Given** source row: {id:1, code:"ABC123"}
**And** target row: {id:1, code:"XYZ789"}
**And** rule set with PATTERN match (STARTS_WITH) on "code", pattern "ABC"
**When** executeReconciliation() is called
**Then** target value "XYZ789" does not start with "ABC"
**And** VALUE_MISMATCH exception is created

---

## Duplicate Detection Tests

### TC-RS-020: Detect Duplicate Keys in Source

**Given** source file with rows: [{id:1, name:"John"}, {id:1, name:"Jane"}]
**And** target file with row: {id:1, name:"John"}
**And** rule set with key field "id"
**When** executeReconciliation() is called
**Then** DUPLICATE exception is created for duplicate source key "1"
**And** exception severity is HIGH
**And** exception details list both duplicate records

---

### TC-RS-021: Detect Duplicate Keys in Target

**Given** source file with row: {id:1, name:"John"}
**And** target file with rows: [{id:1, name:"John"}, {id:1, name:"Jane"}]
**And** rule set with key field "id"
**When** executeReconciliation() is called
**Then** DUPLICATE exception is created for duplicate target key "1"
**And** exception references both duplicate target records

---

## Composite Key Tests

### TC-RS-022: Match on Composite Key Fields

**Given** source row: {id:1, category:"A", amount:100}
**And** target row: {id:1, category:"A", amount:100}
**And** rule set with composite key fields ["id", "category"]
**When** executeReconciliation() is called
**Then** composite key "1|A" is generated for both records
**And** records are matched successfully

---

### TC-RS-023: Mismatch on Composite Key

**Given** source row: {id:1, category:"A", amount:100}
**And** target row: {id:1, category:"B", amount:100}
**And** rule set with composite key fields ["id", "category"]
**When** executeReconciliation() is called
**Then** composite keys "1|A" and "1|B" do not match
**And** MISSING_TARGET exception is created for "1|A"
**And** MISSING_SOURCE exception is created for "1|B"

---

## Large Dataset Tests

### TC-RS-024: Reconcile 10,000 Row Dataset

**Given** source file with 10,000 rows
**And** target file with 9,500 matching rows and 500 mismatches
**And** rule set with key field "id" and EXACT matches
**When** executeReconciliation() is called
**Then** reconciliation completes within 60 seconds
**And** all 10,000 source records are processed
**And** 9,500 records are matched
**And** 500 exceptions are created
**And** matchRate = 95.0

---

## Progress Tracking Tests

### TC-RS-025: Update Progress During Long Reconciliation

**Given** a reconciliation with 10,000 records
**When** executeReconciliation() is in progress
**Then** status is IN_PROGRESS
**And** progress percentage is updated every 1,000 records
**And** progress can be queried via getReconciliationStatus()

---

## Cancellation Tests

### TC-RS-026: Cancel In-Progress Reconciliation

**Given** a reconciliation with status IN_PROGRESS
**And** processing is at 50% completion
**When** cancelReconciliation() is called
**Then** processing is interrupted
**And** status is updated to CANCELLED
**And** partial results are preserved
**And** no further processing occurs

---

### TC-RS-027: Cannot Cancel Completed Reconciliation

**Given** a reconciliation with status COMPLETED
**When** cancelReconciliation() is called
**Then** IllegalStateException is thrown
**And** exception message is "Cannot cancel completed reconciliation"

---

## Error Handling Tests

### TC-RS-028: Handle Missing Source File

**Given** reconciliation references non-existent source file ID
**When** executeReconciliation() is called
**Then** status is updated to FAILED
**And** error message is "Source file not found"
**And** no processing occurs

---

### TC-RS-029: Handle Invalid Rule Set

**Given** rule set has no key fields defined
**When** executeReconciliation() is called
**Then** status is updated to FAILED
**And** error message is "Rule set must have at least one key field"

---

## Match Rate Calculation Tests

### TC-RS-030: Calculate Match Rate Correctly

**Given** totalSourceRecords = 1,000
**And** matchedRecords = 850
**When** match rate is calculated
**Then** matchRate = (850 / 1,000) * 100 = 85.0
**And** matchRate is stored with 2 decimal precision

---

## Statistics Output Tests

### TC-RS-031: Store Reconciliation Statistics JSONB

**Given** a completed reconciliation
**When** statistics are persisted
**Then** statistics include totalSourceRecords, totalTargetRecords, matchedRecords
**And** unmatchedSourceRecords, unmatchedTargetRecords, exceptionCount are stored

---

## Progress Milestone Tests

### TC-RS-032: Progress Updates at Milestones

**Given** a reconciliation with parsed source and target files
**When** executeReconciliation() is called
**Then** progress updates at 20% after source parse
**And** progress updates at 40% after target parse
**And** progress updates at 90% during matching
**And** progress updates to 100% on completion

---

## Cancellation Status Tests

### TC-RS-033: Cancellation Sets Status to CANCELLED

**Given** a reconciliation in PENDING or IN_PROGRESS status
**When** cancelReconciliation() is called
**Then** status becomes CANCELLED
**And** cancelledAt timestamp is recorded

---

## Test Data Requirements

### CSV Files
- `source_data_exact_match.csv`: 3 rows, 100% match
- `source_data_with_mismatches.csv`: 4 rows with value mismatches
- `target_data_missing_records.csv`: 2 rows (missing 2 from source)
- `source_fuzzy_matching.csv`: Names with typos
- `target_fuzzy_matching.csv`: Corrected names
- `source_numeric_tolerance.csv`: Amounts with small differences
- `large_dataset_source.csv`: 10,000 rows

### Mock Objects
- UploadedFile entities with parsed data
- RuleSet entities with various matching rules
- ReconciliationRepository mock
- ExceptionRepository mock
