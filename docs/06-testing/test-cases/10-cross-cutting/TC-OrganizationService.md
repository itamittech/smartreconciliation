# TC-OrganizationService - Unit Tests

**Module**: Cross-Cutting Concerns
**Component**: OrganizationService
**Test Level**: Unit Test
**Total Test Cases**: 3

---

### TC-ORG-001: Auto-Create Default Organization

**Given** no organizations exist in the database
**When** the application starts
**Then** a default organization is created
**And** getDefaultOrganization() returns it

---

### TC-ORG-002: Use Default Organization for New Entities

**Given** a default organization exists
**When** a new file or reconciliation is created
**Then** organizationId is set to the default organization

---

### TC-ORG-003: Handle Missing Default Organization

**Given** no organization exists and auto-create fails
**When** getDefaultOrganization() is called
**Then** a ResourceNotFoundException is thrown

