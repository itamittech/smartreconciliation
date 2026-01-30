# Exception Management Tests

## Overview
Tests for ExceptionsPage including exception queue display, filtering by severity/status/type, AI suggestion acceptance, bulk operations, and resolution workflows.

**Component**: `frontend/src/pages/ExceptionsPage.tsx`

---

## Test Scenarios

### EXC-001: Load and Display Exceptions Queue
**Objective**: Verify exceptions load and display with summary cards

**Prerequisites**:
- At least 1 completed reconciliation with exceptions exists
- Exceptions include various types and severities

**Test Steps**:
1. Navigate to ExceptionsPage at `/exceptions`
2. Verify loading state displays spinner during API fetch
3. Verify summary cards display at top:
   - Critical count (red background/icon)
   - Open count (yellow background/icon)
   - Resolved count (green background/icon)
4. Verify exception list/table displays with cards/rows
5. For each exception, verify displays:
   - Exception type badge (Missing Source, Missing Target, Mismatch, Duplicate)
   - Severity indicator (Critical, Warning, Info)
   - Source data preview
   - Target data preview (or "N/A" for missing types)
   - AI suggestion section (if available)
   - Reconciliation name it belongs to
   - Created date
   - Action buttons: Accept AI, Reject, Investigate, Resolve Manually
6. Verify exceptions sorted by severity (Critical first) then created date
7. Verify backend data transformation correct:
   - Backend "CRITICAL" → Frontend "critical"
   - Backend "OPEN" → Frontend "open"
   - Backend "missing_source" → Frontend display "Missing Source"

**Expected Results**:
- All exceptions load successfully within 2 seconds
- Summary cards show accurate counts
- Exception cards/rows display all required fields
- Data transformed correctly from backend format to frontend display
- No console errors
- Scrollable list if many exceptions

**Edge Cases**:
- No exceptions: Empty state with message "No exceptions found" and "View Reconciliations" link
- API error: Error banner with retry button
- Large dataset (>100 exceptions): Pagination or infinite scroll implemented
- Very long source/target data: Truncated with "Show More" option
- Missing AI suggestion: Section not displayed or shows "No AI suggestion available"

**API Endpoint**: `GET /api/exceptions`

**Sample Response**:
```json
{
  "data": [
    {
      "id": "exc-001",
      "reconciliationId": "rec-001",
      "reconciliationName": "January 2026 Bank Reconciliation",
      "type": "missing_source",
      "severity": "critical",
      "status": "open",
      "sourceData": null,
      "targetData": {
        "date": "2026-01-15",
        "amount": 1250.00,
        "reference": "INV-2026-001"
      },
      "aiSuggestion": {
        "action": "match_with_similar",
        "confidence": 0.87,
        "reasoning": "Similar transaction found with matching amount and nearby date",
        "proposedMatch": {
          "date": "2026-01-16",
          "amount": 1250.00,
          "reference": "Payment Received"
        }
      },
      "createdAt": "2026-01-28T10:45:12Z"
    }
  ],
  "summary": {
    "total": 23,
    "critical": 5,
    "open": 18,
    "resolved": 5
  }
}
```

**Code Reference**: `frontend/src/pages/ExceptionsPage.tsx:56-134`

---

### EXC-002: Filter Exceptions by Severity
**Objective**: Verify severity filter works correctly

**Prerequisites**:
- Multiple exceptions with mixed severities (critical, warning, info)

**Test Steps**:
1. Navigate to ExceptionsPage with at least 15 exceptions
2. Note total exception count
3. Locate severity filter dropdown/tabs
4. Select "Critical" from severity filter
5. Verify only critical exceptions displayed
6. Verify critical count in summary card matches displayed count
7. Note filtered count (e.g., "Showing 5 of 23")
8. Verify all displayed exceptions have red severity indicator
9. Select "Warning" severity
10. Verify only warning severity exceptions shown
11. Verify all have yellow/orange severity indicator
12. Select "Info" severity
13. Verify only info severity exceptions shown
14. Verify all have blue/gray severity indicator
15. Select "All" to clear severity filter
16. Verify all exceptions reappear

**Expected Results**:
- Filters apply immediately (no loading delay if client-side)
- Filtered count displays correctly
- Multiple filters can combine (severity + status + type)
- Filter state visible in UI (active filter highlighted)
- Empty state if no matches: "No [severity] exceptions found"

**Edge Cases**:
- No exceptions of selected severity: Shows empty state
- Filter during search: Combines with search results
- Filter with pagination: Resets to page 1
- Clear all filters: Returns to all exceptions

**Code Reference**: `frontend/src/pages/ExceptionsPage.tsx:145-198`

---

### EXC-003: Filter Exceptions by Status
**Objective**: Verify status filter works correctly

**Prerequisites**:
- Exceptions with varied statuses (open, resolved, ignored)

**Test Steps**:
1. Load ExceptionsPage with mixed status exceptions
2. Verify status filter options:
   - All
   - Open
   - Resolved
   - Ignored
3. Select "Open" from status filter
4. Verify only open exceptions displayed
5. Verify open count in summary matches
6. Verify action buttons available (Accept, Reject, Investigate)
7. Select "Resolved" status
8. Verify only resolved exceptions shown
9. Verify resolution details displayed:
   - Resolved by: User name or "AI"
   - Resolved at: Timestamp
   - Resolution action: Description
10. Verify action buttons different (Reopen, View Details)
11. Select "Ignored" status
12. Verify only ignored exceptions shown
13. Verify ignored reason displayed (if captured)
14. Combine with severity filter (e.g., "Open" + "Critical")
15. Verify both filters applied

**Expected Results**:
- Status filter functions correctly
- Resolved exceptions show resolution metadata
- Ignored exceptions show ignore reason
- Can combine with other filters
- Filter persists during navigation

**Edge Cases**:
- No resolved exceptions: Shows empty state with "Great! No resolved exceptions yet"
- Filter by resolved + critical: Shows only resolved exceptions that were critical
- Status changes while viewing: Exception moves to appropriate filter

**Code Reference**: `frontend/src/pages/ExceptionsPage.tsx:200-267`

---

### EXC-004: Filter Exceptions by Type
**Objective**: Verify type filter works correctly

**Prerequisites**:
- Exceptions of all 4 types exist

**Test Steps**:
1. Verify exception type filter options:
   - All Types
   - Missing Source
   - Missing Target
   - Mismatch
   - Duplicate
2. Select "Missing Source" from type filter
3. Verify only missing_source exceptions shown
4. Verify each exception shows:
   - Source data: "N/A" or empty
   - Target data: Populated
   - Type badge: "Missing Source"
5. Note count of missing source exceptions
6. Select "Missing Target" type
7. Verify only missing_target exceptions shown
8. Verify source data populated, target empty
9. Select "Mismatch" type
10. Verify only mismatch exceptions shown
11. Verify both source and target data populated
12. Verify comparison/diff highlighting (if implemented)
13. Verify shows mismatched fields highlighted
14. Select "Duplicate" type
15. Verify only duplicate exceptions shown
16. Verify shows duplicate records with:
    - Original record
    - Duplicate record(s)
    - Duplicate detection reasoning

**Expected Results**:
- Type filter functions correctly
- Exception cards show appropriate data based on type
- Mismatch type shows field-by-field comparison
- Duplicate type shows all duplicate records
- Empty state for types with no exceptions

**Edge Cases**:
- Combine all three filters: Severity + Status + Type
- Mismatch with many fields: Scrollable or paginated comparison
- Duplicate with >2 records: Shows all duplicates in expandable section

**Code Reference**: `frontend/src/pages/ExceptionsPage.tsx:269-334`

---

### EXC-005: Accept AI Suggestion for Single Exception
**Objective**: Verify user can accept AI-suggested resolution

**Prerequisites**:
- At least 1 open exception with AI suggestion exists
- AI suggestion has confidence score >0.7

**Test Steps**:
1. Find exception card with AI suggestion displayed
2. Verify AI suggestion section shows:
   - Suggestion icon/badge
   - Confidence score (e.g., "87% confident")
   - Proposed action description
   - Reasoning explanation
   - "Accept" and "Reject" buttons
3. Read AI suggestion: "Match with similar transaction dated 2026-01-16"
4. Verify proposed match details displayed
5. Click "Accept" button on AI suggestion
6. Verify confirmation prompt (optional):
   - "Accept AI suggestion?"
   - Shows proposed action
   - "Confirm" and "Cancel" buttons
7. Click "Confirm"
8. Verify API PUT to `/api/exceptions/{id}/resolve`
9. Verify loading state on exception card during API call
10. Verify success toast: "Exception resolved successfully"
11. Verify exception status changes to "Resolved" immediately
12. Verify exception moves to resolved section or is filtered out (if viewing "Open" filter)
13. Verify summary cards update:
    - Open count decrements
    - Resolved count increments
14. Verify React Query cache invalidated

**Expected Results**:
- AI suggestion displays clearly with reasoning
- Confidence score helps user make informed decision
- Accept action resolves exception
- Status updates immediately in UI
- Resolved exceptions tracked with resolution method = "AI"
- Cache invalidation ensures data consistency
- No console errors

**Edge Cases**:
- API error on accept: Error toast, exception remains open
- No AI suggestion available: Only manual resolution options shown
- Low confidence suggestion (<0.6): Warning indicator
- Accept during API loading: Button disabled to prevent duplicate requests
- Network timeout: Timeout error after 30s with retry

**API Endpoint**: `PUT /api/exceptions/{id}/resolve`

**Request Payload**:
```json
{
  "resolutionMethod": "ai_suggestion",
  "aiSuggestionId": "sug-123",
  "action": "match_with_similar",
  "matchedRecordId": "rec-456"
}
```

**Response**:
```json
{
  "id": "exc-001",
  "status": "resolved",
  "resolvedBy": "AI",
  "resolvedAt": "2026-01-30T16:23:45Z",
  "resolution": {
    "method": "ai_suggestion",
    "action": "match_with_similar",
    "confidence": 0.87
  }
}
```

**Code Reference**: `frontend/src/pages/ExceptionsPage.tsx:445-512`

---

### EXC-006: Bulk Accept AI Suggestions
**Objective**: Verify user can bulk accept high-confidence AI suggestions

**Prerequisites**:
- At least 10 open exceptions with AI suggestions
- Multiple suggestions with confidence >0.8

**Test Steps**:
1. Navigate to ExceptionsPage with 10+ exceptions
2. Note exceptions with AI suggestions
3. Locate "Accept All AI Suggestions" button (primary action button)
4. Verify button shows count: "Accept AI Suggestions (12)"
5. Hover over button for tooltip: "Accept high-confidence AI suggestions (>80%)"
6. Click "Accept All AI Suggestions" button
7. Verify confirmation dialog shows:
   - Title: "Accept AI Suggestions?"
   - Message: "This will resolve 12 exceptions using AI suggestions"
   - List of exception IDs or preview
   - Warning: "Review individual suggestions before accepting in bulk"
   - "Confirm" and "Cancel" buttons
8. Review preview of exceptions to be resolved
9. Click "Confirm"
10. Verify API POST to `/api/exceptions/bulk-resolve`
11. Verify progress indicator:
    - Modal showing "Resolving 12 exceptions..."
    - Progress bar: "3 of 12 resolved"
    - Can cancel mid-process (optional)
12. Verify all selected exceptions resolve simultaneously (or batched)
13. Verify success toast: "Successfully resolved 12 exceptions"
14. Verify summary cards update:
    - Open count decrements by 12
    - Resolved count increments by 12
15. Verify exceptions removed from open list
16. Verify can view resolved exceptions in resolved filter
17. Check audit log (if accessible): Bulk resolve action recorded

**Expected Results**:
- Bulk action resolves multiple exceptions in one operation
- Progress indicator during bulk operation
- Summary reflects changes accurately
- All resolutions logged individually for audit
- Cache invalidated after completion
- Can filter to view newly resolved exceptions

**Edge Cases**:
- No AI suggestions available: Button disabled or not shown
- Only low-confidence suggestions: Button disabled with tooltip explanation
- Partial failure (some resolve, some fail):
  - Shows which failed: "Resolved 10 of 12 exceptions, 2 failed"
  - Failed exceptions remain open
  - Success toast shows partial success
  - Can retry failed exceptions individually
- User cancels mid-operation: Already resolved stay resolved, rest remain open
- Concurrent bulk operations: Locked to prevent conflicts
- API rate limiting: Handles gracefully with retry

**API Endpoint**: `POST /api/exceptions/bulk-resolve`

**Request Payload**:
```json
{
  "exceptionIds": ["exc-001", "exc-002", "exc-003"],
  "resolutionMethod": "ai_suggestion_bulk",
  "confidenceThreshold": 0.8
}
```

**Response**:
```json
{
  "resolved": 12,
  "failed": 0,
  "results": [
    {
      "exceptionId": "exc-001",
      "status": "resolved"
    }
  ]
}
```

**Code Reference**: `frontend/src/pages/ExceptionsPage.tsx:514-612`

---

### EXC-007: Reject AI Suggestion
**Objective**: Verify user can reject AI suggestion

**Prerequisites**:
- At least 1 open exception with AI suggestion

**Test Steps**:
1. Find exception with AI suggestion
2. Click "Reject" button on AI suggestion
3. Verify rejection confirmation (optional):
   - "Reject AI suggestion?"
   - "Provide reason (optional)"
   - Reason textarea
   - "Confirm" and "Cancel" buttons
4. Enter rejection reason: "Amount doesn't match closely enough"
5. Click "Confirm"
6. Verify API POST to `/api/exceptions/{id}/reject-suggestion`
7. Verify exception remains open (status unchanged)
8. Verify rejection logged
9. Verify AI suggestion section updates:
   - Shows "Suggestion rejected" badge
   - Shows rejection reason
   - May show alternative AI suggestion (if available)
10. Verify manual resolution options now more prominent
11. Verify can still manually resolve exception

**Expected Results**:
- Rejection does not resolve exception
- Exception remains in open list
- Rejection reason captured for AI learning
- User can manually resolve after rejection
- Alternative suggestions may appear
- Rejection logged in audit trail

**Edge Cases**:
- Reject without reason: Allowed, no reason recorded
- Reject then AI provides new suggestion: New suggestion shown
- Reject multiple times: All rejections logged
- API error: Error toast, rejection not saved

**API Endpoint**: `POST /api/exceptions/{id}/reject-suggestion`

**Code Reference**: `frontend/src/pages/ExceptionsPage.tsx:614-678`

---

### EXC-008: Investigate Exception in Detail View
**Objective**: Verify investigate mode shows comprehensive exception data

**Prerequisites**:
- At least 1 mismatch exception exists

**Test Steps**:
1. Locate mismatch exception in list
2. Click "Investigate" button
3. Verify detailed view/modal opens full-screen or large modal
4. Verify tabs/sections:
   - Overview
   - Source Data
   - Target Data
   - Comparison
   - History
   - AI Analysis
5. **Overview Tab**:
   - Exception type, severity, status
   - Reconciliation details
   - Created date
   - Exception ID
6. **Source Data Tab**:
   - Full source record in table or JSON view
   - All fields with values
   - Field types
   - Toggle between table/JSON view
7. **Target Data Tab**:
   - Full target record display
   - Same format options as source
8. **Comparison Tab** (for mismatch type):
   - Side-by-side field comparison
   - Highlight mismatched fields in red/yellow
   - Show field-level differences
   - Visual diff for text fields
9. **History Tab**:
   - All actions taken on this exception
   - AI suggestions provided
   - Rejections with reasons
   - Status changes
   - Timestamps and users
10. **AI Analysis Tab**:
    - Current AI suggestion with full reasoning
    - Confidence score breakdown
    - Alternative suggestions
    - Related exceptions
11. Verify can manually resolve from investigate view:
    - "Resolve" button with resolution options
    - "Ignore" button with reason
    - "Match Manually" button to select match
12. Click "Match Manually"
13. Verify search interface to find matching record
14. Select match and confirm
15. Verify exception resolved
16. Verify modal closes and list updates

**Expected Results**:
- All relevant data displayed comprehensively
- User can make informed resolution decision
- Comparison view clear and helpful for mismatch types
- History provides full audit trail
- Can manually resolve from investigate view
- Can close investigate mode and return to list

**Edge Cases**:
- Missing source type: Source data tab shows "N/A"
- Missing target type: Target data tab shows "N/A"
- Duplicate type: Shows all duplicate records
- Very large records (>50 fields): Scrollable or paginated
- Binary data fields: Shows placeholder or download option
- Investigate during resolution: Updates in real-time

**Code Reference**: `frontend/src/pages/ExceptionsPage.tsx:680-867`

---

### EXC-009: Manually Resolve Exception
**Objective**: Verify user can manually resolve exception without AI

**Prerequisites**:
- At least 1 open exception (any type)

**Test Steps**:
1. Locate open exception
2. Click "Resolve Manually" button
3. Verify resolution modal opens with options:
   - **For Missing Source**:
     - "Create Source Record"
     - "Ignore (No Match)"
     - "Match with Existing"
   - **For Missing Target**:
     - "Create Target Record"
     - "Ignore (No Match)"
     - "Match with Existing"
   - **For Mismatch**:
     - "Accept Source Value"
     - "Accept Target Value"
     - "Create Custom Resolution"
     - "Ignore Difference"
   - **For Duplicate**:
     - "Keep First"
     - "Keep Last"
     - "Merge Records"
     - "Keep All"
4. Select resolution option: "Ignore (No Match)"
5. Verify reason field appears: "Why are you ignoring this exception?"
6. Enter reason: "Known unmatched transaction from previous period"
7. Click "Resolve"
8. Verify API PUT to `/api/exceptions/{id}/resolve`
9. Verify success toast
10. Verify exception status changes to "Resolved"
11. Verify resolution details stored:
    - Method: "manual"
    - Action: "ignore"
    - Reason: "Known unmatched transaction..."
    - Resolved by: Current user
    - Resolved at: Timestamp

**Expected Results**:
- Manual resolution options appropriate for exception type
- Required fields validated (e.g., reason for ignore)
- Exception resolved successfully
- Resolution details captured for audit
- Can view resolution details in history

**Edge Cases**:
- Missing required fields: Validation error
- Cancel resolution: Modal closes, exception remains open
- API error: Error toast, can retry
- Create record option: Opens form to create source/target record
- Match with existing: Opens search to find record

**API Endpoint**: `PUT /api/exceptions/{id}/resolve`

**Request Payload**:
```json
{
  "resolutionMethod": "manual",
  "action": "ignore",
  "reason": "Known unmatched transaction from previous period",
  "resolvedBy": "user-123"
}
```

**Code Reference**: `frontend/src/pages/ExceptionsPage.tsx:869-1023`

---

### EXC-010: Filter Exceptions by Reconciliation
**Objective**: Verify user can filter exceptions for specific reconciliation

**Prerequisites**:
- Multiple reconciliations with exceptions
- At least 2 reconciliations with 5+ exceptions each

**Test Steps**:
1. Navigate to ExceptionsPage
2. Verify reconciliation filter dropdown
3. Click reconciliation filter
4. Verify dropdown shows all reconciliations with exception counts:
   - "January 2026 Bank Reconciliation (23)"
   - "Q4 2025 Account Reconciliation (15)"
   - "All Reconciliations"
5. Select "January 2026 Bank Reconciliation"
6. Verify only exceptions from that reconciliation shown
7. Verify count: "Showing 23 exceptions"
8. Verify reconciliation name displayed in filter badge
9. Combine with status filter: "Open" exceptions only
10. Verify both filters applied
11. Clear reconciliation filter
12. Verify all exceptions shown again
13. **Alternative Navigation**:
    - Navigate from reconciliation details "View Exceptions" button
    - Verify automatically filtered to that reconciliation
    - Verify can clear filter to see all

**Expected Results**:
- Reconciliation filter works correctly
- Can combine with other filters
- Navigation from reconciliation details pre-applies filter
- Can clear filter to see all exceptions
- Filter state visible in UI

**Edge Cases**:
- Reconciliation with no exceptions: Not shown in dropdown or shows "(0)"
- Delete reconciliation: Exceptions remain with reconciliation name "(Deleted)"
- Very long reconciliation name: Truncated in dropdown

**Code Reference**: `frontend/src/pages/ExceptionsPage.tsx:336-398`

---

### EXC-011: Exception Pagination and Infinite Scroll
**Objective**: Verify exception list handles large datasets efficiently

**Prerequisites**:
- More than 50 exceptions exist

**Test Steps**:
1. Navigate to ExceptionsPage with 50+ exceptions
2. Verify initial load shows first 20 exceptions (or configured page size)
3. Verify pagination controls at bottom:
   - Page numbers
   - "Previous" and "Next" buttons
   - Records per page selector (20, 50, 100)
4. Click "Next" to go to page 2
5. Verify API call for page 2 (or client-side pagination)
6. Verify next 20 exceptions displayed
7. Scroll to bottom of list
8. **Alternative: Infinite Scroll**:
   - Verify "Load More" button appears
   - Or automatic loading as scroll approaches bottom
   - Click "Load More" or scroll
   - Verify next batch appends to list
   - Verify loading indicator during fetch
9. Change records per page to 50
10. Verify 50 exceptions per page
11. Apply filter
12. Verify pagination resets to page 1

**Expected Results**:
- Large datasets load efficiently without lag
- Pagination or infinite scroll works smoothly
- Loading indicators show during fetch
- Filters reset pagination
- Performance remains good with 100+ exceptions

**Edge Cases**:
- Exactly 20 exceptions: No pagination shown
- Apply filter reducing to <20: Pagination removed
- Infinite scroll to end: Shows "No more exceptions" message
- Network error during load more: Error with retry

**Code Reference**: `frontend/src/pages/ExceptionsPage.tsx:45-54` (pagination config)

---

## Integration Points

### API Endpoints
- `GET /api/exceptions` - List exceptions with filtering, pagination
- `GET /api/exceptions/{id}` - Get exception details
- `PUT /api/exceptions/{id}/resolve` - Resolve single exception
- `POST /api/exceptions/bulk-resolve` - Bulk resolve exceptions
- `POST /api/exceptions/{id}/reject-suggestion` - Reject AI suggestion
- `GET /api/exceptions/{id}/history` - Get exception history

### State Management
- Zustand store:
  - `exceptions: Exception[]`
  - `exceptionFilters: { severity, status, type, reconciliationId }`
  - `selectedExceptions: string[]` (for bulk operations)
- React Query cache keys:
  - `['exceptions']`
  - `['exception', id]`
  - `['exception', id, 'history']`

### Navigation
- `/exceptions` - Main exceptions page
- `/exceptions?reconciliationId={id}` - Filtered by reconciliation
- `/reconciliations/{id}` - Link back to reconciliation

### Components Used
- `ExceptionCard` - Individual exception display
- `ExceptionSummary` - Summary cards at top
- `AIsuggestionPanel` - AI suggestion display
- `InvestigateModal` - Detailed exception view
- `ResolutionModal` - Manual resolution interface
- `BulkActionsBar` - Bulk operation controls
- `FilterBar` - Filter controls

---

## Test Data Requirements

### Sample Exception with AI Suggestion
```json
{
  "id": "exc-001",
  "reconciliationId": "rec-001",
  "reconciliationName": "January 2026 Bank Reconciliation",
  "type": "mismatch",
  "severity": "warning",
  "status": "open",
  "sourceData": {
    "date": "2026-01-15",
    "amount": 1250.00,
    "reference": "Payment",
    "account": "1001"
  },
  "targetData": {
    "date": "2026-01-15",
    "amount": 1250.50,
    "reference": "Payment Received",
    "account": "1001"
  },
  "mismatchedFields": ["amount", "reference"],
  "aiSuggestion": {
    "id": "sug-001",
    "action": "accept_rounding_difference",
    "confidence": 0.92,
    "reasoning": "Amount difference of $0.50 is likely a rounding difference. Reference texts are semantically equivalent.",
    "proposedResolution": {
      "acceptedValue": "source",
      "adjustments": []
    }
  },
  "createdAt": "2026-01-28T10:45:12Z"
}
```

---

## Performance Benchmarks

- Exceptions list load: <2 seconds
- Filter application: <200ms
- AI suggestion accept: <500ms
- Bulk resolve 100 exceptions: <10 seconds
- Investigate modal load: <1 second
- Pagination/scroll: <300ms

---

## Accessibility Requirements

- Keyboard navigation through exception list
- Focus management in modals
- ARIA labels for all interactive elements
- Screen reader support for AI suggestions
- High contrast for severity indicators
- Confirmation dialogs keyboard accessible

---

## Notes

- Exceptions are the primary resolution workflow
- AI suggestions drive efficiency gains
- Audit trail critical for compliance
- Consider AI learning from manual resolutions
- Bulk operations need careful UX to prevent mistakes
- Performance critical with large exception volumes
