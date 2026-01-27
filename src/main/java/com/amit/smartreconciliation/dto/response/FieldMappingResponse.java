package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.FieldMapping;
import java.util.Map;

public class FieldMappingResponse {
    private Long id;
    private String sourceField;
    private String targetField;
    private String transform;
    private Double confidence;
    private Boolean isKey;
    private Map<String, Object> transformConfig;

    public FieldMappingResponse() {}

    public static FieldMappingResponse fromEntity(FieldMapping entity) {
        FieldMappingResponse r = new FieldMappingResponse();
        r.id = entity.getId();
        r.sourceField = entity.getSourceField();
        r.targetField = entity.getTargetField();
        r.transform = entity.getTransform();
        r.confidence = entity.getConfidence();
        r.isKey = entity.getIsKey();
        r.transformConfig = entity.getTransformConfig();
        return r;
    }

    public Long getId() { return id; }
    public String getSourceField() { return sourceField; }
    public String getTargetField() { return targetField; }
    public String getTransform() { return transform; }
    public Double getConfidence() { return confidence; }
    public Boolean getIsKey() { return isKey; }
    public Map<String, Object> getTransformConfig() { return transformConfig; }
}
