package com.amit.smartreconciliation.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "rule_sets")
public class RuleSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Integer version = 1;

    @Column(nullable = false)
    private Boolean isAiGenerated = false;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "ruleSet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FieldMapping> fieldMappings = new ArrayList<>();

    @OneToMany(mappedBy = "ruleSet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MatchingRule> matchingRules = new ArrayList<>();

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public RuleSet() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public Boolean getIsAiGenerated() { return isAiGenerated; }
    public void setIsAiGenerated(Boolean isAiGenerated) { this.isAiGenerated = isAiGenerated; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public List<FieldMapping> getFieldMappings() { return fieldMappings; }
    public void setFieldMappings(List<FieldMapping> fieldMappings) { this.fieldMappings = fieldMappings; }

    public List<MatchingRule> getMatchingRules() { return matchingRules; }
    public void setMatchingRules(List<MatchingRule> matchingRules) { this.matchingRules = matchingRules; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final RuleSet rs = new RuleSet();
        public Builder name(String v) { rs.name = v; return this; }
        public Builder description(String v) { rs.description = v; return this; }
        public Builder version(Integer v) { rs.version = v; return this; }
        public Builder isAiGenerated(Boolean v) { rs.isAiGenerated = v; return this; }
        public Builder active(Boolean v) { rs.active = v; return this; }
        public Builder fieldMappings(List<FieldMapping> v) { rs.fieldMappings = v; return this; }
        public Builder matchingRules(List<MatchingRule> v) { rs.matchingRules = v; return this; }
        public Builder metadata(Map<String, Object> v) { rs.metadata = v; return this; }
        public Builder organization(Organization v) { rs.organization = v; return this; }
        public RuleSet build() { return rs; }
    }
}
