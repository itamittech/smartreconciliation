package com.amit.smartreconciliation.service.tool;

import com.amit.smartreconciliation.dto.response.RuleSetResponse;
import com.amit.smartreconciliation.dto.response.tool.RuleSetSummaryResponse;
import com.amit.smartreconciliation.entity.RuleSet;
import com.amit.smartreconciliation.repository.RuleSetRepository;
import com.amit.smartreconciliation.service.OrganizationService;
import com.amit.smartreconciliation.service.RuleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 🛠️ RULE SET TOOLS (Agentic AI)
 *
 * Provides AI chat with the ability to query rule sets and their configurations.
 */
@Component
public class RuleSetTools {

    private static final Logger log = LoggerFactory.getLogger(RuleSetTools.class);

    private final RuleSetRepository ruleSetRepository;
    private final RuleService ruleService;
    private final OrganizationService organizationService;

    public RuleSetTools(RuleSetRepository ruleSetRepository,
                       RuleService ruleService,
                       OrganizationService organizationService) {
        this.ruleSetRepository = ruleSetRepository;
        this.ruleService = ruleService;
        this.organizationService = organizationService;
    }

    @Tool(description = "Lists all rule sets with optional filter for active status. Rule sets contain field mappings and matching rules used for reconciliation. Use this when the user asks about available rule sets, reconciliation rules, or field mappings.")
    public List<RuleSetSummaryResponse> listRuleSets(
            @ToolParam(description = "Filter by active status. Set to true for only active rule sets, false for only inactive, or null for all rule sets.") Boolean activeOnly) {

        log.info("🤖 Tool Call: listRuleSets(activeOnly={})", activeOnly);

        Long orgId = organizationService.getDefaultOrganization().getId();
        List<RuleSet> ruleSets;

        if (activeOnly != null && activeOnly) {
            ruleSets = ruleSetRepository.findByOrganizationIdAndActiveTrue(orgId);
        } else {
            ruleSets = ruleSetRepository.findByOrganizationId(orgId);
            // If activeOnly is false, filter for inactive only
            if (activeOnly != null && !activeOnly) {
                ruleSets = ruleSets.stream()
                        .filter(rs -> !rs.getActive())
                        .collect(Collectors.toList());
            }
        }

        return ruleSets.stream()
                .map(RuleSetSummaryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Tool(description = "Gets complete details of a specific rule set including all field mappings and matching rules. Field mappings define how source and target fields correspond, while matching rules define the comparison logic (exact match, fuzzy match, tolerance, etc.). Use this when the user asks about the configuration of a specific rule set or how reconciliation matching works.")
    public RuleSetResponse getRuleSetDetails(
            @ToolParam(description = "The rule set ID to retrieve") Long ruleSetId) {

        log.info("🤖 Tool Call: getRuleSetDetails(id={})", ruleSetId);

        if (ruleSetId == null) {
            throw new IllegalArgumentException("Rule set ID is required");
        }

        return ruleService.getById(ruleSetId);
    }
}
