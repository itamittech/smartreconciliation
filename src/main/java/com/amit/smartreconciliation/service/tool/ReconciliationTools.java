package com.amit.smartreconciliation.service.tool;

import com.amit.smartreconciliation.dto.response.ReconciliationResponse;
import com.amit.smartreconciliation.dto.response.tool.ReconciliationDetailsResponse;
import com.amit.smartreconciliation.dto.response.tool.ReconciliationSummaryResponse;
import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.enums.ReconciliationStatus;
import com.amit.smartreconciliation.repository.ReconciliationRepository;
import com.amit.smartreconciliation.service.OrganizationService;
import com.amit.smartreconciliation.service.ReconciliationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 🛠️ RECONCILIATION TOOLS (Agentic AI)
 *
 * Provides AI chat with the ability to query and manage reconciliations.
 * Uses Spring AI's @Tool annotation for automatic function discovery.
 */
@Component
public class ReconciliationTools {

    private static final Logger log = LoggerFactory.getLogger(ReconciliationTools.class);

    private final ReconciliationRepository reconciliationRepository;
    private final ReconciliationService reconciliationService;
    private final OrganizationService organizationService;

    public ReconciliationTools(ReconciliationRepository reconciliationRepository,
                              ReconciliationService reconciliationService,
                              OrganizationService organizationService) {
        this.reconciliationRepository = reconciliationRepository;
        this.reconciliationService = reconciliationService;
        this.organizationService = organizationService;
    }

    @Tool(description = "Retrieves detailed information about a specific reconciliation including status, progress, match rate, file details, and statistics. Use this when the user asks about a specific reconciliation by ID or name.")
    public ReconciliationDetailsResponse getReconciliation(
            @ToolParam(description = "The unique ID of the reconciliation to retrieve") Long reconciliationId) {

        log.info("🤖 Tool Call: getReconciliation(id={})", reconciliationId);

        if (reconciliationId == null) {
            throw new IllegalArgumentException("Reconciliation ID is required");
        }

        return reconciliationRepository.findById(reconciliationId)
                .map(ReconciliationDetailsResponse::fromEntity)
                .orElseThrow(() -> new IllegalArgumentException("Reconciliation not found with ID: " + reconciliationId));
    }

    @Tool(description = "Lists reconciliations with optional filters for status and search term. Returns up to 50 results ordered by creation date. Use this when the user asks for a list of reconciliations, recent reconciliations, or reconciliations with specific status.")
    public List<ReconciliationSummaryResponse> listReconciliations(
            @ToolParam(description = "Filter by status: PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED. Leave null for all statuses.") String status,
            @ToolParam(description = "Search by name or description (case-insensitive). Leave null to skip search filter.") String searchTerm,
            @ToolParam(description = "Maximum number of results to return (1-50). Defaults to 10 if null.") Integer limit) {

        log.info("🤖 Tool Call: listReconciliations(status={}, searchTerm={}, limit={})", status, searchTerm, limit);

        Long orgId = organizationService.getDefaultOrganization().getId();
        List<Reconciliation> reconciliations = reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);

        // Apply status filter
        if (status != null && !status.isBlank()) {
            try {
                ReconciliationStatus statusEnum = ReconciliationStatus.valueOf(status.toUpperCase());
                reconciliations = reconciliations.stream()
                        .filter(r -> r.getStatus() == statusEnum)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status filter: {}", status);
            }
        }

        // Apply search filter
        if (searchTerm != null && !searchTerm.isBlank()) {
            String searchLower = searchTerm.toLowerCase();
            reconciliations = reconciliations.stream()
                    .filter(r -> r.getName().toLowerCase().contains(searchLower) ||
                                (r.getDescription() != null && r.getDescription().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        // Apply limit
        int maxResults = (limit != null && limit > 0 && limit <= 50) ? limit : 10;
        return reconciliations.stream()
                .limit(maxResults)
                .map(ReconciliationSummaryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Tool(description = "Gets the current status and progress of a reconciliation. Use this when the user asks if a reconciliation is complete, what the progress is, or the current state.")
    public ReconciliationResponse getReconciliationStatus(
            @ToolParam(description = "The reconciliation ID to check status for") Long reconciliationId) {

        log.info("🤖 Tool Call: getReconciliationStatus(id={})", reconciliationId);

        if (reconciliationId == null) {
            throw new IllegalArgumentException("Reconciliation ID is required");
        }

        return reconciliationService.getStatus(reconciliationId);
    }
}
