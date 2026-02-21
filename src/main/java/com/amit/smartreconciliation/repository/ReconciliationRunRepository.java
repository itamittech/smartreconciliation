package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.ReconciliationRun;
import com.amit.smartreconciliation.enums.StreamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReconciliationRunRepository extends JpaRepository<ReconciliationRun, Long> {
    List<ReconciliationRun> findByOrganizationId(Long organizationId);
    List<ReconciliationRun> findByStreamId(Long streamId);
    List<ReconciliationRun> findByStreamIdAndStatus(Long streamId, StreamStatus status);
    List<ReconciliationRun> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
}
