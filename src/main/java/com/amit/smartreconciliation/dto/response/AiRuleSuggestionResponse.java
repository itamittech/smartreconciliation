package com.amit.smartreconciliation.dto.response;

import java.util.List;

public class AiRuleSuggestionResponse {
    private List<SuggestedRule> rules;
    private String explanation;

    public AiRuleSuggestionResponse() {}

    public List<SuggestedRule> getRules() { return rules; }
    public void setRules(List<SuggestedRule> rules) { this.rules = rules; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public static class SuggestedRule {
        private String name;
        private String sourceField;
        private String targetField;
        private String matchType;  // EXACT, FUZZY, RANGE, CONTAINS, STARTS_WITH, ENDS_WITH
        private Boolean isKey;
        private Double fuzzyThreshold;
        private Double tolerance;
        private Integer priority;
        private String reason;

        public SuggestedRule() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSourceField() { return sourceField; }
        public void setSourceField(String sourceField) { this.sourceField = sourceField; }
        public String getTargetField() { return targetField; }
        public void setTargetField(String targetField) { this.targetField = targetField; }
        public String getMatchType() { return matchType; }
        public void setMatchType(String matchType) { this.matchType = matchType; }
        public Boolean getIsKey() { return isKey; }
        public void setIsKey(Boolean isKey) { this.isKey = isKey; }
        public Double getFuzzyThreshold() { return fuzzyThreshold; }
        public void setFuzzyThreshold(Double fuzzyThreshold) { this.fuzzyThreshold = fuzzyThreshold; }
        public Double getTolerance() { return tolerance; }
        public void setTolerance(Double tolerance) { this.tolerance = tolerance; }
        public Integer getPriority() { return priority; }
        public void setPriority(Integer priority) { this.priority = priority; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
