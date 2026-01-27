package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.MatchingRule;
import com.amit.smartreconciliation.enums.MatchType;
import java.util.Map;

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

    public MatchingRuleResponse() {}

    public static MatchingRuleResponse fromEntity(MatchingRule entity) {
        MatchingRuleResponse r = new MatchingRuleResponse();
        r.id = entity.getId();
        r.name = entity.getName();
        r.description = entity.getDescription();
        r.sourceField = entity.getSourceField();
        r.targetField = entity.getTargetField();
        r.matchType = entity.getMatchType();
        r.tolerance = entity.getTolerance();
        r.fuzzyThreshold = entity.getFuzzyThreshold();
        r.priority = entity.getPriority();
        r.active = entity.getActive();
        r.config = entity.getConfig();
        return r;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getSourceField() { return sourceField; }
    public String getTargetField() { return targetField; }
    public MatchType getMatchType() { return matchType; }
    public Double getTolerance() { return tolerance; }
    public Double getFuzzyThreshold() { return fuzzyThreshold; }
    public Integer getPriority() { return priority; }
    public Boolean getActive() { return active; }
    public Map<String, Object> getConfig() { return config; }
}
