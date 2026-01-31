# TC-AiController - Integration Tests

**Module**: AI Integration
**Component**: AiController
**Test Level**: Integration Test
**Total Test Cases**: 2

---

## Mapping Suggestion Tests

### TC-AIC-001: POST /api/ai/suggest-mappings - Get Field Mapping Suggestions

**Given** request body contains:
```json
{
  "sourceSchema": [
    {"name": "invoice_id", "type": "INTEGER", "uniqueCount": 950, "sampleValues": ["1", "2", "3"]},
    {"name": "customer_name", "type": "TEXT", "uniqueCount": 850, "sampleValues": ["Acme Corp", "TechCo"]},
    {"name": "total_amount", "type": "CURRENCY", "uniqueCount": 920, "sampleValues": ["$1,000.00", "$2,500.00"]}
  ],
  "targetSchema": [
    {"name": "id", "type": "INTEGER", "uniqueCount": 1000, "sampleValues": ["1", "2", "3"]},
    {"name": "client_name", "type": "TEXT", "uniqueCount": 900, "sampleValues": ["Acme Corp", "TechCo"]},
    {"name": "amount", "type": "CURRENCY", "uniqueCount": 980, "sampleValues": ["$1,000.00", "$2,500.00"]}
  ]
}
```
**And** request header "X-Organization-Id: org-123"
**When** POST request is sent to /api/ai/suggest-mappings
**Then** HTTP status 200 OK is returned
**And** response body contains suggested mappings:
```json
{
  "mappings": [
    {"sourceField": "invoice_id", "targetField": "id", "confidence": 0.95, "isKeyField": true},
    {"sourceField": "customer_name", "targetField": "client_name", "confidence": 0.88, "isKeyField": false},
    {"sourceField": "total_amount", "targetField": "amount", "confidence": 0.92, "isKeyField": false}
  ]
}
```

---

## Rule Suggestion Tests

### TC-AIC-002: POST /api/ai/suggest-rules - Get Matching Rule Suggestions

**Given** request body contains field mappings:
```json
{
  "fieldMappings": [
    {"sourceField": "customer_name", "targetField": "client_name", "sourceType": "TEXT"},
    {"sourceField": "total_amount", "targetField": "amount", "sourceType": "CURRENCY"},
    {"sourceField": "invoice_ref", "targetField": "reference", "sourceType": "TEXT"}
  ]
}
```
**And** request header "X-Organization-Id: org-123"
**When** POST request is sent to /api/ai/suggest-rules
**Then** HTTP status 200 OK is returned
**And** response body contains suggested matching rules:
```json
{
  "rules": [
    {"field": "customer_name", "matchType": "FUZZY", "threshold": 0.85, "reasoning": "Text field with potential typos"},
    {"field": "total_amount", "matchType": "RANGE", "tolerance": 0.50, "reasoning": "Currency field with potential rounding differences"},
    {"field": "invoice_ref", "matchType": "EXACT", "reasoning": "Reference field requiring exact match"}
  ]
}
```

---

## Test Configuration

### Test Environment
- `@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)`
- Mock AI service (or use test API key with rate limiting)
- MockMvc or RestAssured

### Test Data Setup
- Sample schemas with various column types
- Field mappings with different data types

### Required Endpoints
- POST /api/ai/suggest-mappings
- POST /api/ai/suggest-rules

### Headers
- `X-Organization-Id`: Organization identifier
- `Content-Type: application/json`

### Notes
- Consider using mock AI responses for faster, more reliable tests
- Actual AI integration can be tested in separate E2E tests
