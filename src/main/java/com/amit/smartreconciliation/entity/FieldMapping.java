package com.amit.smartreconciliation.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "field_mappings")
public class FieldMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sourceField;

    @Column(nullable = false)
    private String targetField;

    private String transform;

    private Double confidence = 1.0;

    @Column(nullable = false)
    private Boolean isKey = false;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> transformConfig;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_set_id", nullable = false)
    private RuleSet ruleSet;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public FieldMapping() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSourceField() { return sourceField; }
    public void setSourceField(String sourceField) { this.sourceField = sourceField; }

    public String getTargetField() { return targetField; }
    public void setTargetField(String targetField) { this.targetField = targetField; }

    public String getTransform() { return transform; }
    public void setTransform(String transform) { this.transform = transform; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public Boolean getIsKey() { return isKey; }
    public void setIsKey(Boolean isKey) { this.isKey = isKey; }

    public Map<String, Object> getTransformConfig() { return transformConfig; }
    public void setTransformConfig(Map<String, Object> transformConfig) { this.transformConfig = transformConfig; }

    public RuleSet getRuleSet() { return ruleSet; }
    public void setRuleSet(RuleSet ruleSet) { this.ruleSet = ruleSet; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final FieldMapping fm = new FieldMapping();
        public Builder sourceField(String v) { fm.sourceField = v; return this; }
        public Builder targetField(String v) { fm.targetField = v; return this; }
        public Builder transform(String v) { fm.transform = v; return this; }
        public Builder confidence(Double v) { fm.confidence = v; return this; }
        public Builder isKey(Boolean v) { fm.isKey = v; return this; }
        public Builder transformConfig(Map<String, Object> v) { fm.transformConfig = v; return this; }
        public Builder ruleSet(RuleSet v) { fm.ruleSet = v; return this; }
        public FieldMapping build() { return fm; }
    }
}
