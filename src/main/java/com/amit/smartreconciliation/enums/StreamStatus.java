package com.amit.smartreconciliation.enums;

/**
 * Lifecycle states for ReconciliationStream (definition) and ReconciliationRun (execution).
 * State machine defined in docs/02-architecture/reconciliation-stream-runtime-architecture.md §4.1
 */
public enum StreamStatus {
    PENDING,
    RUNNING,
    PARTIAL_FAILED,
    FAILED,
    COMPLETED,
    CANCELED
}
