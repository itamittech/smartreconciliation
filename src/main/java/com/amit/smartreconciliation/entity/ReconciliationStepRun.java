package com.amit.smartreconciliation.entity;

import com.amit.smartreconciliation.enums.StepRunStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Execution-time entity representing one attempt at executing a ReconciliationStep.
 * Carries a nullable compatibility link to the underlying Reconciliation that performs matching.
 */
@Entity
@Table(name = "reconciliation_step_runs")
public class ReconciliationStepRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "run_id", nullable = false)
    private ReconciliationRun run;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false)
    private ReconciliationStep step;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private StepRunStatus status = StepRunStatus.PENDING;

    @Column(nullable = false)
    private Integer attemptNo = 1;

    @Column(nullable = false)
    private Integer progress = 0;

    /**
     * Compatibility link — the Reconciliation entity that was created to execute this step's matching.
     * Nullable: not present until the step starts executing.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reconciliation_id")
    private Reconciliation reconciliation;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public ReconciliationStepRun() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ReconciliationRun getRun() { return run; }
    public void setRun(ReconciliationRun run) { this.run = run; }

    public ReconciliationStep getStep() { return step; }
    public void setStep(ReconciliationStep step) { this.step = step; }

    public StepRunStatus getStatus() { return status; }
    public void setStatus(StepRunStatus status) { this.status = status; }

    public Integer getAttemptNo() { return attemptNo; }
    public void setAttemptNo(Integer attemptNo) { this.attemptNo = attemptNo; }

    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }

    public Reconciliation getReconciliation() { return reconciliation; }
    public void setReconciliation(Reconciliation reconciliation) { this.reconciliation = reconciliation; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
