package com.amit.smartreconciliation.exception;

public class InvalidStateTransitionException extends RuntimeException {
    public InvalidStateTransitionException(String entityType, Object currentState, Object targetState) {
        super(String.format("Invalid state transition for %s: %s -> %s", entityType, currentState, targetState));
    }
}
