package com.amit.smartreconciliation.enums;

/**
 * Polymorphic input source types for ReconciliationStep.
 * Input contract defined in docs/02-architecture/reconciliation-stream-runtime-architecture.md §3.2
 */
public enum InputType {
    FILE,
    STEP_OUTPUT_UNMATCHED_SOURCE,
    STEP_OUTPUT_UNMATCHED_TARGET,
    DATA_SOURCE_SNAPSHOT
}
