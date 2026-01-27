package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByOrganizationIdAndActiveTrueOrderByUpdatedAtDesc(Long organizationId);
    List<ChatSession> findByReconciliationId(Long reconciliationId);
}
