# TC-ExceptionController - Integration Tests

**Module**: Exception Management
**Component**: ExceptionController
**Test Level**: Integration Test
**Total Test Cases**: 5

---

## List Exceptions Tests

### TC-EC-001: GET /api/reconciliations/{id}/exceptions - List with Filters

**Given** reconciliation "recon-123" has 20 exceptions
**And** query parameters: type=VALUE_MISMATCH, severity=HIGH, status=OPEN, page=0, size=10
**When** GET request is sent to /api/reconciliations/recon-123/exceptions?type=VALUE_MISMATCH&severity=HIGH&status=OPEN
**Then** HTTP status 200 OK is returned
**And** response body contains paginated exception list
**And** only exceptions matching all filter criteria are returned
**And** pagination metadata included: totalElements, totalPages, pageNumber, pageSize

---

### TC-EC-002: GET /api/reconciliations/{id}/exceptions - No Filters

**Given** reconciliation "recon-456" has 15 exceptions
**And** no query parameters provided
**When** GET request is sent to /api/reconciliations/recon-456/exceptions
**Then** HTTP status 200 OK is returned
**And** all 15 exceptions are returned (paginated)
**And** default page size is applied (e.g., 20)

---

## Single Exception Retrieval Tests

### TC-EC-003: GET /api/exceptions/{id} - Retrieve Exception Details

**Given** exception "exc-789" exists
**And** exception has:
- type: VALUE_MISMATCH
- severity: HIGH
- status: OPEN
- field: "amount"
- sourceValue: "100.00"
- targetValue: "150.00"
**When** GET request is sent to /api/exceptions/exc-789
**Then** HTTP status 200 OK is returned
**And** response body contains all exception details:
```json
{
  "id": "exc-789",
  "reconciliationId": "recon-123",
  "type": "VALUE_MISMATCH",
  "severity": "HIGH",
  "status": "OPEN",
  "field": "amount",
  "sourceValue": "100.00",
  "targetValue": "150.00",
  "description": "Value mismatch in field 'amount'",
  "aiSuggestion": null,
  "createdDate": "2024-01-15T10:30:00Z"
}
```

---

## Update Exception Tests

### TC-EC-004: PUT /api/exceptions/{id} - Update Exception Status

**Given** exception "exc-111" has status OPEN
**And** request body:
```json
{
  "status": "RESOLVED",
  "resolution": "Corrected in source system",
  "resolvedBy": "user-456"
}
```
**When** PUT request is sent to /api/exceptions/exc-111
**Then** HTTP status 200 OK is returned
**And** exception status is updated to RESOLVED
**And** resolution details are saved
**And** response includes updated exception with resolvedDate

---

## Bulk Update Tests

### TC-EC-005: POST /api/exceptions/bulk-update - Bulk Update Exceptions

**Given** exceptions ["exc-001", "exc-002", "exc-003"] have status OPEN
**And** request body:
```json
{
  "exceptionIds": ["exc-001", "exc-002", "exc-003"],
  "status": "ACKNOWLEDGED"
}
```
**When** POST request is sent to /api/exceptions/bulk-update
**Then** HTTP status 200 OK is returned
**And** response message is "3 exceptions updated successfully"
**And** all 3 exceptions have status ACKNOWLEDGED

---

## Test Configuration

### Test Environment
- `@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)`
- TestContainers PostgreSQL
- MockMvc or RestAssured

### Test Data Setup
- Create reconciliations with exceptions
- Seed exceptions with various types, severities, and statuses

### Required Endpoints
- GET /api/reconciliations/{id}/exceptions
- GET /api/exceptions/{id}
- PUT /api/exceptions/{id}
- POST /api/exceptions/bulk-update
- GET /api/exceptions/{id}/ai-suggestion (optional)

### Headers
- `X-Organization-Id`: Organization identifier
- `Content-Type: application/json`
