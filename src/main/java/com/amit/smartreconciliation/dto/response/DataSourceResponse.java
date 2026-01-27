package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.DataSource;
import com.amit.smartreconciliation.enums.DataSourceType;
import java.time.LocalDateTime;
import java.util.Map;

public class DataSourceResponse {
    private Long id;
    private String name;
    private String description;
    private DataSourceType type;
    private Map<String, Object> config;
    private Boolean active;
    private LocalDateTime lastTestedAt;
    private Boolean lastTestSuccessful;
    private String lastTestError;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DataSourceResponse() {}

    public static DataSourceResponse fromEntity(DataSource entity) {
        DataSourceResponse r = new DataSourceResponse();
        r.id = entity.getId();
        r.name = entity.getName();
        r.description = entity.getDescription();
        r.type = entity.getType();
        r.config = entity.getConfig();
        r.active = entity.getActive();
        r.lastTestedAt = entity.getLastTestedAt();
        r.lastTestSuccessful = entity.getLastTestSuccessful();
        r.lastTestError = entity.getLastTestError();
        r.createdAt = entity.getCreatedAt();
        r.updatedAt = entity.getUpdatedAt();
        return r;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public DataSourceType getType() { return type; }
    public Map<String, Object> getConfig() { return config; }
    public Boolean getActive() { return active; }
    public LocalDateTime getLastTestedAt() { return lastTestedAt; }
    public Boolean getLastTestSuccessful() { return lastTestSuccessful; }
    public String getLastTestError() { return lastTestError; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
