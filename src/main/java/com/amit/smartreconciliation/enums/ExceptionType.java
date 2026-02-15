package com.amit.smartreconciliation.enums;

public enum ExceptionType {
    MISSING_SOURCE,
    MISSING_TARGET,
    VALUE_MISMATCH,
    DUPLICATE,
    FORMAT_ERROR,
    TOLERANCE_EXCEEDED,
    POTENTIAL_MATCH   // AI identified a probable cross-file match missed by key-based matching
}
