package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.entity.*;
import com.amit.smartreconciliation.enums.StepRunStatus;
import com.amit.smartreconciliation.enums.StreamStatus;
import com.amit.smartreconciliation.exception.InvalidStateTransitionException;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StreamOrchestratorService — state machine unit tests")
class StreamOrchestratorServiceTest {

    @Mock private ReconciliationStreamRepository streamRepository;
    @Mock private ReconciliationStepRepository stepRepository;
    @Mock private ReconciliationRunRepository runRepository;
    @Mock private ReconciliationStepRunRepository stepRunRepository;
    @Mock private OrganizationService organizationService;

    private StreamOrchestratorService orchestrator;

    // Shared fixtures
    private Organization org;
    private ReconciliationStream stream;

    @BeforeEach
    void setUp() {
        orchestrator = new StreamOrchestratorService(
                streamRepository, stepRepository, runRepository, stepRunRepository, organizationService);

        org = new Organization();
        org.setId(1L);
        org.setName("TestOrg");

        stream = new ReconciliationStream();
        stream.setId(10L);
        stream.setOrganization(org);
        stream.setName("Test Stream");
        stream.setStatus(StreamStatus.PENDING);
    }

    // =========================================================================
    // createRun
    // =========================================================================

    @Nested
    @DisplayName("createRun")
    class CreateRun {

        @Test
        @DisplayName("creates run in PENDING state for valid stream + org")
        void createsRunInPendingState() {
            when(streamRepository.findById(10L)).thenReturn(Optional.of(stream));
            when(organizationService.getById(1L)).thenReturn(org);
            when(runRepository.save(any())).thenAnswer(inv -> {
                ReconciliationRun r = inv.getArgument(0);
                r.setId(100L);
                return r;
            });

            ReconciliationRun run = orchestrator.createRun(10L, 1L, "MANUAL");

            assertThat(run.getStatus()).isEqualTo(StreamStatus.PENDING);
            assertThat(run.getTriggerType()).isEqualTo("MANUAL");
            assertThat(run.getCurrentStepOrder()).isZero();
        }

        @Test
        @DisplayName("throws AccessDeniedException when stream belongs to different org")
        void rejectsOrgMismatch() {
            Organization otherOrg = new Organization();
            otherOrg.setId(99L);
            stream.setOrganization(otherOrg);

            when(streamRepository.findById(10L)).thenReturn(Optional.of(stream));
            when(organizationService.getById(1L)).thenReturn(org);

            assertThatThrownBy(() -> orchestrator.createRun(10L, 1L, "MANUAL"))
                    .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException for unknown stream")
        void throwsForUnknownStream() {
            when(streamRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orchestrator.createRun(99L, 1L, "MANUAL"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // =========================================================================
    // startRun
    // =========================================================================

    @Nested
    @DisplayName("startRun")
    class StartRun {

        @Test
        @DisplayName("transitions run PENDING → RUNNING and creates step_runs, dispatches first step")
        void transitionsToPendingToRunning() {
            ReconciliationRun run = pendingRun(100L);
            ReconciliationStep step1 = step(1L, 1);
            ReconciliationStep step2 = step(2L, 2);

            // Accumulate step_runs as they are saved so advanceRun can find them
            List<ReconciliationStepRun> saved = new ArrayList<>();
            when(runRepository.findById(100L)).thenReturn(Optional.of(run));
            when(stepRepository.findByStreamIdOrderByStepOrderAsc(10L)).thenReturn(List.of(step1, step2));
            when(runRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(stepRunRepository.save(any())).thenAnswer(inv -> {
                ReconciliationStepRun sr = inv.getArgument(0);
                if (sr.getId() == null) { sr.setId((long) (saved.size() + 1)); saved.add(sr); }
                return sr;
            });
            when(stepRunRepository.findByRunIdOrderByCreatedAtAsc(100L))
                    .thenAnswer(inv -> new ArrayList<>(saved));
            when(stepRunRepository.findById(anyLong())).thenAnswer(inv ->
                    saved.stream().filter(sr -> sr.getId().equals((Long) inv.getArgument(0))).findFirst());

            orchestrator.startRun(100L);

            assertThat(run.getStatus()).isEqualTo(StreamStatus.RUNNING);
            assertThat(saved).hasSize(2);
            // First step_run should have been dispatched
            assertThat(saved.get(0).getStatus()).isEqualTo(StepRunStatus.IN_PROGRESS);
            assertThat(saved.get(1).getStatus()).isEqualTo(StepRunStatus.PENDING);
        }

        @Test
        @DisplayName("throws InvalidStateTransitionException when run is already RUNNING")
        void rejectsAlreadyRunning() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.RUNNING);
            when(runRepository.findById(100L)).thenReturn(Optional.of(run));

            assertThatThrownBy(() -> orchestrator.startRun(100L))
                    .isInstanceOf(InvalidStateTransitionException.class)
                    .hasMessageContaining("RUNNING");
        }

        @Test
        @DisplayName("throws IllegalStateException when stream has no steps")
        void throwsWhenNoSteps() {
            ReconciliationRun run = pendingRun(100L);
            when(runRepository.findById(100L)).thenReturn(Optional.of(run));
            when(stepRepository.findByStreamIdOrderByStepOrderAsc(10L)).thenReturn(Collections.emptyList());

            assertThatThrownBy(() -> orchestrator.startRun(100L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("no steps");
        }
    }

    // =========================================================================
    // cancelRun
    // =========================================================================

    @Nested
    @DisplayName("cancelRun")
    class CancelRun {

        @Test
        @DisplayName("cancels PENDING run and cascades to PENDING step_runs")
        void cancelsPendingRun() {
            ReconciliationRun run = pendingRun(100L);
            ReconciliationStepRun sr1 = stepRunWithStatus(1L, StepRunStatus.PENDING, run);
            ReconciliationStepRun sr2 = stepRunWithStatus(2L, StepRunStatus.PENDING, run);

            when(runRepository.findById(100L)).thenReturn(Optional.of(run));
            when(stepRunRepository.findByRunId(100L)).thenReturn(List.of(sr1, sr2));
            when(stepRunRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(runRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            orchestrator.cancelRun(100L);

            assertThat(run.getStatus()).isEqualTo(StreamStatus.CANCELED);
            assertThat(sr1.getStatus()).isEqualTo(StepRunStatus.CANCELED);
            assertThat(sr2.getStatus()).isEqualTo(StepRunStatus.CANCELED);
        }

        @Test
        @DisplayName("cancels RUNNING run and leaves already-COMPLETED step_runs untouched")
        void cancelRunDoesNotAffectCompletedSteps() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.RUNNING);
            ReconciliationStepRun completed = stepRunWithStatus(1L, StepRunStatus.COMPLETED, run);
            ReconciliationStepRun pending   = stepRunWithStatus(2L, StepRunStatus.PENDING, run);

            when(runRepository.findById(100L)).thenReturn(Optional.of(run));
            when(stepRunRepository.findByRunId(100L)).thenReturn(List.of(completed, pending));
            when(stepRunRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(runRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            orchestrator.cancelRun(100L);

            assertThat(completed.getStatus()).isEqualTo(StepRunStatus.COMPLETED);
            assertThat(pending.getStatus()).isEqualTo(StepRunStatus.CANCELED);
        }

        @Test
        @DisplayName("throws InvalidStateTransitionException when run is already COMPLETED")
        void rejectsCancelOnCompletedRun() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.COMPLETED);
            when(runRepository.findById(100L)).thenReturn(Optional.of(run));

            assertThatThrownBy(() -> orchestrator.cancelRun(100L))
                    .isInstanceOf(InvalidStateTransitionException.class);
        }

        @Test
        @DisplayName("throws InvalidStateTransitionException when run is already FAILED")
        void rejectsCancelOnFailedRun() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.FAILED);
            when(runRepository.findById(100L)).thenReturn(Optional.of(run));

            assertThatThrownBy(() -> orchestrator.cancelRun(100L))
                    .isInstanceOf(InvalidStateTransitionException.class);
        }
    }

    // =========================================================================
    // dispatchStepRun
    // =========================================================================

    @Nested
    @DisplayName("dispatchStepRun")
    class DispatchStepRun {

        @Test
        @DisplayName("transitions step_run PENDING → IN_PROGRESS")
        void dispatchesPendingStepRun() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.RUNNING);
            ReconciliationStepRun sr = stepRunWithStatus(1L, StepRunStatus.PENDING, run);

            when(stepRunRepository.findById(1L)).thenReturn(Optional.of(sr));
            when(stepRunRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            orchestrator.dispatchStepRun(1L);

            assertThat(sr.getStatus()).isEqualTo(StepRunStatus.IN_PROGRESS);
            assertThat(sr.getStartedAt()).isNotNull();
        }

        @Test
        @DisplayName("throws InvalidStateTransitionException when step_run is not PENDING")
        void rejectsNonPendingDispatch() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.RUNNING);
            ReconciliationStepRun sr = stepRunWithStatus(1L, StepRunStatus.IN_PROGRESS, run);

            when(stepRunRepository.findById(1L)).thenReturn(Optional.of(sr));

            assertThatThrownBy(() -> orchestrator.dispatchStepRun(1L))
                    .isInstanceOf(InvalidStateTransitionException.class);
        }
    }

    // =========================================================================
    // completeStepRun
    // =========================================================================

    @Nested
    @DisplayName("completeStepRun")
    class CompleteStepRun {

        @Test
        @DisplayName("transitions step_run IN_PROGRESS → COMPLETED and resolves run COMPLETED when all done")
        void completesStepAndResolvesRun() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.RUNNING);
            ReconciliationStepRun sr = stepRunWithStatus(1L, StepRunStatus.IN_PROGRESS, run);

            when(stepRunRepository.findById(1L)).thenReturn(Optional.of(sr));
            when(stepRunRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(stepRunRepository.findByRunIdOrderByCreatedAtAsc(100L)).thenReturn(List.of(sr));
            when(runRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            orchestrator.completeStepRun(1L);

            assertThat(sr.getStatus()).isEqualTo(StepRunStatus.COMPLETED);
            assertThat(sr.getProgress()).isEqualTo(100);
            assertThat(run.getStatus()).isEqualTo(StreamStatus.COMPLETED);
        }

        @Test
        @DisplayName("dispatches next PENDING step_run after completing current one")
        void dispatchesNextStep() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.RUNNING);
            ReconciliationStep step1 = step(1L, 1);
            ReconciliationStep step2 = step(2L, 2);

            ReconciliationStepRun sr1 = stepRunWithStatus(10L, StepRunStatus.IN_PROGRESS, run);
            sr1.setStep(step1);
            ReconciliationStepRun sr2 = stepRunWithStatus(20L, StepRunStatus.PENDING, run);
            sr2.setStep(step2);

            when(stepRunRepository.findById(10L)).thenReturn(Optional.of(sr1));
            when(stepRunRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(stepRunRepository.findByRunIdOrderByCreatedAtAsc(100L)).thenReturn(List.of(sr1, sr2));
            when(runRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            // dispatchStepRun loads sr2
            when(stepRunRepository.findById(20L)).thenReturn(Optional.of(sr2));

            orchestrator.completeStepRun(10L);

            assertThat(sr2.getStatus()).isEqualTo(StepRunStatus.IN_PROGRESS);
        }

        @Test
        @DisplayName("throws InvalidStateTransitionException when step_run is not IN_PROGRESS")
        void rejectsNonInProgressComplete() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.RUNNING);
            ReconciliationStepRun sr = stepRunWithStatus(1L, StepRunStatus.PENDING, run);

            when(stepRunRepository.findById(1L)).thenReturn(Optional.of(sr));

            assertThatThrownBy(() -> orchestrator.completeStepRun(1L))
                    .isInstanceOf(InvalidStateTransitionException.class);
        }
    }

    // =========================================================================
    // failStepRun
    // =========================================================================

    @Nested
    @DisplayName("failStepRun")
    class FailStepRun {

        @Test
        @DisplayName("transitions step_run IN_PROGRESS → FAILED and run → FAILED (stop policy)")
        void failsStepAndRunWithStopPolicy() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.RUNNING);
            ReconciliationStepRun sr = stepRunWithStatus(1L, StepRunStatus.IN_PROGRESS, run);
            ReconciliationStepRun pending = stepRunWithStatus(2L, StepRunStatus.PENDING, run);

            when(stepRunRepository.findById(1L)).thenReturn(Optional.of(sr));
            when(stepRunRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(stepRunRepository.findByRunId(100L)).thenReturn(List.of(sr, pending));
            when(runRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            orchestrator.failStepRun(1L, "Matching engine error");

            assertThat(sr.getStatus()).isEqualTo(StepRunStatus.FAILED);
            assertThat(run.getStatus()).isEqualTo(StreamStatus.FAILED);
            assertThat(pending.getStatus()).isEqualTo(StepRunStatus.SKIPPED);
        }

        @Test
        @DisplayName("throws InvalidStateTransitionException when step_run is not IN_PROGRESS")
        void rejectsNonInProgressFail() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.RUNNING);
            ReconciliationStepRun sr = stepRunWithStatus(1L, StepRunStatus.COMPLETED, run);

            when(stepRunRepository.findById(1L)).thenReturn(Optional.of(sr));

            assertThatThrownBy(() -> orchestrator.failStepRun(1L, "err"))
                    .isInstanceOf(InvalidStateTransitionException.class);
        }
    }

    // =========================================================================
    // retryStepRun / markStepRunRetryWait
    // =========================================================================

    @Nested
    @DisplayName("retry lifecycle")
    class RetryLifecycle {

        @Test
        @DisplayName("markStepRunRetryWait: IN_PROGRESS → RETRY_WAIT")
        void marksRetryWait() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.RUNNING);
            ReconciliationStepRun sr = stepRunWithStatus(1L, StepRunStatus.IN_PROGRESS, run);

            when(stepRunRepository.findById(1L)).thenReturn(Optional.of(sr));
            when(stepRunRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            orchestrator.markStepRunRetryWait(1L, "transient error");

            assertThat(sr.getStatus()).isEqualTo(StepRunStatus.RETRY_WAIT);
            assertThat(sr.getErrorMessage()).isEqualTo("transient error");
        }

        @Test
        @DisplayName("retryStepRun: RETRY_WAIT → IN_PROGRESS, increments attempt_no")
        void retriesStepRun() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.RUNNING);
            ReconciliationStepRun sr = stepRunWithStatus(1L, StepRunStatus.RETRY_WAIT, run);
            sr.setAttemptNo(1);

            when(stepRunRepository.findById(1L)).thenReturn(Optional.of(sr));
            when(stepRunRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            orchestrator.retryStepRun(1L);

            assertThat(sr.getStatus()).isEqualTo(StepRunStatus.IN_PROGRESS);
            assertThat(sr.getAttemptNo()).isEqualTo(2);
        }

        @Test
        @DisplayName("retryStepRun throws InvalidStateTransitionException when not in RETRY_WAIT")
        void rejectsRetryWhenNotWaiting() {
            ReconciliationRun run = runWithStatus(100L, StreamStatus.RUNNING);
            ReconciliationStepRun sr = stepRunWithStatus(1L, StepRunStatus.IN_PROGRESS, run);

            when(stepRunRepository.findById(1L)).thenReturn(Optional.of(sr));

            assertThatThrownBy(() -> orchestrator.retryStepRun(1L))
                    .isInstanceOf(InvalidStateTransitionException.class);
        }
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private ReconciliationRun pendingRun(Long id) {
        return runWithStatus(id, StreamStatus.PENDING);
    }

    private ReconciliationRun runWithStatus(Long id, StreamStatus status) {
        ReconciliationRun run = new ReconciliationRun();
        run.setId(id);
        run.setStream(stream);
        run.setOrganization(org);
        run.setStatus(status);
        run.setCurrentStepOrder(0);
        return run;
    }

    private ReconciliationStep step(Long id, int order) {
        ReconciliationStep s = new ReconciliationStep();
        s.setId(id);
        s.setStepOrder(order);
        s.setStream(stream);
        s.setName("Step " + order);
        return s;
    }

    private ReconciliationStepRun stepRunWithStatus(Long id, StepRunStatus status, ReconciliationRun run) {
        ReconciliationStep step = step(id, id.intValue());
        ReconciliationStepRun sr = new ReconciliationStepRun();
        sr.setId(id);
        sr.setRun(run);
        sr.setStep(step);
        sr.setStatus(status);
        sr.setAttemptNo(1);
        sr.setProgress(0);
        return sr;
    }
}
