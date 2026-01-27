package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.MatchingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchingRuleRepository extends JpaRepository<MatchingRule, Long> {
    List<MatchingRule> findByRuleSetId(Long ruleSetId);
    List<MatchingRule> findByRuleSetIdAndActiveTrueOrderByPriorityDesc(Long ruleSetId);
}
