# Frontend Application - UI Flow Tests

**Module**: Frontend Application  
**Component**: Frontend UI Flows  
**Test Level**: E2E / UI Test  
**Total Test Cases**: 32  

---

### TC-FE-001: Default Navigation Loads Dashboard
**Objective**: Verify default route renders the Dashboard page.

**Prerequisites**:
- App running and reachable at `/`

**Test Steps**:
1. Navigate to `/`.
2. Observe the default page content.

**Expected Results**:
- Dashboard page renders with visible metrics section.
- No error banner displayed.

**API Endpoint**: `GET /api/dashboard/metrics`  
**Code Reference**: `frontend/src/pages/HomePage.tsx`

---

### TC-FE-002: Sidebar Navigation Switches Pages
**Objective**: Verify sidebar navigation changes the current page.

**Prerequisites**:
- App running with sidebar visible

**Test Steps**:
1. Click the Sidebar link for Files.
2. Click the Sidebar link for Reconciliations.
3. Click the Sidebar link for Exceptions.

**Expected Results**:
- Each click updates the main content to the target page.

**Code Reference**: `frontend/src/components/Sidebar.tsx`, `frontend/src/pages/*.tsx`

---

### TC-FE-003: Navigation Preserves Unsaved State (Local)
**Objective**: Verify unsaved form state remains when navigating locally.

**Prerequisites**:
- A form page with editable fields (e.g., Rules or Settings)

**Test Steps**:
1. Navigate to Rules page.
2. Enter text into a form field without saving.
3. Navigate away to another page.
4. Navigate back to Rules page.

**Expected Results**:
- Unsaved form state remains in the UI.

**Code Reference**: `frontend/src/pages/RulesPage.tsx`

---

### TC-FE-004: Global Error Banner for Failed API Calls
**Objective**: Verify a global error banner displays on failed API requests.

**Prerequisites**:
- Simulate a failed API response (500)

**Test Steps**:
1. Trigger a data fetch (e.g., dashboard metrics).
2. Simulate an API failure.

**Expected Results**:
- Global error banner appears with a failure message.

**API Endpoint**: `GET /api/dashboard/metrics`

---

### TC-FE-005: Loading Skeletons During Fetch
**Objective**: Verify skeletons appear while data is loading.

**Prerequisites**:
- Slow down API response

**Test Steps**:
1. Navigate to Dashboard.
2. Observe the page while data is loading.

**Expected Results**:
- Skeleton loaders are visible before data renders.

**Code Reference**: `frontend/src/components/LoadingSkeleton.tsx`

---

### TC-FE-006: Empty State Rendering
**Objective**: Verify empty state UI when no data exists.

**Prerequisites**:
- API returns empty lists (files, reconciliations, rules)

**Test Steps**:
1. Navigate to Files page with empty data.

**Expected Results**:
- Empty state message and guidance are shown.

**Code Reference**: `frontend/src/pages/FilesPage.tsx`

---

### TC-FE-007: Dashboard Metrics Render
**Objective**: Verify dashboard metrics render correctly.

**Prerequisites**:
- Metrics endpoint returns values

**Test Steps**:
1. Load Dashboard.
2. Observe metric cards and charts.

**Expected Results**:
- Metric values render (total reconciliations, match rate, exceptions).

**API Endpoint**: `GET /api/dashboard/metrics`

---

### TC-FE-008: Files Upload Success
**Objective**: Verify file upload flow completes successfully.

**Prerequisites**:
- Valid CSV file available

**Test Steps**:
1. Navigate to Files page.
2. Upload CSV file.
3. Wait for completion.

**Expected Results**:
- Upload succeeds and file appears in list with status.

**API Endpoint**: `POST /api/v1/files/upload/single`

---

### TC-FE-009: Files Preview Modal
**Objective**: Verify preview modal opens and renders data.

**Prerequisites**:
- Uploaded file exists with preview data

**Test Steps**:
1. Open file row actions.
2. Click Preview.

**Expected Results**:
- Modal opens and displays headers and rows.

**API Endpoint**: `GET /api/v1/files/{id}/preview`

---

### TC-FE-010: Reconciliation Creation Wizard
**Objective**: Verify reconciliation wizard completes.

**Prerequisites**:
- At least two files and one ruleset exist

**Test Steps**:
1. Navigate to Reconciliations.
2. Launch creation wizard.
3. Complete steps and submit.

**Expected Results**:
- Reconciliation created and listed with status.

**API Endpoint**: `POST /api/v1/reconciliations`

---

### TC-FE-011: Reconciliation Status Polling
**Objective**: Verify reconciliation status updates via polling.

**Prerequisites**:
- A reconciliation in progress

**Test Steps**:
1. Open reconciliation detail view.
2. Observe status over time.

**Expected Results**:
- Status updates periodically without manual refresh.

**API Endpoint**: `GET /api/v1/reconciliations/{id}/status`

---

### TC-FE-012: Reconciliation Download Action
**Objective**: Verify user can download reconciliation results.

**Prerequisites**:
- Completed reconciliation with results available

**Test Steps**:
1. Open reconciliation row actions.
2. Click Download Results.

**Expected Results**:
- File download begins and completes successfully.

**API Endpoint**: `GET /api/v1/reconciliations/{id}/results`

---

### TC-FE-013: Exceptions Filtering
**Objective**: Verify exception list filters update results.

**Prerequisites**:
- Exceptions exist with multiple types/severities

**Test Steps**:
1. Navigate to Exceptions page.
2. Apply filters by type and severity.

**Expected Results**:
- List updates to show only matching exceptions.

**API Endpoint**: `GET /api/v1/exceptions`

---

### TC-FE-014: Exception Resolution Actions
**Objective**: Verify resolution actions update exception status.

**Prerequisites**:
- Exception in OPEN status

**Test Steps**:
1. Open exception detail.
2. Click Resolve or Ignore.

**Expected Results**:
- Status updates and UI reflects new state.

**API Endpoint**: `PUT /api/v1/exceptions/{id}`

---

### TC-FE-015: AI Suggestion Display
**Objective**: Verify AI suggestion is displayed for exception.

**Prerequisites**:
- Exception supports AI suggestion

**Test Steps**:
1. Open exception detail.
2. Request AI suggestion.

**Expected Results**:
- Suggestion text is displayed in the UI.

**API Endpoint**: `GET /api/v1/exceptions/{id}/suggestions`

---

### TC-FE-016: Rules List and Detail View
**Objective**: Verify rule list and detail view render correctly.

**Prerequisites**:
- Rule sets exist

**Test Steps**:
1. Navigate to Rules page.
2. Open a rule set details panel.

**Expected Results**:
- List renders and detail view shows mappings and rules.

**API Endpoint**: `GET /api/v1/rules`

---

### TC-FE-017: Rules Delete Action
**Objective**: Verify rule set delete action removes it from list.

**Prerequisites**:
- Rule set exists

**Test Steps**:
1. Trigger delete action on a rule set.
2. Confirm deletion.

**Expected Results**:
- Rule set removed from list and success message shown.

**API Endpoint**: `DELETE /api/v1/rules/{id}`

---

### TC-FE-018: Chat Message Send (Sync)
**Objective**: Verify chat message send returns response.

**Prerequisites**:
- Chat session exists

**Test Steps**:
1. Open Chat page.
2. Send a message.

**Expected Results**:
- Assistant response is rendered in the chat thread.

**API Endpoint**: `POST /api/v1/chat/message`

---

### TC-FE-019: Chat File Upload from Chat UI
**Objective**: Verify file upload from chat interface works.

**Prerequisites**:
- Chat page supports file upload

**Test Steps**:
1. Open Chat page.
2. Upload a file using chat attachment control.

**Expected Results**:
- File is uploaded and referenced in chat context.

**API Endpoint**: `POST /api/v1/files/upload/single`

---

### TC-FE-020: Settings Tabs Render
**Objective**: Verify settings tabs render correctly.

**Prerequisites**:
- Settings page available

**Test Steps**:
1. Navigate to Settings page.
2. Click each settings tab.

**Expected Results**:
- Tab content renders and navigation highlights update.

**Code Reference**: `frontend/src/pages/SettingsPage.tsx`

---

### TC-FE-021: Settings Data Source Connection List
**Objective**: Verify data source connections list renders in Settings.

**Prerequisites**:
- Data sources exist

**Test Steps**:
1. Navigate to Settings page.
2. Open Data Sources tab.

**Expected Results**:
- Data sources list renders with name and type.

**API Endpoint**: `GET /api/v1/datasources`

---

### TC-FE-022: Settings AI Provider Selection
**Objective**: Verify AI provider selection can be updated.

**Prerequisites**:
- Settings AI configuration available

**Test Steps**:
1. Open AI settings tab.
2. Select a different AI provider.
3. Save changes.

**Expected Results**:
- Selection persists and success message appears.

**API Endpoint**: `GET/PUT /api/v1/settings/ai`

---

### TC-FE-023: Hook Error Handling for 404
**Objective**: Verify 404 errors are handled by hooks.

**Prerequisites**:
- API endpoint returns 404

**Test Steps**:
1. Navigate to a page requiring data fetch.
2. Simulate 404 response.

**Expected Results**:
- User sees a not found message or empty state.

**Code Reference**: `frontend/src/services/hooks.ts`

---

### TC-FE-024: Hook Error Handling for 401/403
**Objective**: Verify auth errors are handled by hooks.

**Prerequisites**:
- API endpoint returns 401 or 403

**Test Steps**:
1. Trigger a protected API call.
2. Simulate 401/403 response.

**Expected Results**:
- Error banner displayed or user redirected to login.

**Code Reference**: `frontend/src/services/hooks.ts`

---

### TC-FE-025: File Upload Validation Error
**Objective**: Verify validation errors are surfaced on file upload.

**Prerequisites**:
- Invalid file (wrong type or empty)

**Test Steps**:
1. Attempt to upload invalid file.

**Expected Results**:
- Validation error shown and upload is blocked.

**API Endpoint**: `POST /api/v1/files/upload/single`

---

### TC-FE-026: Optimistic UI Update Rollback
**Objective**: Verify optimistic UI changes roll back on failure.

**Prerequisites**:
- Mutation that performs optimistic update

**Test Steps**:
1. Trigger an action that updates UI optimistically.
2. Simulate API failure.

**Expected Results**:
- UI rolls back to previous state and error shown.

**Code Reference**: `frontend/src/services/hooks.ts`

---

### TC-FE-027: Keyboard Navigation in Tables
**Objective**: Verify tables are keyboard navigable.

**Prerequisites**:
- A page with table content

**Test Steps**:
1. Focus table area.
2. Use Arrow keys and Tab to navigate.

**Expected Results**:
- Focus moves between rows/cells predictably.

**Code Reference**: `frontend/src/components/Table.tsx`

---

### TC-FE-028: Accessible Form Labels
**Objective**: Verify forms have accessible labels.

**Prerequisites**:
- Forms present (settings, rules, files)

**Test Steps**:
1. Inspect form fields.
2. Validate labels and aria attributes.

**Expected Results**:
- All inputs have associated labels or aria-labels.

**Code Reference**: `frontend/src/components/FormField.tsx`

---

### TC-FE-029: Responsive Layout (Mobile)
**Objective**: Verify UI layout on mobile screens.

**Prerequisites**:
- Responsive layout enabled

**Test Steps**:
1. Resize viewport to <768px.
2. Navigate across key pages.

**Expected Results**:
- Layout adapts without overflow; navigation still usable.

**Code Reference**: `frontend/src/App.tsx`

---

### TC-FE-030: Responsive Layout (Desktop)
**Objective**: Verify UI layout on desktop screens.

**Prerequisites**:
- Responsive layout enabled

**Test Steps**:
1. Resize viewport to >1024px.
2. Navigate across key pages.

**Expected Results**:
- Sidebar and content layout render correctly.

**Code Reference**: `frontend/src/App.tsx`

---

### TC-FE-031: Empty State Call-to-Action
**Objective**: Verify empty state shows a call-to-action.

**Prerequisites**:
- Empty data list (files, rules, reconciliations)

**Test Steps**:
1. Open a page with no data.

**Expected Results**:
- Empty state includes a primary CTA to create/upload.

**Code Reference**: `frontend/src/components/EmptyState.tsx`

---

### TC-FE-032: Error Retry Button
**Objective**: Verify retry button re-attempts failed requests.

**Prerequisites**:
- API call fails and retry button is shown

**Test Steps**:
1. Trigger a failed API call.
2. Click Retry.

**Expected Results**:
- Request is re-triggered and UI updates if successful.

**Code Reference**: `frontend/src/components/ErrorBanner.tsx`
