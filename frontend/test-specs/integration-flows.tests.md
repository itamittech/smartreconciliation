# Integration Flows and Cross-Cutting Tests

## Overview
End-to-end user journeys, error handling scenarios, and performance tests that span multiple features and pages.

---

## End-to-End User Journeys

### E2E-001: Complete Reconciliation Flow (Happy Path)
**Objective**: Test entire reconciliation process from file upload to exception resolution

**Prerequisites**:
- Clean system state (or known state)
- Two CSV files prepared:
  - `bank_statement_jan_2026.csv` (1,500 rows)
  - `accounting_export_jan_2026.csv` (1,450 rows)
- Backend running and AI configured

**Test Steps**:

**Phase 1: File Upload**
1. Login to application
2. Navigate to FilesPage at `/files`
3. Upload source file A: `bank_statement_jan_2026.csv`
4. Wait for upload and analysis to complete (status: "Analyzed")
5. Verify file metadata correct: 1,500 rows, 8 columns
6. Upload source file B: `accounting_export_jan_2026.csv`
7. Wait for upload and analysis to complete
8. Verify file metadata correct: 1,450 rows, 7 columns
9. Preview both files to verify data loaded correctly

**Phase 2: Rule Creation**
10. Navigate to RulesPage at `/rules`
11. Click "Create Rule"
12. Enter basic info:
    - Name: "E2E Test: January 2026 Bank Reconciliation"
    - Select source file A
    - Select source file B
13. Click "AI Generate Mappings"
14. Wait for AI to analyze and suggest mappings (5-10 seconds)
15. Review AI suggestions (should suggest 6-7 mappings with >80% confidence)
16. Accept all high-confidence mappings
17. Manually map any remaining critical fields
18. Proceed to matching rules
19. Click "AI Suggest Matching Rules"
20. Review suggestions (exact match on amount, date range ±3 days, fuzzy on reference)
21. Accept suggested rules
22. Create rule set
23. Verify rule appears in library

**Phase 3: Reconciliation Creation**
24. Navigate to ReconciliationsPage at `/reconciliations`
25. Click "Create Reconciliation"
26. Wizard Step 1 - Basic Info:
    - Name: "E2E Test: January 2026 Reconciliation"
    - Description: "End-to-end test reconciliation"
    - Select source file A
    - Select source file B
    - Next
27. Wizard Step 2 - Rule Selection:
    - Select newly created rule set
    - Review field mappings preview
    - Review matching rules preview
    - Next
28. Wizard Step 3 - Review:
    - Verify all details correct
    - Create reconciliation

**Phase 4: Start Processing**
29. Verify new reconciliation appears with status "Pending"
30. Click "Start" button
31. Verify status changes to "Processing"
32. Wait for processing to complete (polling every 5 seconds)
33. Estimated completion: 30-60 seconds for 3,000 records
34. Verify status changes to "Completed"
35. Verify match rate displayed (expect ~95%)
36. Verify exception count displayed (expect ~50 exceptions)

**Phase 5: View Results**
37. Click "View Details" on completed reconciliation
38. Verify reconciliation details:
    - Match rate: 95.2% (green indicator)
    - Total records: 2,950
    - Matched: 2,808
    - Unmatched: 142
    - Exceptions: 48
39. Verify source files shown
40. Verify rule set shown
41. Click "View Exceptions"

**Phase 6: Exception Resolution**
42. Navigate to ExceptionsPage filtered for this reconciliation
43. Verify 48 exceptions displayed
44. Verify summary cards:
    - Critical: 5
    - Open: 48
    - Resolved: 0
45. Review exception types:
    - Missing Source: 15
    - Missing Target: 18
    - Mismatch: 10
    - Duplicate: 5
46. Verify AI suggestions available for 35+ exceptions
47. Review high-confidence AI suggestions (>85%)
48. Click "Accept All AI Suggestions"
49. Verify confirmation: "Accept 28 AI suggestions?"
50. Confirm bulk accept
51. Wait for bulk resolution (3-5 seconds)
52. Verify success: "28 exceptions resolved"
53. Verify summary updates:
    - Open: 20
    - Resolved: 28
54. Filter to show only open exceptions
55. Select first mismatch exception
56. Click "Investigate"
57. Review detailed comparison
58. Decide to accept source value
59. Click "Resolve Manually" → "Accept Source Value"
60. Enter reason: "Source value is more recent"
61. Resolve exception
62. Verify exception moves to resolved
63. Continue manually resolving 5 more exceptions
64. Ignore 14 remaining exceptions (known unmatched items from prior period)
65. Select all 14, click "Ignore Selected"
66. Enter reason: "Known unmatched from prior period"
67. Confirm bulk ignore
68. Verify all exceptions now resolved or ignored

**Phase 7: Final Verification**
69. Return to ReconciliationsPage
70. Verify reconciliation shows:
    - Status: Completed
    - Match rate: 95.2%
    - All exceptions resolved or ignored
71. Click reconciliation to view details
72. Verify completion timestamp
73. Download reconciliation report (if implemented)
74. Navigate to Dashboard
75. Verify dashboard reflects:
    - Total reconciliations incremented
    - Match rate updated
    - Open exceptions: 0 (all resolved)

**Expected Results**:
- Complete flow works without errors (80-120 seconds total)
- Files upload and analyze successfully
- AI generates reasonable field mappings and rules
- Reconciliation creates and processes correctly
- Match rate calculated accurately
- Exceptions identified correctly
- AI suggestions relevant and helpful
- Bulk operations work efficiently
- Manual resolution options available
- All data consistent across pages
- Dashboard updates reflect changes

**Success Criteria**:
- No console errors throughout flow
- No API errors (500, 404, etc.)
- No UI glitches or broken layouts
- All state transitions smooth
- Data persists correctly
- Performance acceptable (total time <2 minutes)

---

### E2E-002: AI-Assisted Reconciliation via Chat
**Objective**: Test conversational AI-driven reconciliation creation

**Prerequisites**:
- Clean system state
- Same two CSV files as E2E-001

**Test Steps**:

**Phase 1: AI Chat Interaction**
1. Login to application
2. Navigate to ChatPage at `/chat`
3. Verify welcome message displayed
4. Send message: "I need to reconcile my January 2026 bank statements"
5. Verify AI responds with guidance:
   - Asks about files (do you have the files?)
   - Explains reconciliation process
   - Suggests uploading files
6. Click file upload button in chat
7. Select `bank_statement_jan_2026.csv`
8. Wait for upload (progress shown in chat)
9. Verify AI acknowledges file:
   - "I've received your bank statement file"
   - Analyzes structure: "I see 1,500 transactions with columns: Date, Description, Amount, ..."
10. Send message: "I also have the accounting export"
11. Upload `accounting_export_jan_2026.csv`
12. Verify AI analyzes second file
13. Send message: "Can you match these files for me?"
14. Verify AI responds:
    - "I can help reconcile these files"
    - Analyzes compatibility
    - Suggests field mappings
15. AI displays suggested mappings:
    - "Date" → "Transaction Date" (98% confident)
    - "Amount" → "Debit" (95% confident)
    - "Reference" → "Ref_Number" (82% confident)
16. Send message: "Those mappings look good"
17. Verify AI creates rule set automatically
18. AI suggests: "Should I start the reconciliation?"
19. Send message: "Yes, start it"
20. Verify AI creates reconciliation with conversational name:
    - "January 2026 Bank Reconciliation (AI-assisted)"

**Phase 2: Monitor Progress via Chat**
21. Verify AI sends status updates in chat:
    - "Reconciliation started..."
    - "Processing 2,950 records..."
    - "50% complete..."
    - "Reconciliation complete!"
22. Verify AI provides summary:
    - Match rate: 95.2%
    - Matched: 2,808
    - Exceptions: 48
    - Critical exceptions: 5
23. AI suggests: "Would you like me to resolve exceptions?"
24. Send message: "Yes, resolve high-confidence exceptions"
25. Verify AI bulk resolves exceptions with suggestions >85% confidence
26. AI reports: "I resolved 28 exceptions. 20 exceptions need manual review."
27. Send message: "Show me the critical exceptions"
28. Verify AI provides summary of 5 critical exceptions in chat
29. For each critical exception, AI explains:
    - Type and severity
    - Details of mismatch
    - Suggested resolution
30. Send message: "Accept your suggestions for all critical exceptions"
31. Verify AI resolves critical exceptions
32. AI reports: "All critical exceptions resolved!"

**Phase 3: Verification**
33. Send message: "Show me the final results"
34. Verify AI provides clickable link to reconciliation details
35. Click link
36. Navigate to reconciliation details page
37. Verify all data consistent with chat conversation
38. Return to chat
39. Send message: "Thanks for the help!"
40. Verify AI provides polite closing

**Expected Results**:
- AI understands natural language instructions
- AI guides user through process conversationally
- File uploads work via chat interface
- AI analyzes files and suggests mappings
- AI creates reconciliation without manual wizard
- AI provides status updates proactively
- AI resolves exceptions based on user intent
- Links from chat to app pages work
- Conversation context maintained throughout
- Final state matches chat conversation

**Success Criteria**:
- Entire flow completed via chat (no manual navigation)
- AI responses relevant and helpful
- User can complete reconciliation with minimal technical knowledge
- Total time similar to manual flow (2-3 minutes)

---

### E2E-003: Rule Learning and Reuse Flow
**Objective**: Test AI learning from user corrections and reusing rules

**Prerequisites**:
- Completed E2E-001 or E2E-002

**Test Steps**:

**Phase 1: Initial Reconciliation with Corrections**
1. Create reconciliation using AI-generated field mappings
2. During exception review, AI suggests incorrect match
3. User rejects AI suggestion for mismatch exception
4. User manually resolves with correct action: "Amount should be absolute value match"
5. User provides correction explanation
6. Verify correction captured in system
7. Complete reconciliation

**Phase 2: Second Reconciliation (Learning Test)**
8. Upload similar files for February 2026
9. Create new reconciliation
10. Use AI to generate field mappings
11. Verify AI remembers correction:
    - Suggests absolute value match for amount field
    - References previous correction: "Based on your feedback from January reconciliation..."
12. Accept AI suggestions
13. Start reconciliation
14. Verify fewer exceptions of previously corrected type
15. Verify match rate higher than first reconciliation

**Phase 3: Rule Reuse**
16. Upload March 2026 files (same structure)
17. Create reconciliation
18. Select existing rule set from library (January or February rules)
19. Verify rule applies without modifications
20. Start reconciliation
21. Verify similar match rate
22. Verify exception types consistent

**Expected Results**:
- AI learns from user corrections
- Future suggestions reflect learned preferences
- Rules can be reused across similar reconciliations
- Accuracy improves over time
- User corrections tracked in rule history

---

## Error Handling and Edge Case Tests

### ERR-001: Backend API Unavailable
**Objective**: Verify app handles backend downtime gracefully

**Test Steps**:
1. Load application with backend running
2. Verify dashboard loads successfully
3. Stop backend server (simulate outage)
4. Navigate to ReconciliationsPage
5. Verify loading state shows spinner
6. After timeout (5-10 seconds), verify error state:
   - User-friendly error message (not technical stack trace)
   - Icon indicating connectivity issue
   - "Retry" button
   - Suggestion to check internet connection
7. Verify page doesn't crash or show blank screen
8. Verify other UI elements still functional (navigation, theme toggle, etc.)
9. Restart backend server
10. Click "Retry" button
11. Verify data loads successfully
12. Navigate through other pages
13. Verify all features restored

**Expected Results**:
- User-friendly error message (not "Network Error" or "500")
- Retry mechanism works
- No console errors break UI
- App remains usable for offline-capable features
- Automatic retry with exponential backoff (optional)
- Error clears after backend restored

**Edge Cases**:
- Backend crashes mid-request: Loading state shows, then error after timeout
- Backend returns 500 error: Shows "Service temporarily unavailable"
- Backend partially available (some endpoints down): Working features still accessible
- Network disconnected completely: Shows offline indicator

---

### ERR-002: Network Timeout During Long Operation
**Objective**: Verify timeout handling for slow API responses

**Test Steps**:
1. Start large reconciliation (10,000+ records)
2. Simulate network throttling (browser dev tools)
3. Set network to "Slow 3G" or custom (100 KB/s)
4. Wait for operation to exceed timeout threshold (30 seconds default)
5. Verify timeout error displays:
   - "Request timed out"
   - "This is taking longer than expected"
   - "Retry" button
   - "Cancel" button (if operation can be cancelled)
6. Click "Retry"
7. Restore normal network speed
8. Verify operation completes successfully

**Expected Results**:
- Timeout doesn't hang UI indefinitely
- Clear error message about timeout
- User can retry or cancel
- Operation cancellable if backend supports
- Loading indicator shows throughout wait

---

### ERR-003: Invalid API Response Format
**Objective**: Verify app handles malformed backend responses

**Test Steps**:
1. Mock API to return invalid JSON (via browser extension or test mode)
2. Load dashboard
3. Verify error caught and handled gracefully
4. Verify error message: "Unexpected data format. Please try refreshing."
5. Verify user sees friendly error, not crash or blank page
6. Mock API to return valid JSON but missing required fields
7. Load reconciliations list
8. Verify app handles missing data:
   - Shows placeholders (e.g., "N/A" for missing match rate)
   - Logs error to console for debugging
   - Doesn't crash
9. Restore normal API responses
10. Refresh page
11. Verify data loads normally

**Expected Results**:
- App doesn't crash on malformed data
- Error logged for debugging (console.error)
- User sees friendly error with refresh option
- Partial data rendered if possible
- Data validation on frontend prevents issues

---

### ERR-004: Concurrent Operations Conflict
**Objective**: Verify handling of concurrent edits and operations

**Test Steps**:
1. Open application in two browser tabs
2. Tab 1: Start editing reconciliation
3. Tab 2: Start editing same reconciliation
4. Tab 1: Save changes
5. Tab 2: Attempt to save changes
6. Verify conflict detection:
   - Error: "This reconciliation was modified by another user"
   - Option to reload and see latest version
   - Option to force overwrite (with warning)
7. Select reload option
8. Verify latest changes from Tab 1 displayed
9. Make new changes
10. Save successfully
11. Verify Tab 1 shows stale data warning or auto-refreshes

**Expected Results**:
- Concurrent edit conflicts detected
- User warned before overwriting others' changes
- Latest version retrievable
- Data integrity maintained (no silent overwrites)

---

### ERR-005: Permission Denied
**Objective**: Verify proper handling of unauthorized actions

**Test Steps**:
1. Login as user with "viewer" role (read-only)
2. Navigate to ReconciliationsPage
3. Verify "Create Reconciliation" button disabled or hidden
4. Attempt to access create endpoint directly via API call
5. Verify 403 Forbidden response
6. Verify error message: "You don't have permission to create reconciliations"
7. Verify UI shows upgrade prompt: "Contact admin to upgrade your account"
8. Navigate to Settings page
9. Verify sensitive settings (AI API keys, data sources) disabled or hidden
10. Attempt to change password (allowed)
11. Verify password change works (own profile editable)

**Expected Results**:
- Permission errors clearly communicated
- UI disables unauthorized actions proactively
- API enforces permissions (frontend can't bypass)
- User guided to request access if needed
- Own profile always editable

---

## Performance and Load Tests

### PERF-001: Large Dataset Rendering
**Objective**: Verify UI performs well with large datasets

**Test Steps**:
1. Create reconciliation with 50,000+ records
2. Wait for completion
3. Navigate to reconciliation details
4. Verify page loads within 3 seconds
5. Scroll through match results (if displayed)
6. Verify smooth scrolling (>30 FPS)
7. Navigate to exceptions page filtered for this reconciliation
8. Verify page loads within 3 seconds despite large exception count
9. Verify pagination implemented (20-50 per page, not all loaded at once)
10. Apply filters
11. Verify filter response <500ms
12. Search exceptions
13. Verify search response <500ms

**Expected Results**:
- No UI lag with large datasets
- Pagination or virtual scrolling prevents loading all records
- Filters and search remain responsive
- Memory usage reasonable (<200MB for page)
- Browser doesn't freeze or become unresponsive

---

### PERF-002: Concurrent User Load
**Objective**: Verify system handles multiple users simultaneously

**Test Steps**:
1. Simulate 10 users logging in simultaneously
2. Each user creates reconciliation
3. All reconciliations start processing at same time
4. Verify backend processes all without failure
5. Verify frontend updates for each user independently
6. Verify no slowdown for individual users
7. Check backend logs for errors or warnings
8. Verify database not overloaded

**Expected Results**:
- System handles concurrent load
- Each user's experience smooth
- No conflicts between user operations
- Backend scales appropriately
- Database transactions isolated

**Note**: This is primarily a backend test, but frontend should not exhibit issues

---

### PERF-003: Memory Leak Detection
**Objective**: Verify no memory leaks during extended use

**Test Steps**:
1. Open application in browser
2. Open browser DevTools → Performance → Memory
3. Take memory snapshot (baseline)
4. Navigate through all pages 10 times:
   - Dashboard → Files → Reconciliations → Exceptions → Rules → Settings → Repeat
5. Take memory snapshot after 10 cycles
6. Compare memory usage
7. Verify memory increase <50MB
8. Create and delete 50 reconciliations
9. Take memory snapshot
10. Verify memory released after deletions (garbage collection)
11. Upload and delete 50 files
12. Verify memory released
13. Send 100 chat messages
14. Verify chat history doesn't accumulate indefinitely
15. Take final memory snapshot
16. Compare to baseline
17. Verify total memory increase <100MB over extended session

**Expected Results**:
- Memory usage stays within reasonable bounds
- Zustand store doesn't accumulate orphaned data
- React Query cache cleanup works (LRU eviction)
- Event listeners properly removed on unmount
- No detached DOM nodes
- Browser remains responsive after extended use

---

### PERF-004: API Call Optimization
**Objective**: Verify minimal redundant API calls

**Test Steps**:
1. Open browser DevTools → Network tab
2. Clear network log
3. Load dashboard
4. Count API calls (should be 2-3 for dashboard data)
5. Navigate to Reconciliations page
6. Verify cache hit for shared data (no redundant calls)
7. Return to dashboard
8. Verify no redundant calls (cache used)
9. Wait for auto-refresh interval (60s)
10. Verify only stale data refetched
11. Open multiple tabs with same page
12. Verify shared cache (not duplicate requests per tab)
13. Verify React Query deduplication works

**Expected Results**:
- Minimal API calls (only necessary requests)
- React Query cache prevents redundant calls
- Automatic cache invalidation on mutations
- Polling only for required data (processing reconciliations)
- Request deduplication across tabs

---

## Accessibility Tests

### A11Y-001: Keyboard Navigation
**Objective**: Verify entire application keyboard accessible

**Test Steps**:
1. Navigate to application
2. Use only keyboard (no mouse):
   - Tab through all interactive elements
   - Shift+Tab to reverse
   - Enter/Space to activate buttons
   - Arrow keys for dropdowns and lists
   - Esc to close modals
3. Verify tab order logical (top to bottom, left to right)
4. Verify focus visible on all elements (outline or highlight)
5. Verify no keyboard traps (can always Tab away)
6. Verify modal focus trap (Tab cycles within modal)
7. Test all forms:
   - Tab through fields
   - Enter to submit
   - Esc to cancel
8. Test file upload:
   - Tab to upload button
   - Enter to open file dialog
   - Navigate file system with keyboard
9. Verify custom components (date picker, autocomplete) keyboard accessible

**Expected Results**:
- All features accessible via keyboard
- Tab order logical
- Focus always visible
- No keyboard traps
- Shortcuts documented (e.g., Ctrl+K for search)

---

### A11Y-002: Screen Reader Support
**Objective**: Verify application usable with screen reader

**Test Steps**:
1. Enable screen reader (NVDA on Windows, VoiceOver on Mac)
2. Navigate to application
3. Verify page structure announced:
   - Headings hierarchy (h1, h2, h3)
   - Landmarks (main, nav, aside, footer)
   - Lists and list items
4. Navigate dashboard:
   - Verify stats announced: "Total Reconciliations: 42"
   - Verify chart data announced
5. Navigate forms:
   - Verify labels announced for inputs
   - Verify required fields announced
   - Verify error messages announced
6. Test modals:
   - Verify modal title announced on open
   - Verify close button announced
7. Test dynamic updates:
   - Start reconciliation
   - Verify status changes announced (ARIA live region)
8. Test tables:
   - Verify headers announced
   - Verify row/column navigation
9. Verify images have alt text
10. Verify icons have ARIA labels

**Expected Results**:
- All content announced by screen reader
- Semantic HTML used appropriately
- ARIA labels where needed
- Dynamic updates announced
- No unlabeled interactive elements

---

## Cross-Browser Compatibility Tests

### COMPAT-001: Browser Support
**Objective**: Verify application works across major browsers

**Test Steps**:
1. Test on Chrome (latest)
2. Test on Firefox (latest)
3. Test on Safari (latest)
4. Test on Edge (latest)
5. For each browser:
   - Login
   - Navigate all pages
   - Create reconciliation
   - Upload files
   - Use AI chat
   - Change settings
   - Verify all features work
   - Verify layout correct
   - Verify no console errors
6. Test on mobile browsers:
   - Chrome Mobile (Android)
   - Safari Mobile (iOS)
7. Verify responsive design works
8. Verify touch interactions work

**Expected Results**:
- Application works on all major browsers
- Layout consistent across browsers
- No browser-specific bugs
- Feature parity across browsers
- Mobile experience optimized

---

## Data Integrity Tests

### DATA-001: State Consistency Across Pages
**Objective**: Verify data consistency when navigating between pages

**Test Steps**:
1. Create reconciliation on Reconciliations page
2. Navigate to Dashboard
3. Verify new reconciliation count reflected
4. Navigate to Exceptions page
5. Verify exceptions from new reconciliation appear (after completion)
6. Upload file on Files page
7. Navigate to Reconciliations page
8. Create reconciliation wizard
9. Verify new file appears in file dropdowns
10. Delete file on Files page
11. Navigate to Reconciliations page
12. Verify file no longer in dropdown
13. Resolve exception on Exceptions page
14. Navigate to reconciliation details
15. Verify exception count decremented

**Expected Results**:
- Data consistent across all pages
- React Query cache invalidation works
- Zustand store updates propagate
- No stale data displayed

---

### DATA-002: Persistence After Refresh
**Objective**: Verify data persists after browser refresh

**Test Steps**:
1. Create reconciliation
2. Start reconciliation
3. While processing, hard refresh browser (Ctrl+F5)
4. Verify reconciliation still processing after refresh
5. Wait for completion
6. Refresh browser
7. Verify reconciliation shows completed with correct match rate
8. Make changes to settings (theme, AI config)
9. Refresh browser
10. Verify settings persisted
11. Start typing in chat
12. Refresh browser
13. Verify chat history persisted (or cleared, depending on design)

**Expected Results**:
- Server state persists (reconciliations, files, rules)
- Local settings persist (theme, preferences)
- In-progress operations recoverable after refresh
- Chat history persists or clearly resets

---

## Security Tests

### SEC-001: XSS Prevention
**Objective**: Verify application prevents Cross-Site Scripting attacks

**Test Steps**:
1. Attempt to create reconciliation with name: `<script>alert('XSS')</script>`
2. Verify name sanitized or escaped in display
3. Verify no script executes
4. Upload CSV with malicious content in cells: `<img src=x onerror="alert('XSS')">`
5. Preview file
6. Verify content escaped in preview
7. Send chat message with script tags
8. Verify message displayed as text, not executed
9. Inspect HTML source
10. Verify all user content properly escaped

**Expected Results**:
- No user input executed as code
- HTML entities escaped
- React's built-in XSS protection effective
- No `dangerouslySetInnerHTML` used without sanitization

---

### SEC-002: Authentication and Authorization
**Objective**: Verify proper authentication and authorization throughout app

**Test Steps**:
1. Attempt to access `/reconciliations` without login
2. Verify redirected to login page
3. Login with valid credentials
4. Verify token stored securely (httpOnly cookie or secure localStorage)
5. Verify token sent with all API requests
6. Attempt to access admin-only endpoint as regular user
7. Verify 403 Forbidden response
8. Logout
9. Verify token cleared
10. Verify redirected to login
11. Attempt to access protected page
12. Verify redirected to login (not accessible)

**Expected Results**:
- Unauthenticated users redirected to login
- Authorization enforced on all protected endpoints
- Tokens stored securely
- Tokens cleared on logout
- No sensitive data in URL parameters or localStorage

---

## Summary

These integration and cross-cutting tests ensure:
- **End-to-end workflows** complete successfully
- **Error handling** is user-friendly and robust
- **Performance** meets benchmarks under load
- **Accessibility** supports all users
- **Browser compatibility** is comprehensive
- **Data integrity** maintained throughout app
- **Security** protections are effective

**Total Test Coverage Estimate**:
- **7 module-specific test files**: 100+ test scenarios
- **Integration flows**: 12 E2E and cross-cutting tests
- **Total**: 110+ comprehensive test scenarios

**Execution Priority**:
1. **P0 (Critical)**: E2E happy paths, core CRUD operations
2. **P1 (High)**: Error handling, validation, permissions
3. **P2 (Medium)**: Performance, accessibility, edge cases
4. **P3 (Low)**: Cross-browser, advanced features, nice-to-haves

**Recommended Test Automation**:
- **Unit tests**: Component logic, hooks, utilities (Vitest + React Testing Library)
- **Integration tests**: Feature flows (Vitest + MSW for API mocking)
- **E2E tests**: Critical user journeys (Playwright or Cypress)
- **Visual regression**: UI consistency (Percy, Chromatic)
- **Performance**: Lighthouse CI, bundle size monitoring
