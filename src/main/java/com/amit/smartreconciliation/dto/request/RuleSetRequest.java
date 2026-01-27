package com.amit.smartreconciliation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleSetRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    private List<FieldMappingRequest> fieldMappings;

    private List<MatchingRuleRequest> matchingRules;

    private Map<String, Object> metadata;
}
