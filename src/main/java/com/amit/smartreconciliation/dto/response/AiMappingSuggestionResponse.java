package com.amit.smartreconciliation.dto.response;

import java.util.List;

public class AiMappingSuggestionResponse {
    private List<SuggestedMapping> mappings;
    private String explanation;

    public AiMappingSuggestionResponse() {}

    public AiMappingSuggestionResponse(List<SuggestedMapping> mappings, String explanation) {
        this.mappings = mappings;
        this.explanation = explanation;
    }

    public List<SuggestedMapping> getMappings() { return mappings; }
    public void setMappings(List<SuggestedMapping> mappings) { this.mappings = mappings; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final AiMappingSuggestionResponse r = new AiMappingSuggestionResponse();
        public Builder mappings(List<SuggestedMapping> v) { r.mappings = v; return this; }
        public Builder explanation(String v) { r.explanation = v; return this; }
        public AiMappingSuggestionResponse build() { return r; }
    }

    public static class SuggestedMapping {
        private String sourceField;
        private String targetField;
        private Double confidence;
        private String reason;
        private Boolean isKey;
        private String suggestedTransform;

        public SuggestedMapping() {}

        public SuggestedMapping(String sourceField, String targetField, Double confidence,
                               String reason, Boolean isKey, String suggestedTransform) {
            this.sourceField = sourceField;
            this.targetField = targetField;
            this.confidence = confidence;
            this.reason = reason;
            this.isKey = isKey;
            this.suggestedTransform = suggestedTransform;
        }

        public String getSourceField() { return sourceField; }
        public void setSourceField(String sourceField) { this.sourceField = sourceField; }
        public String getTargetField() { return targetField; }
        public void setTargetField(String targetField) { this.targetField = targetField; }
        public Double getConfidence() { return confidence; }
        public void setConfidence(Double confidence) { this.confidence = confidence; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public Boolean getIsKey() { return isKey; }
        public void setIsKey(Boolean isKey) { this.isKey = isKey; }
        public String getSuggestedTransform() { return suggestedTransform; }
        public void setSuggestedTransform(String suggestedTransform) { this.suggestedTransform = suggestedTransform; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private final SuggestedMapping r = new SuggestedMapping();
            public Builder sourceField(String v) { r.sourceField = v; return this; }
            public Builder targetField(String v) { r.targetField = v; return this; }
            public Builder confidence(Double v) { r.confidence = v; return this; }
            public Builder reason(String v) { r.reason = v; return this; }
            public Builder isKey(Boolean v) { r.isKey = v; return this; }
            public Builder suggestedTransform(String v) { r.suggestedTransform = v; return this; }
            public SuggestedMapping build() { return r; }
        }
    }
}
