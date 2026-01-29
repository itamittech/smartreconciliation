package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.ReconciliationException;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import java.time.LocalDateTime;
import java.util.Map;

public class ReconciliationExceptionResponse {
    private Long id;
    private ExceptionType type;
    private ExceptionSeverity severity;
    private ExceptionStatus status;
    private String description;
    private String fieldName;
    private String sourceValue;
    private String targetValue;
    private Map<String, Object> sourceData;
    private Map<String, Object> targetData;
    private String aiSuggestion;
    private String resolution;
    private String resolvedBy;
    private LocalDateTime resolvedAt;
    private Long reconciliationId;
    private String reconciliationName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReconciliationExceptionResponse() {}

    public static ReconciliationExceptionResponse fromEntity(ReconciliationException entity) {
        ReconciliationExceptionResponse r = new ReconciliationExceptionResponse();
        r.id = entity.getId();
        r.type = entity.getType();
        r.severity = entity.getSeverity();
        r.status = entity.getStatus();
        r.description = entity.getDescription();
        r.fieldName = entity.getFieldName();
        r.sourceValue = entity.getSourceValue();
        r.targetValue = entity.getTargetValue();
        r.sourceData = entity.getSourceData();
        r.targetData = entity.getTargetData();
        r.aiSuggestion = entity.getAiSuggestion();
        r.resolution = entity.getResolution();
        r.resolvedBy = entity.getResolvedBy();
        r.resolvedAt = entity.getResolvedAt();
        r.reconciliationId = entity.getReconciliation().getId();
        r.reconciliationName = entity.getReconciliation().getName();
        r.createdAt = entity.getCreatedAt();
        r.updatedAt = entity.getUpdatedAt();
        return r;
    }

    public Long getId() { return id; }
    public ExceptionType getType() { return type; }
    public ExceptionSeverity getSeverity() { return severity; }
    public ExceptionStatus getStatus() { return status; }
    public String getDescription() { return description; }
    public String getFieldName() { return fieldName; }
    public String getSourceValue() { return sourceValue; }
    public String getTargetValue() { return targetValue; }
    public Map<String, Object> getSourceData() { return sourceData; }
    public Map<String, Object> getTargetData() { return targetData; }
    public String getAiSuggestion() { return aiSuggestion; }
    public String getResolution() { return resolution; }
    public String getResolvedBy() { return resolvedBy; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public Long getReconciliationId() { return reconciliationId; }
    public String getReconciliationName() { return reconciliationName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
