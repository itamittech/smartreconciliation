# TC-DashboardService - Unit Tests

**Module**: Dashboard & Analytics
**Component**: DashboardService
**Test Level**: Unit Test
**Total Test Cases**: 3

---

## Summary Statistics Tests

### TC-DS-001: Calculate Summary Statistics for Organization

**Given** organization "org-123" has 5 reconciliations:
- Recon 1: COMPLETED, 1,000 records, 95.5% match rate, 10 open exceptions
- Recon 2: COMPLETED, 500 records, 88.0% match rate, 25 open exceptions
- Recon 3: IN_PROGRESS, 2,000 records, 0% match rate, 0 exceptions
- Recon 4: COMPLETED, 750 records, 100% match rate, 0 exceptions
- Recon 5: FAILED, 0 records, 0% match rate, 0 exceptions
**When** getSummaryStatistics() is called with organizationId "org-123"
**Then** summary statistics are returned:
```json
{
  "totalReconciliations": 5,
  "completedReconciliations": 3,
  "inProgressReconciliations": 1,
  "failedReconciliations": 1,
  "averageMatchRate": 94.5,
  "totalRecordsProcessed": 4250,
  "totalOpenExceptions": 35,
  "totalResolvedExceptions": 0
}
```

---

## Average Match Rate Tests

### TC-DS-002: Calculate Average Match Rate for Completed Reconciliations

**Given** organization has completed reconciliations with match rates:
- Reconciliation 1: 95.5%
- Reconciliation 2: 88.0%
- Reconciliation 3: 100%
- Reconciliation 4: 85.0%
**And** 1 IN_PROGRESS reconciliation (excluded)
**And** 1 FAILED reconciliation (excluded)
**When** calculateAverageMatchRate() is called
**Then** average match rate = (95.5 + 88.0 + 100 + 85.0) / 4 = 92.125%
**And** only COMPLETED reconciliations are included in calculation

---

## Recent Reconciliations Tests

### TC-DS-003: Retrieve Recent Reconciliations

**Given** organization "org-456" has 10 reconciliations
**And** reconciliations have various completion dates
**And** request limit = 5
**When** getRecentReconciliations() is called with limit 5
**Then** 5 most recent reconciliations are returned
**And** reconciliations are ordered by completedDate descending
**And** each reconciliation includes: id, name, status, matchRate, completedDate

---

## Test Data Requirements

### Reconciliation Entities
- Statuses: COMPLETED, IN_PROGRESS, FAILED, CANCELLED, PENDING
- Match rates: 0%, 50%, 85.0%, 88.0%, 92.3%, 95.5%, 100%
- Record counts: 0 (failed), 100, 500, 750, 1,000, 2,000, 10,000
- Completion dates: Last 30 days with various timestamps

### Exception Counts
- Open exceptions: 0, 5, 10, 25, 50
- Resolved exceptions: 0, 10, 20, 30

### Mock Objects
- ReconciliationRepository with findByOrganizationId()
- ReconciliationExceptionRepository for exception counts
- LocalDateTime mocks for date filtering

### Calculation Validations
- Average match rate precision: 2 decimal places
- Exclude non-completed reconciliations from averages
- Handle empty result sets (0 reconciliations)
