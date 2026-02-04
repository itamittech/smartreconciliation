# TC-HealthController - Integration Tests

**Module**: Cross-Cutting Concerns
**Component**: HealthController
**Test Level**: Integration Test
**Total Test Cases**: 2

---

### TC-HC-001: GET /api/v1/health - Basic Health Check

**Given** the service is running
**When** GET /api/v1/health is called
**Then** HTTP 200 is returned
**And** response includes status=UP and timestamp

---

### TC-HC-002: Health Response Includes Version

**Given** application version is configured
**When** GET /api/v1/health is called
**Then** response includes service version

