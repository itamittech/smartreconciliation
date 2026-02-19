package com.amit.smartreconciliation.entity;

import com.amit.smartreconciliation.enums.DataSourceType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "data_sources")
public class DataSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DataSourceType type;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> config = new HashMap<>();

    @Column(nullable = false)
    private Boolean active = true;

    private LocalDateTime lastTestedAt;
    private Boolean lastTestSuccessful;

    @Column(columnDefinition = "TEXT")
    private String lastTestError;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public DataSource() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public DataSourceType getType() { return type; }
    public void setType(DataSourceType type) { this.type = type; }

    public Map<String, Object> getConfig() { return config; }
    public void setConfig(Map<String, Object> config) { this.config = config; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getLastTestedAt() { return lastTestedAt; }
    public void setLastTestedAt(LocalDateTime lastTestedAt) { this.lastTestedAt = lastTestedAt; }

    public Boolean getLastTestSuccessful() { return lastTestSuccessful; }
    public void setLastTestSuccessful(Boolean lastTestSuccessful) { this.lastTestSuccessful = lastTestSuccessful; }

    public String getLastTestError() { return lastTestError; }
    public void setLastTestError(String lastTestError) { this.lastTestError = lastTestError; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final DataSource ds = new DataSource();
        public Builder name(String name) { ds.name = name; return this; }
        public Builder description(String description) { ds.description = description; return this; }
        public Builder type(DataSourceType type) { ds.type = type; return this; }
        public Builder config(Map<String, Object> config) { ds.config = config; return this; }
        public Builder active(Boolean active) { ds.active = active; return this; }
        public Builder organization(Organization org) { ds.organization = org; return this; }
        public DataSource build() { return ds; }
    }
}
