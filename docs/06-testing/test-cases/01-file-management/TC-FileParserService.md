# TC-FileParserService - Unit Tests

**Module**: File Management
**Component**: FileParserService
**Test Level**: Unit Test
**Total Test Cases**: 8

---

## CSV Parsing Tests

### TC-FPS-001: Parse Valid CSV File with Standard Data

**Given** a valid CSV file "source_data_exact_match.csv" with 3 rows and 4 columns (id, name, amount, date)
**And** file contains standard text and numeric data
**When** parseFile() is called with the CSV file
**Then** a List of Maps is returned with 3 records
**And** each Map contains 4 entries matching the CSV headers
**And** all cell values are correctly extracted as strings

---

### TC-FPS-002: Parse CSV with Special Characters

**Given** a CSV file "data_with_special_chars.csv"
**And** file contains quoted fields with commas (e.g., "Smith, John")
**And** file contains quoted fields with quotes (e.g., "He said ""Hello""")
**And** file contains quoted fields with newlines
**When** parseFile() is called with the CSV file
**Then** all special characters are correctly preserved
**And** quoted fields are properly unescaped
**And** no data corruption occurs

---

### TC-FPS-003: Parse CSV with Empty Cells

**Given** a CSV file "empty_cells.csv"
**And** file contains rows with missing values in various positions
**And** some cells are empty strings, some are null
**When** parseFile() is called with the CSV file
**Then** empty cells are returned as empty strings in the Map
**And** no NullPointerException is thrown
**And** row structure is maintained with all column keys present

---

### TC-FPS-004: Parse Large CSV File

**Given** a CSV file "large_dataset_source.csv" with 10,000 rows
**And** file contains 6 columns (id, reference, description, amount, category, date)
**When** parseFile() is called with the CSV file
**Then** all 10,000 records are successfully parsed
**And** parsing completes within 10 seconds
**And** memory usage remains under 200MB

---

## Excel Parsing Tests

### TC-FPS-005: Parse XLSX File with Mixed Data Types

**Given** an Excel file "mixed_data_types.xlsx"
**And** file contains columns: ID (integer), Name (text), Amount (currency), Date (date), Active (boolean), Percentage (%)
**When** parseFile() is called with the XLSX file
**Then** all rows are successfully parsed
**And** numeric cells are converted to strings with proper formatting
**And** date cells are converted to ISO 8601 format strings
**And** boolean cells are converted to "true"/"false" strings
**And** currency values retain decimal precision

---

### TC-FPS-006: Parse Excel File with Empty Rows

**Given** an Excel file with data rows interspersed with empty rows
**And** first row contains headers
**And** rows 2, 4, 6 contain data, rows 3, 5 are empty
**When** parseFile() is called with the Excel file
**Then** only non-empty rows are returned
**And** empty rows are skipped automatically
**And** row count matches number of rows with data

---

## Error Handling Tests

### TC-FPS-007: Handle Unsupported File Type

**Given** a file "document.pdf" with unsupported extension
**When** parseFile() is called with the PDF file
**Then** an IllegalArgumentException is thrown
**And** exception message is "Unsupported file type: pdf"
**And** no file processing is attempted

---

### TC-FPS-008: Handle Corrupted File

**Given** a file "corrupted.csv" with invalid internal structure
**And** file cannot be read by CSV parser
**When** parseFile() is called with the corrupted file
**Then** a RuntimeException is thrown with clear error message
**And** exception contains the original cause
**And** partial data is not returned

---

## Test Data Requirements

### CSV Files
- `source_data_exact_match.csv`: Standard 3x4 CSV
- `data_with_special_chars.csv`: Edge case characters
- `empty_cells.csv`: Missing values
- `large_dataset_source.csv`: 10,000 rows

### Excel Files
- `mixed_data_types.xlsx`: Multiple data types

### Mock Objects
- File objects with various extensions
- InputStream mocks for error scenarios
