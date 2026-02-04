# TC-GlobalExceptionHandler - Integration Tests

**Module**: Cross-Cutting Concerns
**Component**: GlobalExceptionHandler
**Test Level**: Integration Test
**Total Test Cases**: 6

---

### TC-GEH-001: Validation Error Response

**Given** a request with invalid fields
**When** the controller validates the payload
**Then** HTTP 400 is returned
**And** response body includes field-level errors

---

### TC-GEH-002: File Processing Error Response

**Given** FileProcessingException is thrown
**When** the exception is handled globally
**Then** HTTP 422 is returned
**And** response contains errorCode "FILE_PROCESSING_ERROR"

---

### TC-GEH-003: Reconciliation Error Response

**Given** ReconciliationException is thrown
**When** the exception is handled
**Then** HTTP 400 is returned
**And** response contains reconciliationId (if present)

---

### TC-GEH-004: AI Service Error Response

**Given** AiServiceException is thrown
**When** the exception is handled
**Then** HTTP 503 is returned
**And** response contains a retryable flag

---

### TC-GEH-005: Max Upload Size Error

**Given** a file upload exceeds limits
**When** MaxUploadSizeExceededException is thrown
**Then** HTTP 413 is returned
**And** response includes maxSize bytes

---

### TC-GEH-006: Unhandled Exception Response

**Given** a RuntimeException is thrown
**When** it bubbles to the handler
**Then** HTTP 500 is returned
**And** response contains a generic error message

