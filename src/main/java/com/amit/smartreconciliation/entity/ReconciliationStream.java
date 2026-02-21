package com.amit.smartreconciliation.entity;

import com.amit.smartreconciliation.enums.StreamStatus;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Definition-time entity for a named, ordered sequence of reconciliation steps.
 * One stream may be executed many times via ReconciliationRun.
 */
@Entity
@Table(name = "reconciliation_streams")
public class ReconciliationStream {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private StreamStatus status = StreamStatus.PENDING;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @OneToMany(mappedBy = "stream", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepOrder ASC")
    private List<ReconciliationStep> steps = new ArrayList<>();

    @OneToMany(mappedBy = "stream", cascade = CascadeType.ALL)
    private List<ReconciliationRun> runs = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public ReconciliationStream() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public StreamStatus getStatus() { return status; }
    public void setStatus(StreamStatus status) { this.status = status; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    public List<ReconciliationStep> getSteps() { return steps; }
    public void setSteps(List<ReconciliationStep> steps) { this.steps = steps; }

    public List<ReconciliationRun> getRuns() { return runs; }
    public void setRuns(List<ReconciliationRun> runs) { this.runs = runs; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
