package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.FieldMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FieldMappingRepository extends JpaRepository<FieldMapping, Long> {
    List<FieldMapping> findByRuleSetId(Long ruleSetId);
    List<FieldMapping> findByRuleSetIdAndIsKeyTrue(Long ruleSetId);
}
