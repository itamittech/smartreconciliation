package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.FieldMapping;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldMappingResponse {
    private Long id;
    private String sourceField;
    private String targetField;
    private String transform;
    private Double confidence;
    private Boolean isKey;
    private Map<String, Object> transformConfig;

    public static FieldMappingResponse fromEntity(FieldMapping entity) {
        return FieldMappingResponse.builder()
                .id(entity.getId())
                .sourceField(entity.getSourceField())
                .targetField(entity.getTargetField())
                .transform(entity.getTransform())
                .confidence(entity.getConfidence())
                .isKey(entity.getIsKey())
                .transformConfig(entity.getTransformConfig())
                .build();
    }
}
