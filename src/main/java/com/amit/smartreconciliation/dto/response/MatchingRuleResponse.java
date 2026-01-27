package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.MatchingRule;
import com.amit.smartreconciliation.enums.MatchType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchingRuleResponse {
    private Long id;
    private String name;
    private String description;
    private String sourceField;
    private String targetField;
    private MatchType matchType;
    private Double tolerance;
    private Double fuzzyThreshold;
    private Integer priority;
    private Boolean active;
    private Map<String, Object> config;

    public static MatchingRuleResponse fromEntity(MatchingRule entity) {
        return MatchingRuleResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .sourceField(entity.getSourceField())
                .targetField(entity.getTargetField())
                .matchType(entity.getMatchType())
                .tolerance(entity.getTolerance())
                .fuzzyThreshold(entity.getFuzzyThreshold())
                .priority(entity.getPriority())
                .active(entity.getActive())
                .config(entity.getConfig())
                .build();
    }
}
