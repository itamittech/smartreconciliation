package com.amit.smartreconciliation.dto.request;

import com.amit.smartreconciliation.dto.response.AiMappingSuggestionResponse;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class AiRuleSuggestionRequest {

    @NotNull
    private Long sourceFileId;

    @NotNull
    private Long targetFileId;

    private List<AiMappingSuggestionResponse.SuggestedMapping> mappings;

    public Long getSourceFileId() { return sourceFileId; }
    public void setSourceFileId(Long sourceFileId) { this.sourceFileId = sourceFileId; }

    public Long getTargetFileId() { return targetFileId; }
    public void setTargetFileId(Long targetFileId) { this.targetFileId = targetFileId; }

    public List<AiMappingSuggestionResponse.SuggestedMapping> getMappings() { return mappings; }
    public void setMappings(List<AiMappingSuggestionResponse.SuggestedMapping> mappings) { this.mappings = mappings; }
}
