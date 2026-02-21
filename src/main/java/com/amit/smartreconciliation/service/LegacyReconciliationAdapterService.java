package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.entity.*;
import com.amit.smartreconciliation.enums.InputType;
import com.amit.smartreconciliation.enums.StepRunStatus;
import com.amit.smartreconciliation.enums.StreamStatus;
import com.amit.smartreconciliation.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Compatibility adapter that silently wires each legacy Reconciliation into a
 * one-step stream run so the new runtime model tracks it without modifying the
 * existing API contract.
 *
 * All public methods are designed to be called inside try/catch in
 * ReconciliationService so that adapter failures never break the legacy flow.
 *
 * State machine driven directly (no StreamOrchestratorService) to avoid
 * circular-dependency risk and keep the adapter self-contained.
 *
 * See: docs/02-architecture/reconciliation-stream-runtime-architecture.md §6
 */
@Service
public class LegacyReconciliationAdapterService {

    private static final Logger log = LoggerFactory.getLogger(LegacyReconciliationAdapterService.class);

    private final ReconciliationStreamRepository streamRepository;
    private final ReconciliationStepRepository stepRepository;
    private final ReconciliationRunRepository runRepository;
    private final ReconciliationStepRunRepository stepRunRepository;
    private final ReconciliationRepository reconciliationRepository;

    public LegacyReconciliationAdapterService(ReconciliationStreamRepository streamRepository,
                                              ReconciliationStepRepository stepRepository,
                                              ReconciliationRunRepository runRepository,
                                              ReconciliationStepRunRepository stepRunRepository,
                                              ReconciliationRepository reconciliationRepository) {
        this.streamRepository = streamRepository;
        this.stepRepository = stepRepository;
        this.runRepository = runRepository;
        this.stepRunRepository = stepRunRepository;
        this.reconciliationRepository = reconciliationRepository;
    }

    /**
     * Creates a one-step stream/run/step_run envelope around the given reconciliation
     * and links the run and step_run back to it via the compatibility FK columns.
     *
     * Called immediately after ReconciliationService persists a new Reconciliation.
     */
    @Transactional
    public void attachStreamContext(Reconciliation saved) {
        Organization org = saved.getOrganization();

        // 1. Definition-time stream (single step, represents this legacy reconciliation)
        ReconciliationStream stream = new ReconciliationStream();
        stream.setOrganization(org);
        stream.setName("legacy-recon-" + saved.getId());
        stream.setDescription("Auto-generated stream for legacy reconciliation " + saved.getId());
        stream.setStatus(StreamStatus.PENDING);
        stream = streamRepository.save(stream);

        // 2. Definition-time step (FILE inputs; IDs mirror the legacy files for reference)
        ReconciliationStep step = new ReconciliationStep();
        step.setStream(stream);
        step.setStepOrder(1);
        step.setName("step-1");
        step.setSourceInputType(InputType.FILE);
        step.setSourceInputId(saved.getSourceFile() != null ? saved.getSourceFile().getId() : null);
        step.setTargetInputType(InputType.FILE);
        step.setTargetInputId(saved.getTargetFile() != null ? saved.getTargetFile().getId() : null);
        step.setRuleSet(saved.getRuleSet());
        step = stepRepository.save(step);

        // 3. Execution-time run (PENDING — will transition when execution starts)
        ReconciliationRun run = new ReconciliationRun();
        run.setStream(stream);
        run.setOrganization(org);
        run.setStatus(StreamStatus.PENDING);
        run.setCurrentStepOrder(0);
        run.setTriggerType("LEGACY");
        run = runRepository.save(run);

        // 4. Execution-time step_run (PENDING — compatibility link to the Reconciliation)
        ReconciliationStepRun stepRun = new ReconciliationStepRun();
        stepRun.setRun(run);
        stepRun.setStep(step);
        stepRun.setStatus(StepRunStatus.PENDING);
        stepRun.setAttemptNo(1);
        stepRun.setProgress(0);
        stepRun.setReconciliation(saved);
        stepRun = stepRunRepository.save(stepRun);

        // 5. Link compatibility FKs back to the reconciliation entity
        saved.setStreamRun(run);
        saved.setStepRun(stepRun);
        reconciliationRepository.save(saved);

        log.info("Adapter: attached stream context to reconciliation {} (run={}, stepRun={})",
                saved.getId(), run.getId(), stepRun.getId());
    }

    /**
     * Transitions the associated run PENDING → RUNNING and the step_run PENDING → IN_PROGRESS.
     * Called when ReconciliationService begins async execution.
     */
    @Transactional
    public void notifyExecutionStarted(Reconciliation reconciliation) {
        stepRunRepository.findByReconciliationId(reconciliation.getId()).ifPresent(stepRun -> {
            ReconciliationRun run = stepRun.getRun();

            if (run.getStatus() == StreamStatus.PENDING) {
                run.setStatus(StreamStatus.RUNNING);
                run.setStartedAt(LocalDateTime.now());
                run.setCurrentStepOrder(1);
                runRepository.save(run);
            }

            if (stepRun.getStatus() == StepRunStatus.PENDING) {
                stepRun.setStatus(StepRunStatus.IN_PROGRESS);
                stepRun.setStartedAt(LocalDateTime.now());
                stepRunRepository.save(stepRun);
            }

            log.info("Adapter: notified execution started for reconciliation {} (run={}, stepRun={})",
                    reconciliation.getId(), run.getId(), stepRun.getId());
        });
    }

    /**
     * Transitions the associated step_run → COMPLETED and run → COMPLETED.
     * Called when ReconciliationService finishes execution successfully.
     */
    @Transactional
    public void notifyExecutionCompleted(Long reconciliationId) {
        stepRunRepository.findByReconciliationId(reconciliationId).ifPresent(stepRun -> {
            LocalDateTime now = LocalDateTime.now();

            if (stepRun.getStatus() == StepRunStatus.IN_PROGRESS) {
                stepRun.setStatus(StepRunStatus.COMPLETED);
                stepRun.setProgress(100);
                stepRun.setCompletedAt(now);
                stepRunRepository.save(stepRun);
            }

            ReconciliationRun run = stepRun.getRun();
            if (run.getStatus() == StreamStatus.RUNNING) {
                run.setStatus(StreamStatus.COMPLETED);
                run.setCompletedAt(now);
                runRepository.save(run);
            }

            log.info("Adapter: notified execution completed for reconciliation {} (run={}, stepRun={})",
                    reconciliationId, run.getId(), stepRun.getId());
        });
    }

    /**
     * Transitions the associated step_run → FAILED and run → FAILED.
     * Called when ReconciliationService catches an execution error.
     */
    @Transactional
    public void notifyExecutionFailed(Long reconciliationId, String errorMessage) {
        stepRunRepository.findByReconciliationId(reconciliationId).ifPresent(stepRun -> {
            LocalDateTime now = LocalDateTime.now();

            if (stepRun.getStatus() == StepRunStatus.IN_PROGRESS
                    || stepRun.getStatus() == StepRunStatus.PENDING) {
                stepRun.setStatus(StepRunStatus.FAILED);
                stepRun.setErrorMessage(errorMessage);
                stepRun.setCompletedAt(now);
                stepRunRepository.save(stepRun);
            }

            ReconciliationRun run = stepRun.getRun();
            if (run.getStatus() == StreamStatus.RUNNING
                    || run.getStatus() == StreamStatus.PENDING) {
                run.setStatus(StreamStatus.FAILED);
                run.setErrorMessage(errorMessage);
                run.setCompletedAt(now);
                runRepository.save(run);
            }

            log.warn("Adapter: notified execution failed for reconciliation {} (run={}, stepRun={}): {}",
                    reconciliationId, run.getId(), stepRun.getId(), errorMessage);
        });
    }
}
