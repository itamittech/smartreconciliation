package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.enums.KnowledgeDomain;
import com.amit.smartreconciliation.enums.ReconciliationStatus;
import java.time.LocalDateTime;
import java.util.Map;

public class ReconciliationResponse {
    private Long id;
    private String name;
    private String description;
    private ReconciliationStatus status;
    private KnowledgeDomain domain;
    private Long sourceFileId;
    private String sourceFileName;
    private Long targetFileId;
    private String targetFileName;
    private Long ruleSetId;
    private String ruleSetName;
    private Integer totalSourceRecords;
    private Integer totalTargetRecords;
    private Integer matchedRecords;
    private Integer unmatchedSourceRecords;
    private Integer unmatchedTargetRecords;
    private Integer exceptionCount;
    private Double matchRate;
    private Integer progress;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Map<String, Object> results;
    private Map<String, Object> statistics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReconciliationResponse() {}

    public static ReconciliationResponse fromEntity(Reconciliation entity) {
        ReconciliationResponse r = new ReconciliationResponse();
        r.id = entity.getId();
        r.name = entity.getName();
        r.description = entity.getDescription();
        r.status = entity.getStatus();
        r.domain = entity.getDomain();
        r.sourceFileId = entity.getSourceFile() != null ? entity.getSourceFile().getId() : null;
        r.sourceFileName = entity.getSourceFile() != null ? entity.getSourceFile().getOriginalFilename() : null;
        r.targetFileId = entity.getTargetFile() != null ? entity.getTargetFile().getId() : null;
        r.targetFileName = entity.getTargetFile() != null ? entity.getTargetFile().getOriginalFilename() : null;
        r.ruleSetId = entity.getRuleSet() != null ? entity.getRuleSet().getId() : null;
        r.ruleSetName = entity.getRuleSet() != null ? entity.getRuleSet().getName() : null;
        r.totalSourceRecords = entity.getTotalSourceRecords();
        r.totalTargetRecords = entity.getTotalTargetRecords();
        r.matchedRecords = entity.getMatchedRecords();
        r.unmatchedSourceRecords = entity.getUnmatchedSourceRecords();
        r.unmatchedTargetRecords = entity.getUnmatchedTargetRecords();
        r.exceptionCount = entity.getExceptionCount();
        r.matchRate = entity.getMatchRate();
        r.progress = entity.getProgress();
        r.errorMessage = entity.getErrorMessage();
        r.startedAt = entity.getStartedAt();
        r.completedAt = entity.getCompletedAt();
        r.results = entity.getResults();
        r.statistics = entity.getStatistics();
        r.createdAt = entity.getCreatedAt();
        r.updatedAt = entity.getUpdatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public ReconciliationStatus getStatus() { return status; }
    public KnowledgeDomain getDomain() { return domain; }
    public Long getSourceFileId() { return sourceFileId; }
    public String getSourceFileName() { return sourceFileName; }
    public Long getTargetFileId() { return targetFileId; }
    public String getTargetFileName() { return targetFileName; }
    public Long getRuleSetId() { return ruleSetId; }
    public String getRuleSetName() { return ruleSetName; }
    public Integer getTotalSourceRecords() { return totalSourceRecords; }
    public Integer getTotalTargetRecords() { return totalTargetRecords; }
    public Integer getMatchedRecords() { return matchedRecords; }
    public Integer getUnmatchedSourceRecords() { return unmatchedSourceRecords; }
    public Integer getUnmatchedTargetRecords() { return unmatchedTargetRecords; }
    public Integer getExceptionCount() { return exceptionCount; }
    public Double getMatchRate() { return matchRate; }
    public Integer getProgress() { return progress; }
    public String getErrorMessage() { return errorMessage; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public Map<String, Object> getResults() { return results; }
    public Map<String, Object> getStatistics() { return statistics; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
