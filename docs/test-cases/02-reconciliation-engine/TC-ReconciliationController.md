# TC-ReconciliationController - Integration Tests

**Module**: Reconciliation Engine
**Component**: ReconciliationController
**Test Level**: Integration Test
**Total Test Cases**: 6

---

## Create Reconciliation Tests

### TC-RC-001: POST /api/reconciliations - Create Reconciliation

**Given** two uploaded files exist: source (file-001), target (file-002)
**And** a rule set exists (rule-001)
**And** request body contains:
```json
{
  "name": "Q1 2024 Reconciliation",
  "sourceFileId": "file-001",
  "targetFileId": "file-002",
  "ruleSetId": "rule-001"
}
```
**And** request header "X-Organization-Id: org-123"
**When** POST request is sent to /api/reconciliations
**Then** HTTP status 201 Created is returned
**And** response body contains: id, name, status (PENDING), createdDate
**And** reconciliation entity is saved to database

---

### TC-RC-002: POST /api/reconciliations - Missing Required Field

**Given** request body is missing "targetFileId":
```json
{
  "name": "Test Reconciliation",
  "sourceFileId": "file-001",
  "ruleSetId": "rule-001"
}
```
**When** POST request is sent to /api/reconciliations
**Then** HTTP status 400 Bad Request is returned
**And** error message is "targetFileId is required"

---

## Status and Results Retrieval Tests

### TC-RC-003: GET /api/reconciliations/{id} - Get Reconciliation Status

**Given** a reconciliation with ID "recon-123" exists
**And** status is COMPLETED
**And** matchRate is 85.5%
**And** matchedRecords = 855, unmatchedRecords = 145
**When** GET request is sent to /api/reconciliations/recon-123
**Then** HTTP status 200 OK is returned
**And** response body contains:
```json
{
  "id": "recon-123",
  "name": "Q1 2024 Reconciliation",
  "status": "COMPLETED",
  "matchRate": 85.5,
  "totalSourceRecords": 1000,
  "totalTargetRecords": 980,
  "matchedRecords": 855,
  "unmatchedRecords": 145,
  "createdDate": "2024-01-15T10:30:00Z",
  "completedDate": "2024-01-15T10:35:00Z"
}
```

---

### TC-RC-004: GET /api/reconciliations/{id}/exceptions - List Exceptions

**Given** reconciliation "recon-456" has 5 exceptions
**And** exceptions include: 2 VALUE_MISMATCH, 2 MISSING_TARGET, 1 DUPLICATE
**And** query parameters: type=VALUE_MISMATCH, severity=HIGH, page=0, size=10
**When** GET request is sent to /api/reconciliations/recon-456/exceptions?type=VALUE_MISMATCH&severity=HIGH
**Then** HTTP status 200 OK is returned
**And** response contains paginated list of exceptions filtered by type and severity
**And** only VALUE_MISMATCH exceptions with HIGH severity are returned

---

## Cancellation Tests

### TC-RC-005: POST /api/reconciliations/{id}/cancel - Cancel Reconciliation

**Given** reconciliation "recon-789" has status IN_PROGRESS
**And** processing is at 60% completion
**When** POST request is sent to /api/reconciliations/recon-789/cancel
**Then** HTTP status 200 OK is returned
**And** response message is "Reconciliation cancelled"
**And** reconciliation status is updated to CANCELLED

---

## List Reconciliations Tests

### TC-RC-006: GET /api/reconciliations - List All Reconciliations

**Given** organization "org-123" has 5 reconciliations
**And** request header "X-Organization-Id: org-123"
**And** query parameters: page=0, size=10, sort=createdDate,desc
**When** GET request is sent to /api/reconciliations
**Then** HTTP status 200 OK is returned
**And** response contains paginated list of 5 reconciliations
**And** reconciliations are sorted by createdDate descending
**And** each reconciliation includes: id, name, status, matchRate, createdDate

---

## Test Configuration

### Test Environment
- `@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)`
- TestContainers PostgreSQL
- MockMvc or RestAssured

### Test Data Setup
- Create test files with parsed data
- Create test rule sets
- Seed reconciliations with various statuses

### Required Endpoints
- POST /api/reconciliations
- GET /api/reconciliations/{id}
- GET /api/reconciliations/{id}/exceptions
- POST /api/reconciliations/{id}/cancel
- GET /api/reconciliations

### Headers
- `X-Organization-Id`: Organization identifier
- `Content-Type: application/json`
