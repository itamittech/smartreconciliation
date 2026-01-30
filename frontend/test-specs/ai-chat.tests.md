# AI Chat Tests

## Overview
Tests for ChatPage conversational AI interface including text messages, file uploads, streaming responses, and chat history management.

**Component**: `frontend/src/pages/ChatPage.tsx`

---

## Test Scenarios

### CHAT-001: Send Text Message to AI
**Objective**: Verify user can send messages and receive AI responses

**Prerequisites**:
- AI backend is configured with valid API key (Anthropic Claude, OpenAI, or DeepSeek)
- Chat session can be created
- User authenticated

**Test Steps**:
1. Navigate to ChatPage at `/chat`
2. Verify welcome message displays for new users
3. Verify chat input field is focused automatically
4. Type message: "I want to reconcile bank statements"
5. Verify character count updates (if implemented)
6. Click send button or press Enter
7. Verify message appears in chat history immediately with:
   - "user" role badge
   - Message text
   - Timestamp
8. Verify loading indicator shows while AI processes
9. Verify AI response appears in chat history with:
   - "assistant" role badge
   - Response text
   - Timestamp
10. Verify response is stored in Zustand chat store
11. Send follow-up message: "Use exact matching"
12. Verify context is maintained in conversation
13. Verify AI references previous message

**Expected Results**:
- User messages appear immediately without API delay
- AI responses stream in (if streaming enabled) or appear after loading
- Message history persists during session
- Conversation context maintained across messages
- Timestamps display in human-readable format (e.g., "2:34 PM")
- Messages scrollable in chat container
- Auto-scroll to latest message

**Edge Cases**:
- Empty message: Send button disabled
- Very long message (>5000 chars): Warning or truncation
- AI API error: Error message displayed inline, user can retry
- Very long AI response: Message container scrollable
- Network timeout: Timeout error after 30s with retry option
- Rapid successive messages: Queued and processed in order

**API Endpoint**: `POST /api/chat/message`

**Request Payload**:
```json
{
  "message": "I want to reconcile bank statements",
  "conversationId": "conv-123",
  "context": {
    "previousMessages": [],
    "availableFiles": []
  }
}
```

**Response Payload**:
```json
{
  "response": "I can help you reconcile bank statements...",
  "conversationId": "conv-123",
  "suggestions": ["Upload bank statement", "Upload accounting data"]
}
```

**Code Reference**: `frontend/src/pages/ChatPage.tsx:78-145`

---

### CHAT-002: File Upload via Chat
**Objective**: Verify user can upload files through chat interface

**Prerequisites**:
- Chat session active
- Valid CSV file prepared (e.g., sample_transactions.csv with headers, <100MB)

**Test Steps**:
1. Open ChatPage
2. Locate file upload button (paperclip icon or similar)
3. Click file upload button
4. Select valid CSV file from file system dialog
5. Verify file size validation (<100MB) before upload
6. Verify upload progress bar appears
7. Verify API POST to `/api/files/upload` with multipart/form-data
8. Verify success message displays with file metadata:
   - Filename
   - Size (formatted, e.g., "2.5 MB")
   - Row count detected
   - Column preview
9. Verify AI acknowledges file upload with message:
   - "I've received your file..."
   - File analysis summary
   - Detected columns and sample data
10. Send message: "Use this for reconciliation"
11. Verify AI references uploaded file in response
12. Upload second file (target file)
13. Verify both files tracked in conversation context

**Expected Results**:
- File uploads successfully
- Progress indicator shows upload status (0-100%)
- AI response includes file analysis
- File metadata stored for reconciliation use
- Multiple files can be uploaded in same session
- Uploaded files appear in chat history as attachments

**Alternative Upload Method**:
1. Drag CSV file from file explorer
2. Drop onto chat interface drag-drop zone
3. Verify same upload flow as click method

**Edge Cases**:
- File too large (>100MB): Error message before upload starts
- Unsupported format (.txt, .pdf, .exe): Error message "Unsupported file type"
- Network interruption during upload: Retry option or resume
- Duplicate filename: Backend handles (rename or overwrite)
- Corrupted CSV: Backend returns error, shown in chat
- Empty CSV (no data rows): Warning message
- CSV with very long rows (>1000 columns): Performance warning

**API Endpoint**: `POST /api/files/upload`

**Request**: FormData with file

**Response**:
```json
{
  "fileId": "file-456",
  "filename": "transactions.csv",
  "size": 2621440,
  "rows": 1523,
  "columns": 8,
  "columnNames": ["Date", "Description", "Amount", "Balance"],
  "status": "analyzed"
}
```

**Code Reference**: `frontend/src/pages/ChatPage.tsx:189-245`

---

### CHAT-003: Clear Chat History
**Objective**: Verify user can clear conversation history

**Prerequisites**:
- Active chat session with at least 3 messages

**Test Steps**:
1. Send 3+ messages in chat to build history
2. Locate clear chat button (trash icon or menu option)
3. Click clear chat button
4. Verify confirmation dialog appears with warning:
   - "Are you sure you want to clear this conversation?"
   - "This action cannot be undone"
5. Click "Cancel" button
6. Verify chat history remains unchanged
7. Click clear chat button again
8. Click "Confirm" button
9. Verify chat history emptied from UI
10. Verify Zustand store cleared (`chatMessages = []`)
11. Verify conversation ID reset
12. Verify welcome message reappears
13. Send new message
14. Verify new conversation started with fresh ID

**Expected Results**:
- Confirmation dialog prevents accidental clears
- All messages removed from UI and store
- New conversation can start fresh
- Previous conversation not recoverable (unless saved to backend)
- No console errors during clear

**Edge Cases**:
- Clear during AI response: Cancels pending request and clears
- Clear with uploaded files: Files removed from context
- Multiple rapid clears: Debounced to prevent issues

**Code Reference**: `frontend/src/pages/ChatPage.tsx:256-289`

---

### CHAT-004: AI Streaming Response
**Objective**: Verify AI responses stream in real-time (if streaming enabled)

**Prerequisites**:
- AI provider supports streaming (Anthropic Claude API with streaming)
- Streaming enabled in settings

**Test Steps**:
1. Send message: "Explain how to reconcile transactions"
2. Observe AI response area
3. Verify response appears word-by-word or chunk-by-chunk
4. Verify streaming indicator (animated cursor or dots)
5. Verify user can scroll during streaming
6. Verify user can send another message during streaming
7. Verify partial response stored in real-time
8. Wait for streaming to complete
9. Verify final complete response stored
10. Verify streaming indicator removed

**Expected Results**:
- Response streams smoothly without jitter
- Partial text readable during streaming
- Auto-scroll follows streaming content
- Streaming stops correctly on completion
- Error during streaming shows error state

**Edge Cases**:
- Network interruption mid-stream: Shows partial response with error
- Very fast streaming: UI keeps up without lag
- User navigates away during streaming: Stream cancelled
- User clears chat during streaming: Stream cancelled and cleared

**Technical Implementation**: Server-Sent Events (SSE) or WebSocket

**Code Reference**: `frontend/src/services/api.ts:234-278` (streaming handler)

---

### CHAT-005: Chat Message History Persistence
**Objective**: Verify chat history persists across page reloads

**Prerequisites**:
- Chat session with 5+ messages

**Test Steps**:
1. Send 5 messages with AI responses
2. Note conversation ID and message count
3. Refresh browser page (F5)
4. Verify chat history reloads from backend or localStorage
5. Verify all messages appear in correct order
6. Verify conversation ID remains same
7. Send new message
8. Verify continues in same conversation
9. Close browser tab
10. Reopen application and navigate to `/chat`
11. Verify previous conversation still accessible (if saved)

**Expected Results**:
- History persists across refreshes
- Messages load in correct chronological order
- Conversation context maintained
- Can resume conversation after reload

**Alternative Behavior**:
- If history not persisted: Starts fresh conversation on reload

**Storage Options**:
- Zustand persist middleware with localStorage
- Backend conversation storage with user account
- Session storage (lost on tab close)

**Code Reference**: `frontend/src/store/index.ts:45-67` (chat store persistence)

---

### CHAT-006: AI Suggestions and Quick Actions
**Objective**: Verify AI provides actionable suggestions and quick reply buttons

**Prerequisites**:
- Chat session active

**Test Steps**:
1. Send message: "I need help reconciling"
2. Verify AI response includes suggestion chips/buttons:
   - "Upload Files"
   - "View Existing Reconciliations"
   - "Create New Reconciliation"
3. Click "Upload Files" suggestion
4. Verify file upload dialog opens or navigates to files page
5. Return to chat
6. Send message: "What matching rules should I use?"
7. Verify AI response includes rule suggestions:
   - "Exact Match"
   - "Fuzzy Match"
   - "Date Range Match"
8. Click "Exact Match" suggestion
9. Verify AI acknowledges selection and updates context

**Expected Results**:
- Suggestions relevant to conversation context
- Clicking suggestion sends action or message to AI
- Suggestions update based on conversation flow
- Visual distinction between text and suggestion buttons

**Edge Cases**:
- No relevant suggestions: No buttons shown
- Too many suggestions: Scrollable or limited to top 3

**Code Reference**: `frontend/src/components/ChatSuggestions.tsx:12-56`

---

### CHAT-007: Chat Input Validation and Controls
**Objective**: Verify chat input field validation and control features

**Prerequisites**:
- Chat page loaded

**Test Steps**:
1. Focus chat input field
2. Verify placeholder text: "Ask me anything about reconciliation..."
3. Type single character
4. Verify send button becomes enabled
5. Clear input field
6. Verify send button becomes disabled
7. Type very long message (>5000 characters)
8. Verify character count warning appears
9. Verify send button disabled if over limit
10. Paste multi-line text with formatting
11. Verify formatting preserved or stripped appropriately
12. Press Shift+Enter
13. Verify creates new line (doesn't send)
14. Press Enter alone
15. Verify sends message
16. Type message while AI is responding
17. Verify can queue next message

**Expected Results**:
- Input validation prevents empty messages
- Character limit enforced
- Multi-line input supported
- Keyboard shortcuts work correctly
- Input clears after successful send

**Edge Cases**:
- Paste very long text: Truncated with warning
- Special characters (emoji, unicode): Display correctly
- HTML/script tags: Sanitized before display
- Rapid typing: No input lag

**Code Reference**: `frontend/src/pages/ChatPage.tsx:45-76`

---

### CHAT-008: Chat Error Handling and Retry
**Objective**: Verify chat handles errors gracefully with retry options

**Prerequisites**:
- Chat session active
- Ability to simulate API errors

**Test Steps**:
1. Send message: "Hello"
2. Simulate backend error (500 Internal Server Error)
3. Verify error message displays inline in chat:
   - "Failed to send message"
   - Error reason (if available)
   - "Retry" button
4. Click "Retry" button
5. Verify same message resent
6. Simulate network timeout
7. Verify timeout error after 30s:
   - "Request timed out"
   - "Retry" button
8. Restore normal backend
9. Click "Retry"
10. Verify message sends successfully

**Expected Results**:
- Error messages user-friendly, not technical
- Retry button resends exact same message
- Error state doesn't break chat functionality
- Can send new messages after error
- Error messages visually distinct (red background or icon)

**Edge Cases**:
- Multiple rapid retries: Debounced or disabled during retry
- Permanent error (401 Unauthorized): Redirects to login
- AI provider API key invalid: Shows configuration error

**Code Reference**: `frontend/src/services/hooks.ts:89-134` (error handling)

---

### CHAT-009: Multi-Turn Conversation Context
**Objective**: Verify AI maintains context across multiple message turns

**Prerequisites**:
- Chat session active

**Test Steps**:
1. Send message: "I have two CSV files to reconcile"
2. Verify AI response acknowledges files needed
3. Send message: "One is from the bank"
4. Verify AI references "first file" or "bank file"
5. Send message: "The other is from our accounting system"
6. Verify AI references both files
7. Upload first file
8. Send message: "Use exact matching for amounts"
9. Upload second file
10. Send message: "Start the reconciliation"
11. Verify AI references all previous context:
    - Two files uploaded
    - Exact matching preference
    - Ready to start reconciliation
12. Verify AI creates reconciliation with correct settings

**Expected Results**:
- AI maintains context for entire conversation
- References previous messages appropriately
- Understands pronouns and references (it, that, the file, etc.)
- Context includes both messages and actions (file uploads)

**Edge Cases**:
- Very long conversation (>20 messages): Context window management
- Contradictory statements: AI asks for clarification
- Context reset after clear: AI doesn't reference old conversation

**Code Reference**: Backend AI service manages context window

---

### CHAT-010: Chat with Different AI Providers
**Objective**: Verify chat works with multiple configured AI providers

**Prerequisites**:
- Multiple AI providers configured in settings (Anthropic, OpenAI, DeepSeek)

**Test Steps**:
1. Go to Settings > AI Settings
2. Select "Anthropic Claude" as provider
3. Save settings
4. Navigate to chat page
5. Send message: "Hello, which AI are you?"
6. Verify response indicates Claude (if provider identifies itself)
7. Go to Settings > AI Settings
8. Select "OpenAI" as provider
9. Save settings
10. Navigate to chat page
11. Verify new conversation started (or continue existing)
12. Send message and verify response from OpenAI model
13. Compare response style and capabilities

**Expected Results**:
- Switching providers works seamlessly
- Each provider responds appropriately
- Response quality consistent with provider capabilities
- Provider selection persists across sessions

**Edge Cases**:
- Provider API key missing: Error message with link to settings
- Provider rate limit exceeded: Shows rate limit error
- Provider service down: Falls back to alternative provider (if configured)

**Code Reference**: `frontend/src/services/api.ts:45-89` (provider selection)

---

## Integration Points

### API Endpoints
- `POST /api/chat/message` - Send message and get AI response
- `POST /api/files/upload` - Upload file via chat
- `GET /api/chat/conversations/{id}` - Load conversation history
- `DELETE /api/chat/conversations/{id}` - Clear conversation
- `POST /api/reconciliations` - Create reconciliation from chat

### State Management
- Zustand store:
  - `chatMessages: Message[]`
  - `conversationId: string`
  - `uploadedFiles: File[]`
  - `isAIResponding: boolean`
- React Query cache keys:
  - `['chat', 'conversation', conversationId]`

### Navigation
- `/chat` - Main chat interface
- `/files` - Linked from file upload success
- `/reconciliations` - Linked from reconciliation creation

### Components Used
- `ChatMessage` - Individual message display
- `ChatInput` - Message input field
- `FileUploadZone` - Drag-drop file upload
- `ChatSuggestions` - AI suggestion chips
- `StreamingIndicator` - AI typing indicator
- `ErrorRetryBanner` - Error state with retry

---

## Test Data Requirements

### Sample Chat Message
```json
{
  "id": "msg-001",
  "role": "user",
  "content": "I want to reconcile bank statements",
  "timestamp": "2026-01-30T14:23:45Z",
  "conversationId": "conv-123"
}
```

### Sample AI Response
```json
{
  "id": "msg-002",
  "role": "assistant",
  "content": "I can help you reconcile bank statements. Please upload your bank statement file and your accounting records file...",
  "timestamp": "2026-01-30T14:23:48Z",
  "conversationId": "conv-123",
  "suggestions": [
    {
      "id": "sug-1",
      "label": "Upload Files",
      "action": "uploadFiles"
    },
    {
      "id": "sug-2",
      "label": "View Tutorial",
      "action": "viewTutorial"
    }
  ]
}
```

---

## Performance Benchmarks

- Message send response: <100ms (UI update)
- AI response time: 1-5 seconds (depends on provider)
- File upload (10MB): <2 seconds
- Streaming latency: <500ms for first chunk
- Chat history load: <1 second

---

## Accessibility Requirements

- Chat input accessible via keyboard
- Screen reader announces new messages
- ARIA live region for AI responses
- Focus management on message send
- Keyboard shortcuts:
  - Enter: Send message
  - Shift+Enter: New line
  - Ctrl+K: Clear chat
  - Ctrl+U: Upload file

---

## Notes

- Chat is the primary AI interaction point
- May integrate with reconciliation wizard in future
- Consider rate limiting to prevent API abuse
- Message history may be limited to last 50 messages for performance
- Streaming requires SSE or WebSocket support
