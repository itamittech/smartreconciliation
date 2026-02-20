package com.amit.smartreconciliation.entity;

import com.amit.smartreconciliation.enums.ReconciliationStatus;
import com.amit.smartreconciliation.enums.KnowledgeDomain;
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
@Table(name = "reconciliations")
public class Reconciliation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReconciliationStatus status = ReconciliationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KnowledgeDomain domain = KnowledgeDomain.GENERAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_file_id")
    private UploadedFile sourceFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_file_id")
    private UploadedFile targetFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_set_id")
    private RuleSet ruleSet;

    private Integer totalSourceRecords = 0;
    private Integer totalTargetRecords = 0;
    private Integer matchedRecords = 0;
    private Integer unmatchedSourceRecords = 0;
    private Integer unmatchedTargetRecords = 0;
    private Integer exceptionCount = 0;
    private Double matchRate = 0.0;
    private Integer progress = 0;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> results;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> statistics;

    @OneToMany(mappedBy = "reconciliation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReconciliationException> exceptions = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Reconciliation() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ReconciliationStatus getStatus() { return status; }
    public void setStatus(ReconciliationStatus status) { this.status = status; }

    public KnowledgeDomain getDomain() { return domain; }
    public void setDomain(KnowledgeDomain domain) { this.domain = domain; }

    public UploadedFile getSourceFile() { return sourceFile; }
    public void setSourceFile(UploadedFile sourceFile) { this.sourceFile = sourceFile; }

    public UploadedFile getTargetFile() { return targetFile; }
    public void setTargetFile(UploadedFile targetFile) { this.targetFile = targetFile; }

    public RuleSet getRuleSet() { return ruleSet; }
    public void setRuleSet(RuleSet ruleSet) { this.ruleSet = ruleSet; }

    public Integer getTotalSourceRecords() { return totalSourceRecords; }
    public void setTotalSourceRecords(Integer v) { this.totalSourceRecords = v; }

    public Integer getTotalTargetRecords() { return totalTargetRecords; }
    public void setTotalTargetRecords(Integer v) { this.totalTargetRecords = v; }

    public Integer getMatchedRecords() { return matchedRecords; }
    public void setMatchedRecords(Integer v) { this.matchedRecords = v; }

    public Integer getUnmatchedSourceRecords() { return unmatchedSourceRecords; }
    public void setUnmatchedSourceRecords(Integer v) { this.unmatchedSourceRecords = v; }

    public Integer getUnmatchedTargetRecords() { return unmatchedTargetRecords; }
    public void setUnmatchedTargetRecords(Integer v) { this.unmatchedTargetRecords = v; }

    public Integer getExceptionCount() { return exceptionCount; }
    public void setExceptionCount(Integer v) { this.exceptionCount = v; }

    public Double getMatchRate() { return matchRate; }
    public void setMatchRate(Double v) { this.matchRate = v; }

    public Integer getProgress() { return progress; }
    public void setProgress(Integer v) { this.progress = v; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String v) { this.errorMessage = v; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime v) { this.startedAt = v; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime v) { this.completedAt = v; }

    public Map<String, Object> getResults() { return results; }
    public void setResults(Map<String, Object> v) { this.results = v; }

    public Map<String, Object> getStatistics() { return statistics; }
    public void setStatistics(Map<String, Object> v) { this.statistics = v; }

    public List<ReconciliationException> getExceptions() { return exceptions; }
    public void setExceptions(List<ReconciliationException> v) { this.exceptions = v; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization v) { this.organization = v; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Reconciliation r = new Reconciliation();
        public Builder name(String v) { r.name = v; return this; }
        public Builder description(String v) { r.description = v; return this; }
        public Builder status(ReconciliationStatus v) { r.status = v; return this; }
        public Builder domain(KnowledgeDomain v) { r.domain = v; return this; }
        public Builder sourceFile(UploadedFile v) { r.sourceFile = v; return this; }
        public Builder targetFile(UploadedFile v) { r.targetFile = v; return this; }
        public Builder ruleSet(RuleSet v) { r.ruleSet = v; return this; }
        public Builder organization(Organization v) { r.organization = v; return this; }
        public Builder progress(Integer v) { r.progress = v; return this; }
        public Reconciliation build() { return r; }
    }
}
