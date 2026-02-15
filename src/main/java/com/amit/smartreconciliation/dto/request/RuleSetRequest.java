package com.amit.smartreconciliation.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;

public class RuleSetRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String description;
    private Boolean isAiGenerated;
    private List<FieldMappingRequest> fieldMappings;
    private List<MatchingRuleRequest> matchingRules;
    private Map<String, Object> metadata;

    public RuleSetRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsAiGenerated() { return isAiGenerated; }
    public void setIsAiGenerated(Boolean isAiGenerated) { this.isAiGenerated = isAiGenerated; }
    public List<FieldMappingRequest> getFieldMappings() { return fieldMappings; }
    public void setFieldMappings(List<FieldMappingRequest> fieldMappings) { this.fieldMappings = fieldMappings; }
    public List<MatchingRuleRequest> getMatchingRules() { return matchingRules; }
    public void setMatchingRules(List<MatchingRuleRequest> matchingRules) { this.matchingRules = matchingRules; }
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
