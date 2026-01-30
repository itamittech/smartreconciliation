# TC-ChatController - Integration Tests

**Module**: Chat System
**Component**: ChatController
**Test Level**: Integration Test
**Total Test Cases**: 6

---

## Session Creation Tests

### TC-CC-001: POST /api/chat/sessions - Create Chat Session

**Given** request body:
```json
{
  "userId": "user-123",
  "reconciliationId": "recon-456"
}
```
**And** request header "X-Organization-Id: org-789"
**When** POST request is sent to /api/chat/sessions
**Then** HTTP status 201 Created is returned
**And** response body contains:
```json
{
  "sessionId": "session-xxx",
  "userId": "user-123",
  "reconciliationId": "recon-456",
  "status": "ACTIVE",
  "createdDate": "2024-01-15T10:30:00Z"
}
```

---

## Message Sending Tests

### TC-CC-002: POST /api/chat/sessions/{sessionId}/messages - Send Message

**Given** active session "session-111" exists
**And** request body:
```json
{
  "content": "What is the current match rate?"
}
```
**When** POST request is sent to /api/chat/sessions/session-111/messages
**Then** HTTP status 200 OK is returned
**And** response contains user message and AI response:
```json
{
  "userMessage": {
    "id": "msg-001",
    "role": "USER",
    "content": "What is the current match rate?",
    "timestamp": "2024-01-15T10:35:00Z"
  },
  "aiResponse": {
    "id": "msg-002",
    "role": "ASSISTANT",
    "content": "The current match rate for this reconciliation is 85.5%",
    "timestamp": "2024-01-15T10:35:02Z"
  }
}
```

---

## Streaming Tests

### TC-CC-003: GET /api/chat/sessions/{sessionId}/stream - Stream AI Response

**Given** active session "session-222" exists
**And** query parameter: message="Explain fuzzy matching algorithm"
**When** GET request is sent to /api/chat/sessions/session-222/stream?message=Explain%20fuzzy%20matching%20algorithm
**Then** HTTP status 200 OK is returned
**And** response header "Content-Type: text/event-stream"
**And** Server-Sent Events (SSE) stream is opened
**And** tokens are streamed: "data: Fuzzy\n\n", "data:  matching\n\n", "data:  uses\n\n", ...
**And** stream completes with "data: [DONE]\n\n"

---

## Message History Tests

### TC-CC-004: GET /api/chat/sessions/{sessionId}/messages - Get Message History

**Given** session "session-333" has 20 messages
**And** query parameters: page=0, size=10
**When** GET request is sent to /api/chat/sessions/session-333/messages?page=0&size=10
**Then** HTTP status 200 OK is returned
**And** response contains paginated message list:
```json
{
  "messages": [...],
  "totalElements": 20,
  "totalPages": 2,
  "pageNumber": 0,
  "pageSize": 10
}
```
**And** messages are ordered chronologically

---

## Session Listing Tests

### TC-CC-005: GET /api/chat/sessions - List User Sessions

**Given** user "user-777" has 3 active sessions
**And** request header "X-User-Id: user-777"
**When** GET request is sent to /api/chat/sessions
**Then** HTTP status 200 OK is returned
**And** response contains array of 3 sessions
**And** each session includes: sessionId, reconciliationId, status, createdDate, lastMessageDate

---

## Session Deletion Tests

### TC-CC-006: DELETE /api/chat/sessions/{sessionId} - Delete Session

**Given** session "session-999" exists with ACTIVE status
**When** DELETE request is sent to /api/chat/sessions/session-999
**Then** HTTP status 204 No Content is returned
**And** session status is updated to CLOSED (soft delete)
**And** messages are preserved but session is no longer active

---

## Test Configuration

### Test Environment
- `@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)`
- TestContainers PostgreSQL
- MockMvc or RestAssured
- SSE client for streaming tests

### Test Data Setup
- Create test users and sessions
- Seed sample messages
- Create test reconciliations for context

### Required Endpoints
- POST /api/chat/sessions
- POST /api/chat/sessions/{sessionId}/messages
- GET /api/chat/sessions/{sessionId}/stream
- GET /api/chat/sessions/{sessionId}/messages
- GET /api/chat/sessions
- DELETE /api/chat/sessions/{sessionId}

### Headers
- `X-Organization-Id`: Organization identifier
- `X-User-Id`: User identifier
- `Content-Type: application/json`
- `Accept: text/event-stream` (for streaming)

### Notes
- SSE streaming tests may require specialized client (e.g., WebClient with SSE support)
- Mock AI service responses for consistent testing
