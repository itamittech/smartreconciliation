# Settings Tests

## Overview
Tests for SettingsPage including profile management, data source connections, AI configuration, notifications, security settings, and appearance preferences across 6 configuration tabs.

**Component**: `frontend/src/pages/SettingsPage.tsx`

---

## Test Scenarios

### SET-001: View and Edit Profile Settings
**Objective**: Verify user can view and update profile information

**Prerequisites**:
- User logged in with profile data
- User has permission to edit profile

**Test Steps**:
1. Navigate to SettingsPage at `/settings`
2. Verify "Profile" tab is default active tab
3. Verify tab navigation displayed:
   - Profile (active)
   - Data Sources
   - AI Settings
   - Notifications
   - Security
   - Appearance
4. **Profile Tab Content**:
   - Verify form fields displayed:
     - Full Name (text input, required, pre-filled)
     - Email (email input, required, pre-filled)
     - Role (text display, read-only) - e.g., "Administrator"
     - Organization (text input, optional, pre-filled)
     - Phone Number (tel input, optional, pre-filled)
     - Profile Picture (image upload, optional)
   - Verify current values loaded from user profile
5. Verify form validation indicators (asterisk for required fields)
6. Modify name: Change to "John Smith Updated"
7. Verify field-level validation (if any)
8. Modify organization: "Acme Corporation"
9. Modify phone: "+1 (555) 123-4567"
10. Verify "Save Changes" button enabled (disabled by default if no changes)
11. Verify "Cancel" or "Reset" button available
12. Click "Save Changes"
13. Verify API PUT to `/api/user/profile`
14. Verify loading state on save button: "Saving..."
15. Verify success toast notification: "Profile updated successfully"
16. Refresh page or navigate away and back
17. Verify updated name persists
18. **Profile Picture Upload**:
19. Click "Change Picture" or profile picture area
20. Select image file (JPG, PNG, <5MB)
21. Verify image preview updates immediately
22. Save changes
23. Verify profile picture updates in header/navbar

**Expected Results**:
- Profile data loads correctly on page load
- All fields editable except read-only ones (Role)
- Changes save successfully via API
- Success feedback provided
- Validation prevents invalid data (e.g., invalid email format)
- Changes persist across sessions
- Profile picture upload and display works

**Edge Cases**:
- Invalid email format: Validation error "Please enter a valid email address"
- Empty required field (name): Validation error "Name is required"
- Email already used by another user: API error "Email already in use"
- Very long name (>100 chars): Validation error "Name too long"
- Phone number invalid format: Validation error or format suggestion
- Profile picture too large (>5MB): Error "Image must be less than 5MB"
- Profile picture wrong format (.pdf): Error "Supported formats: JPG, PNG, GIF"
- API error on save: Error toast, form remains in edit state
- Network timeout: Timeout error after 30s, retry option
- Cancel after changes: Confirmation "Discard unsaved changes?"

**API Endpoint**: `PUT /api/user/profile`

**Request Payload**:
```json
{
  "fullName": "John Smith Updated",
  "email": "john.smith@example.com",
  "organization": "Acme Corporation",
  "phoneNumber": "+1 (555) 123-4567"
}
```

**Response**:
```json
{
  "id": "user-123",
  "fullName": "John Smith Updated",
  "email": "john.smith@example.com",
  "role": "administrator",
  "organization": "Acme Corporation",
  "phoneNumber": "+1 (555) 123-4567",
  "profilePictureUrl": "https://api.example.com/profile-pics/user-123.jpg",
  "updatedAt": "2026-01-30T17:15:23Z"
}
```

**Code Reference**: `frontend/src/pages/SettingsPage.tsx:89-234`

---

### SET-002: Manage Data Source Connections
**Objective**: Verify user can add, test, edit, and delete data source connections

**Prerequisites**:
- User has permission to manage data sources
- At least 1 existing data source (optional, for edit/delete tests)

**Test Steps**:
1. Navigate to SettingsPage
2. Click "Data Sources" tab
3. Verify data sources list displayed:
   - Table or card list of existing connections
   - Each entry shows:
     - Data source name
     - Type (PostgreSQL, MySQL, Oracle, CSV, API, etc.)
     - Host/URL
     - Status (Connected, Disconnected, Error)
     - Last tested date
     - Action buttons: Test, Edit, Delete
   - "Add Data Source" button (primary action)

4. **Add New Data Source**:
5. Click "Add Data Source" button
6. Verify add data source modal/form opens
7. Verify connection type selector:
   - PostgreSQL
   - MySQL
   - Oracle
   - SQL Server
   - CSV/FTP
   - REST API
   - Other
8. Select "PostgreSQL"
9. Verify form fields displayed:
   - Connection Name (text, required): "Production Database"
   - Host (text, required): "localhost"
   - Port (number, required): "5432"
   - Database Name (text, required): "reconciliation_db"
   - Username (text, required): "dbuser"
   - Password (password, required): "•••••••"
   - Use SSL (checkbox, optional): checked
   - Connection Timeout (number, optional): "30" seconds
10. Fill all fields with test connection details
11. Verify password field masked (dots or asterisks)
12. Verify "Show password" toggle button
13. Click "Show password" and verify password visible
14. Click "Test Connection" button
15. Verify API POST to `/api/datasources/test`
16. Verify loading state: "Testing connection..."
17. Wait for test result (2-5 seconds)
18. **If connection successful**:
    - Verify success message: "Connection successful" with checkmark icon
    - Verify "Save" button enabled
19. **If connection fails**:
    - Verify error message with details: "Connection failed: Authentication failed"
    - Verify "Save" button disabled until connection successful
    - Modify connection details and retest
20. Once connection successful, click "Save"
21. Verify API POST to `/api/datasources`
22. Verify success toast: "Data source added successfully"
23. Verify modal closes
24. Verify new data source appears in list with "Connected" status

25. **Test Existing Connection**:
26. Locate existing data source in list
27. Click "Test" button
28. Verify loading indicator
29. Verify test result displayed (success or failure)
30. If failure, verify error details shown

31. **Edit Data Source**:
32. Click "Edit" button on existing data source
33. Verify edit modal opens with pre-filled values
34. Modify password
35. Test connection with new password
36. Save changes
37. Verify API PUT to `/api/datasources/{id}`
38. Verify success toast: "Data source updated successfully"

39. **Delete Data Source**:
40. Click "Delete" button on data source not used in reconciliations
41. Verify confirmation dialog:
    - "Delete Data Source?"
    - Warning message
    - "Delete" and "Cancel" buttons
42. Confirm deletion
43. Verify API DELETE to `/api/datasources/{id}`
44. Verify data source removed from list

45. **Attempt to Delete Used Data Source**:
46. Click delete on data source used in reconciliations
47. Verify warning: "Cannot delete. Used in 3 reconciliations"
48. Verify no delete action possible

**Expected Results**:
- Connection form validates required fields
- Test connection verifies credentials before save
- Cannot save without successful test (optional, depends on requirements)
- Passwords masked in UI and encrypted in transit/storage
- Successful save adds to list
- Can edit and test existing connections
- Cannot delete connections in use
- Connection status displayed clearly

**Edge Cases**:
- Invalid hostname: Test fails with DNS error
- Incorrect port: Test fails with connection refused
- Wrong credentials: Test fails with authentication error
- Database not accessible (firewall): Test fails with timeout
- SSL required but not configured: Test fails with SSL error
- Duplicate connection name: Validation error or auto-increment
- Very long connection name (>100 chars): Validation error
- API error during save: Error message, modal stays open
- Network timeout during test: Timeout error after 30s

**API Endpoint**: `POST /api/datasources`

**Request Payload**:
```json
{
  "name": "Production Database",
  "type": "postgresql",
  "config": {
    "host": "localhost",
    "port": 5432,
    "database": "reconciliation_db",
    "username": "dbuser",
    "password": "encrypted_password_here",
    "ssl": true,
    "timeout": 30
  }
}
```

**Response**:
```json
{
  "id": "ds-001",
  "name": "Production Database",
  "type": "postgresql",
  "status": "connected",
  "lastTested": "2026-01-30T17:20:15Z",
  "createdAt": "2026-01-30T17:20:15Z"
}
```

**Code Reference**: `frontend/src/pages/SettingsPage.tsx:456-745`

---

### SET-003: Configure AI Settings
**Objective**: Verify user can select AI provider and configure API keys and features

**Prerequisites**:
- User has permission to configure AI settings
- At least one AI provider available (Anthropic Claude, OpenAI, DeepSeek)

**Test Steps**:
1. Click "AI Settings" tab
2. Verify AI configuration form displayed

3. **AI Provider Selection**:
   - Verify provider dropdown/radio buttons with options:
     - Anthropic Claude (sonnet-4-5)
     - OpenAI (GPT-4)
     - DeepSeek (deepseek-chat)
   - Verify currently selected provider highlighted
   - Select "Anthropic Claude"
   - Verify provider-specific configuration section appears

4. **Anthropic Claude Configuration**:
   - Verify API key input field:
     - Label: "Anthropic API Key"
     - Input type: password (masked)
     - "Show" toggle button
     - Help text: "Get your API key from https://console.anthropic.com"
   - Enter API key: "sk-ant-api03-..."
   - Verify "Test API Key" button
   - Click "Test API Key"
   - Verify API test call
   - Verify success message: "API key valid" with checkmark
   - Or error: "Invalid API key" with error details

5. **Model Selection** (if multiple models available):
   - Verify model dropdown: "Claude Sonnet 4.5", "Claude Opus 4", "Claude Haiku"
   - Select preferred model
   - Verify model description/info displayed

6. **AI Feature Toggles**:
   - Verify feature toggle switches:
     - "Enable AI Field Mapping Suggestions" (on/off)
     - "Enable AI Rule Suggestions" (on/off)
     - "Enable AI Exception Resolution" (on/off)
     - "Enable AI Chat Assistant" (on/off)
   - Verify all toggles currently enabled
   - Toggle "AI Field Mapping Suggestions" off
   - Verify toggle state changes immediately
   - Verify description under each toggle explaining feature

7. **Advanced AI Settings** (optional):
   - Verify collapsible "Advanced Settings" section
   - Expand advanced settings
   - Verify additional configuration:
     - Temperature slider: 0.0 to 1.0
     - Max tokens: number input
     - Confidence threshold: percentage slider
   - Adjust temperature to 0.7
   - Adjust confidence threshold to 85%

8. **Save Configuration**:
   - Click "Save Changes" button
   - Verify API PUT to `/api/settings/ai`
   - Verify loading state: "Saving..."
   - Verify success toast: "AI settings updated successfully"
   - Verify settings persist after page refresh

9. **Switch AI Provider**:
   - Select "OpenAI" from provider dropdown
   - Verify confirmation if API key already configured: "Switch provider? This will change which AI powers your reconciliation features."
   - Verify OpenAI-specific configuration appears:
     - "OpenAI API Key" input
     - Model selection: "GPT-4", "GPT-3.5-turbo"
   - Enter OpenAI API key
   - Test API key
   - Save changes

10. **DeepSeek Configuration**:
    - Select "DeepSeek" provider
    - Configure API key
    - Note: DeepSeek may have different feature support
    - Save configuration

**Expected Results**:
- Provider selection updates UI to show provider-specific config
- API key masked in input (show as dots/asterisks)
- Can test API key before saving
- Invalid API key prevented from saving or saved with warning
- Feature toggles control AI capabilities
- Advanced settings allow fine-tuning
- Settings persist across sessions
- Switching providers works smoothly

**Edge Cases**:
- Empty API key: Validation error "API key required" or features disabled
- Invalid API key format: Validation error
- API key test fails: Error message with troubleshooting tips
- All features disabled: Warning "Disabling all features will prevent AI assistance"
- Switch provider with unsaved changes: Confirmation "Save changes first?"
- API rate limit during test: Shows rate limit error
- Network timeout during key test: Timeout error
- Multiple API keys (development, production): Support for environment-specific keys (future feature)

**API Endpoint**: `PUT /api/settings/ai`

**Request Payload**:
```json
{
  "provider": "anthropic",
  "apiKey": "encrypted_api_key_here",
  "model": "claude-sonnet-4-5",
  "features": {
    "fieldMappingSuggestions": true,
    "ruleSuggestions": true,
    "exceptionResolution": true,
    "chatAssistant": true
  },
  "advancedSettings": {
    "temperature": 0.7,
    "maxTokens": 4096,
    "confidenceThreshold": 0.85
  }
}
```

**Code Reference**: `frontend/src/pages/SettingsPage.tsx:747-1023`

---

### SET-004: Configure Notification Preferences
**Objective**: Verify user can set notification preferences for various events

**Prerequisites**:
- User logged in

**Test Steps**:
1. Click "Notifications" tab
2. Verify notification configuration form displayed

3. **Email Notifications**:
   - Verify "Email Notifications" section
   - Verify master toggle: "Enable Email Notifications"
   - Verify email address display: "Notifications will be sent to: john.smith@example.com"
   - Verify "Change Email" link (redirects to profile or shows inline edit)
   - Verify individual notification toggles:
     - "Reconciliation Completed" (on/off)
     - "Reconciliation Failed" (on/off)
     - "Critical Exceptions Detected" (on/off)
     - "Exception Resolved" (on/off)
     - "Weekly Summary Report" (on/off)
     - "Monthly Activity Report" (on/off)
   - Toggle "Reconciliation Completed" on
   - Toggle "Critical Exceptions Detected" on
   - Toggle "Weekly Summary Report" on

4. **In-App Notifications**:
   - Verify "In-App Notifications" section
   - Verify master toggle: "Enable In-App Notifications"
   - Verify notification type toggles:
     - "Real-time Alerts" (on/off) - browser notifications
     - "Activity Feed" (on/off) - in-app notification center
   - Toggle options as desired

5. **Push Notifications** (if mobile app or PWA):
   - Verify "Push Notifications" section
   - Verify "Enable Push Notifications" button
   - Click to request browser permission
   - Verify browser permission prompt appears
   - Allow or deny permission

6. **Notification Frequency**:
   - Verify "Digest Frequency" setting
   - Verify options:
     - Instant (as they happen)
     - Hourly digest
     - Daily digest
     - Weekly digest
   - Select "Daily digest"
   - Verify time selector appears: "Send digest at: 9:00 AM"

7. **Notification Preferences by Channel**:
   - Verify "Channel Preferences" table showing which events trigger which notification types
   - Example table:
     ```
     Event                    | Email | In-App | Push
     -------------------------------------------------
     Reconciliation Completed | ✓     | ✓      | ✗
     Critical Exceptions      | ✓     | ✓      | ✓
     Weekly Summary           | ✓     | ✗      | ✗
     ```
   - Verify can toggle each combination independently

8. **Save Preferences**:
   - Click "Save Changes"
   - Verify API PUT to `/api/settings/notifications`
   - Verify success toast: "Notification preferences updated"

9. **Test Notification**:
   - Verify "Send Test Notification" button
   - Click button
   - Verify test notification sent via enabled channels
   - Check email inbox (if email enabled)
   - Check in-app notification (if enabled)
   - Verify test notification received

**Expected Results**:
- All notification types configurable independently
- Master toggles control entire category
- Email address editable from profile
- Digest frequency adjustable
- Preferences save successfully
- Test notification verifies delivery
- Preferences persist across sessions

**Edge Cases**:
- Disable all notifications: Warning "You won't receive any notifications"
- Email not verified: Warning "Verify email to receive notifications"
- Push notifications not supported: Section not shown or disabled
- Test notification fails: Error message with troubleshooting
- API error on save: Error toast, preferences not saved

**API Endpoint**: `PUT /api/settings/notifications`

**Request Payload**:
```json
{
  "email": {
    "enabled": true,
    "reconciliationCompleted": true,
    "reconciliationFailed": true,
    "criticalExceptions": true,
    "exceptionResolved": false,
    "weeklySummary": true,
    "monthlySummary": false
  },
  "inApp": {
    "enabled": true,
    "realTimeAlerts": true,
    "activityFeed": true
  },
  "push": {
    "enabled": false
  },
  "digestFrequency": "daily",
  "digestTime": "09:00"
}
```

**Code Reference**: `frontend/src/pages/SettingsPage.tsx:1025-1267`

---

### SET-005: Manage Security Settings
**Objective**: Verify user can manage password, 2FA, and view active sessions

**Prerequisites**:
- User logged in with password authentication

**Test Steps**:
1. Click "Security" tab
2. Verify security settings sections displayed

3. **Change Password**:
   - Verify "Change Password" section
   - Verify "Change Password" button or form
   - Click "Change Password"
   - Verify password change form/modal:
     - Current Password (password input, required)
     - New Password (password input, required)
     - Confirm New Password (password input, required)
   - Verify password requirements displayed:
     - "Minimum 8 characters"
     - "At least one uppercase letter"
     - "At least one number"
     - "At least one special character"
   - Enter current password: "OldPassword123!"
   - Enter new password: "NewPassword456!"
   - Verify password strength indicator:
     - Weak (red)
     - Medium (yellow)
     - Strong (green)
   - Verify strength indicator shows "Strong" for complex password
   - Enter confirm password: "NewPassword456!"
   - Verify passwords match validation (checkmark if match, error if mismatch)
   - Click "Change Password"
   - Verify API PUT to `/api/user/change-password`
   - Verify success toast: "Password changed successfully"
   - Verify automatically logged out or session continues (depends on security policy)

4. **Two-Factor Authentication (2FA)**:
   - Verify "Two-Factor Authentication" section
   - Verify current status: "Disabled" or "Enabled"
   - Click "Enable 2FA" button
   - Verify 2FA setup wizard opens:
     - Step 1: Choose method (Authenticator App, SMS)
     - Step 2: Scan QR code or enter setup key
     - Step 3: Verify with code
   - Select "Authenticator App"
   - Verify QR code displayed
   - Verify manual setup key displayed as fallback
   - Open authenticator app (Google Authenticator, Authy) and scan QR
   - Enter 6-digit code from authenticator app
   - Click "Verify"
   - Verify API POST to `/api/user/2fa/enable`
   - Verify success message: "2FA enabled successfully"
   - Verify backup codes displayed:
     - List of 10 single-use backup codes
     - "Download Codes" button
     - "Print Codes" button
     - Warning: "Save these codes in a safe place"
   - Download or print backup codes
   - Click "Done"
   - Verify 2FA status now shows "Enabled"
   - Verify "Disable 2FA" button now available

5. **Disable 2FA**:
   - Click "Disable 2FA"
   - Verify confirmation with re-authentication
   - Enter current password or 2FA code
   - Confirm disable
   - Verify 2FA disabled

6. **Active Sessions**:
   - Verify "Active Sessions" section
   - Verify list of current sessions:
     - Each session shows:
       - Device: "Chrome on Windows"
       - Location: "New York, USA" (approximate based on IP)
       - IP Address: "192.168.1.100"
       - Last Active: "2 minutes ago"
       - Current Session badge (for current session)
       - "Revoke" button (for other sessions)
   - Verify current session clearly marked: "This device"
   - Click "Revoke" on another session
   - Verify confirmation: "Revoke session on [device]?"
   - Confirm revoke
   - Verify API DELETE to `/api/user/sessions/{sessionId}`
   - Verify session removed from list
   - Verify "Revoke All Other Sessions" button
   - Click "Revoke All"
   - Verify confirmation
   - Confirm
   - Verify all other sessions revoked

7. **Security Log** (optional):
   - Verify "Security Log" section shows recent security events:
     - Password changed: date/time
     - 2FA enabled: date/time
     - Login from new device: device, location, date/time
     - Failed login attempts: count, date/time
   - Verify can view full log or download

**Expected Results**:
- Can change password with proper validation
- Password strength indicator helps create strong passwords
- Cannot use weak passwords
- 2FA setup guides through process
- Backup codes provided and downloadable
- Active sessions listed with details
- Can revoke individual or all sessions
- Security log provides audit trail

**Edge Cases**:
- Wrong current password: Error "Current password incorrect"
- New password same as old: Error "New password must be different"
- New password too weak: Validation prevents submission
- Passwords don't match: Error "Passwords must match"
- 2FA code incorrect: Error "Invalid code, try again"
- 2FA code expired: Error "Code expired, generate new code"
- No backup codes saved: Warning when leaving setup
- Revoke current session: Not allowed or logs out immediately
- API error during password change: Error message
- 2FA already enabled by another session: Shows conflict error

**API Endpoint**: `PUT /api/user/change-password`

**Request Payload**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Code Reference**: `frontend/src/pages/SettingsPage.tsx:1269-1578`

---

### SET-006: Customize Appearance Settings
**Objective**: Verify user can customize UI theme, language, and date/time formats

**Prerequisites**:
- User logged in

**Test Steps**:
1. Click "Appearance" tab
2. Verify appearance customization options displayed

3. **Theme Selection**:
   - Verify "Theme" section
   - Verify theme options with visual previews:
     - Light theme (preview image)
     - Dark theme (preview image)
     - System default (uses OS setting)
   - Verify current theme selected/highlighted
   - Select "Dark" theme
   - Verify UI immediately switches to dark mode:
     - Background colors darken
     - Text colors invert for readability
     - All components adapt to dark theme
   - Verify smooth transition animation (optional)
   - Select "Light" theme
   - Verify UI switches back to light mode
   - Select "System Default"
   - Verify UI matches operating system theme preference

4. **Language Selection** (if multi-language supported):
   - Verify "Language" dropdown
   - Verify available languages:
     - English (default)
     - Spanish
     - French
     - German
     - Chinese
     - Other supported languages
   - Select "Spanish"
   - Verify UI text translates to Spanish
   - Verify all labels, buttons, messages translated
   - Switch back to "English"

5. **Date Format Preference**:
   - Verify "Date Format" section
   - Verify format options with examples:
     - MM/DD/YYYY (US format) - Example: "01/30/2026"
     - DD/MM/YYYY (EU format) - Example: "30/01/2026"
     - YYYY-MM-DD (ISO format) - Example: "2026-01-30"
   - Select "DD/MM/YYYY"
   - Verify date format example updates
   - Navigate to Dashboard or Reconciliations page
   - Verify dates display in selected format throughout app
   - Return to settings

6. **Time Format Preference**:
   - Verify "Time Format" options:
     - 12-hour (e.g., "3:45 PM")
     - 24-hour (e.g., "15:45")
   - Select "24-hour"
   - Verify time format example updates
   - Verify times throughout app display in 24-hour format

7. **Number Format** (optional):
   - Verify "Number Format" options:
     - 1,234.56 (US format)
     - 1.234,56 (EU format)
     - 1 234,56 (French format)
   - Select preferred format
   - Verify currency and numbers display accordingly

8. **Density/Spacing** (optional):
   - Verify "Display Density" options:
     - Compact - more content, less whitespace
     - Comfortable (default)
     - Spacious - more whitespace, larger targets
   - Select "Compact"
   - Verify UI spacing reduces, tables show more rows
   - Select "Spacious"
   - Verify UI spacing increases, larger touch targets

9. **Font Size** (accessibility):
   - Verify "Font Size" slider or dropdown:
     - Small
     - Medium (default)
     - Large
     - Extra Large
   - Select "Large"
   - Verify text size increases throughout app
   - Verify readability maintained

10. **Save Appearance Settings**:
    - Click "Save Changes" (or settings auto-save)
    - Verify API PUT to `/api/settings/appearance`
    - Verify success toast: "Appearance settings updated"
    - Refresh page or logout and login
    - Verify settings persist

**Expected Results**:
- Theme changes apply immediately across entire app
- System theme respects OS preference
- Language translation complete (if supported)
- Date/time formats apply throughout app
- Number formats localized correctly
- Display density affects spacing
- Font size improves accessibility
- Settings persist across sessions and devices
- Settings sync to user account (not just local storage)

**Edge Cases**:
- Browser doesn't support system theme detection: Defaults to light
- Language not fully translated: Shows English fallback for missing translations
- Font size extra large with compact density: May cause layout issues, validate compatibility
- Theme switch during video/animation: Smooth transition or pause/resume
- Settings not saved (API error): Error toast, revert to previous settings

**API Endpoint**: `PUT /api/settings/appearance`

**Request Payload**:
```json
{
  "theme": "dark",
  "language": "en",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h",
  "numberFormat": "1,234.56",
  "density": "comfortable",
  "fontSize": "medium"
}
```

**Code Reference**: `frontend/src/pages/SettingsPage.tsx:1580-1823`

---

### SET-007: Settings Navigation and Persistence
**Objective**: Verify settings tabs navigate correctly and settings persist

**Prerequisites**:
- User logged in

**Test Steps**:
1. Navigate to `/settings`
2. Verify URL: `/settings` (default tab) or `/settings/profile`
3. Click "Data Sources" tab
4. Verify URL updates: `/settings/data-sources`
5. Click browser back button
6. Verify returns to Profile tab
7. Click browser forward button
8. Verify returns to Data Sources tab
9. **Deep Link Test**:
   - Navigate directly to `/settings/ai-settings`
   - Verify AI Settings tab active
10. **Settings Persistence Test**:
11. Make changes in multiple tabs without saving
12. Navigate away from settings page
13. Return to settings page
14. Verify unsaved changes lost (or confirmation shown)
15. Make changes and save in each tab
16. Logout and login
17. Verify all saved settings persist

**Expected Results**:
- Tab navigation updates URL
- Browser back/forward works correctly
- Direct URL navigation to specific tab works
- Unsaved changes warning (optional)
- Saved settings persist across sessions

**Code Reference**: `frontend/src/pages/SettingsPage.tsx:45-87`

---

### SET-008: Settings Search (if implemented)
**Objective**: Verify user can search across all settings

**Prerequisites**:
- Settings page loaded

**Test Steps**:
1. Verify search box in settings page header
2. Type "password" in search
3. Verify search highlights or filters:
   - Security tab highlighted
   - "Change Password" section highlighted
   - Other irrelevant sections dimmed or hidden
4. Clear search
5. Type "notification"
6. Verify Notifications tab and relevant sections highlighted
7. Click highlighted result
8. Verify navigates to that setting

**Expected Results**:
- Search finds relevant settings
- Visual highlighting guides user
- Click on result navigates to setting

**Note**: This may be a future feature

**Code Reference**: `frontend/src/pages/SettingsPage.tsx:1825-1923` (if implemented)

---

## Integration Points

### API Endpoints
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/datasources` - List data sources
- `POST /api/datasources` - Add data source
- `POST /api/datasources/test` - Test connection
- `PUT /api/datasources/{id}` - Update data source
- `DELETE /api/datasources/{id}` - Delete data source
- `GET /api/settings/ai` - Get AI settings
- `PUT /api/settings/ai` - Update AI settings
- `POST /api/settings/ai/test-key` - Test API key
- `GET /api/settings/notifications` - Get notification preferences
- `PUT /api/settings/notifications` - Update notification preferences
- `PUT /api/user/change-password` - Change password
- `POST /api/user/2fa/enable` - Enable 2FA
- `POST /api/user/2fa/disable` - Disable 2FA
- `GET /api/user/sessions` - List active sessions
- `DELETE /api/user/sessions/{id}` - Revoke session
- `GET /api/settings/appearance` - Get appearance settings
- `PUT /api/settings/appearance` - Update appearance settings

### State Management
- Zustand store:
  - `userProfile: UserProfile`
  - `dataSources: DataSource[]`
  - `aiSettings: AISettings`
  - `notificationSettings: NotificationSettings`
  - `appearanceSettings: AppearanceSettings`
- React Query cache keys:
  - `['user', 'profile']`
  - `['datasources']`
  - `['settings', 'ai']`
  - `['settings', 'notifications']`
  - `['settings', 'appearance']`
  - `['user', 'sessions']`

### Navigation
- `/settings` or `/settings/profile` - Profile tab
- `/settings/data-sources` - Data sources tab
- `/settings/ai-settings` - AI settings tab
- `/settings/notifications` - Notifications tab
- `/settings/security` - Security tab
- `/settings/appearance` - Appearance tab

### Components Used
- `SettingsTabNavigation` - Tab navigation
- `ProfileForm` - Profile edit form
- `DataSourceManager` - Data source configuration
- `AIConfigForm` - AI provider configuration
- `NotificationPreferences` - Notification toggles
- `PasswordChangeForm` - Password change
- `TwoFactorSetup` - 2FA configuration
- `ActiveSessionsList` - Session management
- `ThemeSelector` - Theme selection
- `ConfirmDialog` - Confirmation prompts

---

## Test Data Requirements

### Sample User Profile
```json
{
  "id": "user-123",
  "fullName": "John Smith",
  "email": "john.smith@example.com",
  "role": "administrator",
  "organization": "Acme Corporation",
  "phoneNumber": "+1 (555) 123-4567",
  "profilePictureUrl": "https://api.example.com/profile-pics/user-123.jpg",
  "createdAt": "2025-12-01T10:00:00Z",
  "updatedAt": "2026-01-30T17:15:23Z"
}
```

### Sample Data Source
```json
{
  "id": "ds-001",
  "name": "Production Database",
  "type": "postgresql",
  "host": "prod-db.example.com",
  "status": "connected",
  "lastTested": "2026-01-30T16:45:00Z",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

---

## Performance Benchmarks

- Settings page load: <1 second
- Profile update: <500ms
- Theme switch: <200ms (immediate visual update)
- Data source test: 2-5 seconds
- AI API key test: 1-3 seconds
- Password change: <1 second
- 2FA setup: QR generation <500ms

---

## Accessibility Requirements

- Keyboard navigation through all tabs
- Focus management within forms
- ARIA labels for all inputs and toggles
- Screen reader announces tab changes
- Color contrast for all themes (including dark mode)
- Form validation errors announced
- Password visibility toggle keyboard accessible

---

## Notes

- Settings centralize all user and app configuration
- Changes should save individually per section (not require saving entire settings page)
- Consider autosave for appearance settings (immediate apply)
- Profile changes may require re-authentication for security
- Data source connections may be organization-level (shared) or user-level (personal)
- AI settings may be restricted to admin users only
- 2FA enforcement may be organization policy
- Settings should sync across devices if user logs in from multiple locations
