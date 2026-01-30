# Reconciliation Management Tests

## Overview
Tests for ReconciliationsPage including reconciliation creation wizard, list management, filtering, searching, and status tracking.

**Component**: `frontend/src/pages/ReconciliationsPage.tsx`

---

## Test Scenarios

### REC-001: Create New Reconciliation via Wizard
**Objective**: Verify user can create reconciliation using multi-step wizard

**Prerequisites**:
- At least 2 files uploaded and analyzed
- At least 1 rule set exists in library
- User has create reconciliation permission

**Test Steps**:
1. Navigate to ReconciliationsPage at `/reconciliations`
2. Click "Create Reconciliation" button (primary action button)
3. Verify wizard modal opens with:
   - Title: "Create New Reconciliation"
   - Step indicator showing 3 steps
   - "Cancel" and "Next" buttons
   - Current step: 1/3

4. **Step 1 - Basic Information**:
   - Verify form fields displayed:
     - Name (text input, required)
     - Description (textarea, optional)
     - Source File A (dropdown, required)
     - Source File B (dropdown, required)
   - Enter name: "January 2026 Bank Reconciliation"
   - Enter description: "Monthly bank statement reconciliation"
   - Select source file A: "bank_statement_jan_2026.csv" from dropdown
   - Verify dropdown shows file details (name, rows, size)
   - Select source file B: "accounting_export_jan_2026.xlsx" from dropdown
   - Verify "Next" button enabled after all required fields filled
   - Click "Next"
   - Verify step indicator advances to 2/3

5. **Step 2 - Rule Selection**:
   - Verify rule selection options:
     - "Use Existing Rule" (default)
     - "Create New Rule"
     - "AI-Generated Rule"
   - Select "Use Existing Rule"
   - Select existing rule set: "Standard Bank Reconciliation Rules" from library
   - Verify field mappings preview displays:
     - Source field → Target field pairs
     - Data type indicators
     - Sample values (if available)
   - Verify matching rules preview shows:
     - Match strategies (exact, fuzzy, date range)
     - Tolerance settings
   - Click "Next"
   - Verify step indicator advances to 3/3

6. **Step 3 - Review & Confirm**:
   - Verify summary displays all selections:
     - Reconciliation name: "January 2026 Bank Reconciliation"
     - Description shown
     - Source A: "bank_statement_jan_2026.csv" (1,523 rows)
     - Source B: "accounting_export_jan_2026.xlsx" (1,487 rows)
     - Rule set: "Standard Bank Reconciliation Rules"
   - Verify edit buttons allow returning to previous steps
   - Click "Create" button
   - Verify loading state with spinner
   - Verify API POST to `/api/reconciliations`

7. **Post-Creation**:
   - Verify success toast notification: "Reconciliation created successfully"
   - Verify modal closes automatically
   - Verify new reconciliation appears at top of list
   - Verify reconciliation status: "Pending"
   - Verify React Query cache invalidated
   - Verify reconciliations list refreshed

**Expected Results**:
- Wizard guides through all steps with clear labels
- Cannot proceed to next step with incomplete required data
- "Back" button available from steps 2 and 3
- Summary step shows all selections accurately
- Reconciliation created successfully via API
- List updates to show new reconciliation
- Modal closes cleanly without errors

**Edge Cases**:
- Close wizard mid-way via X button: Shows confirmation "Discard changes?"
- Close wizard via Cancel button: Shows same confirmation
- Select same file for source A and B: Validation error "Source files must be different"
- No rule sets available: Shows "Create New Rule" option or "Use AI" option
- No files available: "Create Reconciliation" button disabled with tooltip
- API error during creation: Error message in modal, wizard stays open for retry
- Network timeout: Timeout message after 30s, retry option
- Very long name (>200 chars): Validation error "Name too long"

**API Endpoint**: `POST /api/reconciliations`

**Request Payload**:
```json
{
  "name": "January 2026 Bank Reconciliation",
  "description": "Monthly bank statement reconciliation",
  "sourceFileAId": "file-123",
  "sourceFileBId": "file-456",
  "ruleSetId": "rule-789",
  "autoStart": false
}
```

**Response**:
```json
{
  "id": "rec-001",
  "name": "January 2026 Bank Reconciliation",
  "status": "pending",
  "createdAt": "2026-01-30T15:23:45Z",
  "sourceFileA": {
    "id": "file-123",
    "name": "bank_statement_jan_2026.csv",
    "rows": 1523
  },
  "sourceFileB": {
    "id": "file-456",
    "name": "accounting_export_jan_2026.xlsx",
    "rows": 1487
  },
  "ruleSet": {
    "id": "rule-789",
    "name": "Standard Bank Reconciliation Rules"
  }
}
```

**Code Reference**: `frontend/src/pages/ReconciliationsPage.tsx:234-456`

---

### REC-002: Filter Reconciliations by Status
**Objective**: Verify status filters work correctly

**Prerequisites**:
- Multiple reconciliations exist with different statuses:
  - At least 3 completed
  - At least 2 processing
  - At least 2 pending
  - At least 1 failed

**Test Steps**:
1. Navigate to ReconciliationsPage
2. Verify filter tabs displayed above list:
   - "All" (default active)
   - "Completed"
   - "Processing"
   - "Pending"
   - "Failed"
3. Verify "All" tab shows badge with total count (e.g., "All (8)")
4. Count displayed reconciliations (should equal total)
5. Click "Completed" tab
6. Verify tab becomes active (highlighted)
7. Verify only completed reconciliations displayed
8. Verify badge shows completed count (e.g., "Completed (3)")
9. Verify status badges all show "Completed" (green)
10. Click "Processing" tab
11. Verify only in-progress reconciliations shown
12. Verify status badges show "Processing" (blue) with pulse animation
13. Verify badge count correct
14. Click "Pending" tab
15. Verify only pending reconciliations shown
16. Verify status badges show "Pending" (gray)
17. Click "Failed" tab
18. Verify only failed reconciliations shown
19. Verify status badges show "Failed" (red)
20. Click "All" tab
21. Verify all reconciliations displayed again

**Expected Results**:
- Filters work instantly (client-side filtering if all data loaded)
- Count badges on tabs show correct numbers
- Empty state displayed if no matches for filter:
  - Icon and message: "No [status] reconciliations found"
- Filter state persists during pagination
- Active tab visually distinct
- URL may update with filter parameter (e.g., `?status=completed`)

**Edge Cases**:
- No reconciliations for filter: Shows empty state
- Filter during search: Combines with search results
- Filter with pagination: Page resets to 1
- Real-time status update: Reconciliation moves between filters automatically

**Code Reference**: `frontend/src/pages/ReconciliationsPage.tsx:78-145`

---

### REC-003: Search Reconciliations
**Objective**: Verify search functionality filters reconciliations by name

**Prerequisites**:
- At least 10 reconciliations with varied names

**Test Steps**:
1. Navigate to ReconciliationsPage
2. Locate search input field (typically top-right)
3. Verify placeholder text: "Search reconciliations..."
4. Note initial count of reconciliations
5. Type "Bank" in search box
6. Verify reconciliations filter in real-time as typing
7. Verify only reconciliations with "Bank" in name displayed
8. Verify case-insensitive (matches "bank", "BANK", "Bank")
9. Note filtered count
10. Verify empty state if no matches
11. Type more specific term: "Bank January"
12. Verify further filtered results
13. Clear search box (X button or backspace)
14. Verify all reconciliations reappear
15. Type non-existent term: "XYZ123"
16. Verify empty state displays:
    - Icon and message: "No reconciliations found"
    - "Clear search" button

**Expected Results**:
- Search filters in real-time as user types (debounced for performance)
- Case-insensitive search
- Searches reconciliation name field only
- Empty state for no results with clear option
- Search works with status filters (combined filtering)
- Search preserves filter tab selection
- Search input clearable via X icon

**Edge Cases**:
- Special characters in search: Escaped and handled safely
- Very long search term: Input limited or scrollable
- Search during pagination: Resets to page 1
- Search with only spaces: Treated as empty search
- Search during API loading: Waits for data before filtering

**Code Reference**: `frontend/src/pages/ReconciliationsPage.tsx:147-189`

---

### REC-004: Start Reconciliation
**Objective**: Verify user can start a pending reconciliation and track progress

**Prerequisites**:
- At least 1 reconciliation with "Pending" status exists

**Test Steps**:
1. Locate pending reconciliation in list
2. Verify "Start" button displayed in actions column
3. Hover over "Start" button
4. Verify tooltip (if any): "Start reconciliation process"
5. Click "Start" button
6. Verify confirmation prompt (optional):
   - "Start reconciliation?"
   - "This will process [X] records from both files"
   - "Confirm" and "Cancel" buttons
7. Click "Confirm" (if prompt shown)
8. Verify API POST to `/api/reconciliations/{id}/start`
9. Verify loading state on button during API call
10. Verify status changes to "Processing" immediately after success
11. Verify status badge changes to blue with pulse animation
12. Verify "Start" button replaced with "View Progress" or removed
13. Wait 5 seconds (React Query poll interval)
14. Verify automatic status update if processing completes quickly
15. Verify progress indicator (if implemented):
    - Progress bar showing percentage
    - Records processed count
    - Estimated time remaining
16. Wait for completion
17. Verify status changes to "Completed" (green badge)
18. Verify completion timestamp displays
19. Verify match rate appears

**Expected Results**:
- Reconciliation starts successfully
- Status updates in UI immediately
- Progress shown in real-time via polling
- Completion detected and displayed
- Match rate calculated and shown
- Can navigate away and return (status persists)

**Edge Cases**:
- Start fails (backend error): Error toast, status remains "Pending"
- Reconciliation takes >5 minutes: Polling continues, no timeout
- Start already running reconciliation: "Start" button disabled
- Network error during start: Error message, can retry
- Multiple reconciliations started simultaneously: All tracked independently
- Backend processing fails: Status changes to "Failed" with error message

**API Endpoint**: `POST /api/reconciliations/{id}/start`

**Response**:
```json
{
  "id": "rec-001",
  "status": "processing",
  "startedAt": "2026-01-30T15:30:00Z",
  "estimatedCompletion": "2026-01-30T15:35:00Z"
}
```

**Polling Endpoint**: `GET /api/reconciliations/{id}/status`

**Code Reference**: `frontend/src/pages/ReconciliationsPage.tsx:456-523`

---

### REC-005: Delete Reconciliation
**Objective**: Verify user can delete a reconciliation with safety checks

**Prerequisites**:
- At least 1 completed or pending reconciliation (not processing)

**Test Steps**:
1. Locate reconciliation to delete in list
2. Click delete icon (trash icon) in actions column
3. Verify confirmation dialog appears with:
   - Title: "Delete Reconciliation?"
   - Message: "Are you sure you want to delete '[Reconciliation Name]'?"
   - Warning: "This action cannot be undone"
   - "Cancel" and "Delete" buttons
   - "Delete" button styled as danger (red)
4. Click "Cancel"
5. Verify dialog closes
6. Verify reconciliation still in list
7. Click delete icon again
8. Click "Delete" button in confirmation dialog
9. Verify API DELETE call to `/api/reconciliations/{id}`
10. Verify loading state during deletion
11. Verify success toast: "Reconciliation deleted successfully"
12. Verify reconciliation removed from list immediately
13. Verify React Query cache updated
14. Verify list count decrements

**Expected Results**:
- Confirmation dialog prevents accidental deletion
- Cannot delete in-progress reconciliation (button disabled or error)
- Successful deletion removes from UI immediately
- Cache invalidation ensures data consistency
- Can undo delete (if soft delete implemented)

**Edge Cases**:
- Delete in-progress reconciliation: Button disabled with tooltip "Cannot delete running reconciliation"
- Delete reconciliation with exceptions: Warning "This reconciliation has [X] unresolved exceptions"
- API error during delete: Error toast, reconciliation remains in list
- Network timeout: Timeout error, retry option
- Delete while viewing details: Redirects to list after deletion
- Delete last reconciliation on page: Returns to previous page (pagination)

**API Endpoint**: `DELETE /api/reconciliations/{id}`

**Code Reference**: `frontend/src/pages/ReconciliationsPage.tsx:525-578`

---

### REC-006: View Reconciliation Details
**Objective**: Verify user can view detailed reconciliation information

**Prerequisites**:
- At least 1 completed reconciliation with exceptions

**Test Steps**:
1. Locate completed reconciliation in list
2. Click "View Details" button or reconciliation name
3. Verify reconciliation details panel/modal opens
4. Verify header displays:
   - Reconciliation name (editable icon if editable)
   - Status badge
   - Created date
   - Completed date
5. Verify statistics section displays:
   - Match rate with visual indicator (circular progress or bar)
   - Total records processed (Source A + Source B)
   - Matched count
   - Unmatched count
   - Exception count
   - Match rate color-coded:
     - Green: >95%
     - Yellow: 90-95%
     - Red: <90%
6. Verify source files section displays:
   - Source A: Filename, row count, file size
   - Source B: Filename, row count, file size
   - Link to view file details
7. Verify rule set section displays:
   - Rule set name
   - Link to view rule details
8. Verify actions section displays:
   - "View Exceptions" button
   - "Download Results" button
   - "Re-run Reconciliation" button (if failed or pending)
9. Click "View Exceptions" button
10. Verify navigation to `/exceptions` page filtered for this reconciliation ID
11. Return to details view
12. Click "Download Results" button (if implemented)
13. Verify CSV or Excel file downloads with reconciliation results

**Expected Results**:
- Details display accurately
- Visual match rate indicator clear and readable
- All statistics calculated correctly
- Action buttons work correctly
- Can close details and return to list
- Details update if reconciliation completes while viewing

**Edge Cases**:
- View details of processing reconciliation: Shows live progress updates
- View details of failed reconciliation: Shows error message and "Retry" option
- View details of pending reconciliation: Shows "Start" button
- Very large reconciliation (>100K records): Statistics load without performance issues

**Code Reference**: `frontend/src/pages/ReconciliationsPage.tsx:580-712`

---

### REC-007: Reconciliation List Pagination
**Objective**: Verify pagination works correctly for large reconciliation lists

**Prerequisites**:
- More than 20 reconciliations exist (assuming 20 per page)

**Test Steps**:
1. Navigate to ReconciliationsPage
2. Verify first page displays (reconciliations 1-20)
3. Verify pagination controls displayed:
   - "Previous" button (disabled on first page)
   - Page numbers (e.g., 1, 2, 3, ... , Last)
   - "Next" button
   - Records per page selector (optional)
4. Note reconciliation names on page 1
5. Click "Next" button or page "2"
6. Verify API call to fetch page 2 (or client-side pagination)
7. Verify reconciliations 21-40 displayed
8. Verify page 2 highlighted in pagination
9. Verify "Previous" button now enabled
10. Click "Previous" button
11. Verify returns to page 1
12. Verify same reconciliations as before
13. Jump to last page
14. Verify last page of reconciliations displayed
15. Verify "Next" button disabled

**Expected Results**:
- Pagination controls functional
- Correct reconciliations displayed per page
- Page navigation smooth without errors
- Current page highlighted
- Disabled buttons for first/last pages
- URL updates with page parameter (e.g., `?page=2`)

**Edge Cases**:
- Exactly 20 reconciliations: No pagination controls shown
- Single reconciliation: No pagination
- Filter reduces results below page size: Resets to page 1
- Create new reconciliation: Adds to page 1, may shift pagination
- Delete reconciliation on last page: Returns to previous page if empty

**API Endpoint**: `GET /api/reconciliations?page=2&limit=20`

**Code Reference**: `frontend/src/pages/ReconciliationsPage.tsx:45-76`

---

### REC-008: Sort Reconciliations
**Objective**: Verify user can sort reconciliations by various columns

**Prerequisites**:
- At least 10 reconciliations with varied properties

**Test Steps**:
1. Navigate to ReconciliationsPage
2. Verify sortable column headers:
   - Name
   - Status
   - Match Rate
   - Created Date
   - Completed Date
3. Click "Name" column header
4. Verify reconciliations sorted alphabetically A-Z
5. Verify sort icon indicates ascending order (↑)
6. Click "Name" header again
7. Verify reconciliations sorted Z-A (descending)
8. Verify sort icon changes to descending (↓)
9. Click "Created Date" header
10. Verify reconciliations sorted by date (newest first or oldest first)
11. Click "Match Rate" header
12. Verify reconciliations sorted by match rate percentage
13. Verify reconciliations without match rate (pending) appear at end or beginning
14. Apply status filter
15. Verify sort persists within filtered results
16. Search reconciliations
17. Verify sort applies to search results

**Expected Results**:
- Sorting works correctly for all columns
- Sort direction toggles on repeated clicks
- Sort icons display current sort state
- Sort persists with filters and search
- URL updates with sort parameter (e.g., `?sort=name:asc`)

**Edge Cases**:
- Sort by match rate with pending reconciliations: Null values handled
- Sort during API loading: Disabled until data loads
- Sort with pagination: Sorts across all pages (server-side) or current page (client-side)

**Code Reference**: `frontend/src/pages/ReconciliationsPage.tsx:147-189`

---

### REC-009: Reconciliation Status Real-Time Updates
**Objective**: Verify reconciliation status updates automatically via polling

**Prerequisites**:
- At least 1 processing reconciliation

**Test Steps**:
1. Start a reconciliation (see REC-004)
2. Verify status shows "Processing"
3. Open browser DevTools Network tab
4. Wait and observe periodic API calls every 5 seconds
5. Verify React Query polling endpoint: `GET /api/reconciliations/{id}/status`
6. When reconciliation completes on backend:
7. Verify status updates to "Completed" automatically within 5 seconds
8. Verify match rate appears
9. Verify "View Details" button enabled
10. Open multiple browser tabs with reconciliations page
11. Start reconciliation in one tab
12. Verify status updates in all tabs

**Expected Results**:
- Status updates automatically without manual refresh
- Polling occurs every 5 seconds for processing reconciliations
- Completed reconciliations stop polling
- Updates reflect across all open tabs (shared cache)
- No performance degradation with polling

**Edge Cases**:
- Multiple processing reconciliations: All polled independently
- Navigate away from page: Polling stops
- Return to page: Polling resumes
- Backend slow response: Previous status remains until update
- Polling error: Shows error toast, retries

**Code Reference**: `frontend/src/services/hooks.ts:156-203` (polling logic)

---

### REC-010: Bulk Operations on Reconciliations
**Objective**: Verify user can perform bulk actions on multiple reconciliations (if implemented)

**Prerequisites**:
- At least 5 pending or completed reconciliations

**Test Steps**:
1. Navigate to ReconciliationsPage
2. Verify checkbox column in reconciliations table
3. Click checkbox on 3 reconciliations
4. Verify selected count displays: "3 selected"
5. Verify bulk action buttons appear:
   - "Delete Selected"
   - "Start Selected" (if pending)
   - "Export Selected"
6. Click "Delete Selected"
7. Verify confirmation dialog shows count
8. Confirm deletion
9. Verify API calls to delete all selected
10. Verify selected reconciliations removed
11. Select all reconciliations checkbox (header checkbox)
12. Verify all visible reconciliations selected
13. Deselect one
14. Verify "Select All" checkbox becomes indeterminate

**Expected Results**:
- Can select multiple reconciliations
- Bulk actions work on all selected
- Confirmation for destructive actions
- Selection persists across pagination (optional)
- Can clear selection

**Edge Cases**:
- Select processing reconciliation for deletion: Disabled or error
- Partial bulk operation failure: Shows which failed
- Select all across pages: Confirms action affects all (not just visible)

**Note**: Bulk operations may be future feature, verify existence first

**Code Reference**: `frontend/src/pages/ReconciliationsPage.tsx:714-856` (if implemented)

---

## Integration Points

### API Endpoints
- `GET /api/reconciliations` - List reconciliations with pagination, filtering, sorting
- `POST /api/reconciliations` - Create new reconciliation
- `GET /api/reconciliations/{id}` - Get reconciliation details
- `POST /api/reconciliations/{id}/start` - Start reconciliation processing
- `GET /api/reconciliations/{id}/status` - Poll status updates
- `DELETE /api/reconciliations/{id}` - Delete reconciliation
- `GET /api/reconciliations/{id}/results` - Download results

### State Management
- Zustand store:
  - `reconciliations: Reconciliation[]`
  - `selectedReconciliation: Reconciliation | null`
  - `wizardStep: number`
- React Query cache keys:
  - `['reconciliations']`
  - `['reconciliation', id]`
  - `['reconciliation', id, 'status']`

### Navigation
- `/reconciliations` - Main reconciliations list
- `/exceptions?reconciliationId={id}` - Filtered exceptions view
- `/files/{id}` - Source file details

### Components Used
- `ReconciliationWizard` - Multi-step creation modal
- `ReconciliationListItem` - Table row or card
- `ReconciliationDetails` - Details panel/modal
- `StatusBadge` - Status indicator
- `MatchRateIndicator` - Visual match rate display
- `ConfirmDialog` - Confirmation prompts

---

## Test Data Requirements

### Sample Reconciliation List Response
```json
{
  "data": [
    {
      "id": "rec-001",
      "name": "January 2026 Bank Reconciliation",
      "status": "completed",
      "matchRate": 96.2,
      "totalRecords": 3010,
      "matchedCount": 2896,
      "unmatchedCount": 114,
      "exceptionCount": 23,
      "createdAt": "2026-01-28T10:30:00Z",
      "completedAt": "2026-01-28T10:45:00Z",
      "sourceFileA": {
        "id": "file-123",
        "name": "bank_statement_jan_2026.csv"
      },
      "sourceFileB": {
        "id": "file-456",
        "name": "accounting_export_jan_2026.xlsx"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

---

## Performance Benchmarks

- Reconciliations list load: <1 second
- Wizard step transition: <100ms
- Start reconciliation API call: <500ms
- Status polling interval: 5 seconds
- Details panel load: <500ms
- Pagination navigation: <200ms

---

## Accessibility Requirements

- Keyboard navigation through list
- Focus management in wizard
- ARIA labels on all buttons and inputs
- Screen reader announcements for status changes
- Confirmation dialogs keyboard accessible
- High contrast mode support

---

## Notes

- Reconciliation is the core entity of the application
- Wizard may integrate with AI chat for conversational creation
- Real-time status updates critical for UX
- Consider WebSocket for true real-time updates instead of polling
- Export functionality may be added in future iterations
