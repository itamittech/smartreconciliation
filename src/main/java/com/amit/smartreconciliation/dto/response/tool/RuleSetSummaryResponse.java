package com.amit.smartreconciliation.dto.response.tool;

import com.amit.smartreconciliation.entity.RuleSet;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Rule set summary for list operations.
 */
public record RuleSetSummaryResponse(
    @JsonProperty("id")
    Long id,

    @JsonProperty("name")
    String name,

    @JsonProperty("description")
    String description,

    @JsonProperty("active")
    Boolean active,

    @JsonProperty("version")
    Integer version,

    @JsonProperty("mapping_count")
    Integer mappingCount,

    @JsonProperty("rule_count")
    Integer ruleCount,

    @JsonProperty("is_ai_generated")
    Boolean isAiGenerated,

    @JsonProperty("created_at")
    String createdAt
) {
    public static RuleSetSummaryResponse fromEntity(RuleSet ruleSet) {
        return new RuleSetSummaryResponse(
            ruleSet.getId(),
            ruleSet.getName(),
            ruleSet.getDescription(),
            ruleSet.getActive(),
            ruleSet.getVersion(),
            ruleSet.getFieldMappings() != null ? ruleSet.getFieldMappings().size() : 0,
            ruleSet.getMatchingRules() != null ? ruleSet.getMatchingRules().size() : 0,
            ruleSet.getIsAiGenerated(),
            ruleSet.getCreatedAt() != null ? ruleSet.getCreatedAt().toString() : null
        );
    }
}
