package com.amit.smartreconciliation.entity;

import com.amit.smartreconciliation.enums.ReconciliationStatus;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "reconciliations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reconciliation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReconciliationStatus status = ReconciliationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_file_id")
    private UploadedFile sourceFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_file_id")
    private UploadedFile targetFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_set_id")
    private RuleSet ruleSet;

    @Builder.Default
    private Integer totalSourceRecords = 0;

    @Builder.Default
    private Integer totalTargetRecords = 0;

    @Builder.Default
    private Integer matchedRecords = 0;

    @Builder.Default
    private Integer unmatchedSourceRecords = 0;

    @Builder.Default
    private Integer unmatchedTargetRecords = 0;

    @Builder.Default
    private Integer exceptionCount = 0;

    @Builder.Default
    private Double matchRate = 0.0;

    @Builder.Default
    private Integer progress = 0;

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
    @Builder.Default
    private List<ReconciliationException> exceptions = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
