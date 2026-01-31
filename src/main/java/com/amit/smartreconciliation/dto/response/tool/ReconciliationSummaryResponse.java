package com.amit.smartreconciliation.dto.response.tool;

import com.amit.smartreconciliation.entity.Reconciliation;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Lightweight reconciliation summary for list operations.
 */
public record ReconciliationSummaryResponse(
    @JsonProperty("id")
    Long id,

    @JsonProperty("name")
    String name,

    @JsonProperty("status")
    String status,

    @JsonProperty("match_rate")
    Double matchRate,

    @JsonProperty("exception_count")
    Integer exceptionCount,

    @JsonProperty("created_at")
    String createdAt
) {
    public static ReconciliationSummaryResponse fromEntity(Reconciliation reconciliation) {
        return new ReconciliationSummaryResponse(
            reconciliation.getId(),
            reconciliation.getName(),
            reconciliation.getStatus().name(),
            reconciliation.getMatchRate(),
            reconciliation.getExceptionCount(),
            reconciliation.getCreatedAt() != null ? reconciliation.getCreatedAt().toString() : null
        );
    }
}
