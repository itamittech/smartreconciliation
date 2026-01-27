package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.RuleSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RuleSetRepository extends JpaRepository<RuleSet, Long> {
    List<RuleSet> findByOrganizationId(Long organizationId);
    List<RuleSet> findByOrganizationIdAndActiveTrue(Long organizationId);
}
