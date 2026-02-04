# TC-WebConfig - Integration Tests

**Module**: Cross-Cutting Concerns
**Component**: WebConfig (CORS)
**Test Level**: Integration Test
**Total Test Cases**: 3

---

### TC-CORS-001: Allow Default Origins

**Given** allowed origins include `http://localhost:5173`
**When** a CORS preflight request is sent
**Then** Access-Control-Allow-Origin includes the origin
**And** allowed methods include GET, POST, PUT, DELETE, PATCH, OPTIONS

---

### TC-CORS-002: Reject Disallowed Origin

**Given** an origin not in the allow-list
**When** a CORS preflight is sent
**Then** Access-Control-Allow-Origin is not present

---

### TC-CORS-003: Allow Credentials When Enabled

**Given** allowCredentials is enabled
**When** a CORS request is sent from an allowed origin
**Then** Access-Control-Allow-Credentials is true

