package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.entity.KnowledgeDocument;
import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.entity.User;
import com.amit.smartreconciliation.enums.KnowledgeDomain;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.KnowledgeDocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Orchestrates the full knowledge ingestion pipeline:
 *   parse file → embed chunks → store in PgVector → save tracking record.
 *
 * Delete removes both the tracking record and all associated vectors
 * via a JDBC metadata filter on the vector_store table.
 */
@Service
public class KnowledgeIngestionService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeIngestionService.class);

    private final KnowledgeParserService parserService;
    private final KnowledgeDocumentRepository repository;
    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;

    public KnowledgeIngestionService(
            KnowledgeParserService parserService,
            KnowledgeDocumentRepository repository,
            VectorStore vectorStore,
            JdbcTemplate jdbcTemplate) {
        this.parserService = parserService;
        this.repository = repository;
        this.vectorStore = vectorStore;
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Parse, embed, and store a knowledge file.
     * The KnowledgeDocument entity is saved only after successful vector storage.
     */
    @Transactional
    public KnowledgeDocument ingest(MultipartFile file, KnowledgeDomain domain,
                                    Organization org, User createdBy) throws IOException {
        String originalFilename = file.getOriginalFilename() != null
                ? file.getOriginalFilename() : "unknown";
        String title = stripExtension(originalFilename);
        String fileType = extractExtension(originalFilename);

        log.info("Ingesting knowledge file '{}' (domain={}, org={})", title, domain, org.getId());

        // 1. Parse into chunks
        List<String> chunks = parserService.parse(file);
        if (chunks.isEmpty()) {
            throw new IllegalArgumentException("No content could be extracted from file: " + originalFilename);
        }
        log.debug("Parsed {} chunks from '{}'", chunks.size(), title);

        // 2. Save tracking entity first to get the generated ID for use in vector metadata
        KnowledgeDocument doc = new KnowledgeDocument();
        doc.setTitle(title);
        doc.setDomain(domain);
        doc.setFileType(fileType);
        doc.setChunkCount(chunks.size());
        doc.setOrganization(org);
        doc.setCreatedBy(createdBy);
        doc = repository.save(doc);
        final Long docId = doc.getId();

        // 3. Wrap chunks as Documents with metadata and store in PgVector
        List<Document> documents = chunks.stream()
                .map(chunk -> new Document(
                        chunk,
                        Map.of(
                                "domain", domain.name(),
                                "organizationId", org.getId().toString(),
                                "documentId", docId.toString()
                        )
                ))
                .toList();

        vectorStore.add(documents);
        log.info("Stored {} vectors for knowledge document id={}", documents.size(), docId);

        return doc;
    }

    /**
     * Delete a knowledge document and all its associated vectors.
     * Vectors are deleted via a JDBC metadata filter since Spring AI 1.1.2's
     * VectorStore interface only supports delete-by-UUID-list.
     */
    @Transactional
    public void deleteDocument(Long documentId, Long orgId) {
        KnowledgeDocument doc = repository.findByIdAndOrganizationId(documentId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeDocument", documentId));

        // Delete vectors from PgVector by metadata documentId
        int deleted = jdbcTemplate.update(
                "DELETE FROM vector_store WHERE metadata->>'documentId' = ?",
                documentId.toString()
        );
        log.info("Deleted {} vectors for knowledge document id={}", deleted, documentId);

        repository.delete(doc);
        log.info("Deleted knowledge document id={}", documentId);
    }

    // -------------------------------------------------------------------------

    private String stripExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(0, dot) : filename;
    }

    private String extractExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(dot + 1).toLowerCase() : "txt";
    }
}
