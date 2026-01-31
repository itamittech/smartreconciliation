package com.amit.smartreconciliation.dto.response.tool;

import com.amit.smartreconciliation.entity.Reconciliation;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

/**
 * Simplified reconciliation response optimized for AI tool consumption.
 * Contains only essential fields to minimize token usage.
 */
public record ReconciliationDetailsResponse(
    @JsonProperty("id")
    Long id,

    @JsonProperty("name")
    String name,

    @JsonProperty("description")
    String description,

    @JsonProperty("status")
    String status,

    @JsonProperty("progress")
    Integer progress,

    @JsonProperty("match_rate")
    Double matchRate,

    @JsonProperty("source_file_name")
    String sourceFileName,

    @JsonProperty("target_file_name")
    String targetFileName,

    @JsonProperty("rule_set_name")
    String ruleSetName,

    @JsonProperty("total_source_records")
    Integer totalSourceRecords,

    @JsonProperty("total_target_records")
    Integer totalTargetRecords,

    @JsonProperty("matched_records")
    Integer matchedRecords,

    @JsonProperty("unmatched_source_records")
    Integer unmatchedSourceRecords,

    @JsonProperty("unmatched_target_records")
    Integer unmatchedTargetRecords,

    @JsonProperty("exception_count")
    Integer exceptionCount,

    @JsonProperty("started_at")
    String startedAt,

    @JsonProperty("completed_at")
    String completedAt,

    @JsonProperty("created_at")
    String createdAt
) {
    public static ReconciliationDetailsResponse fromEntity(Reconciliation reconciliation) {
        return new ReconciliationDetailsResponse(
            reconciliation.getId(),
            reconciliation.getName(),
            reconciliation.getDescription(),
            reconciliation.getStatus().name(),
            reconciliation.getProgress(),
            reconciliation.getMatchRate(),
            reconciliation.getSourceFile() != null ? reconciliation.getSourceFile().getOriginalFilename() : null,
            reconciliation.getTargetFile() != null ? reconciliation.getTargetFile().getOriginalFilename() : null,
            reconciliation.getRuleSet() != null ? reconciliation.getRuleSet().getName() : null,
            reconciliation.getTotalSourceRecords(),
            reconciliation.getTotalTargetRecords(),
            reconciliation.getMatchedRecords(),
            reconciliation.getUnmatchedSourceRecords(),
            reconciliation.getUnmatchedTargetRecords(),
            reconciliation.getExceptionCount(),
            reconciliation.getStartedAt() != null ? reconciliation.getStartedAt().toString() : null,
            reconciliation.getCompletedAt() != null ? reconciliation.getCompletedAt().toString() : null,
            reconciliation.getCreatedAt() != null ? reconciliation.getCreatedAt().toString() : null
        );
    }
}
