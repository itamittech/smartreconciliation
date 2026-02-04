# TC-AiService - Unit Tests

**Module**: AI Integration
**Component**: AiService
**Test Level**: Unit Test
**Total Test Cases**: 13

---

## Field Mapping Suggestions Tests

### TC-AI-001: Generate Field Mapping Suggestions

**Given** source file schema with columns: ["invoice_id", "customer_name", "total_amount", "order_date"]
**And** target file schema with columns: ["id", "client_name", "amount", "purchase_date"]
**When** suggestFieldMappings() is called with both schemas
**Then** AI model is invoked with prompt containing both schemas
**And** response contains suggested mappings:
```json
[
  {"sourceField": "invoice_id", "targetField": "id", "confidence": 0.95, "isKeyField": true},
  {"sourceField": "customer_name", "targetField": "client_name", "confidence": 0.88, "isKeyField": false},
  {"sourceField": "total_amount", "targetField": "amount", "confidence": 0.92, "isKeyField": false},
  {"sourceField": "order_date", "targetField": "purchase_date", "confidence": 0.85, "isKeyField": false}
]
```
**And** confidence scores are between 0 and 1

---

### TC-AI-002: Parse JSON Response Wrapped in Markdown

**Given** AI returns response wrapped in markdown code block:
```
Here are the suggested mappings:

```json
[
  {"sourceField": "id", "targetField": "invoice_id", "confidence": 0.95}
]
```

Let me know if you need adjustments.
```
**When** parseAiResponse() is called
**Then** JSON content is extracted from markdown block
**And** parsed as valid JSON array
**And** mapping objects are correctly deserialized

---

### TC-AI-003: Parse Plain JSON Response

**Given** AI returns plain JSON without markdown:
```json
[
  {"sourceField": "id", "targetField": "invoice_id", "confidence": 0.95}
]
```
**When** parseAiResponse() is called
**Then** JSON is parsed directly
**And** mapping objects are correctly deserialized

---

### TC-AI-004: Handle Missing Fields with Defaults

**Given** AI response is missing "confidence" field:
```json
[
  {"sourceField": "id", "targetField": "invoice_id"}
]
```
**When** parseAiResponse() is called
**Then** default confidence value 0.5 is assigned
**And** mapping is still valid

---

### TC-AI-005: Identify Key Fields in Suggestions

**Given** source schema includes column "id" with high uniqueness (95%)
**And** target schema includes column "invoice_id" with high uniqueness (98%)
**When** suggestFieldMappings() is called
**Then** AI identifies these as likely key fields
**And** mapping includes isKeyField=true for id→invoice_id

---

## Matching Rule Suggestions Tests

### TC-AI-006: Suggest Matching Rules Based on Field Types

**Given** field mappings:
- "customer_name" → "client_name" (TEXT type)
- "amount" → "total_amount" (CURRENCY type)
- "reference" → "ref_number" (TEXT type)
**When** suggestMatchingRules() is called
**Then** AI suggests:
- FUZZY match for "customer_name" with threshold 0.85
- RANGE match for "amount" with tolerance 0.50
- EXACT match for "reference"
**And** suggestions include reasoning for each rule type

---

### TC-AI-007: Suggest Pattern Matching for Reference Fields

**Given** field mapping: "invoice_ref" → "reference"
**And** sample values show pattern: "INV-12345", "INV-67890"
**When** suggestMatchingRules() is called
**Then** AI suggests PATTERN match with STARTS_WITH pattern "INV-"
**And** confidence score indicates pattern detection certainty

---

## Exception Resolution Suggestions Tests

### TC-AI-008: Suggest Resolution for Value Mismatch

**Given** exception type VALUE_MISMATCH
**And** field "customer_name"
**And** sourceValue "John Smith"
**And** targetValue "Jon Smith"
**When** suggestResolution() is called
**Then** AI analyzes the mismatch
**And** suggests: "Possible typo in source. Recommended action: Update source to 'Jon Smith' or configure fuzzy matching with threshold 0.90"

---

### TC-AI-009: Suggest Resolution for Missing Record

**Given** exception type MISSING_TARGET
**And** sourceRecord: {id: "123", name: "Acme Corp", amount: "1000"}
**When** suggestResolution() is called
**Then** AI suggests: "Record exists in source but not in target. Verify if record was deleted in target system or if there's a data synchronization issue."

---

## Chat Integration Tests

### TC-AI-010: Send Sync Chat Message

**Given** user message "What is the match rate for Q1 reconciliations?"
**And** chat context includes recent reconciliation statistics
**When** sendChatMessage() is called with sync=true
**Then** AI model processes message with context
**And** response is returned as single string
**And** response addresses the question with relevant data

---

### TC-AI-011: Stream Chat Message

**Given** user message "Explain the fuzzy matching algorithm"
**And** streaming is enabled
**When** sendChatMessage() is called with stream=true
**Then** Flux<String> is returned for streaming response
**And** tokens are emitted as they're generated
**And** complete response is assembled from token stream

---

## Error Handling Tests

### TC-AI-012: Handle AI Service Unavailable

**Given** AI service endpoint is unreachable
**When** suggestFieldMappings() is called
**Then** RuntimeException is thrown
**And** exception message is "AI service unavailable"
**And** error is logged with details

---

### TC-AI-013: Select Provider Based on Configuration

**Given** app.ai.provider is set to "openai"
**When** AiService initializes
**Then** the OpenAI ChatModel is used for requests
**And** switching provider to "anthropic" uses the Anthropic model

---

## Test Data Requirements

### Sample Schemas
- Source: ["invoice_id", "customer_name", "total_amount", "order_date", "status"]
- Target: ["id", "client_name", "amount", "purchase_date", "state"]

### Sample Field Types
- INTEGER: id columns with high uniqueness
- TEXT: name, description fields
- CURRENCY: amount, price, total fields
- DATE: order_date, purchase_date
- PERCENTAGE: discount, tax_rate

### Sample Exceptions
- VALUE_MISMATCH: {field: "amount", source: "100.00", target: "100.50"}
- MISSING_TARGET: {sourceRecord: {id: "123", name: "Acme", amount: "1000"}}
- MISSING_SOURCE: {targetRecord: {id: "456", name: "TechCo", amount: "2000"}}

### Mock Objects
- ChatModel mock returning String responses
- StreamingChatModel mock returning Flux<String>
- AI response strings with various formats (markdown, plain JSON)
