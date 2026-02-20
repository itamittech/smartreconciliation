package com.amit.smartreconciliation.service.tool;

import com.amit.smartreconciliation.enums.KnowledgeDomain;
import com.amit.smartreconciliation.security.SecurityUtils;
import com.amit.smartreconciliation.service.KnowledgeRetrievalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * AI tool that exposes the domain knowledge base to the chat assistant.
 * The LLM calls this when the user asks about field definitions, matching rules,
 * or industry-specific reconciliation strategies.
 */
@Component
public class KnowledgeTool {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeTool.class);

    private final KnowledgeRetrievalService knowledgeRetrievalService;

    public KnowledgeTool(KnowledgeRetrievalService knowledgeRetrievalService) {
        this.knowledgeRetrievalService = knowledgeRetrievalService;
    }

    @Tool(description = "Search the domain knowledge base for reconciliation rules, field definitions, and exception resolution strategies. Use this when the user asks about specific field names, matching logic, industry standards, or domain-specific terminology.")
    public String searchKnowledge(String query, String domain) {
        log.info("Tool Call: searchKnowledge(query='{}', domain='{}')", query, domain);

        KnowledgeDomain kd;
        try {
            kd = KnowledgeDomain.valueOf(domain.toUpperCase());
        } catch (Exception e) {
            log.debug("Unrecognised domain '{}', defaulting to GENERAL", domain);
            kd = KnowledgeDomain.GENERAL;
        }

        Long orgId;
        try {
            orgId = SecurityUtils.getCurrentOrgId();
        } catch (Exception e) {
            log.warn("Could not resolve org from security context in KnowledgeTool: {}", e.getMessage());
            return "Knowledge search unavailable: no authenticated session.";
        }

        List<String> results = knowledgeRetrievalService.search(query, kd, orgId);

        if (results.isEmpty()) {
            return "No relevant knowledge found in the " + kd + " domain for: " + query;
        }

        return String.join("\n---\n", results);
    }
}
