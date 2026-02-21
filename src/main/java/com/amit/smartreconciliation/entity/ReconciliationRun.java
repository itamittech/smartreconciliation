package com.amit.smartreconciliation.entity;

import com.amit.smartreconciliation.enums.StreamStatus;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Execution-time entity representing a single execution of a ReconciliationStream.
 * Contains the run-level lifecycle state and trigger context.
 */
@Entity
@Table(name = "reconciliation_runs")
public class ReconciliationRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stream_id", nullable = false)
    private ReconciliationStream stream;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private StreamStatus status = StreamStatus.PENDING;

    @Column(nullable = false)
    private Integer currentStepOrder = 0;

    @Column(length = 50)
    private String triggerType;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> triggerMetadata;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "run", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReconciliationStepRun> stepRuns = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public ReconciliationRun() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ReconciliationStream getStream() { return stream; }
    public void setStream(ReconciliationStream stream) { this.stream = stream; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public StreamStatus getStatus() { return status; }
    public void setStatus(StreamStatus status) { this.status = status; }

    public Integer getCurrentStepOrder() { return currentStepOrder; }
    public void setCurrentStepOrder(Integer currentStepOrder) { this.currentStepOrder = currentStepOrder; }

    public String getTriggerType() { return triggerType; }
    public void setTriggerType(String triggerType) { this.triggerType = triggerType; }

    public Map<String, Object> getTriggerMetadata() { return triggerMetadata; }
    public void setTriggerMetadata(Map<String, Object> triggerMetadata) { this.triggerMetadata = triggerMetadata; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public List<ReconciliationStepRun> getStepRuns() { return stepRuns; }
    public void setStepRuns(List<ReconciliationStepRun> stepRuns) { this.stepRuns = stepRuns; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
