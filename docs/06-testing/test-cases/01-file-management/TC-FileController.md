# TC-FileController - Integration Tests

**Module**: File Management
**Component**: FileController
**Test Level**: Integration Test
**Total Test Cases**: 14

---

## Upload Endpoint Tests

### TC-FC-001: POST /api/v1/files/upload - Upload Multiple Files

**Given** two valid files (CSV and XLSX)
**When** POST /api/v1/files/upload is called with both files
**Then** HTTP 201 is returned
**And** response contains two file IDs
**And** each file is stored with UPLOADED status

---

### TC-FC-002: POST /api/v1/files/upload/single - Upload Single CSV File

**Given** a valid CSV multipart file in the request
**And** request header "X-Organization-Id: org-123"
**When** POST request is sent to /api/files/upload
**Then** HTTP status 200 OK is returned
**And** response body contains file ID
**And** file is saved to database with status UPLOADED

---

### TC-FC-003: POST /api/v1/files/upload/single - Upload Excel File

**Given** a valid XLSX multipart file in the request
**And** request header "X-Organization-Id: org-456"
**When** POST request is sent to /api/files/upload
**Then** HTTP status 200 OK is returned
**And** response contains file ID and filename
**And** file entity is created with correct organization

---

### TC-FC-004: POST /api/v1/files/upload - Reject Invalid File Type

**Given** a PDF file in the multipart request
**And** request header "X-Organization-Id: org-123"
**When** POST request is sent to /api/files/upload
**Then** HTTP status 400 Bad Request is returned
**And** error message is "Unsupported file type: pdf"
**And** no file is saved to database

---

## File Details Endpoint Tests

### TC-FC-005: GET /api/v1/files/{id} - Retrieve File Details

**Given** a file with ID "file-123" exists in database
**And** file has status COMPLETED with 500 rows and 4 columns
**When** GET request is sent to /api/files/file-123
**Then** HTTP status 200 OK is returned
**And** response body contains: id, filename, status, rowCount, columnCount, uploadDate
**And** status is "COMPLETED"
**And** rowCount is 500

---

### TC-FC-006: GET /api/v1/files/{id} - File Not Found

**Given** no file with ID "file-999" exists
**When** GET request is sent to /api/files/file-999
**Then** HTTP status 404 Not Found is returned
**And** error message is "File not found"

---

## Preview and Schema Endpoint Tests

### TC-FC-007: GET /api/v1/files/{id}/preview - Get File Preview

**Given** a file with ID "file-456" has 10,000 rows
**And** file status is COMPLETED
**When** GET request is sent to /api/files/file-456/preview
**Then** HTTP status 200 OK is returned
**And** response contains exactly 100 rows
**And** each row contains all column data

---

### TC-FC-008: GET /api/v1/files/{id}/schema - Get Detected Schema

**Given** a file with ID "file-789" has detected schema
**And** schema includes 4 columns: id (INTEGER), name (TEXT), amount (CURRENCY), date (DATE)
**When** GET request is sent to /api/files/file-789/schema
**Then** HTTP status 200 OK is returned
**And** response contains schema JSON array with 4 elements
**And** each element has: name, type, uniqueCount, sampleValues

---

## List and Delete Endpoint Tests

### TC-FC-009: GET /api/v1/files - List All Files for Organization

**Given** organization "org-123" has 3 uploaded files
**And** request header "X-Organization-Id: org-123"
**When** GET request is sent to /api/files
**Then** HTTP status 200 OK is returned
**And** response contains array of 3 file objects
**And** all files belong to organization "org-123"
**And** files are ordered by uploadDate descending

---

### TC-FC-010: DELETE /api/v1/files/{id} - Delete File

---

### TC-FC-011: POST /api/v1/files/upload - Reject Oversized File

**Given** a file larger than 100MB
**When** POST /api/v1/files/upload is called
**Then** HTTP 413 is returned
**And** error message indicates max upload size

---

### TC-FC-012: GET /api/v1/files/{id}/preview - Custom Row Count

**Given** a processed file with 500 rows
**When** GET /api/v1/files/{id}/preview?rows=200 is called
**Then** 200 rows are returned

---

### TC-FC-013: GET /api/v1/files/{id}/schema - Includes Analytics

**Given** a processed file with schema analytics
**When** GET /api/v1/files/{id}/schema is called
**Then** each column includes nullCount, uniqueCount, sampleValues

---

### TC-FC-014: POST /api/v1/files/upload/single - Reject Missing File

**Given** a request without a file part
**When** POST /api/v1/files/upload/single is called
**Then** HTTP 400 is returned
**And** validation error indicates file is required

**Given** a file with ID "file-321" exists
**And** file belongs to organization "org-123"
**When** DELETE request is sent to /api/files/file-321
**Then** HTTP status 204 No Content is returned
**And** file is removed from database
**And** physical file is deleted from file system

---

## Test Configuration

### Test Environment
- `@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)`
- TestContainers PostgreSQL for database
- MockMvc or RestAssured for HTTP requests

### Test Data Setup
- Create test organizations in database
- Upload test files before each test
- Clean up files after each test

### Required Files
- `source_data.csv`: 100 rows, 4 columns
- `mixed_data_types.xlsx`: 50 rows, 6 columns
- `large_dataset.csv`: 10,000 rows

### Headers
- `X-Organization-Id`: Organization identifier
- `Content-Type: multipart/form-data` for uploads
