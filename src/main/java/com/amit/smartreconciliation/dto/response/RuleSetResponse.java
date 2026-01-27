package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.RuleSet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleSetResponse {
    private Long id;
    private String name;
    private String description;
    private Integer version;
    private Boolean isAiGenerated;
    private Boolean active;
    private List<FieldMappingResponse> fieldMappings;
    private List<MatchingRuleResponse> matchingRules;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RuleSetResponse fromEntity(RuleSet entity) {
        return RuleSetResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .version(entity.getVersion())
                .isAiGenerated(entity.getIsAiGenerated())
                .active(entity.getActive())
                .fieldMappings(entity.getFieldMappings() != null ?
                        entity.getFieldMappings().stream()
                                .map(FieldMappingResponse::fromEntity)
                                .collect(Collectors.toList()) : null)
                .matchingRules(entity.getMatchingRules() != null ?
                        entity.getMatchingRules().stream()
                                .map(MatchingRuleResponse::fromEntity)
                                .collect(Collectors.toList()) : null)
                .metadata(entity.getMetadata())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
