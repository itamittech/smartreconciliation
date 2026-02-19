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
    private final PromptTemplateService promptTemplateService;

    public ChatContextService(ReconciliationRepository reconciliationRepository,
                             ReconciliationExceptionRepository exceptionRepository,
                             RuleSetRepository ruleSetRepository,
                             UploadedFileRepository fileRepository,
                             DashboardService dashboardService,
                             PromptTemplateService promptTemplateService) {
        this.reconciliationRepository = reconciliationRepository;
        this.exceptionRepository = exceptionRepository;
        this.ruleSetRepository = ruleSetRepository;
        this.fileRepository = fileRepository;
        this.dashboardService = dashboardService;
        this.promptTemplateService = promptTemplateService;
    }

    /**
     * Builds comprehensive system knowledge that describes how Smart Reconciliation works.
     * This is static knowledge that should be included in every AI chat interaction.
     */
    public String buildSystemKnowledge() {
        return promptTemplateService.loadTemplate("prompts/chat/system-knowledge.st");
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

