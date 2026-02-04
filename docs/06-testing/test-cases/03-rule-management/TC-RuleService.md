# TC-RuleService - Unit Tests

**Module**: Rule Management
**Component**: RuleService
**Test Level**: Unit Test
**Total Test Cases**: 15

---

## Rule Set Creation Tests

### TC-RUS-001: Create Rule Set with Field Mappings

**Given** a CreateRuleSetRequest with:
- name: "Standard Invoice Mapping"
- sourceFields: ["invoice_id", "customer_name", "total_amount"]
- targetFields: ["id", "client_name", "amount"]
- keyFields: ["invoice_id"]
- organizationId: "org-123"
**When** createRuleSet() is called
**Then** RuleSet entity is created with version 1
**And** 3 FieldMapping entities are created
**And** FieldMapping for "invoice_id" is marked as keyField=true
**And** rule set is saved to database

---

### TC-RUS-002: Create Rule Set with Matching Rules

**Given** a rule set with field mappings
**And** matching rules defined:
- Field: "customer_name", Type: FUZZY, Threshold: 0.85
- Field: "total_amount", Type: RANGE, Tolerance: 0.50
**When** createRuleSet() is called
**Then** RuleSet entity includes 2 MatchingRule entities
**And** each rule is linked to the rule set
**And** rules are saved with correct parameters

---

### TC-RUS-003: Create Rule Set with Field Transforms

**Given** field mapping for "customer_name"
**And** transform type: UPPERCASE
**When** createRuleSet() is called with transform configuration
**Then** FieldMapping entity includes transform UPPERCASE
**And** transform will be applied during reconciliation

---

### TC-RUS-004: Create Rule Set with Multiple Key Fields (Composite Key)

**Given** field mappings with keyFields: ["invoice_id", "line_number"]
**When** createRuleSet() is called
**Then** 2 FieldMapping entities have keyField=true
**And** composite key will be used for matching

---

## Rule Set Update Tests

### TC-RUS-005: Update Rule Set - Increment Version

**Given** an existing rule set with version 2
**And** update includes new field mapping: "discount" -> "discount_amount"
**When** updateRuleSet() is called
**Then** version is incremented to 3
**And** new field mapping is added
**And** existing mappings are preserved

---

### TC-RUS-006: Update Matching Rule Threshold

**Given** existing matching rule: Field="amount", Type=RANGE, Tolerance=0.50
**And** update request changes tolerance to 1.00
**When** updateRuleSet() is called
**Then** matching rule tolerance is updated to 1.00
**And** version is incremented
**And** rule set is saved

---

### TC-RUS-015: Store Rule Set Version History

**Given** an existing rule set with version 3
**When** updateRuleSet() is called
**Then** version is incremented to 4
**And** a version history entry is stored for version 3

---

## Field Mapping Configuration Tests

### TC-RUS-007: Add Field Mapping to Existing Rule Set

**Given** rule set "rule-001" with 3 existing field mappings
**And** new mapping: "order_date" -> "purchase_date"
**When** addFieldMapping() is called
**Then** 4th field mapping is added to rule set
**And** mapping is persisted
**And** version is incremented

---

### TC-RUS-008: Configure Transform Types

**Given** field mapping for "email" field
**And** transform type: LOWERCASE
**When** field mapping is configured
**Then** transform LOWERCASE is set
**And** during reconciliation, "User@Example.COM" will be compared as "user@example.com"

---

## Matching Rule Types Tests

### TC-RUS-009: Configure Fuzzy Matching Rule

**Given** a matching rule for field "name"
**And** matchType: FUZZY
**And** threshold: 0.90
**When** matching rule is created
**Then** rule parameters are: type=FUZZY, threshold=0.90
**And** rule will use Levenshtein distance algorithm

---

### TC-RUS-010: Configure Range Matching Rule

**Given** a matching rule for field "amount"
**And** matchType: RANGE
**And** tolerance: 5.0
**When** matching rule is created
**Then** rule parameters are: type=RANGE, tolerance=5.0
**And** values within ±5.0 will be considered matches

---

### TC-RUS-011: Configure Exact Matching Rule

**Given** a matching rule for field "invoice_id"
**And** matchType: EXACT
**When** matching rule is created
**Then** rule requires exact string match
**And** no threshold or tolerance is needed

---

### TC-RUS-012: Configure Pattern Matching Rule

**Given** a matching rule for field "reference"
**And** matchType: PATTERN
**And** patternType: STARTS_WITH
**And** pattern: "INV-"
**When** matching rule is created
**Then** rule checks if both values start with "INV-"
**And** pattern matching is case-sensitive

---

## Delete and Retrieve Tests

### TC-RUS-013: Delete Rule Set

**Given** rule set "rule-789" exists
**And** rule set has 5 field mappings and 3 matching rules
**When** deleteRuleSet() is called
**Then** rule set is deleted from database
**And** all related field mappings are cascade deleted
**And** all related matching rules are cascade deleted

---

### TC-RUS-014: List Rule Sets by Organization

**Given** organization "org-123" has 4 rule sets
**And** organization "org-456" has 2 rule sets
**When** listRuleSets() is called with organizationId "org-123"
**Then** 4 rule sets are returned
**And** all rule sets belong to "org-123"
**And** rule sets are sorted by name ascending

---

## Test Data Requirements

### Mock Entities
- RuleSet entities with versions 1-5
- FieldMapping entities with various source/target field pairs
- MatchingRule entities with all match types: EXACT, FUZZY, RANGE, PATTERN
- Transform types: UPPERCASE, LOWERCASE, TRIM

### Test Configurations
- Single key field: ["id"]
- Composite key fields: ["id", "line_number"]
- Fuzzy thresholds: 0.70, 0.85, 0.95
- Range tolerances: 0.1, 0.5, 1.0, 5.0, 10.0
- Pattern types: CONTAINS, STARTS_WITH, ENDS_WITH

### Mock Repository
- RuleSetRepository with save/find/delete operations
- FieldMappingRepository
- MatchingRuleRepository
