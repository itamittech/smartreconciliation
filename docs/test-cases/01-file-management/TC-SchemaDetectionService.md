# TC-SchemaDetectionService - Unit Tests

**Module**: File Management
**Component**: SchemaDetectionService
**Test Level**: Unit Test
**Total Test Cases**: 13

---

## Type Detection Tests

### TC-SDS-001: Detect Integer Type

**Given** a column with values ["123", "456", "789", "0", "-100"]
**When** detectColumnType() is called
**Then** detected type is "INTEGER"
**And** confidence score is 1.0

---

### TC-SDS-002: Detect Decimal Number Type

**Given** a column with values ["12.34", "56.78", "-90.12", "0.5"]
**When** detectColumnType() is called
**Then** detected type is "NUMBER"
**And** confidence score is 1.0

---

### TC-SDS-003: Detect Currency Type

**Given** a column with values ["$1,234.56", "$500.00", "$10,000.99"]
**And** values contain currency symbols and thousand separators
**When** detectColumnType() is called
**Then** detected type is "CURRENCY"
**And** confidence score is 1.0

---

### TC-SDS-004: Detect Date Type with ISO Format

**Given** a column with values ["2024-01-15", "2024-02-20", "2024-03-10"]
**When** detectColumnType() is called
**Then** detected type is "DATE"
**And** detected format is "yyyy-MM-dd"
**And** confidence score is 1.0

---

### TC-SDS-005: Detect Date Type with US Format

**Given** a column with values ["01/15/2024", "02/20/2024", "12/31/2024"]
**When** detectColumnType() is called
**Then** detected type is "DATE"
**And** detected format is "MM/dd/yyyy"
**And** confidence score is 1.0

---

### TC-SDS-006: Detect Date Type with European Format

**Given** a column with values ["15-Jan-2024", "20-Feb-2024", "10-Mar-2024"]
**When** detectColumnType() is called
**Then** detected type is "DATE"
**And** detected format is "dd-MMM-yyyy"
**And** confidence score is 1.0

---

### TC-SDS-007: Detect Email Type

**Given** a column with values ["user@example.com", "test.user@domain.co.uk", "admin@company.org"]
**When** detectColumnType() is called
**Then** detected type is "EMAIL"
**And** confidence score is 1.0

---

### TC-SDS-008: Detect Percentage Type

**Given** a column with values ["15.5%", "100%", "0.5%", "99.99%"]
**When** detectColumnType() is called
**Then** detected type is "PERCENTAGE"
**And** confidence score is 1.0

---

### TC-SDS-009: Detect Boolean Type

**Given** a column with values ["true", "false", "true", "false"]
**When** detectColumnType() is called
**Then** detected type is "BOOLEAN"
**And** confidence score is 1.0

---

### TC-SDS-010: Detect Text Type as Default

**Given** a column with values ["John Smith", "Jane Doe", "Bob Johnson"]
**And** values do not match any specific type pattern
**When** detectColumnType() is called
**Then** detected type is "TEXT"
**And** confidence score is 1.0

---

### TC-SDS-011: Handle Mixed Types with Dominant Type

**Given** a column with values ["123", "456", "789", "abc", "xyz"]
**And** 60% are integers, 40% are text
**When** detectColumnType() is called
**Then** detected type is "INTEGER"
**And** confidence score is 0.6

---

## Null and Edge Case Tests

### TC-SDS-012: Handle Null Values in Column

**Given** a column with values ["123", null, "456", "", "789"]
**And** column contains 2 null/empty values out of 5
**When** detectColumnType() is called
**Then** null values are excluded from type detection
**And** type is detected based on non-null values only
**And** detected type is "INTEGER"

---

## Schema Analysis Tests

### TC-SDS-013: Detect Full Schema for File

**Given** a parsed file with 4 columns: id (integers), name (text), amount (currency), date (dates)
**When** detectSchema() is called with the parsed data
**Then** schema contains 4 ColumnSchema objects
**And** each ColumnSchema has correct name, type, uniqueCount, and sampleValues
**And** sampleValues contains up to 5 example values per column
**And** uniqueCount reflects distinct value count for each column

---

## Test Data Requirements

### Sample Column Data
- **Integers**: ["123", "456", "789", "0", "-100"]
- **Decimals**: ["12.34", "56.78", "-90.12", "0.5"]
- **Currency**: ["$1,234.56", "$500.00", "$10,000.99", "€500.00", "¥10000"]
- **Dates**:
  - ISO: ["2024-01-15", "2024-02-20", "2024-03-10"]
  - US: ["01/15/2024", "02/20/2024", "12/31/2024"]
  - European: ["15-Jan-2024", "20-Feb-2024", "10-Mar-2024"]
- **Emails**: ["user@example.com", "test.user@domain.co.uk", "admin@company.org"]
- **Percentages**: ["15.5%", "100%", "0.5%", "99.99%"]
- **Booleans**: ["true", "false", "yes", "no", "1", "0"]
- **Text**: ["John Smith", "Jane Doe", "Bob Johnson"]
- **Mixed**: ["123", "456", "789", "abc", "xyz"]

### Mock Objects
- List<Map<String, String>> representing parsed file data
