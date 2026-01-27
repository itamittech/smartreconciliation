package com.amit.smartreconciliation.entity;

import com.amit.smartreconciliation.enums.MatchType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "matching_rules")
public class MatchingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String sourceField;

    @Column(nullable = false)
    private String targetField;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchType matchType = MatchType.EXACT;

    private Double tolerance;
    private Double fuzzyThreshold;

    @Column(nullable = false)
    private Integer priority = 0;

    @Column(nullable = false)
    private Boolean active = true;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> config;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_set_id", nullable = false)
    private RuleSet ruleSet;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public MatchingRule() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSourceField() { return sourceField; }
    public void setSourceField(String sourceField) { this.sourceField = sourceField; }

    public String getTargetField() { return targetField; }
    public void setTargetField(String targetField) { this.targetField = targetField; }

    public MatchType getMatchType() { return matchType; }
    public void setMatchType(MatchType matchType) { this.matchType = matchType; }

    public Double getTolerance() { return tolerance; }
    public void setTolerance(Double tolerance) { this.tolerance = tolerance; }

    public Double getFuzzyThreshold() { return fuzzyThreshold; }
    public void setFuzzyThreshold(Double fuzzyThreshold) { this.fuzzyThreshold = fuzzyThreshold; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Map<String, Object> getConfig() { return config; }
    public void setConfig(Map<String, Object> config) { this.config = config; }

    public RuleSet getRuleSet() { return ruleSet; }
    public void setRuleSet(RuleSet ruleSet) { this.ruleSet = ruleSet; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final MatchingRule mr = new MatchingRule();
        public Builder name(String v) { mr.name = v; return this; }
        public Builder description(String v) { mr.description = v; return this; }
        public Builder sourceField(String v) { mr.sourceField = v; return this; }
        public Builder targetField(String v) { mr.targetField = v; return this; }
        public Builder matchType(MatchType v) { mr.matchType = v; return this; }
        public Builder tolerance(Double v) { mr.tolerance = v; return this; }
        public Builder fuzzyThreshold(Double v) { mr.fuzzyThreshold = v; return this; }
        public Builder priority(Integer v) { mr.priority = v; return this; }
        public Builder active(Boolean v) { mr.active = v; return this; }
        public Builder config(Map<String, Object> v) { mr.config = v; return this; }
        public Builder ruleSet(RuleSet v) { mr.ruleSet = v; return this; }
        public MatchingRule build() { return mr; }
    }
}
