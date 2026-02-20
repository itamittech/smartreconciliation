package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.enums.KnowledgeDomain;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.Filter;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Domain-scoped similarity search against the PgVector knowledge base.
 *
 * Search strategy:
 *  1. Query with domain + org filter (exact match)
 *  2. Fallback: if no results, retry with org filter only (picks up GENERAL docs)
 *  3. Return empty list if still no results — callers skip RAG injection silently
 */
@Service
public class KnowledgeRetrievalService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeRetrievalService.class);
    private static final int DEFAULT_TOP_K = 5;

    private final VectorStore vectorStore;

    public KnowledgeRetrievalService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    /**
     * Search with default top-K of 5.
     */
    public List<String> search(String query, KnowledgeDomain domain, Long orgId) {
        return search(query, domain, orgId, DEFAULT_TOP_K);
    }

    /**
     * Search the knowledge base with metadata filtering by domain and organisation.
     *
     * @param query  Natural-language search query
     * @param domain Reconciliation domain to narrow results
     * @param orgId  Organisation ID for data isolation
     * @param topK   Maximum number of chunks to return
     */
    public List<String> search(String query, KnowledgeDomain domain, Long orgId, int topK) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        // Primary search: domain + org scoped
        FilterExpressionBuilder b = new FilterExpressionBuilder();
        Filter.Expression domainOrgFilter = b.and(
                b.eq("domain", domain.name()),
                b.eq("organizationId", orgId.toString())
        ).build();

        List<String> results = doSearch(query, domainOrgFilter, topK);

        if (!results.isEmpty()) {
            log.debug("Knowledge search found {} results (domain={}, org={})", results.size(), domain, orgId);
            return results;
        }

        // Fallback: org-only filter — returns GENERAL or any other domain docs
        if (domain != KnowledgeDomain.GENERAL) {
            log.debug("No domain-specific results for '{}', falling back to org-wide search", domain);
            Filter.Expression orgOnlyFilter = b.eq("organizationId", orgId.toString()).build();
            results = doSearch(query, orgOnlyFilter, topK);
            if (!results.isEmpty()) {
                log.debug("Knowledge fallback search found {} results (org={})", results.size(), orgId);
                return results;
            }
        }

        log.debug("Knowledge search returned no results for query='{}' domain={} org={}", query, domain, orgId);
        return List.of();
    }

    private List<String> doSearch(String query, Filter.Expression filter, int topK) {
        try {
            SearchRequest request = SearchRequest.builder()
                    .query(query)
                    .topK(topK)
                    .filterExpression(filter)
                    .build();

            return vectorStore.similaritySearch(request)
                    .stream()
                    .map(Document::getText)
                    .toList();
        } catch (Exception e) {
            log.warn("Vector search failed: {}", e.getMessage());
            return List.of();
        }
    }
}
