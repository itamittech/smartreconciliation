package com.amit.smartreconciliation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiMappingSuggestionResponse {
    private List<SuggestedMapping> mappings;
    private String explanation;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuggestedMapping {
        private String sourceField;
        private String targetField;
        private Double confidence;
        private String reason;
        private Boolean isKey;
        private String suggestedTransform;
    }
}
