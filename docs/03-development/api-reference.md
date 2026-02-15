# API Reference

Smart Reconciliation REST API v1 Documentation

## Base URL

```
http://localhost:8080/api/v1
```

## Response Format

All API responses follow a standard envelope structure:

```json
{
  "success": true,
  "message": "Operation description",
  "data": { },
  "timestamp": "2026-01-31T10:30:00"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "timestamp": "2026-01-31T10:30:00"
}
```

## Authentication

Currently in development phase - no authentication required. Production deployment will support:
- JWT token-based authentication
- OAuth 2.0 integration
- API key authentication

---

## File Management

### Upload File

Upload a single file for reconciliation.

**Endpoint:** `POST /files/upload`

**Request:**
```http
POST /api/v1/files/upload
Content-Type: multipart/form-data

file: transactions.csv
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": 1,
    "originalFilename": "transactions_2024.csv",
    "fileType": "CSV",
    "fileSize": 2048576,
    "rowCount": 15000,
    "columnCount": 12,
    "uploadedAt": "2026-01-31T10:30:00",
    "status": "PROCESSED"
  }
}
```

**Supported File Types:**
- CSV (`.csv`)
- Excel (`.xlsx`, `.xls`)

---

### Get File Details

Retrieve metadata about an uploaded file.

**Endpoint:** `GET /files/{id}`

**Request:**
```http
GET /api/v1/files/123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "fileName": "transactions_2024.csv",
    "fileType": "CSV",
    "fileSize": 2048576,
    "rowCount": 15000,
    "columnCount": 12,
    "uploadedAt": "2026-01-31T10:30:00",
    "status": "PROCESSED"
  }
}
```

---

### List All Files

Get a list of all uploaded files.

**Endpoint:** `GET /files`

**Request:**
```http
GET /api/v1/files
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fileName": "source_data.csv",
      "fileType": "CSV",
      "rowCount": 10000,
      "uploadedAt": "2026-01-30T14:20:00"
    },
    {
      "id": 2,
      "fileName": "target_data.xlsx",
      "fileType": "EXCEL",
      "rowCount": 9850,
      "uploadedAt": "2026-01-30T14:22:00"
    }
  ]
}
```

---

### Preview File Data

Preview the first N rows of an uploaded file.

**Endpoint:** `GET /files/{id}/preview`

**Query Parameters:**
- `rows` (optional, default: 100) - Number of rows to preview

**Request:**
```http
GET /api/v1/files/123/preview?rows=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": 123,
    "fileName": "transactions.csv",
    "totalRows": 15000,
    "previewRows": 50,
    "columns": ["id", "date", "amount", "description"],
    "rows": [
      ["TXN001", "2024-01-15", "1500.00", "Payment received"],
      ["TXN002", "2024-01-16", "2300.50", "Invoice payment"]
    ]
  }
}
```

---

### Get File Schema

Get the detected schema for an uploaded file.

**Endpoint:** `GET /files/{id}/schema`

**Request:**
```http
GET /api/v1/files/123/schema
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": 123,
    "fileName": "transactions.csv",
    "columns": [
      {
        "name": "id",
        "dataType": "STRING",
        "nullable": false,
        "sampleValues": ["TXN001", "TXN002", "TXN003"]
      },
      {
        "name": "date",
        "dataType": "DATE",
        "nullable": false,
        "format": "yyyy-MM-dd",
        "sampleValues": ["2024-01-15", "2024-01-16"]
      },
      {
        "name": "amount",
        "dataType": "DECIMAL",
        "nullable": false,
        "precision": 10,
        "scale": 2,
        "sampleValues": ["1500.00", "2300.50", "750.25"]
      }
    ]
  }
}
```

---

### Delete File

Delete an uploaded file.

**Endpoint:** `DELETE /files/{id}`

**Request:**
```http
DELETE /api/v1/files/123
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": null
}
```

---

## Reconciliation

### Create Reconciliation

Start a new reconciliation process.

**Endpoint:** `POST /reconciliations`

**Request:**
```json
{
  "name": "January 2024 Bank Reconciliation",
  "description": "Reconcile bank statements with accounting records",
  "sourceFileId": 1,
  "targetFileId": 2,
  "ruleSetId": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reconciliation started",
  "data": {
    "id": 10,
    "name": "January 2024 Bank Reconciliation",
    "status": "PENDING",
    "progress": 0,
    "totalSourceRecords": 10000,
    "totalTargetRecords": 9850,
    "matchedRecords": 0,
    "unmatchedSourceRecords": 0,
    "unmatchedTargetRecords": 0,
    "exceptionCount": 0,
    "matchRate": 0.0,
    "createdAt": "2026-01-31T10:30:00"
  }
}
```

**Status Values:**
- `PENDING` - Reconciliation created, waiting to start
- `RUNNING` - Currently processing
- `COMPLETED` - Successfully completed
- `FAILED` - Failed with errors
- `CANCELLED` - Manually cancelled

---

### Get Reconciliation Details

Retrieve details about a specific reconciliation.

**Endpoint:** `GET /reconciliations/{id}`

**Request:**
```http
GET /api/v1/reconciliations/10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "January 2024 Bank Reconciliation",
    "description": "Reconcile bank statements with accounting records",
    "status": "COMPLETED",
    "progress": 100,
    "totalSourceRecords": 10000,
    "totalTargetRecords": 9850,
    "matchedRecords": 9800,
    "unmatchedSourceRecords": 200,
    "unmatchedTargetRecords": 50,
    "exceptionCount": 25,
    "matchRate": 98.0,
    "startedAt": "2026-01-31T10:30:00",
    "completedAt": "2026-01-31T10:45:00",
    "createdAt": "2026-01-31T10:30:00"
  }
}
```

---

### List All Reconciliations

Get a list of all reconciliations.

**Endpoint:** `GET /reconciliations`

**Request:**
```http
GET /api/v1/reconciliations
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "name": "January 2024 Bank Reconciliation",
      "status": "COMPLETED",
      "matchRate": 98.0,
      "createdAt": "2026-01-31T10:30:00"
    },
    {
      "id": 9,
      "name": "December 2023 Reconciliation",
      "status": "COMPLETED",
      "matchRate": 99.5,
      "createdAt": "2026-01-30T09:15:00"
    }
  ]
}
```

---

### Start Reconciliation

Trigger execution of a created reconciliation.

**Endpoint:** `POST /reconciliations/{id}/start`

**Request:**
```http
POST /api/v1/reconciliations/10/start
```

**Response:**
```json
{
  "success": true,
  "message": "Reconciliation started",
  "data": null
}
```

---

### Cancel Reconciliation

Cancel a running reconciliation.

**Endpoint:** `POST /reconciliations/{id}/cancel`

**Request:**
```http
POST /api/v1/reconciliations/10/cancel
```

**Response:**
```json
{
  "success": true,
  "message": "Reconciliation cancelled",
  "data": null
}
```

---

## Rules Management

### Create Rule Set

Create a new rule set for reconciliation.

**Endpoint:** `POST /rules`

**Request:**
```json
{
  "name": "Bank Statement Rules",
  "description": "Standard rules for bank reconciliation",
  "isAiGenerated": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rule set created successfully",
  "data": {
    "id": 5,
    "name": "Bank Statement Rules",
    "description": "Standard rules for bank reconciliation",
    "isAiGenerated": false,
    "fieldMappings": [],
    "matchingRules": [],
    "createdAt": "2026-01-31T10:30:00"
  }
}
```

Add field mappings and matching rules using the separate endpoints below.

**Match Types:**
- `EXACT` - Exact string/value match
- `FUZZY` - Levenshtein distance similarity (threshold 0–100)
- `RANGE` - Numeric range match
- `CONTAINS` - Source value contains target
- `STARTS_WITH` - Source value starts with target
- `ENDS_WITH` - Source value ends with target

---

### Get Rule Set

Retrieve a specific rule set.

**Endpoint:** `GET /rules/{id}`

**Request:**
```http
GET /api/v1/rules/5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Bank Statement Rules",
    "description": "Standard rules for bank reconciliation",
    "fieldMappings": [],
    "matchingRules": [],
    "createdAt": "2026-01-31T10:30:00",
    "updatedAt": "2026-01-31T10:30:00"
  }
}
```

---

### List All Rule Sets

Get all rule sets.

**Endpoint:** `GET /rules`

**Request:**
```http
GET /api/v1/rules
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Bank Statement Rules",
      "description": "Standard rules for bank reconciliation",
      "createdAt": "2026-01-31T10:30:00"
    },
    {
      "id": 4,
      "name": "Invoice Reconciliation",
      "description": "Rules for invoice matching",
      "createdAt": "2026-01-30T14:00:00"
    }
  ]
}
```

---

### Update Rule Set

Update an existing rule set.

**Endpoint:** `PUT /rules/{id}`

**Request:**
```json
{
  "name": "Updated Bank Statement Rules",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rule set updated successfully",
  "data": {
    "id": 5,
    "name": "Updated Bank Statement Rules",
    "description": "Updated description",
    "updatedAt": "2026-01-31T11:00:00"
  }
}
```

---

### Delete Rule Set

Delete a rule set.

**Endpoint:** `DELETE /rules/{id}`

**Request:**
```http
DELETE /api/v1/rules/5
```

**Response:**
```json
{
  "success": true,
  "message": "Rule set deleted successfully",
  "data": null
}
```

---

### Duplicate Rule Set

Create a copy of an existing rule set.

**Endpoint:** `POST /rules/{id}/duplicate`

**Request:**
```http
POST /api/v1/rules/5/duplicate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "Bank Statement Rules (Copy)",
    "fieldMappings": [],
    "matchingRules": []
  }
}
```

---

### Test Rule Set

Dry-run a rule set against a sample of data without saving results.

**Endpoint:** `POST /rules/{id}/test`

**Request:**
```json
{
  "sampleSize": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sampleSize": 100,
    "matchedCount": 92,
    "unmatchedCount": 8,
    "matchRate": 92.0,
    "details": []
  }
}
```

---

### Add Field Mapping

Add a field mapping to an existing rule set.

**Endpoint:** `POST /rules/{id}/mappings`

**Request:**
```json
{
  "sourceField": "customer_name",
  "targetField": "client_name",
  "isKeyField": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Field mapping added successfully",
  "data": {
    "id": 5,
    "fieldMappings": [
      {
        "id": 11,
        "sourceField": "customer_name",
        "targetField": "client_name",
        "isKeyField": false
      }
    ]
  }
}
```

---

### Add Matching Rule

Add a matching rule to an existing rule set.

**Endpoint:** `POST /rules/{id}/matching-rules`

**Request:**
```json
{
  "name": "Fuzzy Name Match",
  "sourceField": "customer_name",
  "targetField": "client_name",
  "matchType": "FUZZY",
  "threshold": 85
}
```

**Response:**
```json
{
  "success": true,
  "message": "Matching rule added successfully",
  "data": {
    "id": 5,
    "matchingRules": [
      {
        "id": 21,
        "name": "Fuzzy Name Match",
        "fields": ["customer_name"],
        "matchType": "FUZZY",
        "weight": 0.7,
        "threshold": 0.85
      }
    ]
  }
}
```

---

## Exception Management

### List Exceptions

Retrieve exceptions with filtering and pagination.

**Endpoint:** `GET /exceptions`

**Query Parameters:**
- `reconciliationId` (optional) - Filter by reconciliation ID
- `type` (optional) - Filter by exception type
- `severity` (optional) - Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
- `status` (optional) - Filter by status (OPEN, RESOLVED, IGNORED)
- `page` (default: 0) - Page number
- `size` (default: 20) - Page size
- `sortBy` (default: createdAt) - Sort field
- `sortDir` (default: desc) - Sort direction (asc, desc)

**Request:**
```http
GET /api/v1/exceptions?severity=HIGH&status=OPEN&page=0&size=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "reconciliationId": 10,
        "type": "AMOUNT_MISMATCH",
        "severity": "HIGH",
        "status": "OPEN",
        "description": "Amount differs by 0.01",
        "sourceData": {"id": "TXN001", "amount": 1500.00},
        "targetData": {"id": "TXN001", "amount": 1500.01},
        "createdAt": "2026-01-31T10:35:00"
      }
    ],
    "totalElements": 25,
    "totalPages": 2,
    "size": 20,
    "number": 0
  }
}
```

**Exception Types:**
- `VALUE_MISMATCH` - Field values don't match between source and target
- `MISSING_SOURCE` - Record exists in target but not in source
- `MISSING_TARGET` - Record exists in source but not in target
- `DUPLICATE` - Duplicate records detected in source or target
- `FORMAT_ERROR` - Data format/type validation failed
- `TOLERANCE_EXCEEDED` - Numeric difference exceeds allowed tolerance
- `POTENTIAL_MATCH` - AI identified a probable match the deterministic engine missed (typos, formatting differences)

---

### Get Exception Details

Retrieve details about a specific exception.

**Endpoint:** `GET /exceptions/{id}`

**Request:**
```http
GET /api/v1/exceptions/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "reconciliationId": 10,
    "type": "AMOUNT_MISMATCH",
    "severity": "HIGH",
    "status": "OPEN",
    "description": "Amount differs by 0.01",
    "sourceData": {
      "id": "TXN001",
      "date": "2024-01-15",
      "amount": 1500.00,
      "description": "Payment received"
    },
    "targetData": {
      "id": "TXN001",
      "date": "2024-01-15",
      "amount": 1500.01,
      "description": "Payment received"
    },
    "resolution": null,
    "resolvedBy": null,
    "resolvedAt": null,
    "createdAt": "2026-01-31T10:35:00"
  }
}
```

---

### Resolve Exception

Mark an exception as resolved with an optional note.

**Endpoint:** `PUT /exceptions/{id}/resolve`

**Request:**
```json
{
  "notes": "Amount difference is due to rounding. Acceptable variance."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exception resolved",
  "data": {
    "id": 1,
    "status": "RESOLVED",
    "resolvedAt": "2026-01-31T11:00:00"
  }
}
```

---

### Ignore Exception

Mark an exception as ignored.

**Endpoint:** `PUT /exceptions/{id}/ignore`

**Request:**
```http
PUT /api/v1/exceptions/1/ignore
```

**Response:**
```json
{
  "success": true,
  "message": "Exception ignored",
  "data": null
}
```

---

### Bulk Resolve Exceptions

Update multiple exceptions at once.

**Endpoint:** `POST /exceptions/bulk-resolve`

**Request:**
```json
{
  "exceptionIds": [1, 2, 3, 4, 5],
  "status": "RESOLVED",
  "resolution": "Approved by finance team"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exceptions updated successfully",
  "data": [
    {
      "id": 1,
      "status": "RESOLVED"
    },
    {
      "id": 2,
      "status": "RESOLVED"
    }
  ]
}
```

---

---

## AI Services

> **Note:** AI suggestions are automatically pre-populated on every exception during reconciliation (up to 50 per run). The `aiSuggestion` field is always present on exception responses — no extra request is needed.

### Suggest Field Mappings

Get AI-powered suggestions for mapping fields between source and target files.

**Endpoint:** `POST /ai/suggest-mappings`

**Request:**
```json
{
  "sourceFileId": 1,
  "targetFileId": 2,
  "sourceFields": ["txn_id", "amt", "customer"],
  "targetFields": ["transaction_id", "amount", "client_name"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mapping suggestions generated",
  "data": {
    "suggestions": [
      {
        "sourceField": "txn_id",
        "targetField": "transaction_id",
        "confidence": 0.95,
        "reason": "Semantic similarity and common naming pattern"
      },
      {
        "sourceField": "amt",
        "targetField": "amount",
        "confidence": 0.92,
        "reason": "Common abbreviation for amount"
      },
      {
        "sourceField": "customer",
        "targetField": "client_name",
        "confidence": 0.85,
        "reason": "Semantic equivalence"
      }
    ]
  }
}
```

---

### Suggest Matching Rules

Get AI-powered suggestions for reconciliation rules given accepted field mappings.

**Endpoint:** `POST /ai/suggest-rules`

**Request:**
```json
{
  "sourceFileId": 1,
  "targetFileId": 2,
  "acceptedMappings": [
    { "sourceField": "txn_id", "targetField": "transaction_id", "isKeyField": true },
    { "sourceField": "amt", "targetField": "amount", "isKeyField": false }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "name": "Transaction ID Exact Match",
        "sourceField": "txn_id",
        "targetField": "transaction_id",
        "matchType": "EXACT",
        "isKeyField": true,
        "threshold": null,
        "confidence": 0.98,
        "reasoning": "Primary identifier — exact match required"
      }
    ]
  }
}
```

---

### Suggest Exception Resolution

Request an AI-generated resolution suggestion for a specific exception. (Normally not needed — suggestions are auto-populated during reconciliation.)

**Endpoint:** `POST /ai/suggest-resolution/{exceptionId}`

**Request:**
```http
POST /api/v1/ai/suggest-resolution/123
```

**Response:**
```json
{
  "success": true,
  "data": "This $0.01 amount mismatch appears to be a rounding difference. Suggested action: Mark as resolved with 'Rounding variance' as the reason."
}
```

---

## Chat Interface

### Create Chat Session

Create a new chat session.

**Endpoint:** `POST /chat/sessions`

**Query Parameters:**
- `reconciliationId` (optional) - Associate session with a reconciliation

**Request:**
```http
POST /api/v1/chat/sessions?reconciliationId=10
```

**Response:**
```json
{
  "success": true,
  "message": "Chat session created",
  "data": {
    "id": 1,
    "reconciliationId": 10,
    "createdAt": "2026-01-31T10:30:00",
    "updatedAt": "2026-01-31T10:30:00"
  }
}
```

---

### List Chat Sessions

Get all chat sessions.

**Endpoint:** `GET /chat/sessions`

**Request:**
```http
GET /api/v1/chat/sessions
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reconciliationId": 10,
      "messageCount": 5,
      "lastMessageAt": "2026-01-31T10:45:00",
      "createdAt": "2026-01-31T10:30:00"
    }
  ]
}
```

---

### Get Chat Session

Retrieve a specific chat session.

**Endpoint:** `GET /chat/sessions/{id}`

**Request:**
```http
GET /api/v1/chat/sessions/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "reconciliationId": 10,
    "messageCount": 5,
    "createdAt": "2026-01-31T10:30:00",
    "updatedAt": "2026-01-31T10:45:00"
  }
}
```

---

### Get Chat Messages

Retrieve all messages in a chat session.

**Endpoint:** `GET /chat/sessions/{id}/messages`

**Request:**
```http
GET /api/v1/chat/sessions/1/messages
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "role": "USER",
      "content": "Can you help me understand why there are 25 exceptions?",
      "createdAt": "2026-01-31T10:35:00"
    },
    {
      "id": 2,
      "role": "ASSISTANT",
      "content": "I've analyzed the 25 exceptions in your reconciliation. Most are due to rounding differences in amounts (15 cases) and date format variations (10 cases). Would you like me to suggest automatic resolution rules?",
      "createdAt": "2026-01-31T10:35:05"
    }
  ]
}
```

---

### Delete Chat Session

Delete a chat session and all its messages.

**Endpoint:** `DELETE /chat/sessions/{id}`

**Request:**
```http
DELETE /api/v1/chat/sessions/1
```

**Response:**
```json
{
  "success": true,
  "message": "Chat session deleted",
  "data": null
}
```

---

### Send Message

Send a message in a chat session.

**Endpoint:** `POST /chat/message`

**Request:**
```json
{
  "message": "Can you suggest rules for matching these files?",
  "sessionId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": 3,
      "role": "USER",
      "content": "Can you suggest rules for matching these files?",
      "createdAt": "2026-01-31T10:40:00"
    },
    "assistantMessage": {
      "id": 4,
      "role": "ASSISTANT",
      "content": "Based on the file schemas, I recommend using transaction_id for exact matching, and amount with a ±0.01 tolerance. I can create these rules automatically if you'd like.",
      "createdAt": "2026-01-31T10:40:03"
    }
  }
}
```

---

### Stream Message

Send a message and receive a streaming response. **This is the primary chat endpoint** — the frontend uses this for real-time token-by-token rendering.

**Endpoint:** `POST /chat/stream`

**Response Content-Type:** `text/event-stream`

**Request:**
```json
{
  "message": "Explain the reconciliation results",
  "reconciliationId": 10
}
```

**Response:** (Server-Sent Events)
```
data: Based on the

data:  reconciliation

data:  results,

data:  you have

data:  a 98%

data:  match rate

data: ...
```

---

## Dashboard

### Get Dashboard Metrics

Retrieve dashboard metrics and statistics.

**Endpoint:** `GET /dashboard/metrics`

**Request:**
```http
GET /api/v1/dashboard/metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReconciliations": 150,
    "activeReconciliations": 3,
    "completedToday": 5,
    "averageMatchRate": 96.5,
    "totalExceptions": 45,
    "openExceptions": 12,
    "totalFiles": 300,
    "totalRules": 25
  }
}
```

---

## Health Check

### Application Health

Check application health status.

**Endpoint:** `GET /health`

**Request:**
```http
GET /api/v1/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "database": "UP",
    "aiService": "UP",
    "version": "0.0.1-SNAPSHOT",
    "timestamp": "2026-01-31T11:00:00"
  }
}
```

---

## Error Codes

### HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Application Error Codes

- `FILE_NOT_FOUND` - Requested file does not exist
- `INVALID_FILE_FORMAT` - Unsupported or corrupted file format
- `RECONCILIATION_NOT_FOUND` - Reconciliation does not exist
- `RULE_SET_NOT_FOUND` - Rule set does not exist
- `EXCEPTION_NOT_FOUND` - Exception does not exist
- `DATA_SOURCE_CONNECTION_FAILED` - Unable to connect to data source
- `AI_SERVICE_ERROR` - Error communicating with AI service

---

## Rate Limiting

Current implementation: No rate limiting in development.

Production recommendations:
- 100 requests per minute per IP for file uploads
- 1000 requests per minute for read operations
- 500 requests per minute for write operations

---

## Pagination

List endpoints support pagination with the following parameters:

- `page` - Page number (0-indexed, default: 0)
- `size` - Page size (default: 20, max: 100)
- `sortBy` - Sort field (default varies by endpoint)
- `sortDir` - Sort direction: `asc` or `desc` (default: desc)

Example:
```http
GET /api/v1/exceptions?page=1&size=50&sortBy=severity&sortDir=desc
```

---

## Changelog

### Version 1.0 (2026-01-31)

Initial API release with core functionality:
- File upload and management
- Reconciliation engine
- Rule management
- Exception handling
- AI-powered suggestions
- Chat interface
- Data source connections
