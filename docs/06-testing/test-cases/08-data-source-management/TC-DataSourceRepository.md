# TC-DataSourceRepository - Repository Tests

**Module**: Data Source Management
**Component**: DataSourceRepository
**Test Level**: Repository Test
**Total Test Cases**: 2

---

### TC-DSR-001: Find Data Sources by Organization

**Given** organization "org-123" has 3 data sources
**And** organization "org-456" has 1 data source
**When** findByOrganizationId("org-123") is called
**Then** 3 results are returned
**And** no results from other organizations are included

---

### TC-DSR-002: Find Data Sources by Organization and Type

**Given** organization "org-123" has 2 FILE and 1 DATABASE sources
**When** findByOrganizationIdAndType("org-123", DATABASE) is called
**Then** exactly 1 result is returned

