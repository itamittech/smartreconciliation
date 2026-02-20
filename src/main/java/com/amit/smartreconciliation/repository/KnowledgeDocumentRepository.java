package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.KnowledgeDocument;
import com.amit.smartreconciliation.enums.KnowledgeDomain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, Long> {

    List<KnowledgeDocument> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);

    List<KnowledgeDocument> findByOrganizationIdAndDomainOrderByCreatedAtDesc(Long organizationId, KnowledgeDomain domain);

    Optional<KnowledgeDocument> findByIdAndOrganizationId(Long id, Long organizationId);

    boolean existsByIdAndOrganizationId(Long id, Long organizationId);
}
