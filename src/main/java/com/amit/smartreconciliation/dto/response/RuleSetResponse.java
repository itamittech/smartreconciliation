package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.RuleSet;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class RuleSetResponse {
    private Long id;
    private String name;
    private String description;
    private Integer version;
    private Boolean isAiGenerated;
    private Boolean active;
    private List<FieldMappingResponse> fieldMappings;
    private List<MatchingRuleResponse> matchingRules;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RuleSetResponse() {}

    public static RuleSetResponse fromEntity(RuleSet entity) {
        RuleSetResponse r = new RuleSetResponse();
        r.id = entity.getId();
        r.name = entity.getName();
        r.description = entity.getDescription();
        r.version = entity.getVersion();
        r.isAiGenerated = entity.getIsAiGenerated();
        r.active = entity.getActive();
        r.fieldMappings = entity.getFieldMappings() != null ?
                entity.getFieldMappings().stream().map(FieldMappingResponse::fromEntity).collect(Collectors.toList()) : null;
        r.matchingRules = entity.getMatchingRules() != null ?
                entity.getMatchingRules().stream().map(MatchingRuleResponse::fromEntity).collect(Collectors.toList()) : null;
        r.metadata = entity.getMetadata();
        r.createdAt = entity.getCreatedAt();
        r.updatedAt = entity.getUpdatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Integer getVersion() { return version; }
    public Boolean getIsAiGenerated() { return isAiGenerated; }
    public Boolean getActive() { return active; }
    public List<FieldMappingResponse> getFieldMappings() { return fieldMappings; }
    public List<MatchingRuleResponse> getMatchingRules() { return matchingRules; }
    public Map<String, Object> getMetadata() { return metadata; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
