package com.amit.smartreconciliation.dto.request;

import com.amit.smartreconciliation.enums.MatchType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchingRuleRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotBlank(message = "Source field is required")
    private String sourceField;

    @NotBlank(message = "Target field is required")
    private String targetField;

    @NotNull(message = "Match type is required")
    private MatchType matchType;

    private Double tolerance;

    private Double fuzzyThreshold;

    private Integer priority;

    private Map<String, Object> config;
}
