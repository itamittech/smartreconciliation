package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.ReconciliationStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReconciliationStepRepository extends JpaRepository<ReconciliationStep, Long> {
    List<ReconciliationStep> findByStreamIdOrderByStepOrderAsc(Long streamId);
}
