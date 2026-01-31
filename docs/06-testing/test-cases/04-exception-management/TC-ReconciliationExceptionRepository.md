# TC-ReconciliationExceptionRepository - Repository Tests

**Module**: Exception Management
**Component**: ReconciliationExceptionRepository
**Test Level**: Repository Test
**Total Test Cases**: 3

---

## Filtering Tests

### TC-RER-001: Find Exceptions by Reconciliation ID

**Given** database contains:
- 10 exceptions for reconciliation "recon-123"
- 5 exceptions for reconciliation "recon-456"
**When** repository.findByReconciliationId("recon-123") is called
**Then** exactly 10 exceptions are returned
**And** all exceptions belong to reconciliation "recon-123"

---

## Custom Query Tests

### TC-RER-002: Custom Filter Query with Multiple Criteria

**Given** reconciliation "recon-789" has 20 exceptions
**And** database contains:
- 5 exceptions: type=VALUE_MISMATCH, severity=CRITICAL, status=OPEN
- 3 exceptions: type=VALUE_MISMATCH, severity=HIGH, status=OPEN
- 12 other exceptions with different attributes
**And** custom filter: type=VALUE_MISMATCH, severity=CRITICAL, status=OPEN
**When** repository.findByReconciliationIdAndFilters("recon-789", filters) is called
**Then** exactly 5 exceptions are returned
**And** all match the filter criteria

---

### TC-RER-003: Handle Null Filter Values

**Given** reconciliation "recon-999" has 15 exceptions
**And** filter criteria: type=VALUE_MISMATCH, severity=null, status=null
**When** repository.findByReconciliationIdAndFilters() is called
**Then** query ignores null filter values
**And** only type filter is applied
**And** all VALUE_MISMATCH exceptions are returned regardless of severity/status

---

## Test Configuration

### Test Annotations
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Testcontainers
```

### Test Database
- TestContainers PostgreSQL
- Schema auto-generated from entities

### Test Data
- ReconciliationException entities with various combinations:
  - Types: VALUE_MISMATCH, MISSING_SOURCE, MISSING_TARGET, DUPLICATE
  - Severities: CRITICAL, HIGH, MEDIUM, LOW
  - Statuses: OPEN, RESOLVED, ACKNOWLEDGED
- Multiple reconciliations
- Pageable objects for pagination testing

### Custom Query Methods
```java
Page<ReconciliationException> findByReconciliationIdAndFilters(
    String reconciliationId,
    ExceptionType type,
    Severity severity,
    Status status,
    Pageable pageable
);

Map<Status, Long> countByReconciliationIdGroupByStatus(String reconciliationId);
```
