package com.amit.smartreconciliation.entity;

import com.amit.smartreconciliation.enums.InputType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Definition-time entity for a single ordered step within a ReconciliationStream.
 * Specifies polymorphic source/target inputs and the rule set to apply.
 */
@Entity
@Table(
    name = "reconciliation_steps",
    uniqueConstraints = @UniqueConstraint(name = "uq_stream_step_order", columnNames = {"stream_id", "step_order"})
)
public class ReconciliationStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stream_id", nullable = false)
    private ReconciliationStream stream;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_input_type", nullable = false, length = 100)
    private InputType sourceInputType;

    @Column(name = "source_input_id")
    private Long sourceInputId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_input_type", nullable = false, length = 100)
    private InputType targetInputType;

    @Column(name = "target_input_id")
    private Long targetInputId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_set_id")
    private RuleSet ruleSet;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> config;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public ReconciliationStep() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ReconciliationStream getStream() { return stream; }
    public void setStream(ReconciliationStream stream) { this.stream = stream; }

    public Integer getStepOrder() { return stepOrder; }
    public void setStepOrder(Integer stepOrder) { this.stepOrder = stepOrder; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public InputType getSourceInputType() { return sourceInputType; }
    public void setSourceInputType(InputType sourceInputType) { this.sourceInputType = sourceInputType; }

    public Long getSourceInputId() { return sourceInputId; }
    public void setSourceInputId(Long sourceInputId) { this.sourceInputId = sourceInputId; }

    public InputType getTargetInputType() { return targetInputType; }
    public void setTargetInputType(InputType targetInputType) { this.targetInputType = targetInputType; }

    public Long getTargetInputId() { return targetInputId; }
    public void setTargetInputId(Long targetInputId) { this.targetInputId = targetInputId; }

    public RuleSet getRuleSet() { return ruleSet; }
    public void setRuleSet(RuleSet ruleSet) { this.ruleSet = ruleSet; }

    public Map<String, Object> getConfig() { return config; }
    public void setConfig(Map<String, Object> config) { this.config = config; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
