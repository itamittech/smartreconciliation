# TC-DataSourceController - Integration Tests

**Module**: Data Source Management
**Component**: DataSourceController
**Test Level**: Integration Test
**Total Test Cases**: 8

---

### TC-DSC-001: POST /api/v1/datasources - Create FILE Source

**Given** a valid FILE data source payload
**When** POST /api/v1/datasources is called
**Then** HTTP 201 is returned
**And** response includes dataSourceId and type FILE

---

### TC-DSC-002: POST /api/v1/datasources - Validation Error

**Given** a payload missing required fields (name, type)
**When** POST /api/v1/datasources is called
**Then** HTTP 400 is returned
**And** validation errors are listed

---

### TC-DSC-003: GET /api/v1/datasources - List All

**Given** an organization with 3 data sources
**When** GET /api/v1/datasources is called
**Then** HTTP 200 is returned with 3 items

---

### TC-DSC-004: GET /api/v1/datasources?type=DATABASE - Filter by Type

**Given** 1 DATABASE and 2 FILE sources
**When** GET /api/v1/datasources?type=DATABASE is called
**Then** only DATABASE sources are returned

---

### TC-DSC-005: GET /api/v1/datasources/{id} - Retrieve Details

**Given** an existing data source with ID "ds-123"
**When** GET /api/v1/datasources/ds-123 is called
**Then** HTTP 200 is returned with full configuration (masked secrets)

---

### TC-DSC-006: PUT /api/v1/datasources/{id} - Update Source

**Given** an existing data source
**When** PUT /api/v1/datasources/{id} is called with updated name
**Then** HTTP 200 is returned
**And** response reflects updated values

---

### TC-DSC-007: DELETE /api/v1/datasources/{id} - Delete Source

**Given** an existing data source
**When** DELETE /api/v1/datasources/{id} is called
**Then** HTTP 204 is returned
**And** subsequent GET returns 404

---

### TC-DSC-008: POST /api/v1/datasources/{id}/test - Test Connection

**Given** an existing data source
**When** POST /api/v1/datasources/{id}/test is called
**Then** HTTP 200 is returned
**And** response includes success flag and lastTestedAt

