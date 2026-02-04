# TC-ExceptionService - Unit Tests

**Module**: Exception Management
**Component**: ExceptionService
**Test Level**: Unit Test
**Total Test Cases**: 18

---

## Exception Filtering Tests

### TC-ES-001: Filter Exceptions by Type

**Given** reconciliation "recon-123" has 10 exceptions:
- 4 VALUE_MISMATCH
- 3 MISSING_TARGET
- 2 MISSING_SOURCE
- 1 DUPLICATE
**And** filter criteria: type=VALUE_MISMATCH
**When** listExceptions() is called with filter
**Then** 4 exceptions are returned
**And** all exceptions have type VALUE_MISMATCH

---

### TC-ES-002: Filter Exceptions by Severity

**Given** reconciliation has exceptions with severities:
- 2 CRITICAL
- 5 HIGH
- 8 MEDIUM
- 5 LOW
**And** filter criteria: severity=HIGH
**When** listExceptions() is called
**Then** 5 exceptions are returned
**And** all exceptions have severity HIGH

---

### TC-ES-003: Filter Exceptions by Status

**Given** reconciliation has exceptions with statuses:
- 10 OPEN
- 5 RESOLVED
- 3 ACKNOWLEDGED
**And** filter criteria: status=OPEN
**When** listExceptions() is called
**Then** 10 exceptions are returned
**And** all exceptions have status OPEN

---

### TC-ES-004: Filter with Multiple Criteria

**Given** reconciliation has 20 exceptions with various attributes
**And** filter criteria: type=VALUE_MISMATCH, severity=CRITICAL, status=OPEN
**When** listExceptions() is called
**Then** only exceptions matching ALL criteria are returned
**And** exceptions have type=VALUE_MISMATCH AND severity=CRITICAL AND status=OPEN

---

### TC-ES-005: Filter with No Matching Results

**Given** reconciliation has no DUPLICATE exceptions
**And** filter criteria: type=DUPLICATE
**When** listExceptions() is called
**Then** empty list is returned
**And** no exceptions are included

---

## Pagination Tests

### TC-ES-006: Paginate Exception List

**Given** reconciliation has 50 exceptions
**And** page request: page=0, size=10
**When** listExceptions() is called with pagination
**Then** first 10 exceptions are returned
**And** total pages = 5
**And** total elements = 50

---

### TC-ES-007: Retrieve Second Page

**Given** reconciliation has 50 exceptions
**And** page request: page=1, size=10
**When** listExceptions() is called
**Then** exceptions 11-20 are returned
**And** page number is 1

---

## Status Update Tests

### TC-ES-008: Update Exception Status to RESOLVED

**Given** exception "exc-123" has status OPEN
**And** update request: status=RESOLVED, resolution="Corrected in source system"
**And** resolver: "user-456"
**When** updateExceptionStatus() is called
**Then** exception status is updated to RESOLVED
**And** resolution field is set to "Corrected in source system"
**And** resolvedBy is set to "user-456"
**And** resolvedDate is set to current timestamp

---

### TC-ES-009: Update Exception Status to ACKNOWLEDGED

**Given** exception "exc-456" has status OPEN
**When** updateExceptionStatus() is called with status=ACKNOWLEDGED
**Then** exception status is updated to ACKNOWLEDGED
**And** acknowledgedDate is set
**And** no resolution is required

---

### TC-ES-010: Cannot Reopen Resolved Exception

**Given** exception "exc-789" has status RESOLVED
**When** updateExceptionStatus() is called with status=OPEN
**Then** IllegalStateException is thrown
**And** exception message is "Cannot reopen resolved exception"

---

## Bulk Update Tests

### TC-ES-011: Bulk Update Multiple Exceptions

**Given** exceptions: ["exc-001", "exc-002", "exc-003"]
**And** all have status OPEN
**And** bulk update request: status=ACKNOWLEDGED
**When** bulkUpdateExceptions() is called
**Then** all 3 exceptions are updated to ACKNOWLEDGED
**And** operation completes in single transaction

---

### TC-ES-012: Bulk Update with Partial Failure

**Given** exceptions: ["exc-111", "exc-222", "exc-999"]
**And** "exc-999" does not exist
**When** bulkUpdateExceptions() is called
**Then** exceptions "exc-111" and "exc-222" are updated
**And** error is logged for "exc-999"
**And** successful updates are committed

---

## AI Suggestion Tests

### TC-ES-013: Generate AI Suggestion for Value Mismatch

**Given** exception type VALUE_MISMATCH
**And** field "customer_name"
**And** sourceValue "John Smith"
**And** targetValue "Jon Smith"
**When** generateAiSuggestion() is called
**Then** aiService.suggestResolution() is invoked with exception details
**And** AI response is returned: "Possible typo in source. Suggested: Update source to 'Jon Smith'"
**And** suggestion is cached in exception entity

---

### TC-ES-014: Return Cached AI Suggestion

**Given** exception "exc-333" already has cached AI suggestion
**When** generateAiSuggestion() is called again
**Then** cached suggestion is returned immediately
**And** aiService is NOT called (to save API costs)

---

## Exception Counting Tests

### TC-ES-015: Count Exceptions by Status

**Given** reconciliation "recon-888" has:
- 15 OPEN exceptions
- 10 RESOLVED exceptions
- 5 ACKNOWLEDGED exceptions
**When** countExceptionsByStatus() is called
**Then** Map is returned with counts:
```json
{
  "OPEN": 15,
  "RESOLVED": 10,
  "ACKNOWLEDGED": 5
}
```

---

## Severity and Workflow Tests

### TC-ES-016: Assign Severity Based on Key Field

**Given** a value mismatch on a key field
**When** exception is created
**Then** severity is CRITICAL
**And** non-key field mismatches are MEDIUM by default

---

### TC-ES-017: Update Exception Status to IN_REVIEW

**Given** exception "exc-901" has status OPEN
**When** updateExceptionStatus() is called with status=IN_REVIEW
**Then** status is updated to IN_REVIEW
**And** reviewedDate is set

---

### TC-ES-018: Update Exception Status to IGNORED

**Given** exception "exc-902" has status IN_REVIEW
**When** updateExceptionStatus() is called with status=IGNORED
**Then** status is updated to IGNORED
**And** ignoredDate is set with resolver identity

---

## Test Data Requirements

### Exception Entities
- Types: VALUE_MISMATCH, MISSING_SOURCE, MISSING_TARGET, DUPLICATE
- Severities: CRITICAL, HIGH, MEDIUM, LOW
- Statuses: OPEN, RESOLVED, ACKNOWLEDGED
- Fields: Key fields vs non-key fields
- Sample data:
  - sourceValue: "John Smith", targetValue: "Jon Smith"
  - sourceValue: "100.00", targetValue: "100.50"

### Mock Objects
- ReconciliationExceptionRepository with custom query methods
- AiService mock for suggestion generation
- Pageable objects for pagination testing

### Filter Combinations
- Single filter: type, severity, status
- Multiple filters: type + severity, type + status, severity + status
- All filters: type + severity + status
