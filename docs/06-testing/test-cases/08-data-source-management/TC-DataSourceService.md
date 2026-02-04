# TC-DataSourceService - Unit Tests

**Module**: Data Source Management
**Component**: DataSourceService
**Test Level**: Unit Test
**Total Test Cases**: 12

---

## CRUD Tests

### TC-DSS-001: Create File Data Source

**Given** a request with name "January Bank CSV", type FILE, and fileConfig {path:"/uploads/jan.csv"}
**When** createDataSource() is called
**Then** a DataSource entity is created with type FILE
**And** organizationId is assigned
**And** createdAt is set

---

### TC-DSS-002: Create Database Data Source

**Given** a request with type DATABASE and jdbcConfig {host, port, dbName, username, password}
**When** createDataSource() is called
**Then** credentials are stored securely
**And** DataSource type is DATABASE
**And** connectionTestStatus is PENDING

---

### TC-DSS-003: Create API Data Source

**Given** a request with type API and apiConfig {baseUrl, authType, headers}
**When** createDataSource() is called
**Then** DataSource is created with type API
**And** headers are persisted

---

### TC-DSS-004: Update Data Source

**Given** an existing data source with name "Old Name"
**When** updateDataSource() is called with name "New Name"
**Then** name is updated
**And** updatedAt is set

---

### TC-DSS-005: Delete Data Source

**Given** an existing data source
**When** deleteDataSource() is called
**Then** the data source is removed
**And** subsequent getDataSource() throws ResourceNotFoundException

---

## Listing and Filtering Tests

### TC-DSS-006: List Data Sources by Organization

**Given** an organization with 3 data sources
**When** listDataSources() is called
**Then** exactly 3 records are returned
**And** all belong to the organization

---

### TC-DSS-007: Filter Data Sources by Type

**Given** 2 FILE sources and 1 DATABASE source
**When** listDataSources(type=DATABASE) is called
**Then** only DATABASE sources are returned

---

## Connection Test Cases

### TC-DSS-008: Test Connection for FILE Source

**Given** a FILE source pointing to an existing file path
**When** testConnection() is called
**Then** connectionTestStatus is SUCCESS
**And** lastTestedAt is updated

---

### TC-DSS-009: Test Connection for DATABASE Source (Success)

**Given** a DATABASE source with valid JDBC configuration
**When** testConnection() is called
**Then** a connection is opened and closed successfully
**And** connectionTestStatus is SUCCESS

---

### TC-DSS-010: Test Connection for DATABASE Source (Failure)

**Given** a DATABASE source with invalid credentials
**When** testConnection() is called
**Then** connectionTestStatus is FAILED
**And** errorDetails includes authentication failure

---

### TC-DSS-011: Test Connection for API Source (Success)

**Given** an API source with reachable baseUrl and valid auth headers
**When** testConnection() is called
**Then** an HTTP 200 response is received
**And** connectionTestStatus is SUCCESS

---

### TC-DSS-012: Test Connection for API Source (Failure)

**Given** an API source with invalid auth token
**When** testConnection() is called
**Then** connectionTestStatus is FAILED
**And** errorDetails include 401/403 status

---

## Test Data Requirements

### Mock Configurations
- FILE config: valid and missing file paths
- DATABASE config: valid credentials + invalid credentials
- API config: valid token + invalid token

### Mock Objects
- DataSourceRepository
- JdbcConnectionProvider
- WebClient or RestTemplate
