package com.amit.smartreconciliation.service.tool;

import com.amit.smartreconciliation.dto.response.ReconciliationExceptionResponse;
import com.amit.smartreconciliation.dto.response.tool.ExceptionSummaryResponse;
import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.entity.ReconciliationException;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.repository.ReconciliationExceptionRepository;
import com.amit.smartreconciliation.repository.ReconciliationRepository;
import com.amit.smartreconciliation.service.ExceptionService;
import com.amit.smartreconciliation.service.OrganizationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 🛠️ EXCEPTION TOOLS (Agentic AI)
 *
 * Provides AI chat with the ability to query and analyze reconciliation exceptions.
 */
@Component
public class ExceptionTools {

    private static final Logger log = LoggerFactory.getLogger(ExceptionTools.class);

    private final ReconciliationExceptionRepository exceptionRepository;
    private final ReconciliationRepository reconciliationRepository;
    private final ExceptionService exceptionService;
    private final OrganizationService organizationService;

    public ExceptionTools(ReconciliationExceptionRepository exceptionRepository,
                         ReconciliationRepository reconciliationRepository,
                         ExceptionService exceptionService,
                         OrganizationService organizationService) {
        this.exceptionRepository = exceptionRepository;
        this.reconciliationRepository = reconciliationRepository;
        this.exceptionService = exceptionService;
        this.organizationService = organizationService;
    }

    @Tool(description = "Lists exceptions with optional filters for reconciliation, type, severity, and status. Use this when the user asks about exceptions, errors, discrepancies, or mismatches.")
    public List<ExceptionSummaryResponse> listExceptions(
            @ToolParam(description = "Filter by reconciliation ID. Leave null to get exceptions across all reconciliations.") Long reconciliationId,
            @ToolParam(description = "Filter by exception type: MISSING_SOURCE, MISSING_TARGET, VALUE_MISMATCH, DUPLICATE, FORMAT_ERROR, TOLERANCE_EXCEEDED. Leave null for all types.") String exceptionType,
            @ToolParam(description = "Filter by severity: CRITICAL, HIGH, MEDIUM, LOW. Leave null for all severities.") String severity,
            @ToolParam(description = "Filter by status: OPEN, IN_REVIEW, RESOLVED, IGNORED. Leave null for all statuses.") String status,
            @ToolParam(description = "Maximum results to return (1-100). Defaults to 20 if null.") Integer limit) {

        log.info("🤖 Tool Call: listExceptions(reconciliationId={}, type={}, severity={}, status={}, limit={})",
                reconciliationId, exceptionType, severity, status, limit);

        Long orgId = organizationService.getDefaultOrganization().getId();
        List<ReconciliationException> exceptions;

        // Get exceptions
        if (reconciliationId != null) {
            exceptions = exceptionRepository.findByReconciliationId(reconciliationId);
        } else {
            // Get all exceptions for organization
            List<Reconciliation> orgReconciliations = reconciliationRepository.findByOrganizationId(orgId);
            exceptions = orgReconciliations.stream()
                    .flatMap(r -> exceptionRepository.findByReconciliationId(r.getId()).stream())
                    .collect(Collectors.toList());
        }

        // Apply type filter
        if (exceptionType != null && !exceptionType.isBlank()) {
            try {
                ExceptionType typeEnum = ExceptionType.valueOf(exceptionType.toUpperCase());
                exceptions = exceptions.stream()
                        .filter(e -> e.getType() == typeEnum)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid exception type filter: {}", exceptionType);
            }
        }

        // Apply severity filter
        if (severity != null && !severity.isBlank()) {
            try {
                ExceptionSeverity severityEnum = ExceptionSeverity.valueOf(severity.toUpperCase());
                exceptions = exceptions.stream()
                        .filter(e -> e.getSeverity() == severityEnum)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid severity filter: {}", severity);
            }
        }

        // Apply status filter
        if (status != null && !status.isBlank()) {
            try {
                ExceptionStatus statusEnum = ExceptionStatus.valueOf(status.toUpperCase());
                exceptions = exceptions.stream()
                        .filter(e -> e.getStatus() == statusEnum)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status filter: {}", status);
            }
        }

        // Apply limit
        int maxResults = (limit != null && limit > 0 && limit <= 100) ? limit : 20;
        return exceptions.stream()
                .limit(maxResults)
                .map(ExceptionSummaryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Tool(description = "Gets full details of a specific exception including source and target record data, field mismatches, and AI suggestions. Use this when the user asks for details about a specific exception.")
    public ReconciliationExceptionResponse getExceptionDetails(
            @ToolParam(description = "The exception ID to retrieve") Long exceptionId) {

        log.info("🤖 Tool Call: getExceptionDetails(id={})", exceptionId);

        if (exceptionId == null) {
            throw new IllegalArgumentException("Exception ID is required");
        }

        return exceptionService.getById(exceptionId);
    }
}
