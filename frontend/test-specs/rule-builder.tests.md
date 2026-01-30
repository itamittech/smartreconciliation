# Rule Builder Tests

## Overview
Tests for RulesPage including rule library viewing, rule selection, field mappings, matching rules, and rule management (create, edit, duplicate, delete).

**Component**: `frontend/src/pages/RulesPage.tsx`

---

## Test Scenarios

### RULE-001: View Rule Library
**Objective**: Verify user can view list of existing rule sets

**Prerequisites**:
- At least 5 rule sets exist in system
- Mix of user-created and AI-generated rules

**Test Steps**:
1. Navigate to RulesPage at `/rules`
2. Verify two-panel layout:
   - Left panel: Rule library list (30-40% width)
   - Right panel: Rule details (60-70% width)
3. Verify left panel displays rule library with search
4. Verify each rule card/item displays:
   - Rule set name
   - Description (truncated if long)
   - AI-generated badge (if applicable) - blue badge with "AI" icon
   - Last modified date (relative, e.g., "2 days ago")
   - Number of field mappings count
   - Number of matching rules count
   - Edit icon button
   - Delete icon button
5. Verify rules sorted by last modified date (newest first)
6. Count total rules displayed
7. Verify first rule auto-selected and details shown in right panel
8. Verify selected rule highlighted in left panel

**Expected Results**:
- All rule sets load and display within 1 second
- Rule cards show key information clearly
- AI-generated rules visually distinguished
- List scrollable if many rules
- First rule auto-selected for viewing
- Selected rule highlighted

**Edge Cases**:
- No rules exist: Empty state with "Create Your First Rule" button and illustration
- Only AI-generated rules: All have AI badge
- Very long rule name (>50 chars): Truncated with ellipsis, full name on hover
- Rule with no description: Shows placeholder "(No description)"
- Rule being edited by another user: Shows lock icon or "In use" badge (if collaborative editing)

**API Endpoint**: `GET /api/rules`

**Sample Response**:
```json
{
  "data": [
    {
      "id": "rule-001",
      "name": "Standard Bank Reconciliation Rules",
      "description": "General purpose rules for bank statement reconciliation",
      "isAiGenerated": false,
      "fieldMappingsCount": 8,
      "matchingRulesCount": 3,
      "createdAt": "2026-01-20T10:30:00Z",
      "updatedAt": "2026-01-28T14:22:00Z",
      "createdBy": "user-123"
    },
    {
      "id": "rule-002",
      "name": "AI-Generated: January 2026 Bank Mapping",
      "description": "Automatically generated based on file analysis",
      "isAiGenerated": true,
      "fieldMappingsCount": 10,
      "matchingRulesCount": 4,
      "createdAt": "2026-01-28T10:45:00Z",
      "updatedAt": "2026-01-28T10:45:00Z",
      "createdBy": "ai"
    }
  ],
  "total": 5
}
```

**Code Reference**: `frontend/src/pages/RulesPage.tsx:67-145`

---

### RULE-002: Search Rule Library
**Objective**: Verify search functionality filters rules by name and description

**Prerequisites**:
- At least 10 rules exist with varied names

**Test Steps**:
1. Navigate to RulesPage with 10+ rules
2. Locate search input field in left panel header
3. Verify placeholder text: "Search rules..."
4. Note initial rule count
5. Type "bank" in search box
6. Verify rules filter in real-time as typing
7. Verify only rules with "bank" in name or description displayed
8. Verify search is case-insensitive
9. Note filtered count: "Showing 3 of 10"
10. Clear search box (X icon or backspace all)
11. Verify all rules reappear
12. Type "AI-Generated" in search
13. Verify only AI-generated rules shown
14. Type non-existent term: "xyz123"
15. Verify empty state displays:
    - Icon (magnifying glass with X)
    - Message: "No rules found"
    - "Clear search" button
16. Click "Clear search"
17. Verify all rules shown again

**Expected Results**:
- Search filters in real-time (debounced 300ms)
- Case-insensitive search
- Searches both name and description fields
- Empty state for no results
- Can clear search easily
- Filtered count displayed

**Edge Cases**:
- Search with special characters: Escaped and handled safely
- Search during rule creation: New rule appears if matches search
- Very long search term: Input limited or scrollable

**Code Reference**: `frontend/src/pages/RulesPage.tsx:147-189`

---

### RULE-003: Select and View Rule Details
**Objective**: Verify user can select rule and view comprehensive details

**Prerequisites**:
- At least 1 rule set with field mappings and matching rules

**Test Steps**:
1. Navigate to RulesPage
2. Click on rule set in library: "Standard Bank Reconciliation Rules"
3. Verify right panel displays rule details with tabs/sections:
   - Overview
   - Field Mappings
   - Matching Rules
   - Usage History (optional)

4. **Overview Tab/Section**:
   - Verify displays:
     - Rule set name (editable inline if edit mode)
     - Description (editable inline if edit mode)
     - AI-generated badge (if applicable)
     - Created by: User name
     - Created date: "Jan 20, 2026"
     - Last modified: "2 days ago"
     - Used in: "3 reconciliations" (clickable link)

5. **Field Mappings Section**:
   - Verify table/list displays all field mappings:
     - Source Field column
     - → (arrow icon)
     - Target Field column
     - Transform Logic column (if any)
     - Confidence Score column (if AI-generated)
     - Actions column (edit, delete icons)
   - Example row:
     - Source: "Date"
     - Target: "Transaction Date"
     - Transform: "Date format: MM/DD/YYYY → YYYY-MM-DD"
     - Confidence: "95%" (if AI-generated)
   - Verify at least 8 field mappings displayed
   - Verify can scroll if many mappings
   - Verify each mapping shows data types (string, number, date, boolean)

6. **Matching Rules Section**:
   - Verify table/list displays all matching rules:
     - Rule name column
     - Match type column (Exact, Fuzzy, Range, Date Range, etc.)
     - Tolerance settings column
     - Priority column (1, 2, 3...)
     - Enabled toggle column
     - Actions column (edit, delete, reorder icons)
   - Example rule:
     - Name: "Amount Exact Match"
     - Type: "Exact"
     - Tolerance: "None"
     - Priority: "1"
     - Enabled: ✓
   - Another example:
     - Name: "Date Range Match"
     - Type: "Date Range"
     - Tolerance: "±3 days"
     - Priority: "2"
     - Enabled: ✓
   - Verify rules displayed in priority order (1 first)
   - Verify can toggle enabled/disabled status

7. **Usage History Section** (if implemented):
   - Verify shows list of reconciliations using this rule set
   - Each entry shows:
     - Reconciliation name
     - Date used
     - Link to view reconciliation

8. Click "Used in 3 reconciliations" link
9. Verify navigates to reconciliations page filtered to show these reconciliations

**Expected Results**:
- Details load without errors within 500ms
- All field mappings displayed clearly with arrows
- Matching rules show configuration and priority
- Confidence scores shown for AI-generated mappings
- Can see rule usage history
- Transform logic displayed when present
- Data types indicated for fields
- All sections scrollable if content extensive

**Edge Cases**:
- Rule with no field mappings: Shows empty state "No field mappings defined"
- Rule with no matching rules: Shows empty state "No matching rules defined"
- Rule never used: Usage shows "Not yet used"
- Very complex transform logic: Shows summary with "View Details" option
- Disabled matching rule: Grayed out or badge indicates "Disabled"

**API Endpoint**: `GET /api/rules/{id}`

**Sample Response**:
```json
{
  "id": "rule-001",
  "name": "Standard Bank Reconciliation Rules",
  "description": "General purpose rules for bank statement reconciliation",
  "isAiGenerated": false,
  "createdBy": "user-123",
  "createdAt": "2026-01-20T10:30:00Z",
  "updatedAt": "2026-01-28T14:22:00Z",
  "fieldMappings": [
    {
      "id": "map-001",
      "sourceField": "Date",
      "sourceType": "date",
      "targetField": "Transaction Date",
      "targetType": "date",
      "transform": {
        "type": "date_format",
        "fromFormat": "MM/DD/YYYY",
        "toFormat": "YYYY-MM-DD"
      },
      "confidence": 0.98,
      "isAiGenerated": true
    },
    {
      "id": "map-002",
      "sourceField": "Amount",
      "sourceType": "number",
      "targetField": "Debit",
      "targetType": "number",
      "transform": null,
      "confidence": 1.0,
      "isAiGenerated": false
    }
  ],
  "matchingRules": [
    {
      "id": "match-001",
      "name": "Amount Exact Match",
      "type": "exact",
      "fields": ["Amount"],
      "tolerance": null,
      "priority": 1,
      "enabled": true
    },
    {
      "id": "match-002",
      "name": "Date Range Match",
      "type": "date_range",
      "fields": ["Date"],
      "tolerance": {
        "days": 3,
        "direction": "both"
      },
      "priority": 2,
      "enabled": true
    },
    {
      "id": "match-003",
      "name": "Fuzzy Reference Match",
      "type": "fuzzy",
      "fields": ["Reference"],
      "tolerance": {
        "similarity": 0.85
      },
      "priority": 3,
      "enabled": true
    }
  ],
  "usedInReconciliations": [
    {
      "id": "rec-001",
      "name": "January 2026 Bank Reconciliation",
      "date": "2026-01-28T10:30:00Z"
    }
  ]
}
```

**Code Reference**: `frontend/src/pages/RulesPage.tsx:234-456`

---

### RULE-004: Create New Rule Set (Manual)
**Objective**: Verify user can create new rule set manually

**Prerequisites**:
- At least 2 analyzed files available (for schema reference)

**Test Steps**:
1. Navigate to RulesPage
2. Click "Create Rule" button (primary action button in header)
3. Verify create rule modal/form opens with tabs:
   - Basic Info (Step 1)
   - Field Mappings (Step 2)
   - Matching Rules (Step 3)

4. **Step 1 - Basic Info**:
   - Enter rule set name: "Q1 2026 Reconciliation Rules"
   - Enter description: "Custom rules for quarterly reconciliation"
   - Select source schema reference: "bank_transactions_jan_2026.csv"
   - Select target schema reference: "accounting_export_jan_2026.xlsx"
   - Verify source and target schemas displayed with column lists
   - Click "Next"

5. **Step 2 - Field Mappings**:
   - Verify two-column layout:
     - Left: Source fields (from selected file)
     - Right: Target fields (from selected file)
   - Verify "Add Mapping" button or drag-drop interface
   - **Manual Mapping**:
     - Drag "Date" from source to "Transaction Date" in target
     - Verify mapping created with arrow visualization
     - Alternatively: Click "Add Mapping" button
     - Select source field: "Amount"
     - Select target field: "Debit"
     - Select transform (optional): "None" or select from dropdown
     - Click "Add"
   - Verify mapping appears in mappings list
   - Repeat to create 5+ mappings
   - Verify can delete mapping (X icon)
   - Verify can edit mapping (edit icon)
   - **Add Transform**:
     - Create mapping: "Date" → "Transaction Date"
     - Click "Add Transform"
     - Select transform type: "Date Format"
     - Configure: From "MM/DD/YYYY" To "YYYY-MM-DD"
     - Save transform
     - Verify transform displayed in mapping
   - **AI Suggestion** (if available):
     - Click "Suggest Mappings" button
     - Verify AI analyzes schemas and suggests mappings
     - Review AI suggestions with confidence scores
     - Accept or reject each suggestion
   - Verify unmapped fields highlighted
   - Click "Next"

6. **Step 3 - Matching Rules**:
   - Click "Add Matching Rule" button
   - **Exact Match Rule**:
     - Enter name: "Amount Exact Match"
     - Select type: "Exact"
     - Select fields: ["Amount"]
     - Priority: "1"
     - Enabled: ✓
     - Click "Add"
   - **Date Range Rule**:
     - Click "Add Matching Rule"
     - Name: "Date Range Match"
     - Type: "Date Range"
     - Fields: ["Date"]
     - Tolerance: "±3 days"
     - Priority: "2"
     - Enabled: ✓
     - Click "Add"
   - **Fuzzy Match Rule**:
     - Click "Add Matching Rule"
     - Name: "Reference Fuzzy Match"
     - Type: "Fuzzy"
     - Fields: ["Reference"]
     - Similarity threshold: "85%"
     - Priority: "3"
     - Enabled: ✓
     - Click "Add"
   - Verify can reorder rules (drag handles or up/down arrows)
   - Verify can toggle enabled/disabled
   - Verify can delete rule
   - Click "Create Rule Set"

7. Verify API POST to `/api/rules`
8. Verify loading state during creation
9. Verify success toast: "Rule set created successfully"
10. Verify modal closes
11. Verify new rule appears in library
12. Verify new rule auto-selected and details shown

**Expected Results**:
- Wizard guides through all steps
- Can create field mappings manually
- Can add transforms to mappings
- Can create multiple matching rule types
- AI suggestions available (optional)
- All configurations validated before creation
- Successfully creates rule set
- New rule immediately available for use

**Edge Cases**:
- Close modal mid-creation: Confirmation "Discard changes?"
- No field mappings: Warning "At least one field mapping required"
- No matching rules: Warning but allow (use all mappings as exact match)
- Duplicate field mapping: Error "Mapping already exists"
- Invalid transform configuration: Validation error
- API error during creation: Error message, modal stays open
- Rule name already exists: Error "Rule name must be unique" or auto-append number

**API Endpoint**: `POST /api/rules`

**Request Payload**:
```json
{
  "name": "Q1 2026 Reconciliation Rules",
  "description": "Custom rules for quarterly reconciliation",
  "sourceSchemaId": "file-123",
  "targetSchemaId": "file-456",
  "fieldMappings": [
    {
      "sourceField": "Date",
      "targetField": "Transaction Date",
      "transform": {
        "type": "date_format",
        "fromFormat": "MM/DD/YYYY",
        "toFormat": "YYYY-MM-DD"
      }
    }
  ],
  "matchingRules": [
    {
      "name": "Amount Exact Match",
      "type": "exact",
      "fields": ["Amount"],
      "priority": 1,
      "enabled": true
    }
  ]
}
```

**Code Reference**: `frontend/src/pages/RulesPage.tsx:567-823`

---

### RULE-005: Create Rule Set with AI Assistance
**Objective**: Verify AI can generate field mappings and matching rules

**Prerequisites**:
- Two analyzed files with similar schemas
- AI service configured

**Test Steps**:
1. Click "Create Rule" button
2. Enter basic info:
   - Name: "AI-Generated: Test Mapping"
   - Select source and target files
3. Click "Next" to Field Mappings step
4. Click "AI Generate Mappings" button
5. Verify loading indicator: "AI analyzing schemas..."
6. Wait for AI analysis (3-10 seconds)
7. Verify AI suggestions displayed:
   - List of proposed mappings
   - Each with confidence score
   - Each with visual indicator (high confidence: green, medium: yellow, low: red)
8. Review suggestions:
   - "Date" → "Transaction Date" (98% confidence)
   - "Amount" → "Debit" (92% confidence)
   - "Reference" → "Ref_Number" (75% confidence)
9. Verify can accept individual mappings (checkboxes or Accept button)
10. Verify can reject individual mappings
11. Verify can edit AI-suggested mapping before accepting
12. Click "Accept All High Confidence" (>80%)
13. Verify high confidence mappings added
14. Manually review and accept/reject medium confidence
15. Click "Next" to Matching Rules
16. Click "AI Suggest Matching Rules"
17. Verify AI suggests appropriate rules based on field types and data
18. Review and accept/reject suggestions
19. Complete creation
20. Verify rule set marked as "AI-Generated" with badge

**Expected Results**:
- AI generates relevant field mappings
- Confidence scores help prioritize review
- Can accept/reject individual suggestions
- Can edit suggestions before accepting
- AI suggests appropriate matching rules
- AI-generated rules clearly marked

**Edge Cases**:
- No similar fields: AI shows message "No confident mappings found"
- All fields identical names: 100% confidence mappings
- AI service error: Error message, can proceed with manual mapping
- AI timeout: Shows timeout message after 30s, retry option

**API Endpoint**: `POST /api/rules/ai-generate`

**Code Reference**: `frontend/src/pages/RulesPage.tsx:825-1023`

---

### RULE-006: Edit Existing Rule Set
**Objective**: Verify user can edit existing rule set

**Prerequisites**:
- At least 1 rule set that is NOT currently used in active reconciliation

**Test Steps**:
1. Select rule set in library
2. Click edit icon/button (pencil icon)
3. Verify edit mode activated:
   - Rule name becomes editable inline or modal opens
   - All sections become editable
   - "Save" and "Cancel" buttons appear
4. Edit rule name: Append " - Updated"
5. Edit description
6. **Edit Field Mapping**:
   - Click edit icon on existing mapping
   - Change target field selection
   - Update transform configuration
   - Click "Save"
   - Verify mapping updated
7. **Add New Field Mapping**:
   - Click "Add Mapping"
   - Configure new mapping
   - Save
   - Verify appears in list
8. **Delete Field Mapping**:
   - Click delete icon on mapping
   - Verify confirmation
   - Confirm deletion
   - Verify mapping removed
9. **Edit Matching Rule**:
   - Click edit on matching rule
   - Change tolerance value
   - Change priority
   - Save
   - Verify rule updated
10. **Reorder Matching Rules**:
    - Drag matching rule to different priority position
    - Verify priorities renumber automatically
11. Click "Save Changes"
12. Verify API PUT to `/api/rules/{id}`
13. Verify success toast: "Rule set updated successfully"
14. Verify changes persist after save
15. Verify "Last modified" date updated

**Expected Results**:
- All sections editable in edit mode
- Can modify name, description, mappings, and rules
- Changes validated before save
- Successfully saves updates
- Last modified timestamp updates

**Edge Cases**:
- Edit rule used in active reconciliation: Warning "This rule is currently in use. Changes may affect active reconciliations."
- Remove all field mappings: Error "At least one mapping required"
- Duplicate mapping after edit: Validation error
- Cancel edit with unsaved changes: Confirmation "Discard changes?"
- API error during save: Error message, edit mode remains open

**API Endpoint**: `PUT /api/rules/{id}`

**Code Reference**: `frontend/src/pages/RulesPage.tsx:1025-1234`

---

### RULE-007: Duplicate Rule Set
**Objective**: Verify rule duplication creates independent copy

**Prerequisites**:
- At least 1 rule set exists

**Test Steps**:
1. Select rule set in library: "Standard Bank Reconciliation Rules"
2. Click duplicate icon/button or select "Duplicate" from actions menu
3. Verify duplication modal appears:
   - Title: "Duplicate Rule Set"
   - New name field pre-filled: "Standard Bank Reconciliation Rules (Copy)"
   - Option to edit name before duplication
   - "Duplicate" and "Cancel" buttons
4. Edit name: "Standard Bank Reconciliation Rules - Modified"
5. Click "Duplicate"
6. Verify API POST to `/api/rules/{id}/duplicate`
7. Verify success toast: "Rule set duplicated successfully"
8. Verify copy appears in rule library
9. Verify copy has same field mappings as original
10. Verify copy has same matching rules as original
11. Verify copy has different ID
12. Verify copy shows current date as created/modified date
13. Verify copy NOT marked as AI-generated (even if original was)
14. Select duplicated rule
15. Verify all details identical except name and metadata
16. Edit duplicated rule
17. Verify changes to copy do not affect original

**Expected Results**:
- Duplicate creates independent copy
- All field mappings and rules copied
- Can rename during duplication
- Copy editable independently
- Original unchanged by edits to copy

**Edge Cases**:
- Duplicate with existing name: Auto-appends number "(Copy 2)"
- Duplicate during edit of original: Works independently
- API error during duplicate: Error message

**API Endpoint**: `POST /api/rules/{id}/duplicate`

**Response**:
```json
{
  "id": "rule-003",
  "name": "Standard Bank Reconciliation Rules - Modified",
  "sourceRuleId": "rule-001",
  "createdAt": "2026-01-30T16:45:00Z"
}
```

**Code Reference**: `frontend/src/pages/RulesPage.tsx:1236-1312`

---

### RULE-008: Delete Rule Set
**Objective**: Verify rule deletion with safety checks

**Prerequisites**:
- At least 1 rule set that is NOT used in any reconciliation
- At least 1 rule set that IS used in reconciliation

**Test Steps**:
1. **Delete Unused Rule**:
   - Select unused rule in library
   - Click delete icon (trash icon)
   - Verify confirmation dialog:
     - Title: "Delete Rule Set?"
     - Message: "Are you sure you want to delete '[Rule Name]'?"
     - Warning: "This action cannot be undone"
     - "Cancel" and "Delete" buttons (Delete in red)
2. Click "Cancel"
3. Verify dialog closes, rule remains
4. Click delete icon again
5. Click "Delete"
6. Verify API DELETE to `/api/rules/{id}`
7. Verify success toast: "Rule set deleted successfully"
8. Verify rule removed from library
9. Verify if rule was selected, another rule auto-selected or empty state shown

10. **Attempt to Delete Used Rule**:
11. Select rule used in reconciliation
12. Click delete icon
13. Verify different warning dialog:
    - Title: "Cannot Delete Rule Set"
    - Message: "This rule set is used in 2 reconciliation(s):"
    - List of reconciliation names
    - Subtext: "Delete or update these reconciliations first"
    - "View Reconciliations" button
    - "Close" button (no Delete button)
14. Click "View Reconciliations"
15. Verify navigates to reconciliations page showing reconciliations using this rule

**Expected Results**:
- Confirmation prevents accidental deletion
- Cannot delete rules in use
- Shows which reconciliations use the rule
- Can navigate to view dependent reconciliations
- Unused rules delete successfully
- Library updates immediately

**Edge Cases**:
- Delete while viewing: Another rule auto-selected
- Delete last rule: Shows empty state
- API error during delete: Error toast, rule remains
- Delete rule used in completed reconciliation: May allow with warning (depends on business rules)

**API Endpoint**: `DELETE /api/rules/{id}`

**Response (rule in use)**:
```json
{
  "success": false,
  "error": "rule_in_use",
  "message": "Rule set is used in 2 reconciliations",
  "reconciliations": [
    {
      "id": "rec-001",
      "name": "January 2026 Bank Reconciliation"
    }
  ]
}
```

**Code Reference**: `frontend/src/pages/RulesPage.tsx:1314-1423`

---

### RULE-009: Test Rule Set (Preview)
**Objective**: Verify user can test rule set against sample data before using in reconciliation

**Prerequisites**:
- Rule set with field mappings configured
- Two files uploaded

**Test Steps**:
1. Select rule set
2. Click "Test Rule" button
3. Verify test modal opens:
   - Select source file dropdown
   - Select target file dropdown
   - "Run Test" button
4. Select files to test against
5. Click "Run Test"
6. Verify API call to test endpoint
7. Verify loading state: "Testing rule set..."
8. Wait for test results (5-15 seconds)
9. Verify test results displayed:
   - **Field Mappings Test**:
     - Shows sample rows (5-10)
     - Shows source value → transformed value → target value for each mapping
     - Highlights successful mappings (green)
     - Highlights failed mappings (red) with error message
   - **Matching Rules Test**:
     - Shows sample match results
     - Number of matches found per rule
     - Sample matched record pairs
     - Warnings for rules that found no matches
   - **Overall Statistics**:
     - Total records tested: 100 (sample)
     - Successful mappings: 95%
     - Potential match rate: 87%
10. Verify can export test results (optional)
11. Verify "Looks Good, Use This Rule" button
12. Verify "Adjust Rule" button returns to edit mode

**Expected Results**:
- Can test rule against real data
- Test results show mapping effectiveness
- Identifies potential issues before full reconciliation
- Visual feedback on successes and failures
- Helps user refine rule before committing

**Edge Cases**:
- No files selected: Validation error
- Files don't match rule schema: Error message
- Test timeout (>30s): Shows partial results or timeout error
- All mappings fail: Clear indication, suggests AI re-generation or manual review

**API Endpoint**: `POST /api/rules/{id}/test`

**Request**:
```json
{
  "ruleId": "rule-001",
  "sourceFileId": "file-123",
  "targetFileId": "file-456",
  "sampleSize": 100
}
```

**Note**: This may be a future feature, verify existence first

**Code Reference**: `frontend/src/pages/RulesPage.tsx:1425-1634` (if implemented)

---

## Integration Points

### API Endpoints
- `GET /api/rules` - List rule sets
- `GET /api/rules/{id}` - Get rule set details
- `POST /api/rules` - Create new rule set
- `POST /api/rules/ai-generate` - AI generate field mappings
- `PUT /api/rules/{id}` - Update rule set
- `POST /api/rules/{id}/duplicate` - Duplicate rule set
- `DELETE /api/rules/{id}` - Delete rule set
- `POST /api/rules/{id}/test` - Test rule set (optional)

### State Management
- Zustand store:
  - `rules: Rule[]`
  - `selectedRuleId: string | null`
  - `ruleEditMode: boolean`
- React Query cache keys:
  - `['rules']`
  - `['rule', id]`
  - `['rule', id, 'test-results']`

### Navigation
- `/rules` - Main rules page
- `/reconciliations?ruleId={id}` - Filtered reconciliations using rule

### Components Used
- `RuleLibraryPanel` - Left panel rule list
- `RuleDetailsPanel` - Right panel details view
- `RuleWizard` - Create/edit wizard
- `FieldMappingEditor` - Field mapping configuration
- `MatchingRuleEditor` - Matching rule configuration
- `AIsuggestionPanel` - AI-generated suggestions
- `RuleTestModal` - Test rule interface

---

## Test Data Requirements

### Sample Rule with Full Details
```json
{
  "id": "rule-001",
  "name": "Standard Bank Reconciliation Rules",
  "description": "General purpose rules for bank statement reconciliation",
  "isAiGenerated": false,
  "createdBy": "user-123",
  "createdAt": "2026-01-20T10:30:00Z",
  "updatedAt": "2026-01-28T14:22:00Z",
  "sourceSchemaId": "file-123",
  "targetSchemaId": "file-456",
  "fieldMappings": [
    {
      "id": "map-001",
      "sourceField": "Date",
      "sourceType": "date",
      "targetField": "Transaction Date",
      "targetType": "date",
      "transform": {
        "type": "date_format",
        "fromFormat": "MM/DD/YYYY",
        "toFormat": "YYYY-MM-DD"
      },
      "confidence": 0.98
    }
  ],
  "matchingRules": [
    {
      "id": "match-001",
      "name": "Amount Exact Match",
      "type": "exact",
      "fields": ["Amount"],
      "tolerance": null,
      "priority": 1,
      "enabled": true
    }
  ],
  "usedInReconciliations": ["rec-001", "rec-002"]
}
```

---

## Performance Benchmarks

- Rule library load: <1 second
- Rule details load: <500ms
- AI mapping generation: 3-10 seconds
- Rule save: <1 second
- Rule test: 5-15 seconds (depends on sample size)

---

## Accessibility Requirements

- Keyboard navigation between library and details panels
- Focus management in wizard
- ARIA labels for all interactive elements
- Screen reader support for complex components (field mappings, matching rules)
- Drag-drop alternatives for keyboard users
- High contrast mode support

---

## Notes

- Rules are reusable across multiple reconciliations
- AI-generated rules accelerate setup
- Field mapping transforms enable data normalization
- Matching rules define reconciliation logic
- Priority system determines match precedence
- Testing rules before use improves success rate
- Consider versioning rules for audit and rollback
