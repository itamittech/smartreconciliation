package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.enums.ReconciliationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReconciliationRepository extends JpaRepository<Reconciliation, Long> {
    List<Reconciliation> findByOrganizationId(Long organizationId);
    Page<Reconciliation> findByOrganizationId(Long organizationId, Pageable pageable);
    List<Reconciliation> findByOrganizationIdAndStatus(Long organizationId, ReconciliationStatus status);
    List<Reconciliation> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
}
