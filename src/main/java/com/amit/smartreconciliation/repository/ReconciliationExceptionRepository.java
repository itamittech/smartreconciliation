package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.ReconciliationException;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReconciliationExceptionRepository extends JpaRepository<ReconciliationException, Long> {
    List<ReconciliationException> findByReconciliationId(Long reconciliationId);

    Page<ReconciliationException> findByReconciliationId(Long reconciliationId, Pageable pageable);

    List<ReconciliationException> findByReconciliationIdAndStatus(Long reconciliationId, ExceptionStatus status);

    List<ReconciliationException> findByReconciliationIdAndType(Long reconciliationId, ExceptionType type);

    List<ReconciliationException> findByReconciliationIdAndSeverity(Long reconciliationId, ExceptionSeverity severity);

    @Query("SELECT e FROM ReconciliationException e WHERE e.reconciliation.id = :reconciliationId " +
           "AND (:type IS NULL OR e.type = :type) " +
           "AND (:severity IS NULL OR e.severity = :severity) " +
           "AND (:status IS NULL OR e.status = :status)")
    Page<ReconciliationException> findByFilters(
            @Param("reconciliationId") Long reconciliationId,
            @Param("type") ExceptionType type,
            @Param("severity") ExceptionSeverity severity,
            @Param("status") ExceptionStatus status,
            Pageable pageable);

    @Query("SELECT e FROM ReconciliationException e WHERE " +
           "(:type IS NULL OR e.type = :type) " +
           "AND (:severity IS NULL OR e.severity = :severity) " +
           "AND (:status IS NULL OR e.status = :status)")
    Page<ReconciliationException> findAllByFilters(
            @Param("type") ExceptionType type,
            @Param("severity") ExceptionSeverity severity,
            @Param("status") ExceptionStatus status,
            Pageable pageable);

    @Query("SELECT e FROM ReconciliationException e WHERE " +
           "(:reconciliationId IS NULL OR e.reconciliation.id = :reconciliationId) " +
           "AND (:type IS NULL OR e.type = :type) " +
           "AND (:severity IS NULL OR e.severity = :severity) " +
           "AND (:status IS NULL OR e.status = :status) " +
           "AND (:fromCreatedAt IS NULL OR e.reconciliation.createdAt >= :fromCreatedAt) " +
           "AND (:toCreatedAt IS NULL OR e.reconciliation.createdAt < :toCreatedAt)")
    Page<ReconciliationException> findByScope(
            @Param("reconciliationId") Long reconciliationId,
            @Param("type") ExceptionType type,
            @Param("severity") ExceptionSeverity severity,
            @Param("status") ExceptionStatus status,
            @Param("fromCreatedAt") LocalDateTime fromCreatedAt,
            @Param("toCreatedAt") LocalDateTime toCreatedAt,
            Pageable pageable);

    @Query("SELECT e FROM ReconciliationException e WHERE " +
           "(:reconciliationId IS NULL OR e.reconciliation.id = :reconciliationId) " +
           "AND (:type IS NULL OR e.type = :type) " +
           "AND (:severity IS NULL OR e.severity = :severity) " +
           "AND (:status IS NULL OR e.status = :status) " +
           "AND (:fromCreatedAt IS NULL OR e.reconciliation.createdAt >= :fromCreatedAt) " +
           "AND (:toCreatedAt IS NULL OR e.reconciliation.createdAt < :toCreatedAt)")
    List<ReconciliationException> findAllByScope(
            @Param("reconciliationId") Long reconciliationId,
            @Param("type") ExceptionType type,
            @Param("severity") ExceptionSeverity severity,
            @Param("status") ExceptionStatus status,
            @Param("fromCreatedAt") LocalDateTime fromCreatedAt,
            @Param("toCreatedAt") LocalDateTime toCreatedAt);

    @Query("SELECT e.reconciliation.id AS reconciliationId, " +
           "e.reconciliation.name AS reconciliationName, " +
           "e.reconciliation.createdAt AS reconciliationCreatedAt, " +
           "SUM(CASE WHEN e.status = com.amit.smartreconciliation.enums.ExceptionStatus.OPEN THEN 1 ELSE 0 END) AS openCount, " +
           "SUM(CASE WHEN e.status = com.amit.smartreconciliation.enums.ExceptionStatus.IN_REVIEW THEN 1 ELSE 0 END) AS inReviewCount, " +
           "SUM(CASE WHEN e.status = com.amit.smartreconciliation.enums.ExceptionStatus.OPEN " +
           "AND e.severity = com.amit.smartreconciliation.enums.ExceptionSeverity.CRITICAL THEN 1 ELSE 0 END) AS criticalOpenCount, " +
           "SUM(CASE WHEN e.status = com.amit.smartreconciliation.enums.ExceptionStatus.OPEN " +
           "AND e.aiSuggestion IS NOT NULL AND e.aiSuggestion <> '' THEN 1 ELSE 0 END) AS aiActionableCount, " +
           "COUNT(e) AS totalInScope " +
           "FROM ReconciliationException e WHERE " +
           "(:type IS NULL OR e.type = :type) " +
           "AND (:severity IS NULL OR e.severity = :severity) " +
           "AND (:status IS NULL OR e.status = :status) " +
           "AND (:fromCreatedAt IS NULL OR e.reconciliation.createdAt >= :fromCreatedAt) " +
           "AND (:toCreatedAt IS NULL OR e.reconciliation.createdAt < :toCreatedAt) " +
           "GROUP BY e.reconciliation.id, e.reconciliation.name, e.reconciliation.createdAt " +
           "ORDER BY e.reconciliation.createdAt DESC")
    List<ExceptionRunSummaryProjection> summarizeByRun(
            @Param("type") ExceptionType type,
            @Param("severity") ExceptionSeverity severity,
            @Param("status") ExceptionStatus status,
            @Param("fromCreatedAt") LocalDateTime fromCreatedAt,
            @Param("toCreatedAt") LocalDateTime toCreatedAt);

    long countByReconciliationIdAndStatus(Long reconciliationId, ExceptionStatus status);

    interface ExceptionRunSummaryProjection {
        Long getReconciliationId();
        String getReconciliationName();
        LocalDateTime getReconciliationCreatedAt();
        Long getOpenCount();
        Long getInReviewCount();
        Long getCriticalOpenCount();
        Long getAiActionableCount();
        Long getTotalInScope();
    }
}
