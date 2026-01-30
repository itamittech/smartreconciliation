# Dashboard Tests

## Overview
Tests for HomePage dashboard functionality including metrics display, auto-refresh, chart interactions, and recent reconciliations list.

**Component**: `frontend/src/pages/HomePage.tsx`

---

## Test Scenarios

### DS-001: Dashboard Data Loading and Display
**Objective**: Verify dashboard loads and displays metrics correctly on initial page load

**Prerequisites**:
- Backend is running with sample data
- At least 3 reconciliations exist (1 completed, 1 in-progress, 1 failed)
- Dashboard metrics endpoint returns valid data

**Test Steps**:
1. Navigate to HomePage at `/`
2. Wait for dashboard metrics API call to complete
3. Verify loading state shows spinner during API call
4. Verify stats cards display correct values:
   - Total Reconciliations count
   - Match Rate percentage
   - Open Exceptions count
   - In Progress count
5. Verify match rate chart renders with exception data by type
6. Verify recent reconciliations list shows at least 3 entries
7. Verify quick actions panel displays action buttons

**Expected Results**:
- All stats cards show numeric values (not loading/error)
- Chart displays data points for each exception type
- Recent reconciliations show name, status badge, match rate, and date
- No console errors

**Edge Cases**:
- Empty dashboard (0 reconciliations): Shows empty state message
- API error: Shows error banner with retry option
- Slow network: Loading spinner remains visible until timeout (30s)

**API Endpoint**: `GET /api/dashboard/metrics`

**Code Reference**: `frontend/src/pages/HomePage.tsx:45-89`

---

### DS-002: Auto-Refresh Dashboard Metrics
**Objective**: Verify dashboard polls for updated metrics every 60 seconds

**Prerequisites**:
- Dashboard loaded successfully
- At least 1 reconciliation exists

**Test Steps**:
1. Load dashboard and note initial metric values
2. Open browser DevTools Network tab
3. Wait 60 seconds without interaction
4. Verify API call is made after 60 seconds
5. Update a reconciliation via another tab/window
6. Wait for next poll cycle
7. Verify dashboard reflects updated data

**Expected Results**:
- Metrics refresh automatically every 60s
- Updated data appears without manual page refresh
- Polling continues even during user interactions
- Network tab shows periodic API calls

**Edge Cases**:
- User navigates away: Polling stops
- User returns to dashboard: Polling resumes immediately
- Backend slow response: Previous data remains until new data loads

**React Query Hook**: `useDashboardMetrics` with `refetchInterval: 60000`

**Code Reference**: `frontend/src/services/hooks.ts:23-31`

---

### DS-003: Match Rate Chart Interaction
**Objective**: Verify chart displays exception breakdown and responds to interactions

**Prerequisites**:
- At least 10 exceptions across different types exist
- Dashboard loaded successfully

**Test Steps**:
1. Load dashboard with at least 10 exceptions across different types
2. Locate match rate chart component
3. Hover over chart segments
4. Verify tooltip shows exception type and count
5. Verify chart uses color coding:
   - Critical: Red (#EF4444)
   - Warning: Yellow/Orange (#F59E0B)
   - Info: Blue/Gray (#3B82F6)
6. Verify chart legend shows all exception types
7. Click legend item to toggle visibility (if implemented)

**Expected Results**:
- Chart renders with correct data
- Interactive tooltips work on hover
- Color scheme matches severity levels consistently
- Legend accurately reflects data
- Chart responsive to window resize

**Edge Cases**:
- No exceptions: Chart shows "No data available" message
- Single exception type: Chart still renders correctly
- Very large counts (>1000): Numbers formatted with commas

**Chart Library**: Recharts or Chart.js

**Code Reference**: `frontend/src/components/MatchRateChart.tsx:15-67`

---

### DS-004: Recent Reconciliations List Actions
**Objective**: Verify user can interact with recent reconciliations

**Prerequisites**:
- At least 5 reconciliations exist with varied statuses
- Dashboard loaded successfully

**Test Steps**:
1. Locate recent reconciliations list section
2. Verify list shows maximum 5 recent reconciliations
3. Click "View Details" on a completed reconciliation
4. Verify navigation to reconciliations page with selected reconciliation
5. Use browser back button to return to dashboard
6. Click "View Details" on an in-progress reconciliation
7. Verify status badge shows "Processing" with animated indicator
8. Verify match rate displays with color coding:
   - Green (>95%): Success color
   - Yellow (90-95%): Warning color
   - Red (<90%): Danger color
9. Hover over reconciliation row
10. Verify hover state changes background

**Expected Results**:
- Clicking view details navigates correctly
- Status badges accurately reflect reconciliation state:
  - Completed: Green badge
  - Processing: Blue badge with pulse animation
  - Pending: Gray badge
  - Failed: Red badge
- Match rate displays with appropriate color
- Dates formatted consistently (e.g., "Jan 15, 2026")
- "View All" link navigates to `/reconciliations`

**Edge Cases**:
- Less than 5 reconciliations: Shows all available
- No reconciliations: Shows empty state with "Create Reconciliation" CTA
- Very long reconciliation name: Truncates with ellipsis

**Code Reference**: `frontend/src/pages/HomePage.tsx:123-178`

---

### DS-005: Dashboard Quick Actions
**Objective**: Verify quick action buttons work correctly

**Prerequisites**:
- Dashboard loaded successfully

**Test Steps**:
1. Locate quick actions panel
2. Verify buttons displayed:
   - "Create Reconciliation"
   - "Upload Files"
   - "View Exceptions"
   - "AI Assistant"
3. Click "Create Reconciliation"
4. Verify navigation to `/reconciliations` with wizard modal open
5. Return to dashboard
6. Click "Upload Files"
7. Verify navigation to `/files` page
8. Return to dashboard
9. Click "View Exceptions"
10. Verify navigation to `/exceptions` page
11. Return to dashboard
12. Click "AI Assistant"
13. Verify navigation to `/chat` page

**Expected Results**:
- All buttons visible and clickable
- Each button navigates to correct page
- No console errors
- Button hover states work

**Edge Cases**:
- User lacks permission: Button disabled or shows tooltip
- Mobile view: Buttons stack vertically

**Code Reference**: `frontend/src/pages/HomePage.tsx:91-121`

---

### DS-006: Dashboard Error Recovery
**Objective**: Verify dashboard handles errors gracefully with retry mechanism

**Prerequisites**:
- Backend available initially

**Test Steps**:
1. Load dashboard successfully
2. Stop backend server or block network
3. Wait for next auto-refresh (60s) or force refresh
4. Verify error state displays:
   - Error icon
   - Error message: "Failed to load dashboard data"
   - "Retry" button
5. Click "Retry" button
6. Verify retry attempt made (loading state)
7. Verify error persists if backend still down
8. Restart backend server
9. Click "Retry" again
10. Verify dashboard data loads successfully

**Expected Results**:
- Error message is user-friendly (not technical)
- Retry button triggers new API call
- Success after retry restores full dashboard
- Previous data cleared on successful reload
- No app crash on error

**Edge Cases**:
- Partial API failure (some endpoints succeed): Shows available data with error banner
- Network timeout: Shows timeout message after 30s
- Multiple rapid retries: Debounced to prevent spam

**Code Reference**: `frontend/src/services/hooks.ts:23-31` (error handling)

---

### DS-007: Dashboard Responsive Layout
**Objective**: Verify dashboard layout adapts to different screen sizes

**Prerequisites**:
- Dashboard loaded successfully

**Test Steps**:
1. Load dashboard in desktop view (>1024px width)
2. Verify 4-column grid for stats cards
3. Verify chart and recent reconciliations side-by-side
4. Resize browser to tablet view (768px - 1024px)
5. Verify 2-column grid for stats cards
6. Verify chart and recent reconciliations stack vertically
7. Resize to mobile view (<768px)
8. Verify 1-column layout
9. Verify all content remains accessible
10. Verify no horizontal scroll

**Expected Results**:
- Layout adapts smoothly to screen size
- No content cut off or overlapping
- Touch targets adequate for mobile (>44px)
- Charts resize appropriately
- Text remains readable at all sizes

**Edge Cases**:
- Very small mobile (<375px): Content still usable
- Ultra-wide desktop (>1920px): Max-width container prevents excessive stretching

**CSS Framework**: Tailwind CSS responsive utilities

**Code Reference**: `frontend/src/pages/HomePage.tsx:15-200` (responsive classes)

---

## Integration Points

### API Endpoints
- `GET /api/dashboard/metrics` - Fetch dashboard statistics
- `GET /api/reconciliations?limit=5&sort=createdAt:desc` - Recent reconciliations

### State Management
- Zustand store: Not heavily used for dashboard (mostly React Query cache)
- React Query cache keys:
  - `['dashboard', 'metrics']`
  - `['reconciliations', 'recent']`

### Navigation
- Routes:
  - `/` - Dashboard home
  - `/reconciliations` - From view all link
  - `/exceptions` - From quick actions
  - `/files` - From quick actions
  - `/chat` - From AI assistant button

### Components Used
- `StatsCard` - Metric display cards
- `MatchRateChart` - Exception visualization
- `ReconciliationListItem` - Recent reconciliation row
- `QuickActions` - Action button panel
- `ErrorBanner` - Error state display
- `LoadingSpinner` - Loading state

---

## Test Data Requirements

### Sample Dashboard Metrics Response
```json
{
  "totalReconciliations": 42,
  "matchRate": 94.5,
  "openExceptions": 23,
  "inProgress": 3,
  "exceptionsByType": {
    "missing_source": 8,
    "missing_target": 5,
    "mismatch": 7,
    "duplicate": 3
  },
  "exceptionsBySeverity": {
    "critical": 5,
    "warning": 12,
    "info": 6
  }
}
```

### Sample Recent Reconciliations Response
```json
{
  "data": [
    {
      "id": "rec-001",
      "name": "January 2026 Bank Reconciliation",
      "status": "completed",
      "matchRate": 96.2,
      "createdAt": "2026-01-28T10:30:00Z",
      "completedAt": "2026-01-28T10:45:00Z"
    },
    {
      "id": "rec-002",
      "name": "Q4 2025 Account Reconciliation",
      "status": "processing",
      "matchRate": null,
      "createdAt": "2026-01-28T09:15:00Z",
      "completedAt": null
    }
  ],
  "total": 42
}
```

---

## Performance Benchmarks

- Initial dashboard load: <2 seconds
- Auto-refresh API call: <500ms
- Chart render time: <200ms
- Interaction response: <50ms
- Memory usage: <50MB for dashboard page

---

## Accessibility Requirements

- ARIA labels on all interactive elements
- Keyboard navigation support:
  - Tab through quick action buttons
  - Enter to activate buttons
  - Focus visible on all interactive elements
- Screen reader announcements:
  - Stats card values
  - Chart data points
  - Status changes
- Color contrast ratio ≥4.5:1 for text
- Semantic HTML structure

---

## Notes

- Dashboard is typically the landing page after login
- Auto-refresh can be disabled in settings (future feature)
- Chart library may need performance optimization for >100 exceptions
- Consider caching dashboard data in localStorage for faster initial load
