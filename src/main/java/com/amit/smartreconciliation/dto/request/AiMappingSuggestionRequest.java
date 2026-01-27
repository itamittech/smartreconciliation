package com.amit.smartreconciliation.dto.request;

import jakarta.validation.constraints.NotNull;

public class AiMappingSuggestionRequest {
    @NotNull(message = "Source file ID is required")
    private Long sourceFileId;
    @NotNull(message = "Target file ID is required")
    private Long targetFileId;

    public AiMappingSuggestionRequest() {}

    public Long getSourceFileId() { return sourceFileId; }
    public void setSourceFileId(Long sourceFileId) { this.sourceFileId = sourceFileId; }
    public Long getTargetFileId() { return targetFileId; }
    public void setTargetFileId(Long targetFileId) { this.targetFileId = targetFileId; }
}
