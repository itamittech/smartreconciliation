package com.amit.smartreconciliation.enums;

/**
 * Lifecycle states for ReconciliationStepRun.
 * State machine defined in docs/02-architecture/reconciliation-stream-runtime-architecture.md §4.2
 */
public enum StepRunStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    RETRY_WAIT,
    FAILED,
    SKIPPED,
    CANCELED
}
