package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.ReconciliationStream;
import com.amit.smartreconciliation.enums.StreamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReconciliationStreamRepository extends JpaRepository<ReconciliationStream, Long> {
    List<ReconciliationStream> findByOrganizationId(Long organizationId);
    List<ReconciliationStream> findByOrganizationIdAndStatus(Long organizationId, StreamStatus status);
    List<ReconciliationStream> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
}
