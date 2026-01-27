package com.amit.smartreconciliation.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public class FieldMappingRequest {
    @NotBlank(message = "Source field is required")
    private String sourceField;
    @NotBlank(message = "Target field is required")
    private String targetField;
    private String transform;
    private Double confidence;
    private Boolean isKey;
    private Map<String, Object> transformConfig;

    public FieldMappingRequest() {}

    public String getSourceField() { return sourceField; }
    public void setSourceField(String sourceField) { this.sourceField = sourceField; }
    public String getTargetField() { return targetField; }
    public void setTargetField(String targetField) { this.targetField = targetField; }
    public String getTransform() { return transform; }
    public void setTransform(String transform) { this.transform = transform; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    public Boolean getIsKey() { return isKey; }
    public void setIsKey(Boolean isKey) { this.isKey = isKey; }
    public Map<String, Object> getTransformConfig() { return transformConfig; }
    public void setTransformConfig(Map<String, Object> transformConfig) { this.transformConfig = transformConfig; }
}
