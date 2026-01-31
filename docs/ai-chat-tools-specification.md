# AI Chat Tools Specification - Spring AI Function Calling

## Overview

Smart Reconciliation is an **AI-centered product** where the conversational AI assistant is a core feature, not an add-on. The AI must be able to intelligently query data, trigger operations, and provide actionable insights using Spring AI's function calling capabilities.

## Spring AI Function Calling Architecture

Spring AI provides `@Tool` annotation support for function calling. The AI model:
1. Receives tool definitions in the system prompt
2. Decides which tools to call based on user questions
3. Spring AI framework executes the tool methods
4. Results are returned to the AI to formulate the final response

## Tool Categories

### Category 1: Reconciliation Query & Management
### Category 2: Exception Management
### Category 3: File & Schema Management
### Category 4: Rule Set Management
### Category 5: Dashboard & Analytics
### Category 6: AI Capabilities
### Category 7: Search & Discovery

---

## Detailed Tool Specifications

### Category 1: Reconciliation Query & Management

#### Tool 1.1: Get Reconciliation by ID
```java
@Tool(name = "get_reconciliation",
      description = "Retrieves detailed information about a specific reconciliation by its ID, including status, progress, match rate, file details, and statistics")
public ReconciliationDetailsResponse getReconciliation(
    @ToolParam(description = "The unique ID of the reconciliation to retrieve") Long reconciliationId
) {
    // Returns: name, status, progress, match rate, source/target files,
    // rule set name, record counts, exception count, started/completed times
}
```

**Use Cases:**
- "Show me reconciliation #5"
- "What's the status of reconciliation 'Bank Statement Jan 2026'?"
- "Give me details about the latest reconciliation"

**Implementation:** Calls `ReconciliationService.getReconciliationById()`

---

#### Tool 1.2: List Reconciliations
```java
@Tool(name = "list_reconciliations",
      description = "Lists reconciliations with optional filters for status, date range, and search term. Returns up to 50 results ordered by creation date")
public List<ReconciliationSummaryResponse> listReconciliations(
    @ToolParam(description = "Filter by status: PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED. Optional.")
    String status,

    @ToolParam(description = "Filter by name or description using case-insensitive search. Optional.")
    String searchTerm,

    @ToolParam(description = "Return only reconciliations created after this date (ISO format: 2026-01-01). Optional.")
    String fromDate,

    @ToolParam(description = "Maximum number of results to return (1-50). Defaults to 10.")
    Integer limit
) {
    // Returns: id, name, status, match rate, exception count, created date
}
```

**Use Cases:**
- "Show me all completed reconciliations"
- "List failed reconciliations from this month"
- "What reconciliations contain 'bank statement' in the name?"

**Implementation:** Calls repository with filters + pagination

---

#### Tool 1.3: Get Reconciliation Status
```java
@Tool(name = "get_reconciliation_status",
      description = "Gets real-time status and progress of a running or completed reconciliation")
public ReconciliationStatusResponse getReconciliationStatus(
    @ToolParam(description = "The reconciliation ID to check status for")
    Long reconciliationId
) {
    // Returns: status, progress percentage, current phase, error message if failed
}
```

**Use Cases:**
- "Is reconciliation #10 finished yet?"
- "What's the progress on the bank reconciliation?"

**Implementation:** Calls `ReconciliationService.getStatus()`

---

#### Tool 1.4: Start Reconciliation
```java
@Tool(name = "start_reconciliation",
      description = "Creates and starts a new reconciliation process with specified source file, target file, and rule set")
public ReconciliationStartResponse startReconciliation(
    @ToolParam(description = "Name for this reconciliation")
    String name,

    @ToolParam(description = "Optional description")
    String description,

    @ToolParam(description = "ID of the source file to reconcile")
    Long sourceFileId,

    @ToolParam(description = "ID of the target file to reconcile")
    Long targetFileId,

    @ToolParam(description = "ID of the rule set defining how to match records")
    Long ruleSetId
) {
    // Returns: reconciliation ID, initial status, created timestamp
}
```

**Use Cases:**
- "Start a reconciliation using source file 5, target file 6, and rule set 2"
- "Create a new bank reconciliation with files X and Y"

**Implementation:** Calls `ReconciliationService.createReconciliation()`

---

#### Tool 1.5: Cancel Reconciliation
```java
@Tool(name = "cancel_reconciliation",
      description = "Cancels a pending or in-progress reconciliation")
public CancellationResponse cancelReconciliation(
    @ToolParam(description = "The reconciliation ID to cancel")
    Long reconciliationId
) {
    // Returns: success/failure, new status
}
```

**Use Cases:**
- "Cancel reconciliation #8"
- "Stop the running reconciliation"

**Implementation:** Calls `ReconciliationService.cancelReconciliation()`

---

### Category 2: Exception Management

#### Tool 2.1: List Exceptions
```java
@Tool(name = "list_exceptions",
      description = "Lists exceptions with filters for reconciliation, type, severity, and status. Returns paginated results.")
public List<ExceptionSummaryResponse> listExceptions(
    @ToolParam(description = "Filter by reconciliation ID. Optional.")
    Long reconciliationId,

    @ToolParam(description = "Filter by exception type: MISSING_SOURCE, MISSING_TARGET, VALUE_MISMATCH, DUPLICATE, FORMAT_ERROR, TOLERANCE_EXCEEDED. Optional.")
    String exceptionType,

    @ToolParam(description = "Filter by severity: CRITICAL, HIGH, MEDIUM, LOW. Optional.")
    String severity,

    @ToolParam(description = "Filter by status: OPEN, IN_REVIEW, RESOLVED, IGNORED. Optional.")
    String status,

    @ToolParam(description = "Maximum results to return (1-100). Defaults to 20.")
    Integer limit
) {
    // Returns: id, type, severity, status, field name, source/target values, reconciliation ID
}
```

**Use Cases:**
- "Show me all critical exceptions"
- "List open exceptions for reconciliation #5"
- "What are the VALUE_MISMATCH exceptions?"

**Implementation:** Calls `ExceptionService.getExceptions()` with filters

---

#### Tool 2.2: Get Exception Details
```java
@Tool(name = "get_exception_details",
      description = "Gets full details of a specific exception including source record, target record, and AI suggestion")
public ExceptionDetailsResponse getExceptionDetails(
    @ToolParam(description = "The exception ID to retrieve")
    Long exceptionId
) {
    // Returns: type, severity, status, field name, source/target values,
    // full source record (JSONB), full target record (JSONB),
    // AI suggestion, resolution notes, timestamps
}
```

**Use Cases:**
- "Show me details of exception #42"
- "What's the full record data for this exception?"

**Implementation:** Calls `ExceptionService.getException()`

---

#### Tool 2.3: Get Exception AI Suggestion
```java
@Tool(name = "get_exception_ai_suggestion",
      description = "Gets or generates AI-powered resolution suggestion for a specific exception")
public ExceptionAiSuggestionResponse getExceptionAiSuggestion(
    @ToolParam(description = "The exception ID to get AI suggestion for")
    Long exceptionId
) {
    // Returns: AI-generated suggestion text, cached or newly generated
}
```

**Use Cases:**
- "What does AI suggest for exception #15?"
- "How should I resolve this VALUE_MISMATCH?"

**Implementation:** Calls `ExceptionService.getAiSuggestion()` or `AiService.getExceptionSuggestion()`

---

#### Tool 2.4: Resolve Exception
```java
@Tool(name = "resolve_exception",
      description = "Marks an exception as RESOLVED with optional resolution notes")
public ExceptionResolutionResponse resolveException(
    @ToolParam(description = "The exception ID to resolve")
    Long exceptionId,

    @ToolParam(description = "Optional notes explaining the resolution")
    String resolutionNotes
) {
    // Returns: success/failure, new status, resolved timestamp
}
```

**Use Cases:**
- "Resolve exception #20 with note 'Timing difference - acceptable'"
- "Mark this exception as resolved"

**Implementation:** Calls `ExceptionService.resolveException()`

---

#### Tool 2.5: Get Exception Statistics
```java
@Tool(name = "get_exception_statistics",
      description = "Gets aggregate exception statistics across the system or for a specific reconciliation")
public ExceptionStatisticsResponse getExceptionStatistics(
    @ToolParam(description = "Optional reconciliation ID to scope statistics to. If null, returns system-wide stats.")
    Long reconciliationId
) {
    // Returns: total count, counts by type, by severity, by status, trending patterns
}
```

**Use Cases:**
- "What's the exception breakdown for reconciliation #5?"
- "Show me system-wide exception statistics"

**Implementation:** Calls `DashboardService` or custom repository aggregation

---

### Category 3: File & Schema Management

#### Tool 3.1: List Files
```java
@Tool(name = "list_files",
      description = "Lists uploaded files with optional filters for status and search term")
public List<FileSummaryResponse> listFiles(
    @ToolParam(description = "Filter by file status: UPLOADING, UPLOADED, PROCESSING, PROCESSED, FAILED. Optional.")
    String status,

    @ToolParam(description = "Search by original filename. Optional.")
    String searchTerm,

    @ToolParam(description = "Maximum results (1-100). Defaults to 20.")
    Integer limit
) {
    // Returns: id, original filename, file size, row count, column count, status, created date
}
```

**Use Cases:**
- "Show me all processed files"
- "List files containing 'bank' in the name"

**Implementation:** Calls `FileUploadService.listFiles()`

---

#### Tool 3.2: Get File Schema
```java
@Tool(name = "get_file_schema",
      description = "Retrieves the detected schema of a file including column names, data types, and sample values")
public FileSchemaResponse getFileSchema(
    @ToolParam(description = "The file ID to get schema for")
    Long fileId
) {
    // Returns: filename, columns array with (name, detected type, sample values, null count, unique count)
}
```

**Use Cases:**
- "What's the schema of file #10?"
- "Show me column types in the bank statement file"

**Implementation:** Calls `FileUploadService.getSchema()`

---

#### Tool 3.3: Get File Preview
```java
@Tool(name = "get_file_preview",
      description = "Gets a preview of file data showing the first N rows")
public FilePreviewResponse getFilePreview(
    @ToolParam(description = "The file ID to preview")
    Long fileId,

    @ToolParam(description = "Number of rows to return (1-100). Defaults to 10.")
    Integer rowCount
) {
    // Returns: headers, preview rows (up to specified count)
}
```

**Use Cases:**
- "Show me the first 5 rows of file #3"
- "Preview the bank statement file"

**Implementation:** Calls `FileUploadService.getPreview()`

---

### Category 4: Rule Set Management

#### Tool 4.1: List Rule Sets
```java
@Tool(name = "list_rule_sets",
      description = "Lists all rule sets with optional filter for active status")
public List<RuleSetSummaryResponse> listRuleSets(
    @ToolParam(description = "Filter by active status. If true, only active rule sets. If false, only inactive. If null, all. Optional.")
    Boolean active,

    @ToolParam(description = "Search by rule set name. Optional.")
    String searchTerm
) {
    // Returns: id, name, description, active, version, mapping count, rule count, is AI-generated
}
```

**Use Cases:**
- "Show me all active rule sets"
- "List rule sets for bank reconciliation"

**Implementation:** Calls `RuleService.getRuleSets()`

---

#### Tool 4.2: Get Rule Set Details
```java
@Tool(name = "get_rule_set_details",
      description = "Gets complete details of a rule set including field mappings and matching rules")
public RuleSetDetailsResponse getRuleSetDetails(
    @ToolParam(description = "The rule set ID to retrieve")
    Long ruleSetId
) {
    // Returns: name, description, version, active, is AI-generated,
    // field mappings array (source field, target field, is key, confidence, transform),
    // matching rules array (field name, match type, priority, tolerance, fuzzy threshold, active)
}
```

**Use Cases:**
- "Show me the details of rule set #2"
- "What are the field mappings in the bank rule set?"

**Implementation:** Calls `RuleService.getRuleSet()`

---

### Category 5: Dashboard & Analytics

#### Tool 5.1: Get Dashboard Metrics
```java
@Tool(name = "get_dashboard_metrics",
      description = "Retrieves comprehensive dashboard metrics including reconciliation counts, match rates, and exception analytics")
public DashboardMetricsResponse getDashboardMetrics() {
    // Returns: total/completed/pending/failed reconciliation counts,
    // overall match rate, open/resolved exception counts,
    // exceptions by type map, exceptions by severity map,
    // total file count, total rule set count
}
```

**Use Cases:**
- "What's the current system status?"
- "Show me dashboard metrics"
- "How many reconciliations have failed?"

**Implementation:** Calls `DashboardService.getMetrics()`

---

#### Tool 5.2: Get Recent Activity
```java
@Tool(name = "get_recent_activity",
      description = "Gets recent reconciliation activity across the system")
public List<RecentActivityResponse> getRecentActivity(
    @ToolParam(description = "Number of recent items to return (1-50). Defaults to 10.")
    Integer limit
) {
    // Returns: recent reconciliations with id, name, status, match rate, created date
}
```

**Use Cases:**
- "What are the latest reconciliations?"
- "Show me recent activity"

**Implementation:** Calls repository with date ordering and limit

---

### Category 6: AI Capabilities

#### Tool 6.1: Get AI Field Mapping Suggestions
```java
@Tool(name = "get_ai_field_mapping_suggestions",
      description = "Uses AI to analyze source and target file schemas and suggest optimal field mappings with confidence scores")
public AiMappingSuggestionsResponse getAiFieldMappingSuggestions(
    @ToolParam(description = "Source file ID")
    Long sourceFileId,

    @ToolParam(description = "Target file ID")
    Long targetFileId
) {
    // Returns: mappings array (source field, target field, confidence, reason, is key, suggested transform),
    // overall explanation
}
```

**Use Cases:**
- "Suggest field mappings between file 5 and file 6"
- "What columns should I map from source to target?"

**Implementation:** Calls `AiService.suggestMappings()`

---

#### Tool 6.2: Get AI Rule Suggestions
```java
@Tool(name = "get_ai_rule_suggestions",
      description = "Uses AI to recommend matching rules based on file schemas and existing field mappings")
public String getAiRuleSuggestions(
    @ToolParam(description = "Source file ID")
    Long sourceFileId,

    @ToolParam(description = "Target file ID")
    Long targetFileId,

    @ToolParam(description = "Comma-separated list of already-mapped field names")
    String mappedFields
) {
    // Returns: natural language AI recommendations for matching rules
}
```

**Use Cases:**
- "What matching rules should I use for these files?"
- "Suggest rules for bank reconciliation"

**Implementation:** Calls `AiService.suggestRules()`

---

### Category 7: Search & Discovery

#### Tool 7.1: Search Across System
```java
@Tool(name = "search_system",
      description = "Performs a broad search across reconciliations, files, and rule sets by name or description")
public SearchResultsResponse searchSystem(
    @ToolParam(description = "Search term to find in names and descriptions")
    String query,

    @ToolParam(description = "Maximum results per category (1-20). Defaults to 5.")
    Integer limitPerCategory
) {
    // Returns: matching reconciliations, matching files, matching rule sets
}
```

**Use Cases:**
- "Search for 'bank statement' across the system"
- "Find anything related to January 2026"

**Implementation:** Multiple repository queries with LIKE/ILIKE clauses

---

## Implementation Strategy

### Phase 1: Core Query Tools (High Priority)
Tools that enable the AI to answer questions about existing data:
- ✅ get_reconciliation
- ✅ list_reconciliations
- ✅ get_reconciliation_status
- ✅ list_exceptions
- ✅ get_exception_details
- ✅ get_dashboard_metrics
- ✅ list_files
- ✅ get_file_schema
- ✅ list_rule_sets
- ✅ get_rule_set_details

### Phase 2: AI-Powered Tools (Medium Priority)
Tools that leverage AI capabilities:
- ✅ get_exception_ai_suggestion
- ✅ get_ai_field_mapping_suggestions
- ✅ get_ai_rule_suggestions

### Phase 3: Action Tools (Lower Priority)
Tools that modify state:
- ⚠️ start_reconciliation
- ⚠️ cancel_reconciliation
- ⚠️ resolve_exception

**Note:** Action tools require careful permission handling and confirmation prompts.

### Phase 4: Advanced Analytics (Future)
- get_exception_statistics
- get_recent_activity
- search_system

---

## Spring AI Implementation Pattern

### Step 1: Create Tool Service Class

```java
@Service
public class ChatToolService {

    private final ReconciliationService reconciliationService;
    private final ExceptionService exceptionService;
    private final FileUploadService fileUploadService;
    private final RuleService ruleService;
    private final DashboardService dashboardService;
    private final AiService aiService;

    // Constructor injection

    @Tool(name = "get_reconciliation",
          description = "Retrieves detailed information about a specific reconciliation")
    public ReconciliationDetailsResponse getReconciliation(
        @ToolParam(description = "The reconciliation ID") Long reconciliationId) {
        return reconciliationService.getReconciliationDetails(reconciliationId);
    }

    // ... other tool methods
}
```

### Step 2: Configure Spring AI Function Calling

```java
@Configuration
public class AiChatConfig {

    @Bean
    public ChatClient chatClient(ChatModel chatModel, ChatToolService toolService) {
        return ChatClient.builder(chatModel)
            .defaultFunctions(
                "get_reconciliation",
                "list_reconciliations",
                "list_exceptions",
                "get_exception_details",
                "get_file_schema",
                "list_rule_sets",
                "get_dashboard_metrics"
                // ... register all tools
            )
            .build();
    }
}
```

### Step 3: Update AiService to Use ChatClient with Tools

```java
@Service
public class AiService {

    private final ChatClient chatClient;

    public String chatSync(String message, String context) {
        String systemPrompt = buildChatSystemPrompt(context);

        return chatClient.prompt()
            .system(systemPrompt)
            .user(message)
            .call()
            .content();
    }

    public Flux<String> chat(String message, String context) {
        String systemPrompt = buildChatSystemPrompt(context);

        return chatClient.prompt()
            .system(systemPrompt)
            .user(message)
            .stream()
            .content();
    }
}
```

---

## Tool Response DTOs

Create specialized response DTOs optimized for AI consumption:

```java
// Simplified responses with only essential fields
public record ReconciliationDetailsResponse(
    Long id,
    String name,
    String status,
    Integer progress,
    Double matchRate,
    String sourceFileName,
    String targetFileName,
    String ruleSetName,
    Long totalSourceRecords,
    Long totalTargetRecords,
    Long matchedRecords,
    Long exceptionCount,
    String startedAt,
    String completedAt
) {}

// Array responses for lists
public record ReconciliationSummaryResponse(
    Long id,
    String name,
    String status,
    Double matchRate,
    Long exceptionCount,
    String createdAt
) {}
```

---

## Expected User Interactions

### Example 1: Investigating Reconciliation Status
**User:** "What's the status of reconciliation #5?"

**AI Flow:**
1. Calls `get_reconciliation(5)`
2. Receives: `{id: 5, name: "Bank Statement Jan", status: "COMPLETED", matchRate: 94.5, exceptionCount: 23, ...}`
3. Responds: "Reconciliation #5 'Bank Statement Jan' is COMPLETED with a 94.5% match rate. There are 23 exceptions that need review..."

### Example 2: Exception Investigation
**User:** "Show me critical exceptions from the latest reconciliation"

**AI Flow:**
1. Calls `list_reconciliations(limit=1)` → Gets reconciliation ID
2. Calls `list_exceptions(reconciliationId=X, severity="CRITICAL")`
3. Responds with structured list of critical exceptions

### Example 3: AI Suggestions
**User:** "Suggest mappings between file 10 and file 11"

**AI Flow:**
1. Calls `get_ai_field_mapping_suggestions(10, 11)`
2. Receives AI-generated mapping suggestions
3. Presents formatted recommendations to user

### Example 4: Multi-Step Analysis
**User:** "Why is the match rate for bank reconciliation so low?"

**AI Flow:**
1. Calls `search_system("bank")` → Finds relevant reconciliation
2. Calls `get_reconciliation(id)` → Gets match rate and stats
3. Calls `list_exceptions(reconciliationId, limit=10)` → Gets exception samples
4. Calls `get_exception_statistics(reconciliationId)` → Gets breakdown
5. Synthesizes analysis: "The bank reconciliation has a 72% match rate. Analysis of exceptions shows 15 MISSING_TARGET exceptions and 8 VALUE_MISMATCH exceptions primarily in the 'amount' field..."

---

## Testing Strategy

### Unit Tests
Test each tool method in isolation with mock dependencies.

### Integration Tests
Test Spring AI function calling orchestration end-to-end.

### AI Behavior Tests
Verify the AI correctly:
- Chooses appropriate tools
- Handles tool errors gracefully
- Synthesizes multi-tool results coherently

---

## Security & Performance Considerations

### Security
- All tools enforce organization-scoped data access
- Action tools (start, cancel, resolve) require additional authorization
- Sensitive data filtering in tool responses
- Rate limiting on AI API calls

### Performance
- Tool responses optimized for minimal data transfer
- Caching strategies for frequently accessed data
- Async execution for long-running operations
- Pagination limits enforced

---

## Success Metrics

1. **Tool Usage Rate**: % of chat interactions that use tools
2. **Tool Accuracy**: % of correct tool selections by AI
3. **User Satisfaction**: Rating of AI responses using tools
4. **Response Time**: P95 latency for tool-augmented responses
5. **Tool Coverage**: % of user questions answerable via tools

---

## Conclusion

This comprehensive tool set transforms the Smart Reconciliation AI assistant from a conversational interface into a **fully functional AI agent** capable of querying data, analyzing reconciliations, and providing actionable insights - all through natural language interaction powered by Spring AI's function calling capabilities.
