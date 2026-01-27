package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.ReconciliationException;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
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
public class ReconciliationExceptionResponse {
    private Long id;
    private ExceptionType type;
    private ExceptionSeverity severity;
    private ExceptionStatus status;
    private String description;
    private String fieldName;
    private String sourceValue;
    private String targetValue;
    private Map<String, Object> sourceData;
    private Map<String, Object> targetData;
    private String aiSuggestion;
    private String resolution;
    private String resolvedBy;
    private LocalDateTime resolvedAt;
    private Long reconciliationId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReconciliationExceptionResponse fromEntity(ReconciliationException entity) {
        return ReconciliationExceptionResponse.builder()
                .id(entity.getId())
                .type(entity.getType())
                .severity(entity.getSeverity())
                .status(entity.getStatus())
                .description(entity.getDescription())
                .fieldName(entity.getFieldName())
                .sourceValue(entity.getSourceValue())
                .targetValue(entity.getTargetValue())
                .sourceData(entity.getSourceData())
                .targetData(entity.getTargetData())
                .aiSuggestion(entity.getAiSuggestion())
                .resolution(entity.getResolution())
                .resolvedBy(entity.getResolvedBy())
                .resolvedAt(entity.getResolvedAt())
                .reconciliationId(entity.getReconciliation().getId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
