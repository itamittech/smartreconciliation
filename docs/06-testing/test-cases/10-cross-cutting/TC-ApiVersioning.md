# TC-ApiVersioning - Integration Tests

**Module**: Cross-Cutting Concerns
**Component**: API Versioning
**Test Level**: Integration Test
**Total Test Cases**: 2

---

### TC-AV-001: All Controllers Use /api/v1 Prefix

**Given** the API is running
**When** known endpoints are requested without `/api/v1`
**Then** HTTP 404 is returned
**And** endpoints respond correctly under `/api/v1`

---

### TC-AV-002: API Version Constant is Consistent

**Given** controller mappings are scanned
**When** the base path is evaluated
**Then** all controllers use `/api/v1` prefix

