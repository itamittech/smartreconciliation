# TC-FutureImprovements - TDD Test Cases

**Module**: Future Improvements
**Component**: Multiple (see sections)
**Test Level**: Unit / Integration / E2E
**Total Test Cases**: 55

---

## Authentication & Authorization (JWT + RBAC)

### TC-AUTH-001: Login Returns JWT for Valid Credentials
**Given** a valid user with role ADMIN
**When** POST /auth/login is called
**Then** HTTP 200 returns accessToken and refreshToken

### TC-AUTH-002: Login Fails for Invalid Credentials
**Given** invalid password
**When** POST /auth/login is called
**Then** HTTP 401 is returned

### TC-AUTH-003: JWT Expiry Rejects Requests
**Given** an expired access token
**When** a protected endpoint is called
**Then** HTTP 401 is returned

### TC-AUTH-004: Role-Based Access Control
**Given** a VIEWER role token
**When** POST /api/v1/rules is called
**Then** HTTP 403 is returned

### TC-AUTH-005: Organization Scoping Enforced
**Given** a user from org A
**When** accessing a resource from org B
**Then** HTTP 404/403 is returned

### TC-AUTH-006: User Role Assignment
**Given** an ADMIN creates a user
**When** role is set to OPERATOR
**Then** new user permissions reflect OPERATOR

### TC-AUTH-007: Passwords Are Hashed
**Given** a new user is created
**When** user record is stored
**Then** password is hashed (not plaintext)

### TC-AUTH-008: Logout Revokes Tokens
**Given** a valid refresh token
**When** POST /auth/logout is called
**Then** the refresh token is revoked

---

## Client-Side Routing & Deep Linking

### TC-ROUT-001: Route Navigation Works
**Given** the user navigates to `/reconciliations`
**When** the route loads
**Then** Reconciliations page renders

### TC-ROUT-002: Deep Link to Reconciliation Detail
**Given** a reconciliation id
**When** `/reconciliations/{id}` is loaded
**Then** detail view renders for that id

### TC-ROUT-003: Browser Back/Forward
**Given** multiple route navigations
**When** back is clicked
**Then** the previous page is restored

### TC-ROUT-004: Unknown Route Shows 404
**Given** `/unknown` path
**When** the route loads
**Then** a Not Found page renders

### TC-ROUT-005: Query Params Preserve Filters
**Given** filter params in URL
**When** page reloads
**Then** filters are restored from the URL

### TC-ROUT-006: Auth Guard Redirects to Login
**Given** unauthenticated user
**When** accessing a protected route
**Then** user is redirected to `/login`

---

## JSON File Parser (FileParserService)

### TC-JP-001: Parse JSON Array of Objects
**Given** a JSON array file with flat objects
**When** parseJSON() is called
**Then** rows are parsed into key-value maps

### TC-JP-002: Parse Nested JSON Structures
**Given** a JSON file with nested objects
**When** parseJSON() is called
**Then** fields are flattened using dot notation

### TC-JP-003: Handle Invalid JSON
**Given** invalid JSON syntax
**When** parseJSON() is called
**Then** FileProcessingException is thrown

### TC-JP-004: Large JSON File Performance
**Given** a JSON file with 10,000 objects
**When** parseJSON() is called
**Then** parsing completes within 10 seconds

---

## Database and API Connectors

### TC-CON-001: JDBC Connector - PostgreSQL Success
**Given** valid PostgreSQL credentials
**When** testConnection() is called
**Then** connection succeeds and is closed cleanly

### TC-CON-002: JDBC Connector - MySQL Success
**Given** valid MySQL credentials
**When** testConnection() is called
**Then** connection succeeds

### TC-CON-003: JDBC Connector - Failure Handling
**Given** invalid credentials
**When** testConnection() is called
**Then** error details are recorded

### TC-CON-004: API Connector - Authenticated Request
**Given** a REST API with bearer token auth
**When** testConnection() is called
**Then** HTTP 200 is returned

### TC-CON-005: API Connector - Retry on Transient Error
**Given** a 502 response
**When** testConnection() retries
**Then** request is retried with backoff

### TC-CON-006: Live Ingestion Mapping
**Given** a data source and mapping
**When** ingestion runs
**Then** data is normalized to internal schema

---

## Scheduled and Recurring Reconciliations

### TC-SCH-001: Create Daily Schedule
**Given** a schedule request for daily 02:00
**When** schedule is saved
**Then** nextRunAt is calculated correctly

### TC-SCH-002: Schedule Triggers Reconciliation
**Given** a due schedule
**When** scheduler executes
**Then** a reconciliation run is created

### TC-SCH-003: Webhook Triggered Reconciliation
**Given** a webhook endpoint
**When** a valid webhook payload is received
**Then** reconciliation is started

### TC-SCH-004: Completion Notification Sent
**Given** a completed scheduled run
**When** processing completes
**Then** notification email is sent

---

## Reconciliation Result Export

### TC-EXP-001: Export CSV Includes Matches and Exceptions
**Given** a completed reconciliation
**When** export CSV is requested
**Then** CSV includes matched and unmatched rows

### TC-EXP-002: Export Excel with Summary Sheet
**Given** a completed reconciliation
**When** export Excel is requested
**Then** workbook includes Summary and Exceptions sheets

### TC-EXP-003: Export PDF with Charts
**Given** a completed reconciliation
**When** export PDF is requested
**Then** report contains KPI summary and charts

### TC-EXP-004: Export Authorization
**Given** a user without access
**When** export is requested
**Then** HTTP 403 is returned

---

## Settings Backend Integration

### TC-SET-001: Save User Profile
**Given** profile fields are updated
**When** PUT /settings/profile is called
**Then** values persist and reload

### TC-SET-002: Persist AI Provider Configuration
**Given** provider selection is changed
**When** settings are saved
**Then** configuration persists and is applied on restart

### TC-SET-003: Notification Preferences Stored
**Given** notifications are toggled
**When** settings are saved
**Then** preferences persist across sessions

### TC-SET-004: Theme Preference Stored
**Given** theme is set to "dark"
**When** settings are saved
**Then** theme persists on refresh

---

## PGvector RAG

### TC-RAG-001: Generate Embeddings for Reconciliation Results
**Given** a completed reconciliation
**When** embedding job runs
**Then** vectors are stored in PGvector

### TC-RAG-002: Query Returns Relevant Results
**Given** a query about an exception pattern
**When** RAG search runs
**Then** top results include related reconciliations

### TC-RAG-003: Organization Scoped Retrieval
**Given** org A and org B data
**When** org A searches
**Then** only org A vectors are returned

### TC-RAG-004: Fallback When No Vectors
**Given** an empty vector store
**When** RAG search runs
**Then** response falls back to generic AI answer

---

## Audit Trail and Activity Logging

### TC-AUD-001: Audit Log on Reconciliation Create
**Given** a reconciliation is created
**When** the operation completes
**Then** an audit entry is stored

### TC-AUD-002: Audit Log on Exception Resolution
**Given** an exception is resolved
**When** status changes
**Then** before/after values are recorded

### TC-AUD-003: Audit Log on Rule Set Update
**Given** a rule set is updated
**When** update completes
**Then** an audit entry includes changed fields

### TC-AUD-004: Audit Log Is Immutable
**Given** an audit record exists
**When** an update is attempted
**Then** update is rejected

---

## Transformation Pipeline

### TC-TR-001: Currency Conversion Transform
**Given** source amounts in EUR and target in USD
**When** transform is configured
**Then** amounts are converted before matching

### TC-TR-002: Date Normalization Transform
**Given** source date "01/31/2026"
**When** normalization is applied
**Then** date becomes "2026-01-31"

### TC-TR-003: String Standardization Transform
**Given** source value "  acme corp "
**When** standardization runs
**Then** value becomes "ACME CORP"

### TC-TR-004: Custom Expression Transform
**Given** a custom transform expression
**When** execution runs
**Then** output matches expected derived value

---

## Performance Optimization for Large Files

### TC-LF-001: Streaming Parser Uses Constant Memory
**Given** a 1M-row file
**When** parsing runs
**Then** memory usage remains within limits

### TC-LF-002: Batch Insert Exceptions
**Given** 50,000 exceptions
**When** persistence runs
**Then** batch inserts are used

### TC-LF-003: Parallel Matching with Virtual Threads
**Given** large dataset
**When** matching runs
**Then** processing uses virtual threads and completes faster

### TC-LF-004: File Size Limit Enforcement
**Given** a file exceeds configured limit
**When** upload is attempted
**Then** the request is rejected with clear message

---

## SSE Streaming in Chat UI

### TC-SSE-001: Streamed Messages Render Incrementally
**Given** an SSE response stream
**When** tokens are received
**Then** the chat UI renders progressively

### TC-SSE-002: Stream Reconnect on Network Interruption
**Given** an active stream
**When** the network drops and reconnects
**Then** the stream resumes without duplicating tokens

### TC-SSE-003: Cancel Stream on New User Message
**Given** an in-progress stream
**When** the user sends a new message
**Then** the prior stream is cancelled

