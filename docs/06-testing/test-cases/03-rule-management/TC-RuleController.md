# TC-RuleController - Integration Tests

**Module**: Rule Management
**Component**: RuleController
**Test Level**: Integration Test
**Total Test Cases**: 8

---

## Create Rule Set Tests

### TC-RUC-001: POST /api/rules - Create Rule Set with Field Mappings

**Given** request body:
```json
{
  "name": "Invoice Reconciliation Rules",
  "fieldMappings": [
    {"sourceField": "invoice_id", "targetField": "id", "isKeyField": true},
    {"sourceField": "customer_name", "targetField": "client_name", "transform": "UPPERCASE"},
    {"sourceField": "total_amount", "targetField": "amount"}
  ],
  "matchingRules": [
    {"field": "customer_name", "matchType": "FUZZY", "threshold": 0.85},
    {"field": "total_amount", "matchType": "RANGE", "tolerance": 0.50}
  ]
}
```
**And** request header "X-Organization-Id: org-123"
**When** POST request is sent to /api/rules
**Then** HTTP status 201 Created is returned
**And** response body contains: id, name, version (1), fieldMappings, matchingRules
**And** rule set is saved to database

---

### TC-RUC-002: POST /api/rules - Validation Error for Missing Key Field

**Given** request body without any keyField=true mapping
**When** POST request is sent to /api/rules
**Then** HTTP status 400 Bad Request is returned
**And** error message is "At least one key field is required"

---

## Update Rule Set Tests

### TC-RUC-003: PUT /api/rules/{id} - Update Rule Set

**Given** rule set "rule-123" exists with version 2
**And** request body adds new field mapping:
```json
{
  "fieldMappings": [
    {"sourceField": "discount", "targetField": "discount_amount"}
  ]
}
```
**When** PUT request is sent to /api/rules/rule-123
**Then** HTTP status 200 OK is returned
**And** response shows version incremented to 3
**And** new field mapping is included

---

## Add Mappings and Rules Tests

### TC-RUC-004: POST /api/rules/{id}/mappings - Add Field Mapping

**Given** rule set "rule-456" exists
**And** request body:
```json
{
  "sourceField": "order_date",
  "targetField": "purchase_date",
  "isKeyField": false
}
```
**When** POST request is sent to /api/rules/rule-456/mappings
**Then** HTTP status 201 Created is returned
**And** new mapping is added to rule set
**And** version is incremented

---

### TC-RUC-005: POST /api/rules/{id}/matching-rules - Add Matching Rule

**Given** rule set "rule-789" exists
**And** request body:
```json
{
  "field": "reference",
  "matchType": "PATTERN",
  "patternType": "STARTS_WITH",
  "pattern": "REF-"
}
```
**When** POST request is sent to /api/rules/rule-789/matching-rules
**Then** HTTP status 201 Created is returned
**And** new matching rule is added
**And** rule is linked to rule set

---

## Retrieve and List Tests

### TC-RUC-006: GET /api/rules - List All Rule Sets

**Given** organization "org-123" has 3 rule sets
**And** request header "X-Organization-Id: org-123"
**When** GET request is sent to /api/rules
**Then** HTTP status 200 OK is returned
**And** response contains array of 3 rule sets
**And** each rule set includes: id, name, version, fieldMappings, matchingRules

---

### TC-RUC-008: GET /api/rules/{id} - Retrieve Rule Set Details

**Given** rule set "rule-321" exists with version 4
**When** GET request is sent to /api/rules/rule-321
**Then** HTTP status 200 OK is returned
**And** response includes version and rule configuration

---

## Delete Tests

### TC-RUC-007: DELETE /api/rules/{id} - Delete Rule Set

**Given** rule set "rule-999" exists
**When** DELETE request is sent to /api/rules/rule-999
**Then** HTTP status 204 No Content is returned
**And** rule set is deleted from database
**And** subsequent GET request returns 404 Not Found

---

## Test Configuration

### Test Environment
- `@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)`
- TestContainers PostgreSQL
- MockMvc or RestAssured

### Test Data Setup
- Create test rule sets with various configurations
- Seed field mappings and matching rules

### Required Endpoints
- POST /api/rules
- PUT /api/rules/{id}
- POST /api/rules/{id}/mappings
- POST /api/rules/{id}/matching-rules
- GET /api/rules
- GET /api/rules/{id}
- DELETE /api/rules/{id}

### Headers
- `X-Organization-Id`: Organization identifier
- `Content-Type: application/json`
