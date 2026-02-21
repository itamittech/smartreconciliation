package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.entity.*;
import com.amit.smartreconciliation.enums.StepRunStatus;
import com.amit.smartreconciliation.enums.StreamStatus;
import com.amit.smartreconciliation.exception.InvalidStateTransitionException;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

/**
 * In-app state machine for ReconciliationRun and ReconciliationStepRun lifecycle.
 *
 * Run states:   PENDING → RUNNING → COMPLETED | FAILED | CANCELED | PARTIAL_FAILED
 * Step states:  PENDING → IN_PROGRESS → COMPLETED | FAILED | RETRY_WAIT | SKIPPED | CANCELED
 *
 * See: docs/02-architecture/reconciliation-stream-runtime-architecture.md §4
 */
@Service
public class StreamOrchestratorService {

    private static final Logger log = LoggerFactory.getLogger(StreamOrchestratorService.class);

    // Run statuses from which cancel is allowed
    private static final Set<StreamStatus> CANCELABLE_RUN_STATUSES =
            Set.of(StreamStatus.PENDING, StreamStatus.RUNNING, StreamStatus.PARTIAL_FAILED);

    // Step statuses that should be canceled when a run is canceled
    private static final Set<StepRunStatus> CANCELABLE_STEP_STATUSES =
            Set.of(StepRunStatus.PENDING, StepRunStatus.IN_PROGRESS, StepRunStatus.RETRY_WAIT);

    private final ReconciliationStreamRepository streamRepository;
    private final ReconciliationStepRepository stepRepository;
    private final ReconciliationRunRepository runRepository;
    private final ReconciliationStepRunRepository stepRunRepository;
    private final OrganizationService organizationService;

    public StreamOrchestratorService(ReconciliationStreamRepository streamRepository,
                                     ReconciliationStepRepository stepRepository,
                                     ReconciliationRunRepository runRepository,
                                     ReconciliationStepRunRepository stepRunRepository,
                                     OrganizationService organizationService) {
        this.streamRepository = streamRepository;
        this.stepRepository = stepRepository;
        this.runRepository = runRepository;
        this.stepRunRepository = stepRunRepository;
        this.organizationService = organizationService;
    }

    // -------------------------------------------------------------------------
    // Run lifecycle
    // -------------------------------------------------------------------------

    /**
     * Creates a new ReconciliationRun in PENDING state.
     * The run is not started yet; call startRun() to begin execution.
     */
    @Transactional
    public ReconciliationRun createRun(Long streamId, Long organizationId, String triggerType) {
        ReconciliationStream stream = streamRepository.findById(streamId)
                .orElseThrow(() -> new ResourceNotFoundException("ReconciliationStream", streamId));

        Organization org = organizationService.getById(organizationId);

        if (!stream.getOrganization().getId().equals(organizationId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Stream " + streamId + " does not belong to organization " + organizationId);
        }

        ReconciliationRun run = new ReconciliationRun();
        run.setStream(stream);
        run.setOrganization(org);
        run.setStatus(StreamStatus.PENDING);
        run.setCurrentStepOrder(0);
        run.setTriggerType(triggerType);

        ReconciliationRun saved = runRepository.save(run);
        log.info("Created run {} for stream {} (org {})", saved.getId(), streamId, organizationId);
        return saved;
    }

    /**
     * Transitions run PENDING → RUNNING, creates a ReconciliationStepRun (PENDING) for each
     * step definition, and dispatches the first step.
     */
    @Transactional
    public ReconciliationRun startRun(Long runId) {
        ReconciliationRun run = loadRun(runId);

        assertRunTransition(run, StreamStatus.RUNNING);

        List<ReconciliationStep> steps = stepRepository.findByStreamIdOrderByStepOrderAsc(
                run.getStream().getId());

        if (steps.isEmpty()) {
            throw new IllegalStateException("Cannot start run " + runId + ": stream has no steps defined");
        }

        run.setStatus(StreamStatus.RUNNING);
        run.setStartedAt(LocalDateTime.now());
        runRepository.save(run);

        // Create a step_run placeholder for every step in order
        for (ReconciliationStep step : steps) {
            ReconciliationStepRun stepRun = new ReconciliationStepRun();
            stepRun.setRun(run);
            stepRun.setStep(step);
            stepRun.setStatus(StepRunStatus.PENDING);
            stepRun.setAttemptNo(1);
            stepRun.setProgress(0);
            stepRunRepository.save(stepRun);
        }

        log.info("Run {} started — {} step(s) created", runId, steps.size());
        advanceRun(run);
        return runRepository.findById(runId).orElseThrow();
    }

    /**
     * Cancels a run in any cancelable state (PENDING, RUNNING, PARTIAL_FAILED).
     * Cascades CANCELED to all PENDING, IN_PROGRESS, and RETRY_WAIT step_runs.
     */
    @Transactional
    public ReconciliationRun cancelRun(Long runId) {
        ReconciliationRun run = loadRun(runId);

        if (!CANCELABLE_RUN_STATUSES.contains(run.getStatus())) {
            throw new InvalidStateTransitionException("ReconciliationRun", run.getStatus(), StreamStatus.CANCELED);
        }

        // Cascade cancel to active step_runs
        List<ReconciliationStepRun> stepRuns = stepRunRepository.findByRunId(runId);
        for (ReconciliationStepRun sr : stepRuns) {
            if (CANCELABLE_STEP_STATUSES.contains(sr.getStatus())) {
                sr.setStatus(StepRunStatus.CANCELED);
                stepRunRepository.save(sr);
            }
        }

        run.setStatus(StreamStatus.CANCELED);
        run.setCompletedAt(LocalDateTime.now());
        runRepository.save(run);

        log.info("Run {} canceled", runId);
        return run;
    }

    // -------------------------------------------------------------------------
    // Step run lifecycle
    // -------------------------------------------------------------------------

    /**
     * Transitions a step run PENDING → IN_PROGRESS.
     * Called by advanceRun internally; exposed for direct dispatch in tests and P1.3 adapter.
     */
    @Transactional
    public ReconciliationStepRun dispatchStepRun(Long stepRunId) {
        ReconciliationStepRun sr = loadStepRun(stepRunId);

        if (sr.getStatus() != StepRunStatus.PENDING) {
            throw new InvalidStateTransitionException("ReconciliationStepRun", sr.getStatus(), StepRunStatus.IN_PROGRESS);
        }

        sr.setStatus(StepRunStatus.IN_PROGRESS);
        sr.setStartedAt(LocalDateTime.now());
        stepRunRepository.save(sr);

        log.info("Step run {} dispatched (step order {})", stepRunId, sr.getStep().getStepOrder());
        return sr;
    }

    /**
     * Marks a step run IN_PROGRESS → COMPLETED, then advances the parent run.
     */
    @Transactional
    public ReconciliationStepRun completeStepRun(Long stepRunId) {
        ReconciliationStepRun sr = loadStepRun(stepRunId);

        if (sr.getStatus() != StepRunStatus.IN_PROGRESS) {
            throw new InvalidStateTransitionException("ReconciliationStepRun", sr.getStatus(), StepRunStatus.COMPLETED);
        }

        sr.setStatus(StepRunStatus.COMPLETED);
        sr.setProgress(100);
        sr.setCompletedAt(LocalDateTime.now());
        stepRunRepository.save(sr);

        log.info("Step run {} completed", stepRunId);
        advanceRun(sr.getRun());
        return sr;
    }

    /**
     * Marks a step run IN_PROGRESS → FAILED and propagates to the parent run.
     * Run transitions to FAILED (stop policy) or PARTIAL_FAILED (continue policy).
     *
     * P1: always uses stop policy (FAILED). Continue/partial policy is a P5 concern.
     */
    @Transactional
    public ReconciliationStepRun failStepRun(Long stepRunId, String errorMessage) {
        ReconciliationStepRun sr = loadStepRun(stepRunId);

        if (sr.getStatus() != StepRunStatus.IN_PROGRESS) {
            throw new InvalidStateTransitionException("ReconciliationStepRun", sr.getStatus(), StepRunStatus.FAILED);
        }

        sr.setStatus(StepRunStatus.FAILED);
        sr.setErrorMessage(errorMessage);
        sr.setCompletedAt(LocalDateTime.now());
        stepRunRepository.save(sr);

        log.warn("Step run {} failed: {}", stepRunId, errorMessage);
        propagateFailureToRun(sr.getRun(), errorMessage);
        return sr;
    }

    /**
     * Transitions a step run RETRY_WAIT → IN_PROGRESS.
     * P1: immediate re-dispatch. P5 will layer in backoff timing.
     */
    @Transactional
    public ReconciliationStepRun retryStepRun(Long stepRunId) {
        ReconciliationStepRun sr = loadStepRun(stepRunId);

        if (sr.getStatus() != StepRunStatus.RETRY_WAIT) {
            throw new InvalidStateTransitionException("ReconciliationStepRun", sr.getStatus(), StepRunStatus.IN_PROGRESS);
        }

        sr.setStatus(StepRunStatus.IN_PROGRESS);
        sr.setAttemptNo(sr.getAttemptNo() + 1);
        sr.setStartedAt(LocalDateTime.now());
        stepRunRepository.save(sr);

        log.info("Step run {} retried (attempt {})", stepRunId, sr.getAttemptNo());
        return sr;
    }

    /**
     * Marks a step run IN_PROGRESS → RETRY_WAIT.
     * Called by the execution layer when a retryable failure is detected.
     */
    @Transactional
    public ReconciliationStepRun markStepRunRetryWait(Long stepRunId, String errorMessage) {
        ReconciliationStepRun sr = loadStepRun(stepRunId);

        if (sr.getStatus() != StepRunStatus.IN_PROGRESS) {
            throw new InvalidStateTransitionException("ReconciliationStepRun", sr.getStatus(), StepRunStatus.RETRY_WAIT);
        }

        sr.setStatus(StepRunStatus.RETRY_WAIT);
        sr.setErrorMessage(errorMessage);
        stepRunRepository.save(sr);

        log.info("Step run {} moved to RETRY_WAIT", stepRunId);
        return sr;
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    /**
     * Advances the run after a step_run completes.
     * Finds the next PENDING step_run in order and dispatches it,
     * or resolves the run to a terminal state if all steps are settled.
     */
    private void advanceRun(ReconciliationRun run) {
        List<ReconciliationStepRun> stepRuns = stepRunRepository.findByRunIdOrderByCreatedAtAsc(run.getId());

        // Find next PENDING step_run (ordered by step_order ascending)
        stepRuns.stream()
                .filter(sr -> sr.getStatus() == StepRunStatus.PENDING)
                .min(Comparator.comparingInt(sr -> sr.getStep().getStepOrder()))
                .ifPresentOrElse(
                        next -> {
                            run.setCurrentStepOrder(next.getStep().getStepOrder());
                            runRepository.save(run);
                            dispatchStepRun(next.getId());
                        },
                        () -> resolveRunTerminalState(run, stepRuns)
                );
    }

    /**
     * Resolves the run to COMPLETED or FAILED based on step_run outcomes.
     * Called when no PENDING step_runs remain.
     */
    private void resolveRunTerminalState(ReconciliationRun run, List<ReconciliationStepRun> stepRuns) {
        long failed  = stepRuns.stream().filter(sr -> sr.getStatus() == StepRunStatus.FAILED).count();
        long completed = stepRuns.stream().filter(sr -> sr.getStatus() == StepRunStatus.COMPLETED).count();

        StreamStatus terminal = (failed > 0 && completed > 0) ? StreamStatus.PARTIAL_FAILED
                              : (failed > 0)                  ? StreamStatus.FAILED
                              :                                  StreamStatus.COMPLETED;

        run.setStatus(terminal);
        run.setCompletedAt(LocalDateTime.now());
        runRepository.save(run);

        log.info("Run {} resolved to {} (completed={}, failed={})", run.getId(), terminal, completed, failed);
    }

    /**
     * Propagates step failure to the parent run.
     * P1: stop-on-failure → run moves to FAILED.
     * Remaining PENDING step_runs are SKIPPED.
     */
    private void propagateFailureToRun(ReconciliationRun run, String errorMessage) {
        // Skip remaining PENDING step_runs (stop-on-failure policy for P1)
        List<ReconciliationStepRun> stepRuns = stepRunRepository.findByRunId(run.getId());
        for (ReconciliationStepRun sr : stepRuns) {
            if (sr.getStatus() == StepRunStatus.PENDING) {
                sr.setStatus(StepRunStatus.SKIPPED);
                stepRunRepository.save(sr);
            }
        }

        run.setStatus(StreamStatus.FAILED);
        run.setErrorMessage(errorMessage);
        run.setCompletedAt(LocalDateTime.now());
        runRepository.save(run);

        log.warn("Run {} failed due to step failure", run.getId());
    }

    private void assertRunTransition(ReconciliationRun run, StreamStatus target) {
        boolean valid = switch (target) {
            case RUNNING  -> run.getStatus() == StreamStatus.PENDING;
            case CANCELED -> CANCELABLE_RUN_STATUSES.contains(run.getStatus());
            case FAILED   -> run.getStatus() == StreamStatus.RUNNING || run.getStatus() == StreamStatus.PARTIAL_FAILED;
            case COMPLETED, PARTIAL_FAILED -> run.getStatus() == StreamStatus.RUNNING || run.getStatus() == StreamStatus.PARTIAL_FAILED;
            default -> false;
        };
        if (!valid) {
            throw new InvalidStateTransitionException("ReconciliationRun", run.getStatus(), target);
        }
    }

    private ReconciliationRun loadRun(Long runId) {
        return runRepository.findById(runId)
                .orElseThrow(() -> new ResourceNotFoundException("ReconciliationRun", runId));
    }

    private ReconciliationStepRun loadStepRun(Long stepRunId) {
        return stepRunRepository.findById(stepRunId)
                .orElseThrow(() -> new ResourceNotFoundException("ReconciliationStepRun", stepRunId));
    }
}
