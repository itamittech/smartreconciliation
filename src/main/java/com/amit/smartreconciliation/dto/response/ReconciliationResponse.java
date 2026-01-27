package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.enums.ReconciliationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReconciliationResponse {
    private Long id;
    private String name;
    private String description;
    private ReconciliationStatus status;
    private Long sourceFileId;
    private String sourceFileName;
    private Long targetFileId;
    private String targetFileName;
    private Long ruleSetId;
    private String ruleSetName;
    private Integer totalSourceRecords;
    private Integer totalTargetRecords;
    private Integer matchedRecords;
    private Integer unmatchedSourceRecords;
    private Integer unmatchedTargetRecords;
    private Integer exceptionCount;
    private Double matchRate;
    private Integer progress;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Map<String, Object> results;
    private Map<String, Object> statistics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReconciliationResponse fromEntity(Reconciliation entity) {
        return ReconciliationResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .sourceFileId(entity.getSourceFile() != null ? entity.getSourceFile().getId() : null)
                .sourceFileName(entity.getSourceFile() != null ? entity.getSourceFile().getOriginalFilename() : null)
                .targetFileId(entity.getTargetFile() != null ? entity.getTargetFile().getId() : null)
                .targetFileName(entity.getTargetFile() != null ? entity.getTargetFile().getOriginalFilename() : null)
                .ruleSetId(entity.getRuleSet() != null ? entity.getRuleSet().getId() : null)
                .ruleSetName(entity.getRuleSet() != null ? entity.getRuleSet().getName() : null)
                .totalSourceRecords(entity.getTotalSourceRecords())
                .totalTargetRecords(entity.getTotalTargetRecords())
                .matchedRecords(entity.getMatchedRecords())
                .unmatchedSourceRecords(entity.getUnmatchedSourceRecords())
                .unmatchedTargetRecords(entity.getUnmatchedTargetRecords())
                .exceptionCount(entity.getExceptionCount())
                .matchRate(entity.getMatchRate())
                .progress(entity.getProgress())
                .errorMessage(entity.getErrorMessage())
                .startedAt(entity.getStartedAt())
                .completedAt(entity.getCompletedAt())
                .results(entity.getResults())
                .statistics(entity.getStatistics())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
