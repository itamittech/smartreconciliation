# TC-FileController - Integration Tests

**Module**: File Management
**Component**: FileController
**Test Level**: Integration Test
**Total Test Cases**: 9

---

## Upload Endpoint Tests

### TC-FC-001: POST /api/files/upload - Upload Single CSV File

**Given** a valid CSV multipart file in the request
**And** request header "X-Organization-Id: org-123"
**When** POST request is sent to /api/files/upload
**Then** HTTP status 200 OK is returned
**And** response body contains file ID
**And** file is saved to database with status UPLOADED

---

### TC-FC-002: POST /api/files/upload - Upload Excel File

**Given** a valid XLSX multipart file in the request
**And** request header "X-Organization-Id: org-456"
**When** POST request is sent to /api/files/upload
**Then** HTTP status 200 OK is returned
**And** response contains file ID and filename
**And** file entity is created with correct organization

---

### TC-FC-003: POST /api/files/upload - Reject Invalid File Type

**Given** a PDF file in the multipart request
**And** request header "X-Organization-Id: org-123"
**When** POST request is sent to /api/files/upload
**Then** HTTP status 400 Bad Request is returned
**And** error message is "Unsupported file type: pdf"
**And** no file is saved to database

---

## File Details Endpoint Tests

### TC-FC-004: GET /api/files/{id} - Retrieve File Details

**Given** a file with ID "file-123" exists in database
**And** file has status COMPLETED with 500 rows and 4 columns
**When** GET request is sent to /api/files/file-123
**Then** HTTP status 200 OK is returned
**And** response body contains: id, filename, status, rowCount, columnCount, uploadDate
**And** status is "COMPLETED"
**And** rowCount is 500

---

### TC-FC-005: GET /api/files/{id} - File Not Found

**Given** no file with ID "file-999" exists
**When** GET request is sent to /api/files/file-999
**Then** HTTP status 404 Not Found is returned
**And** error message is "File not found"

---

## Preview and Schema Endpoint Tests

### TC-FC-006: GET /api/files/{id}/preview - Get File Preview

**Given** a file with ID "file-456" has 10,000 rows
**And** file status is COMPLETED
**When** GET request is sent to /api/files/file-456/preview
**Then** HTTP status 200 OK is returned
**And** response contains exactly 100 rows
**And** each row contains all column data

---

### TC-FC-007: GET /api/files/{id}/schema - Get Detected Schema

**Given** a file with ID "file-789" has detected schema
**And** schema includes 4 columns: id (INTEGER), name (TEXT), amount (CURRENCY), date (DATE)
**When** GET request is sent to /api/files/file-789/schema
**Then** HTTP status 200 OK is returned
**And** response contains schema JSON array with 4 elements
**And** each element has: name, type, uniqueCount, sampleValues

---

## List and Delete Endpoint Tests

### TC-FC-008: GET /api/files - List All Files for Organization

**Given** organization "org-123" has 3 uploaded files
**And** request header "X-Organization-Id: org-123"
**When** GET request is sent to /api/files
**Then** HTTP status 200 OK is returned
**And** response contains array of 3 file objects
**And** all files belong to organization "org-123"
**And** files are ordered by uploadDate descending

---

### TC-FC-009: DELETE /api/files/{id} - Delete File

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
