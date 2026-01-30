# File Management Tests

## Overview
Tests for FilesPage including file upload (CSV, Excel), search, preview, deletion, and status tracking.

**Component**: `frontend/src/pages/FilesPage.tsx`

---

## Test Scenarios

### FILE-001: Upload CSV File
**Objective**: Verify user can upload CSV file successfully with automatic analysis

**Prerequisites**:
- Valid CSV file prepared (e.g., sample_transactions.csv with headers, <100MB)
- Backend file upload and analysis endpoints functional

**Test Steps**:
1. Navigate to FilesPage at `/files`
2. Verify upload area displayed with:
   - "Upload File" button
   - Drag-and-drop zone with instructions
   - Supported formats listed: "CSV, XLSX, XLS"
   - Size limit displayed: "Max 100MB"
3. Click "Upload File" button
4. Select CSV file from file system dialog: `bank_transactions_jan_2026.csv` (2.5 MB, 1523 rows)
5. Verify file size validation happens before upload (<100MB check)
6. Verify upload begins immediately after selection
7. Verify upload progress indicator appears:
   - Progress bar showing percentage (0-100%)
   - File name displayed
   - File size displayed
   - Cancel button (optional)
8. Monitor progress bar advancing
9. Verify API POST to `/api/files/upload` with `multipart/form-data`
10. Wait for upload completion (should take <5 seconds for 2.5MB)
11. Verify backend analysis begins automatically
12. Verify success toast: "File uploaded successfully"
13. Verify file appears in files table with:
    - Filename: "bank_transactions_jan_2026.csv"
    - Size: "2.5 MB" (formatted)
    - Row count: "1,523" (detected by backend)
    - Column count: "8" (detected by backend)
    - Status: "Analyzing..." → "Analyzed" (within seconds)
    - Upload date: "Today at 3:45 PM" or "Jan 30, 2026"
    - Action buttons: Preview, Download, Delete
14. Verify Zustand store updated with new file
15. Verify React Query cache invalidated

**Expected Results**:
- Upload completes successfully
- Progress indicator accurate
- File metadata detected automatically by backend
- File status transitions from "Pending" → "Analyzing" → "Analyzed"
- File available for use in reconciliations
- Upload date formatted correctly
- No console errors

**Edge Cases**:
- File exactly 100MB: Uploads successfully
- File >100MB: Error before upload starts: "File too large. Maximum size is 100MB"
- Empty CSV (only headers, no data): Uploads but shows warning: "File has no data rows"
- CSV without headers: Warning or error depending on requirements
- CSV with special characters in filename: Filename sanitized
- CSV with special characters in data (UTF-8, Unicode): Data preserved correctly
- Network interruption during upload:
  - Upload fails with error
  - "Retry" button appears
  - Can retry upload
- Duplicate filename:
  - Backend appends number: "file.csv" → "file (1).csv"
  - Or prompts user to overwrite/rename
- Cancel during upload: Upload cancelled, file not saved

**API Endpoint**: `POST /api/files/upload`

**Request**: `multipart/form-data` with file

**Response**:
```json
{
  "id": "file-001",
  "filename": "bank_transactions_jan_2026.csv",
  "originalFilename": "bank_transactions_jan_2026.csv",
  "size": 2621440,
  "rows": 1523,
  "columns": 8,
  "columnNames": ["Date", "Description", "Amount", "Balance", "Reference", "Type", "Account", "Notes"],
  "columnTypes": ["date", "string", "number", "number", "string", "string", "string", "string"],
  "status": "analyzing",
  "uploadedAt": "2026-01-30T15:45:23Z",
  "uploadedBy": "user-123"
}
```

**Status Polling**: `GET /api/files/{id}/status` (every 2 seconds until "analyzed" or "error")

**Code Reference**: `frontend/src/pages/FilesPage.tsx:145-289`

---

### FILE-002: Upload Excel File (.xlsx and .xls)
**Objective**: Verify user can upload Excel files in both formats

**Prerequisites**:
- Valid .xlsx file (e.g., `accounting_export.xlsx`, 5.2 MB, 2134 rows)
- Valid .xls file (e.g., `legacy_data.xls`, 1.8 MB, 856 rows)

**Test Steps**:
1. Navigate to FilesPage
2. Upload .xlsx file via drag-and-drop:
   - Drag `accounting_export.xlsx` from file explorer
   - Drop onto drag-drop zone
   - Verify drop zone highlights on drag over
3. Verify upload starts automatically
4. Verify progress indicator appears
5. Wait for completion
6. Verify file appears in table with correct metadata:
   - Filename: "accounting_export.xlsx"
   - Size: "5.2 MB"
   - Row count: "2,134"
   - Column count: "12"
   - Status: "Analyzed"
7. Verify file format icon shows Excel icon
8. Upload .xls file via button:
   - Click "Upload File"
   - Select `legacy_data.xls`
9. Verify upload and analysis successful
10. Verify both files listed in table
11. **Multi-Sheet Handling**:
    - If Excel has multiple sheets:
    - Verify backend detects all sheets
    - Verify user prompted to select sheet (or first sheet used by default)
    - Verify selected sheet name displayed with file

**Expected Results**:
- Both .xlsx and .xls formats supported
- Drag-and-drop works correctly
- Excel files analyzed correctly
- Sheet selection handled appropriately
- File icons/badges distinguish Excel from CSV
- All metadata accurate

**Edge Cases**:
- Excel with multiple sheets: Prompts sheet selection or uses first sheet
- Excel with complex formatting (colors, formulas): Data extracted correctly, formatting ignored
- Excel with charts/images: Non-data elements ignored
- Password-protected Excel: Error: "Cannot process password-protected files"
- Corrupted Excel file: Error: "File is corrupted or invalid format"
- Excel with very wide sheets (>100 columns): Performance warning or accepted

**Code Reference**: `frontend/src/pages/FilesPage.tsx:145-289` (same upload handler)

---

### FILE-003: Search Files
**Objective**: Verify file search functionality filters files by name

**Prerequisites**:
- At least 10 files uploaded with different names

**Test Steps**:
1. Navigate to FilesPage with 10+ files
2. Verify search input field displayed (typically top-right)
3. Verify placeholder text: "Search files..."
4. Note initial file count
5. Type "bank" in search box
6. Verify files filter in real-time as typing
7. Verify only files with "bank" in filename displayed
8. Verify search is case-insensitive
9. Note filtered count: "Showing 3 of 10 files"
10. Type more specific: "bank_2026"
11. Verify further filtered results
12. Clear search box (X button or select all + delete)
13. Verify all files reappear
14. Type non-existent term: "xyz123"
15. Verify empty state displays:
    - Icon (magnifying glass with X)
    - Message: "No files found"
    - Subtext: "No files match your search"
    - "Clear search" button
16. Click "Clear search"
17. Verify all files shown again

**Expected Results**:
- Search filters in real-time as user types
- Debounced for performance (e.g., 300ms delay)
- Case-insensitive search
- Searches filename only
- Empty state for no results with clear option
- Search count displayed
- Can clear search easily

**Edge Cases**:
- Search with special characters: Handled safely
- Search with only spaces: Treated as empty
- Search during file upload: New file appears if matches search
- Search during pagination: Resets to page 1
- Very long search term: Input limited or scrollable

**Code Reference**: `frontend/src/pages/FilesPage.tsx:78-123`

---

### FILE-004: Preview File Contents
**Objective**: Verify user can preview uploaded file data in readable table format

**Prerequisites**:
- At least 1 analyzed file with data

**Test Steps**:
1. Locate uploaded file in table
2. Click "Preview" button/icon (eye icon)
3. Verify preview modal opens with:
   - Title: "Preview: [filename]"
   - Close button (X)
   - Table view (default)
   - JSON view toggle (optional)
4. **Table View**:
   - Verify displays first 10 rows in table format
   - Verify column headers shown in table header row
   - Verify data formatted correctly:
     - Dates: "Jan 15, 2026" or "2026-01-15"
     - Numbers: Formatted with commas "1,250.50"
     - Text: Displayed as-is
     - Empty cells: Show "-" or empty
   - Verify table scrollable horizontally if many columns
   - Verify table scrollable vertically within modal
   - Verify row numbers shown in first column
5. Verify pagination/load more within preview (if implemented):
   - "Showing rows 1-10 of 1,523"
   - "Load Next 10" button
6. Click "Load Next 10"
7. Verify rows 11-20 appended or replace first 10
8. **JSON View** (if toggle available):
   - Click "JSON" toggle
   - Verify data displayed as formatted JSON array
   - Verify syntax highlighting
   - Verify collapsible/expandable sections
9. Verify can copy data from preview (select and Ctrl+C)
10. Click close button or press Escape
11. Verify modal closes
12. Repeat for file with 1000+ rows
13. Verify still only shows first 10 rows initially (performance)
14. Repeat for file with 50 columns
15. Verify horizontal scroll works smoothly

**Expected Results**:
- Preview loads quickly (<1 second)
- Data displayed in readable table format
- Column headers clear
- Data formatted appropriately by type
- Large files don't cause performance issues (only preview rows loaded)
- Modal closeable via X button, outside click, or Escape key
- Scrolling works smoothly
- Can switch between table and JSON views

**Edge Cases**:
- File with no data (only headers): Shows headers, message "No data rows available"
- File with special characters: Displays correctly (UTF-8 support)
- File with very long text fields: Truncates with "..." and tooltip shows full text on hover
- File with binary data: Shows placeholder "[Binary data]" or hex representation
- File still analyzing: Preview disabled or shows loading state
- File with analysis error: Preview shows error message
- Very wide table (>20 columns): Horizontal scroll, fixed first column (optional)

**API Endpoint**: `GET /api/files/{id}/preview?limit=10&offset=0`

**Response**:
```json
{
  "fileId": "file-001",
  "filename": "bank_transactions_jan_2026.csv",
  "columns": ["Date", "Description", "Amount", "Balance"],
  "rows": [
    ["2026-01-15", "Salary Deposit", 5000.00, 12500.00],
    ["2026-01-16", "Grocery Store", -125.50, 12374.50]
  ],
  "totalRows": 1523,
  "showing": {
    "from": 1,
    "to": 10
  }
}
```

**Code Reference**: `frontend/src/pages/FilesPage.tsx:456-612`

---

### FILE-005: Delete File
**Objective**: Verify user can delete uploaded file with safety checks

**Prerequisites**:
- At least 1 analyzed file that is NOT used in any reconciliation

**Test Steps**:
1. Locate file to delete in table
2. Click delete icon (trash icon) in actions column
3. Verify confirmation dialog appears with:
   - Title: "Delete File?"
   - Message: "Are you sure you want to delete '[filename]'?"
   - Warning: "This action cannot be undone"
   - "Cancel" and "Delete" buttons
   - "Delete" button styled as danger (red)
4. Click "Cancel" button
5. Verify dialog closes
6. Verify file still in table
7. Click delete icon again
8. Click "Delete" button in confirmation dialog
9. Verify API DELETE call to `/api/files/{id}`
10. Verify loading state on delete button during API call
11. Verify success toast: "File deleted successfully"
12. Verify file removed from table immediately
13. Verify Zustand store updated (file removed)
14. Verify React Query cache invalidated
15. Verify file count updates
16. **Attempt to delete file used in reconciliation**:
17. Locate file that is used as source in existing reconciliation
18. Click delete icon
19. Verify warning dialog:
    - Title: "Cannot Delete File"
    - Message: "This file is used in 2 reconciliation(s):"
    - List of reconciliation names
    - "View Reconciliations" button
    - "Close" button
    - No "Delete" button
20. Click "View Reconciliations"
21. Verify navigates to reconciliations page filtered to show reconciliations using this file

**Expected Results**:
- Confirmation dialog prevents accidental deletion
- Cannot delete files referenced by reconciliations
- Successful deletion removes from UI and backend
- Cache invalidation ensures data consistency
- Warning shows which reconciliations use the file
- Can navigate to view dependent reconciliations

**Edge Cases**:
- Delete during file analysis: Cancels analysis and deletes file
- Delete file while viewing preview: Preview closes, file deleted
- API error during delete: Error toast "Failed to delete file", file remains in table
- Network timeout: Timeout error after 30s, retry option
- Concurrent delete attempts: Locked to prevent duplicate requests
- Delete file uploaded by another user: Requires permission check
- Orphaned file (reconciliation deleted): Can be deleted freely

**API Endpoint**: `DELETE /api/files/{id}`

**Response (success)**:
```json
{
  "success": true,
  "fileId": "file-001"
}
```

**Response (file in use)**:
```json
{
  "success": false,
  "error": "file_in_use",
  "message": "File is used in 2 reconciliations",
  "reconciliations": [
    {
      "id": "rec-001",
      "name": "January 2026 Bank Reconciliation"
    }
  ]
}
```

**Code Reference**: `frontend/src/pages/FilesPage.tsx:614-728`

---

### FILE-006: File Status Tracking
**Objective**: Verify file status updates correctly through upload, analysis, and error states

**Prerequisites**:
- Ability to upload files
- Backend analysis takes >2 seconds (for observation)

**Test Steps**:
1. Upload a file
2. Verify initial status immediately after upload: "Pending" (gray badge)
3. Verify status transitions within 1 second: "Analyzing..." (blue badge with pulse animation)
4. Observe backend analysis processing (schema detection, row counting, data type inference)
5. Wait for analysis completion (2-10 seconds depending on file size)
6. Verify status changes to: "Analyzed" (green badge)
7. Verify all metadata now available:
   - Row count populated
   - Column count populated
   - Column names and types available
8. Verify "Preview" button now enabled
9. **Upload intentionally corrupted file**:
10. Rename a .txt file to .csv and upload
11. Verify upload succeeds initially
12. Verify status shows "Analyzing..."
13. Verify backend analysis fails
14. Verify status changes to: "Error" (red badge)
15. Verify error message accessible (hover tooltip or click for details):
    - "Failed to analyze file"
    - "Invalid file format or corrupted data"
16. Verify action buttons:
    - "Retry Analysis" button available
    - "View Error Details" button
    - "Delete" button
17. Click "Retry Analysis"
18. Verify analysis attempted again
19. Verify error persists if file truly corrupted
20. **Test status polling**:
21. Upload large file (50+ MB if possible)
22. Open browser DevTools Network tab
23. Observe periodic API calls to status endpoint every 2 seconds
24. Verify polling continues until status reaches terminal state ("Analyzed" or "Error")
25. Verify polling stops after terminal state reached

**Expected Results**:
- Status updates automatically via polling
- Status transitions: Pending → Analyzing → Analyzed (success path)
- Status transitions: Pending → Analyzing → Error (failure path)
- Error states clearly indicated with messages
- User can retry analysis or delete failed files
- Polling stops appropriately to conserve resources
- Status badges color-coded for quick identification

**Edge Cases**:
- Analysis takes >1 minute: Polling continues, no timeout
- Backend crashes during analysis: Status remains "Analyzing", timeout after 5 minutes shows error
- Network interruption during analysis: Polling resumes when connection restored
- File upload succeeds but analysis never starts: Manual retry available
- Multiple files analyzing simultaneously: All polled independently

**Status Values**:
- `pending`: Initial state after upload
- `analyzing`: Backend processing file
- `analyzed`: Successfully analyzed and ready
- `error`: Analysis failed

**API Endpoint**: `GET /api/files/{id}/status`

**Response**:
```json
{
  "fileId": "file-001",
  "status": "analyzed",
  "progress": 100,
  "rows": 1523,
  "columns": 8,
  "columnNames": ["Date", "Description", "Amount", "Balance"],
  "analyzedAt": "2026-01-30T15:45:35Z"
}
```

**Code Reference**:
- `frontend/src/pages/FilesPage.tsx:291-356` (status display)
- `frontend/src/services/hooks.ts:234-278` (polling logic)

---

### FILE-007: Download File
**Objective**: Verify user can download previously uploaded file

**Prerequisites**:
- At least 1 analyzed file

**Test Steps**:
1. Locate file in table
2. Click "Download" button/icon
3. Verify browser download starts immediately
4. Verify downloaded file has original filename
5. Verify downloaded file size matches original
6. Open downloaded file
7. Verify file content identical to original upload
8. Verify file format preserved (CSV remains CSV, Excel remains Excel)

**Expected Results**:
- Download starts immediately
- File downloads with original filename
- File content preserved exactly
- No data loss or corruption
- Works for both CSV and Excel files

**Edge Cases**:
- Very large file (>100MB): Download may take time, shows progress if possible
- Network interruption during download: Browser handles retry
- File deleted between viewing and downloading: 404 error with message

**API Endpoint**: `GET /api/files/{id}/download`

**Code Reference**: `frontend/src/pages/FilesPage.tsx:730-768`

---

### FILE-008: File List Sorting
**Objective**: Verify user can sort files by various columns

**Prerequisites**:
- At least 10 files with varied properties

**Test Steps**:
1. Navigate to FilesPage with 10+ files
2. Verify sortable column headers:
   - Filename
   - Size
   - Rows
   - Uploaded Date
   - Status
3. Click "Filename" header
4. Verify files sorted alphabetically A-Z
5. Verify sort icon indicates ascending order (↑)
6. Click "Filename" header again
7. Verify files sorted Z-A (descending)
8. Verify sort icon changes to descending (↓)
9. Click "Size" header
10. Verify files sorted by size (smallest to largest or vice versa)
11. Click "Uploaded Date" header
12. Verify files sorted by date (newest first or oldest first)
13. Apply search filter
14. Verify sort persists within search results
15. Verify default sort: Uploaded Date descending (newest first)

**Expected Results**:
- Sorting works correctly for all columns
- Sort direction toggles on repeated clicks
- Sort icons display current sort state
- Sort persists with search filter
- Default sort logical (newest files first)

**Edge Cases**:
- Files with same sort value: Secondary sort by filename
- Files still analyzing (no row count): Appear at end or beginning when sorting by rows
- Sort during file upload: New file appears in correct sort position

**Code Reference**: `frontend/src/pages/FilesPage.tsx:125-143`

---

### FILE-009: Bulk File Operations
**Objective**: Verify user can perform bulk actions on multiple files (if implemented)

**Prerequisites**:
- At least 5 files that are not used in reconciliations

**Test Steps**:
1. Navigate to FilesPage
2. Verify checkbox column in files table
3. Click checkbox on 3 files
4. Verify selected count displays: "3 selected"
5. Verify bulk action buttons appear:
   - "Delete Selected"
   - "Download Selected" (as ZIP)
6. Click "Delete Selected"
7. Verify confirmation dialog shows count: "Delete 3 files?"
8. Confirm deletion
9. Verify API calls to delete all selected files
10. Verify selected files removed from table
11. Select all files checkbox (header checkbox)
12. Verify all visible files selected
13. Deselect one file
14. Verify "Select All" checkbox becomes indeterminate
15. Click "Download Selected"
16. Verify multiple files download (as individual downloads or ZIP)

**Expected Results**:
- Can select multiple files
- Bulk actions work on all selected
- Confirmation for destructive actions
- Can select/deselect all
- Download multiple files (ZIP preferred)

**Edge Cases**:
- Select file used in reconciliation: Warning when attempting bulk delete
- Partial bulk operation failure: Shows which files failed to delete
- Select across pagination: Selection persists or resets (define behavior)

**Note**: Bulk operations may be future feature, verify existence first

**Code Reference**: `frontend/src/pages/FilesPage.tsx:770-912` (if implemented)

---

### FILE-010: File Upload via Drag and Drop
**Objective**: Verify drag-and-drop upload works correctly

**Prerequisites**:
- Valid CSV or Excel file

**Test Steps**:
1. Navigate to FilesPage
2. Locate drag-drop zone
3. Open file explorer and select file
4. Drag file over drop zone
5. Verify drop zone highlights (border color changes, background changes)
6. Verify drop zone shows "Drop file here" message
7. Drop file
8. Verify upload starts automatically
9. Verify progress indicator appears
10. Wait for upload and analysis completion
11. **Test multiple file drag-drop**:
12. Select 3 files from file explorer
13. Drag all 3 over drop zone
14. Drop files
15. Verify all 3 files upload simultaneously or sequentially
16. Verify progress shown for each file
17. Verify all files appear in table after completion

**Expected Results**:
- Drag-drop zone responsive and highlighted on drag over
- Single file drop works correctly
- Multiple file drop supported (simultaneous or sequential upload)
- Upload starts immediately on drop
- Visual feedback during drag-drop

**Edge Cases**:
- Drag non-supported file type: Drop rejected with error message
- Drag file >100MB: Drop rejected with size error
- Drag folder: Rejected, only files accepted
- Drop outside drop zone: No action
- Drag file already uploaded: Duplicate handling applies

**Code Reference**: `frontend/src/pages/FilesPage.tsx:358-454`

---

## Integration Points

### API Endpoints
- `POST /api/files/upload` - Upload file (multipart/form-data)
- `GET /api/files` - List files with filtering, sorting, pagination
- `GET /api/files/{id}` - Get file details
- `GET /api/files/{id}/status` - Poll file analysis status
- `GET /api/files/{id}/preview` - Get file preview data
- `GET /api/files/{id}/download` - Download file
- `DELETE /api/files/{id}` - Delete file

### State Management
- Zustand store:
  - `files: File[]`
  - `uploadProgress: Record<string, number>` (file ID → percentage)
  - `fileFilters: { search: string, status: string }`
- React Query cache keys:
  - `['files']`
  - `['file', id]`
  - `['file', id, 'status']`
  - `['file', id, 'preview']`

### Navigation
- `/files` - Main files page
- `/reconciliations` - Link from "used in reconciliations" warning

### Components Used
- `FileUploadZone` - Drag-drop and click upload
- `FileListItem` - Table row or card
- `FilePreviewModal` - Preview modal
- `UploadProgressBar` - Progress indicator
- `StatusBadge` - Status indicator
- `ConfirmDialog` - Confirmation prompts

---

## Test Data Requirements

### Sample File List Response
```json
{
  "data": [
    {
      "id": "file-001",
      "filename": "bank_transactions_jan_2026.csv",
      "size": 2621440,
      "sizeFormatted": "2.5 MB",
      "rows": 1523,
      "columns": 8,
      "columnNames": ["Date", "Description", "Amount", "Balance"],
      "status": "analyzed",
      "uploadedAt": "2026-01-30T15:45:23Z",
      "uploadedBy": "user-123",
      "usedInReconciliations": ["rec-001"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

---

## Performance Benchmarks

- File upload (10MB): <3 seconds
- File analysis: <10 seconds for most files
- File list load: <1 second
- File preview load: <500ms
- Search/filter: <200ms
- Status polling interval: 2 seconds

---

## Accessibility Requirements

- Drag-drop zone keyboard accessible (fallback to button)
- File list keyboard navigable
- ARIA labels on all buttons
- Screen reader announces upload progress
- Focus management in preview modal
- High contrast mode support

---

## Notes

- Files are the input to reconciliations
- Automatic analysis critical for usability
- Preview helps users verify correct file uploaded
- Status tracking provides transparency
- Consider chunked uploads for very large files
- May add file versioning in future
