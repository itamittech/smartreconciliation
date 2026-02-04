package com.amit.smartreconciliation.entity;

import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "reconciliation_exceptions")
public class ReconciliationException {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExceptionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExceptionSeverity severity = ExceptionSeverity.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExceptionStatus status = ExceptionStatus.OPEN;

    private String description;
    private String fieldName;
    private String sourceValue;
    private String targetValue;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> sourceData;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> targetData;

    private String aiSuggestion;
    private String resolution;
    private String resolvedBy;
    private LocalDateTime resolvedAt;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime ignoredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reconciliation_id", nullable = false)
    private Reconciliation reconciliation;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public ReconciliationException() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ExceptionType getType() { return type; }
    public void setType(ExceptionType type) { this.type = type; }

    public ExceptionSeverity getSeverity() { return severity; }
    public void setSeverity(ExceptionSeverity severity) { this.severity = severity; }

    public ExceptionStatus getStatus() { return status; }
    public void setStatus(ExceptionStatus status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }

    public String getSourceValue() { return sourceValue; }
    public void setSourceValue(String sourceValue) { this.sourceValue = sourceValue; }

    public String getTargetValue() { return targetValue; }
    public void setTargetValue(String targetValue) { this.targetValue = targetValue; }

    public Map<String, Object> getSourceData() { return sourceData; }
    public void setSourceData(Map<String, Object> sourceData) { this.sourceData = sourceData; }

    public Map<String, Object> getTargetData() { return targetData; }
    public void setTargetData(Map<String, Object> targetData) { this.targetData = targetData; }

    public String getAiSuggestion() { return aiSuggestion; }
    public void setAiSuggestion(String aiSuggestion) { this.aiSuggestion = aiSuggestion; }

    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }

    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public LocalDateTime getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public LocalDateTime getIgnoredAt() { return ignoredAt; }
    public void setIgnoredAt(LocalDateTime ignoredAt) { this.ignoredAt = ignoredAt; }

    public Reconciliation getReconciliation() { return reconciliation; }
    public void setReconciliation(Reconciliation reconciliation) { this.reconciliation = reconciliation; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ReconciliationException e = new ReconciliationException();
        public Builder type(ExceptionType v) { e.type = v; return this; }
        public Builder severity(ExceptionSeverity v) { e.severity = v; return this; }
        public Builder status(ExceptionStatus v) { e.status = v; return this; }
        public Builder description(String v) { e.description = v; return this; }
        public Builder fieldName(String v) { e.fieldName = v; return this; }
        public Builder sourceValue(String v) { e.sourceValue = v; return this; }
        public Builder targetValue(String v) { e.targetValue = v; return this; }
        public Builder sourceData(Map<String, Object> v) { e.sourceData = v; return this; }
        public Builder targetData(Map<String, Object> v) { e.targetData = v; return this; }
        public Builder reconciliation(Reconciliation v) { e.reconciliation = v; return this; }
        public ReconciliationException build() { return e; }
    }
}
