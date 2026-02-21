package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.ReconciliationStepRun;
import com.amit.smartreconciliation.enums.StepRunStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReconciliationStepRunRepository extends JpaRepository<ReconciliationStepRun, Long> {
    List<ReconciliationStepRun> findByRunId(Long runId);
    List<ReconciliationStepRun> findByRunIdOrderByCreatedAtAsc(Long runId);
    List<ReconciliationStepRun> findByRunIdAndStatus(Long runId, StepRunStatus status);
    Optional<ReconciliationStepRun> findByRunIdAndStepId(Long runId, Long stepId);
    Optional<ReconciliationStepRun> findByReconciliationId(Long reconciliationId);
}
