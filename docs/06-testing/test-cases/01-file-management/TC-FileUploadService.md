# TC-FileUploadService - Unit Tests

**Module**: File Management
**Component**: FileUploadService
**Test Level**: Unit Test
**Total Test Cases**: 15

---

## File Upload Tests

### TC-FUS-001: Upload Valid CSV File

**Given** a multipart file "source_data.csv" with valid CSV content
**And** user belongs to organization ID "org-123"
**When** uploadFile() is called with the file and organizationId
**Then** file is saved to file system with unique filename
**And** UploadedFile entity is created with status UPLOADED
**And** UploadedFile ID is returned
**And** fileParserService.parseFile() is NOT called yet (async)

---

### TC-FUS-002: Upload Valid Excel File

**Given** a multipart file "data.xlsx" with valid Excel content
**And** user belongs to organization ID "org-456"
**When** uploadFile() is called with the file and organizationId
**Then** file is saved with .xlsx extension preserved
**And** UploadedFile entity is created with correct filename and size
**And** file status is UPLOADED

---

## Async File Processing Tests

### TC-FUS-003: Process File Asynchronously After Upload

**Given** an UploadedFile entity with status UPLOADED
**And** file exists on file system
**When** processFileAsync() is called with the file ID
**Then** file status is updated to PROCESSING
**And** fileParserService.parseFile() is called
**And** parsed data is stored in parsedData field
**And** schemaDetectionService.detectSchema() is called
**And** schema is stored in schema field
**And** file status is updated to COMPLETED
**And** processing completes within 30 seconds for 10,000 row file

---

### TC-FUS-004: Handle File Processing Failure

**Given** an UploadedFile entity with status UPLOADED
**And** fileParserService.parseFile() throws RuntimeException
**When** processFileAsync() is called
**Then** file status is updated to FAILED
**And** error message is captured and stored
**And** exception is logged
**And** no schema is generated

---

## Preview Generation Tests

### TC-FUS-005: Generate File Preview with First 100 Rows

**Given** a processed file with 10,000 rows
**And** file status is COMPLETED
**When** getFilePreview() is called with file ID
**Then** exactly 100 rows are returned
**And** rows include all columns from the original file
**And** data is correctly formatted

---

### TC-FUS-006: Generate Preview for Small File

**Given** a processed file with only 10 rows
**And** file status is COMPLETED
**When** getFilePreview() is called
**Then** all 10 rows are returned
**And** no padding or empty rows are added

---

## Schema Retrieval Tests

### TC-FUS-007: Retrieve Detected Schema

**Given** a processed file with detected schema
**And** schema contains 4 columns with types: INTEGER, TEXT, CURRENCY, DATE
**When** getFileSchema() is called with file ID
**Then** schema JSON is returned
**And** all 4 column definitions are included
**And** each column has name, type, uniqueCount, and sampleValues

---

### TC-FUS-008: Handle Schema Request for Unprocessed File

**Given** an UploadedFile with status PROCESSING
**And** schema is not yet available
**When** getFileSchema() is called
**Then** an IllegalStateException is thrown
**And** exception message is "File processing not completed"

---

### TC-FUS-009: Schema Analytics Include Null and Unique Counts

**Given** a processed file with schema analytics
**When** getFileSchema() is called
**Then** each column includes nullCount and uniqueCount
**And** sampleValues are present for each column

---

## File Status Tracking Tests

### TC-FUS-010: Get File Status and Details

**Given** an UploadedFile with status COMPLETED
**And** file has 1,000 rows and 5 columns
**When** getFileStatus() is called with file ID
**Then** FileStatusDTO is returned
**And** DTO contains: id, filename, status, rowCount, columnCount, uploadDate
**And** rowCount is 1,000
**And** columnCount is 5

---

### TC-FUS-011: List All Files for Organization

**Given** organization "org-123" has uploaded 3 files
**And** another organization "org-456" has uploaded 2 files
**When** listFiles() is called with organizationId "org-123"
**Then** exactly 3 files are returned
**And** all files belong to organization "org-123"
**And** files are sorted by uploadDate descending

---

## File Deletion Tests

### TC-FUS-012: Delete Uploaded File

**Given** an UploadedFile with ID "file-789"
**And** file exists in database and file system
**When** deleteFile() is called with file ID "file-789"
**Then** file is removed from file system
**And** UploadedFile entity is deleted from database
**And** no exception is thrown

---

## Error Handling Tests

### TC-FUS-013: Handle File Storage Failure

**Given** a valid multipart file
**And** file system has insufficient disk space
**When** uploadFile() is called
**Then** an IOException is thrown
**And** no UploadedFile entity is created
**And** exception message indicates storage failure

---

## File Naming & Status Tests

### TC-FUS-014: UUID-Prefixed File Naming

**Given** a file named "payments.csv"
**When** uploadFile() is called
**Then** the stored filename is prefixed with a UUID
**And** the original filename is preserved in metadata

---

### TC-FUS-015: Status Transitions During Async Processing

**Given** an uploaded file with status UPLOADING
**When** upload completes and async processing starts
**Then** status transitions UPLOADING -> UPLOADED -> PROCESSING
**And** status ends in PROCESSED or FAILED

---

## Test Data Requirements

### Multipart Files
- `source_data.csv`: Valid CSV, 100 rows
- `data.xlsx`: Valid Excel, 50 rows
- `large_file.csv`: 10,000 rows for performance testing

### Mock Objects
- FileParserService mock returning List<Map<String, String>>
- SchemaDetectionService mock returning schema JSON
- FileRepository mock with save/find/delete operations
- File system mock for storage operations

### Test Entities
- UploadedFile entities with various statuses: UPLOADED, PROCESSING, COMPLETED, FAILED
- Organizations with different IDs
