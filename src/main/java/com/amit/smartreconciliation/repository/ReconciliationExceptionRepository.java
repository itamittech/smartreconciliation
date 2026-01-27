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

    long countByReconciliationIdAndStatus(Long reconciliationId, ExceptionStatus status);
}
