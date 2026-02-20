package com.amit.smartreconciliation.dto.request;

import com.amit.smartreconciliation.enums.KnowledgeDomain;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReconciliationRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String description;
    @NotNull(message = "Source file ID is required")
    private Long sourceFileId;
    @NotNull(message = "Target file ID is required")
    private Long targetFileId;
    @NotNull(message = "Rule set ID is required")
    private Long ruleSetId;
    private KnowledgeDomain domain;

    public ReconciliationRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getSourceFileId() { return sourceFileId; }
    public void setSourceFileId(Long sourceFileId) { this.sourceFileId = sourceFileId; }
    public Long getTargetFileId() { return targetFileId; }
    public void setTargetFileId(Long targetFileId) { this.targetFileId = targetFileId; }
    public Long getRuleSetId() { return ruleSetId; }
    public void setRuleSetId(Long ruleSetId) { this.ruleSetId = ruleSetId; }
    public KnowledgeDomain getDomain() { return domain; }
    public void setDomain(KnowledgeDomain domain) { this.domain = domain; }
}
