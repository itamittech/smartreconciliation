package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.entity.*;
import com.amit.smartreconciliation.enums.*;
import com.amit.smartreconciliation.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for LegacyReconciliationAdapterService.
 * Verifies that stream/run/step-run entities are created and linked correctly,
 * and that state notifications produce the expected transitions.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("LegacyReconciliationAdapterService Unit Tests")
class LegacyReconciliationAdapterServiceTest {

    @Mock private ReconciliationStreamRepository streamRepository;
    @Mock private ReconciliationStepRepository stepRepository;
    @Mock private ReconciliationRunRepository runRepository;
    @Mock private ReconciliationStepRunRepository stepRunRepository;
    @Mock private ReconciliationRepository reconciliationRepository;

    private LegacyReconciliationAdapterService adapter;

    @BeforeEach
    void setUp() {
        adapter = new LegacyReconciliationAdapterService(
                streamRepository, stepRepository, runRepository,
                stepRunRepository, reconciliationRepository);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Organization buildOrg(Long id) {
        Organization org = new Organization();
        org.setId(id);
        org.setName("org-" + id);
        return org;
    }

    private Reconciliation buildReconciliation(Long id, Organization org) {
        UploadedFile src = new UploadedFile(); src.setId(10L);
        UploadedFile tgt = new UploadedFile(); tgt.setId(11L);
        Reconciliation r = new Reconciliation();
        r.setId(id);
        r.setName("recon-" + id);
        r.setOrganization(org);
        r.setSourceFile(src);
        r.setTargetFile(tgt);
        return r;
    }

    private ReconciliationStepRun buildStepRun(Long id, ReconciliationRun run, StepRunStatus status) {
        ReconciliationStepRun sr = new ReconciliationStepRun();
        sr.setId(id);
        sr.setRun(run);
        sr.setStatus(status);
        return sr;
    }

    private ReconciliationRun buildRun(Long id, StreamStatus status) {
        ReconciliationRun run = new ReconciliationRun();
        run.setId(id);
        run.setStatus(status);
        return run;
    }

    // -------------------------------------------------------------------------
    // attachStreamContext
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("attachStreamContext")
    class AttachStreamContext {

        @Test
        @DisplayName("TA-ADP-001: Creates stream, step, run, and step_run; links back to reconciliation")
        void createsAllEntitiesAndLinksBack() {
            Organization org = buildOrg(1L);
            Reconciliation recon = buildReconciliation(42L, org);

            // Each save returns the entity with an assigned ID
            ReconciliationStream savedStream = new ReconciliationStream();
            savedStream.setId(100L); savedStream.setOrganization(org);
            when(streamRepository.save(any())).thenReturn(savedStream);

            ReconciliationStep savedStep = new ReconciliationStep();
            savedStep.setId(200L);
            when(stepRepository.save(any())).thenReturn(savedStep);

            ReconciliationRun savedRun = new ReconciliationRun();
            savedRun.setId(300L); savedRun.setStatus(StreamStatus.PENDING);
            when(runRepository.save(any())).thenReturn(savedRun);

            ReconciliationStepRun savedStepRun = new ReconciliationStepRun();
            savedStepRun.setId(400L); savedStepRun.setStatus(StepRunStatus.PENDING);
            when(stepRunRepository.save(any())).thenReturn(savedStepRun);

            when(reconciliationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            // Act
            adapter.attachStreamContext(recon);

            // Assert stream was created for correct org
            ArgumentCaptor<ReconciliationStream> streamCap = ArgumentCaptor.forClass(ReconciliationStream.class);
            verify(streamRepository).save(streamCap.capture());
            assertThat(streamCap.getValue().getOrganization()).isEqualTo(org);
            assertThat(streamCap.getValue().getName()).contains("legacy-recon-42");
            assertThat(streamCap.getValue().getStatus()).isEqualTo(StreamStatus.PENDING);

            // Assert step was linked to stream with correct input types
            ArgumentCaptor<ReconciliationStep> stepCap = ArgumentCaptor.forClass(ReconciliationStep.class);
            verify(stepRepository).save(stepCap.capture());
            assertThat(stepCap.getValue().getStepOrder()).isEqualTo(1);
            assertThat(stepCap.getValue().getSourceInputType()).isEqualTo(InputType.FILE);
            assertThat(stepCap.getValue().getTargetInputType()).isEqualTo(InputType.FILE);

            // Assert run was created PENDING with LEGACY trigger
            ArgumentCaptor<ReconciliationRun> runCap = ArgumentCaptor.forClass(ReconciliationRun.class);
            verify(runRepository).save(runCap.capture());
            assertThat(runCap.getValue().getStatus()).isEqualTo(StreamStatus.PENDING);
            assertThat(runCap.getValue().getTriggerType()).isEqualTo("LEGACY");

            // Assert step_run linked to reconciliation
            ArgumentCaptor<ReconciliationStepRun> srCap = ArgumentCaptor.forClass(ReconciliationStepRun.class);
            verify(stepRunRepository).save(srCap.capture());
            assertThat(srCap.getValue().getStatus()).isEqualTo(StepRunStatus.PENDING);
            assertThat(srCap.getValue().getReconciliation()).isEqualTo(recon);

            // Assert reconciliation was saved with run/stepRun links
            assertThat(recon.getStreamRun()).isEqualTo(savedRun);
            assertThat(recon.getStepRun()).isEqualTo(savedStepRun);
            verify(reconciliationRepository).save(recon);
        }

        @Test
        @DisplayName("TA-ADP-002: Trigger type is LEGACY")
        void triggerTypeIsLegacy() {
            Organization org = buildOrg(1L);
            Reconciliation recon = buildReconciliation(1L, org);

            when(streamRepository.save(any())).thenAnswer(inv -> {
                ReconciliationStream s = inv.getArgument(0); s.setId(1L); return s; });
            when(stepRepository.save(any())).thenAnswer(inv -> {
                ReconciliationStep s = inv.getArgument(0); s.setId(2L); return s; });
            when(runRepository.save(any())).thenAnswer(inv -> {
                ReconciliationRun r = inv.getArgument(0); r.setId(3L); return r; });
            when(stepRunRepository.save(any())).thenAnswer(inv -> {
                ReconciliationStepRun sr = inv.getArgument(0); sr.setId(4L); return sr; });
            when(reconciliationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            adapter.attachStreamContext(recon);

            ArgumentCaptor<ReconciliationRun> cap = ArgumentCaptor.forClass(ReconciliationRun.class);
            verify(runRepository).save(cap.capture());
            assertThat(cap.getValue().getTriggerType()).isEqualTo("LEGACY");
        }
    }

    // -------------------------------------------------------------------------
    // notifyExecutionStarted
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("notifyExecutionStarted")
    class NotifyExecutionStarted {

        @Test
        @DisplayName("TA-ADP-003: Transitions run PENDING→RUNNING and step_run PENDING→IN_PROGRESS")
        void transitionsRunAndStepRun() {
            ReconciliationRun run = buildRun(10L, StreamStatus.PENDING);
            ReconciliationStepRun stepRun = buildStepRun(20L, run, StepRunStatus.PENDING);

            Reconciliation recon = new Reconciliation();
            recon.setId(5L);

            when(stepRunRepository.findByReconciliationId(5L)).thenReturn(Optional.of(stepRun));
            when(runRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(stepRunRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            adapter.notifyExecutionStarted(recon);

            assertThat(run.getStatus()).isEqualTo(StreamStatus.RUNNING);
            assertThat(run.getStartedAt()).isNotNull();
            assertThat(run.getCurrentStepOrder()).isEqualTo(1);
            assertThat(stepRun.getStatus()).isEqualTo(StepRunStatus.IN_PROGRESS);
            assertThat(stepRun.getStartedAt()).isNotNull();
        }

        @Test
        @DisplayName("TA-ADP-004: Does nothing when no step_run found for reconciliation")
        void noOpWhenNoStepRunFound() {
            Reconciliation recon = new Reconciliation();
            recon.setId(99L);
            when(stepRunRepository.findByReconciliationId(99L)).thenReturn(Optional.empty());

            adapter.notifyExecutionStarted(recon);

            verify(runRepository, never()).save(any());
            verify(stepRunRepository, never()).save(any());
        }
    }

    // -------------------------------------------------------------------------
    // notifyExecutionCompleted
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("notifyExecutionCompleted")
    class NotifyExecutionCompleted {

        @Test
        @DisplayName("TA-ADP-005: Transitions step_run IN_PROGRESS→COMPLETED and run RUNNING→COMPLETED")
        void transitionsToCompleted() {
            ReconciliationRun run = buildRun(10L, StreamStatus.RUNNING);
            ReconciliationStepRun stepRun = buildStepRun(20L, run, StepRunStatus.IN_PROGRESS);

            when(stepRunRepository.findByReconciliationId(5L)).thenReturn(Optional.of(stepRun));
            when(stepRunRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(runRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            adapter.notifyExecutionCompleted(5L);

            assertThat(stepRun.getStatus()).isEqualTo(StepRunStatus.COMPLETED);
            assertThat(stepRun.getProgress()).isEqualTo(100);
            assertThat(stepRun.getCompletedAt()).isNotNull();
            assertThat(run.getStatus()).isEqualTo(StreamStatus.COMPLETED);
            assertThat(run.getCompletedAt()).isNotNull();
        }

        @Test
        @DisplayName("TA-ADP-006: Does nothing when no step_run found")
        void noOpWhenNoStepRunFound() {
            when(stepRunRepository.findByReconciliationId(99L)).thenReturn(Optional.empty());

            adapter.notifyExecutionCompleted(99L);

            verify(stepRunRepository, never()).save(any());
            verify(runRepository, never()).save(any());
        }
    }

    // -------------------------------------------------------------------------
    // notifyExecutionFailed
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("notifyExecutionFailed")
    class NotifyExecutionFailed {

        @Test
        @DisplayName("TA-ADP-007: Transitions step_run IN_PROGRESS→FAILED and run RUNNING→FAILED")
        void transitionsToFailed() {
            ReconciliationRun run = buildRun(10L, StreamStatus.RUNNING);
            ReconciliationStepRun stepRun = buildStepRun(20L, run, StepRunStatus.IN_PROGRESS);

            when(stepRunRepository.findByReconciliationId(5L)).thenReturn(Optional.of(stepRun));
            when(stepRunRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(runRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            adapter.notifyExecutionFailed(5L, "parse error");

            assertThat(stepRun.getStatus()).isEqualTo(StepRunStatus.FAILED);
            assertThat(stepRun.getErrorMessage()).isEqualTo("parse error");
            assertThat(stepRun.getCompletedAt()).isNotNull();
            assertThat(run.getStatus()).isEqualTo(StreamStatus.FAILED);
            assertThat(run.getErrorMessage()).isEqualTo("parse error");
            assertThat(run.getCompletedAt()).isNotNull();
        }

        @Test
        @DisplayName("TA-ADP-008: Also fails PENDING step_run (execution died before IN_PROGRESS)")
        void failsPendingStepRunToo() {
            ReconciliationRun run = buildRun(10L, StreamStatus.PENDING);
            ReconciliationStepRun stepRun = buildStepRun(20L, run, StepRunStatus.PENDING);

            when(stepRunRepository.findByReconciliationId(5L)).thenReturn(Optional.of(stepRun));
            when(stepRunRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(runRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            adapter.notifyExecutionFailed(5L, "unexpected error");

            assertThat(stepRun.getStatus()).isEqualTo(StepRunStatus.FAILED);
            assertThat(run.getStatus()).isEqualTo(StreamStatus.FAILED);
        }

        @Test
        @DisplayName("TA-ADP-009: Does nothing when no step_run found")
        void noOpWhenNoStepRunFound() {
            when(stepRunRepository.findByReconciliationId(99L)).thenReturn(Optional.empty());

            adapter.notifyExecutionFailed(99L, "some error");

            verify(stepRunRepository, never()).save(any());
            verify(runRepository, never()).save(any());
        }
    }
}
