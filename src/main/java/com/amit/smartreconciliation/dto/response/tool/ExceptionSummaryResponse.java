package com.amit.smartreconciliation.dto.response.tool;

import com.amit.smartreconciliation.entity.ReconciliationException;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Exception summary for list operations.
 */
public record ExceptionSummaryResponse(
    @JsonProperty("id")
    Long id,

    @JsonProperty("reconciliation_id")
    Long reconciliationId,

    @JsonProperty("type")
    String type,

    @JsonProperty("severity")
    String severity,

    @JsonProperty("status")
    String status,

    @JsonProperty("field_name")
    String fieldName,

    @JsonProperty("source_value")
    String sourceValue,

    @JsonProperty("target_value")
    String targetValue,

    @JsonProperty("created_at")
    String createdAt
) {
    public static ExceptionSummaryResponse fromEntity(ReconciliationException exception) {
        return new ExceptionSummaryResponse(
            exception.getId(),
            exception.getReconciliation() != null ? exception.getReconciliation().getId() : null,
            exception.getType().name(),
            exception.getSeverity().name(),
            exception.getStatus().name(),
            exception.getFieldName(),
            exception.getSourceValue(),
            exception.getTargetValue(),
            exception.getCreatedAt() != null ? exception.getCreatedAt().toString() : null
        );
    }
}
