package com.amit.smartreconciliation.dto.request;

import com.amit.smartreconciliation.enums.MatchType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

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

    public MatchingRuleRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSourceField() { return sourceField; }
    public void setSourceField(String sourceField) { this.sourceField = sourceField; }
    public String getTargetField() { return targetField; }
    public void setTargetField(String targetField) { this.targetField = targetField; }
    public MatchType getMatchType() { return matchType; }
    public void setMatchType(MatchType matchType) { this.matchType = matchType; }
    public Double getTolerance() { return tolerance; }
    public void setTolerance(Double tolerance) { this.tolerance = tolerance; }
    public Double getFuzzyThreshold() { return fuzzyThreshold; }
    public void setFuzzyThreshold(Double fuzzyThreshold) { this.fuzzyThreshold = fuzzyThreshold; }
    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }
    public Map<String, Object> getConfig() { return config; }
    public void setConfig(Map<String, Object> config) { this.config = config; }
}
