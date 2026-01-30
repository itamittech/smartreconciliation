# TC-ChatService - Unit Tests

**Module**: Chat System
**Component**: ChatService
**Test Level**: Unit Test
**Total Test Cases**: 11

---

## Session Creation Tests

### TC-CS-001: Create Chat Session with Reconciliation Context

**Given** reconciliation "recon-123" exists
**And** user "user-456" belongs to organization "org-789"
**When** createSession() is called with reconciliationId and userId
**Then** ChatSession entity is created with unique ID
**And** session links to reconciliationId "recon-123"
**And** session status is ACTIVE
**And** createdDate is set to current timestamp

---

### TC-CS-002: Create Chat Session without Reconciliation

**Given** user "user-456" wants general assistance
**When** createSession() is called with userId only (no reconciliationId)
**Then** ChatSession is created without reconciliation link
**And** session is general-purpose (not context-specific)
**And** session status is ACTIVE

---

## Message Sending Tests

### TC-CS-003: Send User Message

**Given** chat session "session-111" exists
**And** user message content: "What is the current match rate?"
**When** sendMessage() is called with sessionId and message
**Then** ChatMessage entity is created with role USER
**And** message content is stored
**And** message is linked to session "session-111"
**And** timestamp is recorded

---

### TC-CS-004: Generate AI Response Message

**Given** chat session with user message "What is the match rate?"
**And** session is linked to reconciliation "recon-123"
**And** reconciliation has matchRate = 85.5%
**When** generateAiResponse() is called
**Then** context is built with reconciliation statistics
**And** AI service is invoked with context + user message
**And** AI response is returned: "The current match rate for this reconciliation is 85.5%"
**And** ChatMessage entity is created with role ASSISTANT
**And** response is saved to database

---

## Context Building Tests

### TC-CS-005: Build Context with Reconciliation Statistics

**Given** session linked to reconciliation "recon-789"
**And** reconciliation has:
- matchRate: 92.3%
- totalSourceRecords: 1,000
- matchedRecords: 923
- unmatchedRecords: 77
- exception counts: 50 OPEN, 27 RESOLVED
**When** buildContext() is called
**Then** context string includes:
```
Reconciliation Context:
- Match Rate: 92.3%
- Total Records: 1,000 source
- Matched: 923
- Unmatched: 77
- Open Exceptions: 50
- Resolved Exceptions: 27
```

---

### TC-CS-006: Include Recent Messages in Context

**Given** session has 10 previous messages
**And** messages include user questions and AI responses
**When** buildContext() is called
**Then** last 5 messages are included in context
**And** message format is: "USER: <message>\nASSISTANT: <response>"
**And** context provides conversation continuity

---

## Auto-Session Creation Tests

### TC-CS-007: Auto-Create Session on First Message

**Given** no active session exists for user "user-999"
**And** user sends message for reconciliation "recon-555"
**When** sendMessage() is called without sessionId
**Then** new session is automatically created
**And** session is linked to reconciliation "recon-555"
**And** user message is added to new session
**And** session ID is returned

---

## Message Streaming Tests

### TC-CS-008: Stream AI Response

**Given** chat session "session-222"
**And** user message "Explain fuzzy matching algorithm"
**When** streamAiResponse() is called
**Then** Flux<String> is returned for streaming
**And** tokens are emitted as they're generated: ["Fuzzy", " matching", " uses", " Levenshtein", "..."]
**And** complete response is assembled from stream
**And** final message is saved to database with complete content

---

### TC-CS-009: Handle Streaming Error

**Given** streaming is in progress
**And** AI service connection drops mid-stream
**When** Flux error occurs
**Then** partial response is saved with error flag
**And** error message is logged
**And** user is notified of incomplete response

---

## Message History Tests

### TC-CS-010: Retrieve Message History

**Given** session "session-333" has 20 messages
**And** request for page 0, size 10
**When** getMessages() is called with pagination
**Then** first 10 messages are returned
**And** messages are ordered by timestamp ascending
**And** each message includes: id, sessionId, role, content, timestamp

---

## Session Management Tests

### TC-CS-011: List Active Sessions for User

**Given** user "user-777" has:
- 3 ACTIVE sessions
- 2 CLOSED sessions
**When** listSessions() is called with userId "user-777"
**Then** only 3 ACTIVE sessions are returned
**And** sessions are ordered by last message timestamp descending
**And** each session includes: id, reconciliationId (if any), status, createdDate

---

## Test Data Requirements

### ChatSession Entities
- Sessions with and without reconciliationId
- Statuses: ACTIVE, CLOSED
- Multiple sessions per user

### ChatMessage Entities
- Roles: USER, ASSISTANT
- Various message contents (questions, responses, errors)
- Timestamps for ordering

### Mock Objects
- ChatSessionRepository with save/find operations
- ChatMessageRepository with pagination
- AiService mock for response generation
- Flux<String> for streaming responses

### Sample Messages
- User: "What is the match rate?", "Explain fuzzy matching", "How many exceptions are open?"
- Assistant: Statistics responses, algorithm explanations, guidance

### Reconciliation Context Data
- Match rates: 50%, 85.5%, 92.3%, 100%
- Record counts: 100, 1,000, 10,000
- Exception counts by status
