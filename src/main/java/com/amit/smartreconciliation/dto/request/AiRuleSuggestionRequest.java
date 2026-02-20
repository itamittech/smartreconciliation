package com.amit.smartreconciliation.dto.request;

import com.amit.smartreconciliation.dto.response.AiMappingSuggestionResponse;
import com.amit.smartreconciliation.enums.KnowledgeDomain;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class AiRuleSuggestionRequest {

    @NotNull
    private Long sourceFileId;

    @NotNull
    private Long targetFileId;

    private List<AiMappingSuggestionResponse.SuggestedMapping> mappings;
    private KnowledgeDomain domain;

    public Long getSourceFileId() { return sourceFileId; }
    public void setSourceFileId(Long sourceFileId) { this.sourceFileId = sourceFileId; }

    public Long getTargetFileId() { return targetFileId; }
    public void setTargetFileId(Long targetFileId) { this.targetFileId = targetFileId; }

    public List<AiMappingSuggestionResponse.SuggestedMapping> getMappings() { return mappings; }
    public void setMappings(List<AiMappingSuggestionResponse.SuggestedMapping> mappings) { this.mappings = mappings; }

    public KnowledgeDomain getDomain() { return domain; }
    public void setDomain(KnowledgeDomain domain) { this.domain = domain; }
}
