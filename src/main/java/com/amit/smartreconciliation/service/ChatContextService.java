package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.entity.*;
import com.amit.smartreconciliation.enums.*;
import com.amit.smartreconciliation.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service responsible for building comprehensive context for AI chat interactions.
 * Provides both static system knowledge and dynamic data retrieval.
 */
@Service
public class ChatContextService {

    private final ReconciliationRepository reconciliationRepository;
    private final ReconciliationExceptionRepository exceptionRepository;
    private final RuleSetRepository ruleSetRepository;
    private final UploadedFileRepository fileRepository;
    private final DashboardService dashboardService;

    public ChatContextService(ReconciliationRepository reconciliationRepository,
                             ReconciliationExceptionRepository exceptionRepository,
                             RuleSetRepository ruleSetRepository,
                             UploadedFileRepository fileRepository,
                             DashboardService dashboardService) {
        this.reconciliationRepository = reconciliationRepository;
        this.exceptionRepository = exceptionRepository;
        this.ruleSetRepository = ruleSetRepository;
        this.fileRepository = fileRepository;
        this.dashboardService = dashboardService;
    }

    /**
     * Builds comprehensive system knowledge that describes how Smart Reconciliation works.
     * This is static knowledge that should be included in every AI chat interaction.
     */
    public String buildSystemKnowledge() {
        return """
            # SMART RECONCILIATION SYSTEM KNOWLEDGE

            You are the AI assistant for Smart Reconciliation - an AI-powered data reconciliation platform.
            Your role is to help users understand and work with THIS SPECIFIC SYSTEM, not generic reconciliation concepts.

            ## DATABASE SCHEMA

            ### Core Entities:

            1. **rule_sets** table:
               - id (Primary Key)
               - name (Rule set name)
               - description
               - active (boolean - is this rule set active?)
               - is_ai_generated (boolean - was this created by AI suggestions?)
               - metadata (JSONB - additional configuration)
               - organization_id (Foreign Key to organizations)
               - version (integer - auto-increments on updates)
               - created_at, updated_at timestamps

            2. **field_mappings** table:
               - id (Primary Key)
               - rule_set_id (Foreign Key to rule_sets)
               - source_field (column name in source file)
               - target_field (column name in target file)
               - is_key (boolean - is this a key field for matching?)
               - confidence (double - AI confidence score 0.0-1.0)
               - transform (string - transformation to apply)
               - transform_config (JSONB - transformation parameters)

            3. **matching_rules** table:
               - id (Primary Key)
               - rule_set_id (Foreign Key to rule_sets)
               - field_name (which field this rule applies to)
               - match_type (EXACT, FUZZY, RANGE, CONTAINS, STARTS_WITH, ENDS_WITH)
               - priority (integer - execution order)
               - active (boolean)
               - tolerance (double - for RANGE matching)
               - fuzzy_threshold (double - for FUZZY matching using Levenshtein distance)

            4. **reconciliations** table:
               - id (Primary Key)
               - name
               - description
               - organization_id (Foreign Key)
               - source_file_id (Foreign Key to uploaded_files)
               - target_file_id (Foreign Key to uploaded_files)
               - rule_set_id (Foreign Key to rule_sets)
               - status (PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED)
               - progress (0-100 percentage)
               - match_rate (percentage of matched records)
               - total_source_records, total_target_records
               - matched_records
               - unmatched_source_records, unmatched_target_records
               - exception_count
               - results (JSONB - detailed matching results)
               - statistics (JSONB - aggregate statistics)
               - started_at, completed_at, created_at, updated_at

            5. **reconciliation_exceptions** table:
               - id (Primary Key)
               - reconciliation_id (Foreign Key)
               - exception_type (MISSING_SOURCE, MISSING_TARGET, VALUE_MISMATCH, DUPLICATE, FORMAT_ERROR, TOLERANCE_EXCEEDED)
               - severity (CRITICAL, HIGH, MEDIUM, LOW)
               - status (OPEN, IN_REVIEW, RESOLVED, IGNORED)
               - field_name (which field has the mismatch)
               - source_value, target_value
               - source_record_data (JSONB - full source record snapshot)
               - target_record_data (JSONB - full target record snapshot)
               - resolution_notes
               - ai_suggestion (cached AI resolution suggestion)
               - resolved_at, resolved_by

            6. **uploaded_files** table:
               - id (Primary Key)
               - original_filename
               - stored_filename (UUID-based)
               - file_path (disk location)
               - content_type (text/csv, application/vnd.ms-excel, etc.)
               - file_size (bytes)
               - status (UPLOADING, UPLOADED, PROCESSING, PROCESSED, FAILED)
               - row_count, column_count
               - detected_schema (JSONB - column types and samples)
               - preview_data (JSONB - first 100 rows)
               - processing_error
               - organization_id, data_source_id

            ## MATCHING STRATEGIES

            When users ask about matching rules or how matching works, explain these strategies:

            1. **EXACT**: Exact string/number match (case-sensitive for strings)
            2. **FUZZY**: Levenshtein distance-based similarity (threshold 0.0-1.0, where 1.0 = exact match)
            3. **RANGE**: Numeric matching with tolerance (e.g., tolerance=0.01 allows ±1% difference)
            4. **CONTAINS**: Source contains target value or vice versa
            5. **STARTS_WITH**: Field value starts with specified pattern
            6. **ENDS_WITH**: Field value ends with specified pattern

            ## EXCEPTION TYPES AND SEVERITY

            Exception types:
            - **MISSING_SOURCE**: Record exists in target but not in source (usually HIGH severity)
            - **MISSING_TARGET**: Record exists in source but not in target (usually HIGH severity)
            - **VALUE_MISMATCH**: Record found but field values differ (usually MEDIUM severity)
            - **DUPLICATE**: Multiple records found when only one expected (usually MEDIUM severity)
            - **FORMAT_ERROR**: Data format incompatible for comparison (usually LOW severity)
            - **TOLERANCE_EXCEEDED**: Numeric difference exceeds configured tolerance (severity varies by field)

            Severity assignment logic:
            - **CRITICAL**: Key field mismatches (when is_key=true in field_mapping)
            - **HIGH**: Missing records in either direction
            - **MEDIUM**: Non-key value mismatches, duplicates
            - **LOW**: Format differences, minor tolerances exceeded

            ## WORKFLOW

            Standard reconciliation workflow:
            1. Upload source and target files → uploaded_files table (status: UPLOADING → PROCESSING → PROCESSED)
            2. AI suggests field mappings → field_mappings created with high confidence scores
            3. Create/configure rule set → rule_sets with field_mappings and matching_rules
            4. Execute reconciliation → reconciliations table (status: PENDING → IN_PROGRESS → COMPLETED)
            5. Review exceptions → reconciliation_exceptions filtered by severity/type
            6. Resolve exceptions → status changes from OPEN → IN_REVIEW → RESOLVED

            ## API ENDPOINTS

            Key endpoints users might ask about:
            - POST /api/v1/files/upload - Upload files
            - GET /api/v1/files/{id}/schema - Get detected schema
            - POST /api/v1/ai/suggest-mapping - Get AI field mapping suggestions
            - POST /api/v1/rules - Create rule set
            - POST /api/v1/reconciliations - Start reconciliation
            - GET /api/v1/exceptions - List/filter exceptions
            - POST /api/v1/chat/message - Send chat message (this endpoint!)

            ## IMPORTANT GUIDELINES

            When answering questions:
            1. Always reference the ACTUAL system components (table names, field names, enum values) from above
            2. If asked about database schema, use the exact table and column names listed above
            3. If asked about how the system works, describe the actual workflow and entities
            4. Don't make up hypothetical table structures - use only what's documented above
            5. When discussing exceptions or matching, use the exact enum values (MISSING_SOURCE, FUZZY, etc.)
            6. If you don't have specific information in the context below, say so clearly

            """;
    }

    /**
     * Builds dynamic context based on the current chat session and recent activity.
     */
    public String buildDynamicContext(ChatSession session, Long organizationId) {
        StringBuilder context = new StringBuilder();

        // Add reconciliation context if session is linked to one
        if (session.getReconciliation() != null) {
            context.append(buildReconciliationContext(session.getReconciliation()));
        }

        // Add recent system activity
        context.append(buildRecentActivityContext(organizationId));

        // Add system statistics
        context.append(buildSystemStatistics(organizationId));

        return context.toString();
    }

    /**
     * Builds detailed context about a specific reconciliation.
     */
    private String buildReconciliationContext(Reconciliation rec) {
        StringBuilder sb = new StringBuilder();
        sb.append("\n## CURRENT RECONCILIATION CONTEXT\n\n");
        sb.append("Reconciliation ID: ").append(rec.getId()).append("\n");
        sb.append("Name: ").append(rec.getName()).append("\n");
        sb.append("Status: ").append(rec.getStatus()).append("\n");

        if (rec.getStatus() == ReconciliationStatus.IN_PROGRESS) {
            sb.append("Progress: ").append(rec.getProgress()).append("%\n");
        }

        if (rec.getStatus() == ReconciliationStatus.COMPLETED) {
            sb.append("Match Rate: ").append(String.format("%.2f%%", rec.getMatchRate())).append("\n");
            sb.append("Total Source Records: ").append(rec.getTotalSourceRecords()).append("\n");
            sb.append("Total Target Records: ").append(rec.getTotalTargetRecords()).append("\n");
            sb.append("Matched Records: ").append(rec.getMatchedRecords()).append("\n");
            sb.append("Unmatched Source: ").append(rec.getUnmatchedSourceRecords()).append("\n");
            sb.append("Unmatched Target: ").append(rec.getUnmatchedTargetRecords()).append("\n");
            sb.append("Total Exceptions: ").append(rec.getExceptionCount()).append("\n");
        }

        sb.append("\nSource File: ").append(rec.getSourceFile().getOriginalFilename())
          .append(" (").append(rec.getSourceFile().getRowCount()).append(" rows, ")
          .append(rec.getSourceFile().getColumnCount()).append(" columns)\n");

        sb.append("Target File: ").append(rec.getTargetFile().getOriginalFilename())
          .append(" (").append(rec.getTargetFile().getRowCount()).append(" rows, ")
          .append(rec.getTargetFile().getColumnCount()).append(" columns)\n");

        if (rec.getRuleSet() != null) {
            RuleSet ruleSet = rec.getRuleSet();
            sb.append("\nRule Set: ").append(ruleSet.getName())
              .append(" (version ").append(ruleSet.getVersion()).append(")\n");
            sb.append("Number of field mappings: ").append(ruleSet.getFieldMappings().size()).append("\n");
            sb.append("Number of matching rules: ").append(ruleSet.getMatchingRules().size()).append("\n");

            // List key fields
            List<String> keyFields = ruleSet.getFieldMappings().stream()
                    .filter(FieldMapping::getIsKey)
                    .map(fm -> fm.getSourceField() + " -> " + fm.getTargetField())
                    .collect(Collectors.toList());
            if (!keyFields.isEmpty()) {
                sb.append("Key fields for matching: ").append(String.join(", ", keyFields)).append("\n");
            }
        }

        // Add exception summary if completed
        if (rec.getStatus() == ReconciliationStatus.COMPLETED && rec.getExceptionCount() > 0) {
            sb.append("\n### Exception Breakdown\n");

            List<ReconciliationException> exceptions = exceptionRepository.findByReconciliationId(rec.getId());

            Map<ExceptionType, Long> byType = exceptions.stream()
                    .collect(Collectors.groupingBy(ReconciliationException::getType, Collectors.counting()));

            Map<ExceptionSeverity, Long> bySeverity = exceptions.stream()
                    .collect(Collectors.groupingBy(ReconciliationException::getSeverity, Collectors.counting()));

            Map<ExceptionStatus, Long> byStatus = exceptions.stream()
                    .collect(Collectors.groupingBy(ReconciliationException::getStatus, Collectors.counting()));

            sb.append("By Type: ").append(byType).append("\n");
            sb.append("By Severity: ").append(bySeverity).append("\n");
            sb.append("By Status: ").append(byStatus).append("\n");
        }

        return sb.toString();
    }

    /**
     * Builds context about recent system activity.
     */
    private String buildRecentActivityContext(Long organizationId) {
        StringBuilder sb = new StringBuilder();
        sb.append("\n## RECENT SYSTEM ACTIVITY\n\n");

        // Get last 5 reconciliations
        List<Reconciliation> recentRecs = reconciliationRepository
                .findByOrganizationIdOrderByCreatedAtDesc(organizationId)
                .stream()
                .limit(5)
                .collect(Collectors.toList());

        if (!recentRecs.isEmpty()) {
            sb.append("Last 5 reconciliations:\n");
            for (Reconciliation rec : recentRecs) {
                sb.append("- ").append(rec.getName())
                  .append(" (").append(rec.getStatus())
                  .append(", Match Rate: ").append(String.format("%.1f%%", rec.getMatchRate()))
                  .append(")\n");
            }
        }

        // Get count of active rule sets
        long activeRuleSets = ruleSetRepository.findByOrganizationIdAndActiveTrue(organizationId).size();
        sb.append("\nActive rule sets: ").append(activeRuleSets).append("\n");

        // Get count of files
        long totalFiles = fileRepository.findByOrganizationId(organizationId).size();
        sb.append("Total uploaded files: ").append(totalFiles).append("\n");

        return sb.toString();
    }

    /**
     * Builds overall system statistics.
     */
    private String buildSystemStatistics(Long organizationId) {
        StringBuilder sb = new StringBuilder();
        sb.append("\n## SYSTEM STATISTICS\n\n");

        var metrics = dashboardService.getMetrics();

        sb.append("Total reconciliations: ").append(metrics.getTotalReconciliations()).append("\n");
        sb.append("Completed: ").append(metrics.getCompletedReconciliations()).append("\n");
        sb.append("Pending: ").append(metrics.getPendingReconciliations()).append("\n");
        sb.append("Failed: ").append(metrics.getFailedReconciliations()).append("\n");
        sb.append("Overall match rate: ").append(String.format("%.2f%%", metrics.getOverallMatchRate())).append("\n");

        sb.append("\nException Summary:\n");
        sb.append("- Open exceptions: ").append(metrics.getOpenExceptions()).append("\n");
        sb.append("- Resolved exceptions: ").append(metrics.getResolvedExceptions()).append("\n");

        if (metrics.getExceptionsByType() != null && !metrics.getExceptionsByType().isEmpty()) {
            sb.append("- By type: ").append(metrics.getExceptionsByType()).append("\n");
        }

        if (metrics.getExceptionsBySeverity() != null && !metrics.getExceptionsBySeverity().isEmpty()) {
            sb.append("- By severity: ").append(metrics.getExceptionsBySeverity()).append("\n");
        }

        return sb.toString();
    }

    /**
     * Analyzes the user's message and determines what additional context might be needed.
     * This is a simple keyword-based approach that can be enhanced with more sophisticated NLP.
     */
    public String buildSmartContext(String userMessage, Long organizationId) {
        StringBuilder context = new StringBuilder();
        String messageLower = userMessage.toLowerCase();

        // If asking about specific reconciliation
        if (messageLower.contains("reconciliation") &&
            (messageLower.contains("latest") || messageLower.contains("recent") || messageLower.contains("last"))) {

            List<Reconciliation> recent = reconciliationRepository
                    .findByOrganizationIdOrderByCreatedAtDesc(organizationId)
                    .stream()
                    .limit(3)
                    .collect(Collectors.toList());

            if (!recent.isEmpty()) {
                context.append("\n## RECENT RECONCILIATIONS (for reference)\n\n");
                for (Reconciliation rec : recent) {
                    context.append("- ID: ").append(rec.getId())
                          .append(", Name: ").append(rec.getName())
                          .append(", Status: ").append(rec.getStatus())
                          .append(", Match Rate: ").append(String.format("%.1f%%", rec.getMatchRate()))
                          .append("\n");
                }
            }
        }

        // If asking about exceptions
        if (messageLower.contains("exception")) {
            // Get exception counts from dashboard service which already has this logic
            var dashMetrics = dashboardService.getMetrics();

            context.append("\n## EXCEPTION OVERVIEW\n\n");
            context.append("Open exceptions: ").append(dashMetrics.getOpenExceptions()).append("\n");
            context.append("Resolved exceptions: ").append(dashMetrics.getResolvedExceptions()).append("\n");

            if (dashMetrics.getExceptionsByType() != null && !dashMetrics.getExceptionsByType().isEmpty()) {
                context.append("By type: ").append(dashMetrics.getExceptionsByType()).append("\n");
            }

            if (dashMetrics.getExceptionsBySeverity() != null && !dashMetrics.getExceptionsBySeverity().isEmpty()) {
                context.append("By severity: ").append(dashMetrics.getExceptionsBySeverity()).append("\n");
            }
        }

        // If asking about rules
        if (messageLower.contains("rule") && !messageLower.contains("matching rule")) {
            List<RuleSet> ruleSets = ruleSetRepository.findByOrganizationIdAndActiveTrue(organizationId);

            if (!ruleSets.isEmpty()) {
                context.append("\n## ACTIVE RULE SETS\n\n");
                for (RuleSet rs : ruleSets) {
                    context.append("- ").append(rs.getName())
                          .append(" (v").append(rs.getVersion())
                          .append(", ").append(rs.getFieldMappings().size()).append(" mappings, ")
                          .append(rs.getMatchingRules().size()).append(" rules")
                          .append(")\n");
                }
            }
        }

        return context.toString();
    }
}
