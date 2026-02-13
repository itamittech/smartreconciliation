# TC-FrontendApplication - UI & E2E Tests

**Module**: Frontend Application
**Component**: Frontend UI Flows
**Test Level**: E2E / UI Test
**Total Test Cases**: 32

---

## Navigation & State

### TC-FE-001: Default Navigation Loads Dashboard

**Given** the app loads at `/`
**When** the shell renders
**Then** the Dashboard page is visible
**And** sidebar highlights "Dashboard"

---

### TC-FE-002: Sidebar Navigation Switches Pages

**Given** the user is on Dashboard
**When** the user clicks "Files" in the sidebar
**Then** Files page is rendered
**And** activeView state updates to FILES

---

### TC-FE-003: Navigation Preserves Unsaved State (Local)

**Given** a user has typed in a search filter
**When** they navigate away and back
**Then** the filter value remains (client state preserved)

---

### TC-FE-004: Global Error Banner for Failed API Calls

**Given** the API returns a 500 error
**When** the page loads data
**Then** an error banner is displayed with a retry action

---

### TC-FE-005: Loading Skeletons During Fetch

**Given** the API response is delayed
**When** data is loading
**Then** skeleton loaders are shown instead of empty tables

---

### TC-FE-006: Empty State Rendering

**Given** the API returns an empty list
**When** the page loads
**Then** an empty state with CTA is shown

---

## Page-Level Flows

### TC-FE-007: Dashboard Metrics Render

**Given** `/dashboard/metrics` returns counts and match rate
**When** the Dashboard loads
**Then** KPI cards and trend chart render with correct values

---

### TC-FE-008: Files Upload Success

**Given** a valid CSV file is selected
**When** Upload is triggered
**Then** the file appears in the table with status UPLOADING/UPLOADED

---

### TC-FE-009: Files Preview Modal

**Given** a file exists in the list
**When** the user clicks the preview icon
**Then** a modal opens with a data table of rows

---

### TC-FE-010: Reconciliation Creation Wizard

**Given** the user opens "New Reconciliation"
**When** they complete all 4 steps
**Then** a reconciliation is created and listed with PENDING status

---

### TC-FE-011: Reconciliation Status Polling

**Given** a reconciliation is IN_PROGRESS
**When** the page is open for 30 seconds
**Then** status and progress values refresh automatically

---

### TC-FE-012: Reconciliation Download Action

**Given** a completed reconciliation row is visible
**When** the user clicks Download
**Then** a file download starts or an export error is shown

---

### TC-FE-013: Exceptions Filtering

**Given** multiple exceptions exist
**When** filters are applied (severity, status, type)
**Then** only matching exceptions are shown

---

### TC-FE-014: Exception Resolution Actions

**Given** an exception is OPEN
**When** the user clicks Resolve
**Then** status updates to RESOLVED and UI reflects the change

---

### TC-FE-015: AI Suggestion Display

**Given** an exception has an AI suggestion
**When** the exception card renders
**Then** suggestion text is visible with an "Apply" action

---

### TC-FE-016: Rules List and Detail View

**Given** rule sets exist
**When** the user selects a rule set
**Then** details panel shows mappings and matching rules

---

### TC-FE-017: Rules Delete Action

**Given** a rule set is selected
**When** the user clicks Delete
**Then** the rule set is removed from the list

---

### TC-FE-018: Chat Message Send (Sync)

**Given** a chat session is active
**When** the user sends a message
**Then** the assistant response appears in the thread

---

### TC-FE-019: Chat File Upload from Chat UI

**Given** the chat interface is open
**When** a file is attached and sent
**Then** the file upload succeeds and is linked in the message

---

### TC-FE-020: Settings Tabs Render

**Given** the Settings page is opened
**When** the user clicks across all tabs
**Then** each tab panel renders without errors

---

### TC-FE-021: Settings Data Source Connection List

**Given** Data Sources are available
**When** the Data Sources tab loads
**Then** the list shows connection status and last tested time

---

### TC-FE-022: Settings AI Provider Selection

**Given** AI Settings tab is open
**When** the user selects a provider
**Then** the selection is stored (local or backend)

---

## API Integration & Error States

### TC-FE-023: Hook Error Handling for 404

**Given** the API returns 404
**When** a page requests details
**Then** a "Not Found" state is rendered

---

### TC-FE-024: Hook Error Handling for 401/403

**Given** the API returns 401/403
**When** a page requests protected data
**Then** the user is redirected or prompted to re-authenticate

---

### TC-FE-025: File Upload Validation Error

**Given** a file with unsupported type is selected
**When** upload is attempted
**Then** a validation error is shown and no API call is made

---

### TC-FE-026: Optimistic UI Update Rollback

**Given** an optimistic UI update is applied
**When** the API returns an error
**Then** the UI rolls back to the previous state

---

## UX & Accessibility

### TC-FE-027: Keyboard Navigation in Tables

**Given** a data table is focused
**When** the user presses arrow keys
**Then** focus moves row-by-row

---

### TC-FE-028: Accessible Form Labels

**Given** a form input is rendered
**When** a screen reader reads the page
**Then** each input has an associated label

---

### TC-FE-029: Responsive Layout (Mobile)

**Given** viewport width is 375px
**When** the Dashboard renders
**Then** cards stack vertically and remain readable

---

### TC-FE-030: Responsive Layout (Desktop)

**Given** viewport width is 1280px
**When** the Dashboard renders
**Then** cards render in a multi-column grid

---

### TC-FE-031: Empty State Call-to-Action

**Given** there are no reconciliations
**When** the Reconciliations page loads
**Then** an empty state CTA guides the user to create one

---

### TC-FE-032: Error Retry Button

**Given** an API error is displayed
**When** the user clicks Retry
**Then** the request is re-fired and state updates on success

---

## Reference

Detailed UI test specs live in `frontend/test-specs/*.tests.md`. Use those files for page-by-page acceptance detail.
