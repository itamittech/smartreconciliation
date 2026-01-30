# TC-ReconciliationRepository - Repository Tests

**Module**: Reconciliation Engine
**Component**: ReconciliationRepository
**Test Level**: Repository Test
**Total Test Cases**: 3

---

## Entity Persistence Tests

### TC-RR-001: Save and Retrieve Reconciliation Entity

**Given** a Reconciliation entity with:
- name: "Q1 2024 Reconciliation"
- status: COMPLETED
- matchRate: 95.5
- totalSourceRecords: 1000
- totalTargetRecords: 980
- matchedRecords: 955
- unmatchedRecords: 45
- organizationId: "org-123"
**When** repository.save() is called
**And** repository.findById() is called with the saved ID
**Then** entity is persisted to database
**And** retrieved entity matches all field values
**And** timestamps (createdDate, completedDate) are populated

---

## Organization-Based Filtering Tests

### TC-RR-002: Find Reconciliations by Organization

**Given** database contains:
- 3 reconciliations for organization "org-123"
- 2 reconciliations for organization "org-456"
**When** repository.findByOrganizationId("org-123") is called
**Then** exactly 3 reconciliations are returned
**And** all returned reconciliations belong to "org-123"

---

## Status Update Tests

### TC-RR-003: Update Reconciliation Status

**Given** a reconciliation with status PENDING
**And** entity is persisted in database
**When** entity status is updated to IN_PROGRESS
**And** repository.save() is called
**Then** status is updated in database
**And** retrieved entity has status IN_PROGRESS

---

## Test Configuration

### Test Annotations
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Testcontainers
```

### Test Database
- TestContainers PostgreSQL instance
- Schema auto-generated from entities

### Test Data
- Reconciliation entities with various statuses
- Multiple organizations
- Related entities: UploadedFile, RuleSet
