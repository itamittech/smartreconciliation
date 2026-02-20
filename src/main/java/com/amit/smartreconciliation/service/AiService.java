package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.AiMappingSuggestionRequest;
import com.amit.smartreconciliation.dto.response.AiMappingSuggestionResponse;
import com.amit.smartreconciliation.dto.response.AiRuleSuggestionResponse;
import com.amit.smartreconciliation.dto.response.DomainDetectionResponse;
import com.amit.smartreconciliation.dto.response.SchemaResponse;
import com.amit.smartreconciliation.enums.KnowledgeDomain;
import com.amit.smartreconciliation.entity.FieldMapping;
import com.amit.smartreconciliation.exception.AiServiceException;
import com.amit.smartreconciliation.security.SecurityUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final ChatModel chatModel;
    private final FileUploadService fileUploadService;
    private final ObjectMapper objectMapper;
    private final ChatContextService chatContextService;
    private final PromptTemplateService promptTemplateService;
    private final KnowledgeRetrievalService knowledgeRetrievalService;
    private final ChatClient chatClient;

    public AiService(ChatModel chatModel,
                     FileUploadService fileUploadService,
                     ObjectMapper objectMapper,
                     ChatContextService chatContextService,
                     PromptTemplateService promptTemplateService,
                     KnowledgeRetrievalService knowledgeRetrievalService) {
        this.chatModel = chatModel;
        this.fileUploadService = fileUploadService;
        this.objectMapper = objectMapper;
        this.chatContextService = chatContextService;
        this.promptTemplateService = promptTemplateService;
        this.knowledgeRetrievalService = knowledgeRetrievalService;

        // Build ChatClient - Spring AI will auto-discover @Tool annotated methods from @Component classes
        this.chatClient = ChatClient.builder(chatModel).build();
    }

    public AiMappingSuggestionResponse suggestMappings(AiMappingSuggestionRequest request) {
        try {
            SchemaResponse sourceSchema = fileUploadService.getSchema(request.getSourceFileId());
            SchemaResponse targetSchema = fileUploadService.getSchema(request.getTargetFileId());
            KnowledgeDomain domain = request.getDomain() != null ? request.getDomain() : KnowledgeDomain.GENERAL;

            String prompt = buildMappingSuggestionPrompt(sourceSchema, targetSchema);

            // RAG: prepend domain knowledge if available
            String ragQuery = "column mapping field definitions: "
                    + formatColumnNames(sourceSchema.getColumns())
                    + " " + formatColumnNames(targetSchema.getColumns());
            prompt = prependKnowledge(prompt, ragQuery, domain);

            ChatClient chatClient = ChatClient.create(chatModel);
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            return parseMappingSuggestionResponse(response);
        } catch (Exception e) {
            log.error("Error getting AI mapping suggestions: {}", e.getMessage(), e);
            throw new AiServiceException("Failed to get mapping suggestions: " + e.getMessage(), e);
        }
    }

    public AiRuleSuggestionResponse suggestRules(Long sourceFileId, Long targetFileId,
                                                 List<AiMappingSuggestionResponse.SuggestedMapping> mappings) {
        return suggestRules(sourceFileId, targetFileId, mappings, KnowledgeDomain.GENERAL);
    }

    public AiRuleSuggestionResponse suggestRules(Long sourceFileId, Long targetFileId,
                                                 List<AiMappingSuggestionResponse.SuggestedMapping> mappings,
                                                 KnowledgeDomain domain) {
        try {
            SchemaResponse sourceSchema = fileUploadService.getSchema(sourceFileId);
            SchemaResponse targetSchema = fileUploadService.getSchema(targetFileId);

            String prompt = buildRuleSuggestionPrompt(sourceSchema, targetSchema, mappings);

            // RAG: prepend domain knowledge if available
            String ragQuery = "matching rules tolerances for: " + formatFieldMappings(mappings);
            prompt = prependKnowledge(prompt, ragQuery, domain != null ? domain : KnowledgeDomain.GENERAL);

            ChatClient chatClient = ChatClient.create(chatModel);
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            return parseRuleSuggestionResponse(response);
        } catch (Exception e) {
            log.error("Error getting AI rule suggestions: {}", e.getMessage(), e);
            throw new AiServiceException("Failed to get rule suggestions: " + e.getMessage(), e);
        }
    }

    public String getExceptionSuggestion(String exceptionType, String sourceValue, String targetValue,
                                         String fieldName, String context) {
        return getExceptionSuggestion(exceptionType, sourceValue, targetValue, fieldName, context, KnowledgeDomain.GENERAL);
    }

    public String getExceptionSuggestion(String exceptionType, String sourceValue, String targetValue,
                                         String fieldName, String context, KnowledgeDomain domain) {
        try {
            String prompt = buildExceptionSuggestionPrompt(exceptionType, sourceValue, targetValue, fieldName, context);

            // RAG: prepend domain knowledge if available
            String ragQuery = exceptionType + " " + fieldName + " resolution strategy";
            prompt = prependKnowledge(prompt, ragQuery, domain != null ? domain : KnowledgeDomain.GENERAL);

            ChatClient chatClient = ChatClient.create(chatModel);
            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Error getting AI exception suggestion: {}", e.getMessage(), e);
            throw new AiServiceException("Failed to get exception suggestion: " + e.getMessage(), e);
        }
    }

    /**
     * Classify a text sample into a KnowledgeDomain using the LLM.
     * Returns GENERAL with confidence 0.5 if classification fails.
     */
    public DomainDetectionResponse detectDomain(String sampleContent) {
        String truncated = sampleContent != null && sampleContent.length() > 2000
                ? sampleContent.substring(0, 2000)
                : sampleContent;

        String prompt = """
                Classify the following text into exactly one reconciliation domain.
                Domains: BANKING, TRADING, ACCOUNTS_PAYABLE, INVENTORY, INTERCOMPANY, ECOMMERCE, TECHNICAL, GENERAL
                Return ONLY valid JSON with no markdown fences: {"domain":"<DOMAIN>","confidence":<0.0-1.0>}

                Text:
                """ + truncated;

        try {
            String response = ChatClient.create(chatModel).prompt()
                    .user(prompt)
                    .call()
                    .content();

            String cleaned = response.trim()
                    .replaceAll("(?s)^```json", "").replaceAll("(?s)^```", "").replaceAll("```$", "").trim();

            JsonNode node = objectMapper.readTree(cleaned);
            String domainStr = node.has("domain") ? node.get("domain").asText("GENERAL") : "GENERAL";
            double confidence = node.has("confidence") ? node.get("confidence").asDouble(0.5) : 0.5;

            KnowledgeDomain domain;
            try {
                domain = KnowledgeDomain.valueOf(domainStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("LLM returned unknown domain '{}', defaulting to GENERAL", domainStr);
                domain = KnowledgeDomain.GENERAL;
            }

            return new DomainDetectionResponse(domain, confidence);
        } catch (Exception e) {
            log.warn("Domain detection failed: {}", e.getMessage());
            return new DomainDetectionResponse(KnowledgeDomain.GENERAL, 0.5);
        }
    }

    public Flux<String> chat(String message, String context) {
        return chat(message, context, new Object[0]);
    }

    public Flux<String> chat(String message, String context, Object... tools) {
        try {
            String systemPrompt = buildChatSystemPrompt(context);
            var prompt = chatClient.prompt().system(systemPrompt).user(message);
            if (tools != null && tools.length > 0) {
                prompt = prompt.tools(tools);
            }
            return prompt.stream().content();
        } catch (Exception e) {
            log.error("Error in AI chat: {}", e.getMessage(), e);
            return Flux.error(new AiServiceException("Chat error: " + e.getMessage(), e));
        }
    }

    public String chatSync(String message, String context) {
        return chatSync(message, context, new Object[0]);
    }

    public String chatSync(String message, String context, Object... tools) {
        try {
            String systemPrompt = buildChatSystemPrompt(context);
            var prompt = chatClient.prompt().system(systemPrompt).user(message);
            if (tools != null && tools.length > 0) {
                prompt = prompt.tools(tools);
            }
            return prompt.call().content();
        } catch (Exception e) {
            log.error("Error in AI chat: {}", e.getMessage(), e);
            throw new AiServiceException("Chat error: " + e.getMessage(), e);
        }
    }

    /**
     * Fetches relevant knowledge snippets and prepends them to the prompt under
     * a "## DOMAIN KNOWLEDGE" heading. No-ops silently if the knowledge base is
     * empty or the vector store call fails.
     */
    private String prependKnowledge(String prompt, String query, KnowledgeDomain domain) {
        try {
            Long orgId = SecurityUtils.getCurrentOrgId();
            List<String> snippets = knowledgeRetrievalService.search(query, domain, orgId);
            if (snippets.isEmpty()) {
                return prompt;
            }
            String knowledgeBlock = "\n\n## DOMAIN KNOWLEDGE\n"
                    + snippets.stream().map(s -> "- " + s).collect(Collectors.joining("\n"))
                    + "\n\n";
            log.debug("RAG: injecting {} knowledge snippets for query='{}'", snippets.size(), query);
            return knowledgeBlock + prompt;
        } catch (Exception e) {
            log.debug("RAG knowledge lookup skipped: {}", e.getMessage());
            return prompt;
        }
    }

    private String formatColumnNames(List<SchemaResponse.ColumnSchema> columns) {
        if (columns == null || columns.isEmpty()) return "";
        return columns.stream().map(SchemaResponse.ColumnSchema::getName).collect(Collectors.joining(", "));
    }

    private String buildMappingSuggestionPrompt(SchemaResponse sourceSchema, SchemaResponse targetSchema) {
        Map<String, String> variables = new HashMap<>();
        variables.put("sourceFileName", sourceSchema.getFilename());
        variables.put("sourceColumns", formatSchemaColumnsWithSamples(sourceSchema.getColumns()));
        variables.put("targetFileName", targetSchema.getFilename());
        variables.put("targetColumns", formatSchemaColumnsWithSamples(targetSchema.getColumns()));

        return promptTemplateService.renderTemplate("prompts/ai/mapping-suggestion.st", variables);
    }

    private String buildRuleSuggestionPrompt(SchemaResponse sourceSchema, SchemaResponse targetSchema,
                                             List<AiMappingSuggestionResponse.SuggestedMapping> mappings) {
        Map<String, String> variables = new HashMap<>();
        variables.put("fieldMappings", formatFieldMappings(mappings));
        variables.put("sourceSchema", formatSchemaTypes(sourceSchema.getColumns()));
        variables.put("targetSchema", formatSchemaTypes(targetSchema.getColumns()));

        return promptTemplateService.renderTemplate("prompts/ai/rule-suggestion.st", variables);
    }

    private AiRuleSuggestionResponse parseRuleSuggestionResponse(String response) {
        try {
            String cleaned = response.trim()
                    .replaceAll("(?s)^```json", "").replaceAll("(?s)^```", "").replaceAll("```$", "").trim();

            JsonNode root = objectMapper.readTree(cleaned);
            AiRuleSuggestionResponse result = new AiRuleSuggestionResponse();

            if (root.has("explanation")) {
                result.setExplanation(root.get("explanation").asText());
            }

            List<AiRuleSuggestionResponse.SuggestedRule> rules = new ArrayList<>();
            JsonNode rulesNode = root.get("rules");
            if (rulesNode != null && rulesNode.isArray()) {
                for (JsonNode node : rulesNode) {
                    AiRuleSuggestionResponse.SuggestedRule rule = new AiRuleSuggestionResponse.SuggestedRule();
                    rule.setName(node.has("name") ? node.get("name").asText() : "Rule");
                    rule.setSourceField(node.has("sourceField") ? node.get("sourceField").asText() : null);
                    rule.setTargetField(node.has("targetField") ? node.get("targetField").asText() : null);
                    rule.setMatchType(node.has("matchType") ? node.get("matchType").asText("EXACT") : "EXACT");
                    rule.setIsKey(node.has("isKey") ? node.get("isKey").asBoolean() : false);
                    rule.setFuzzyThreshold(node.has("fuzzyThreshold") ? node.get("fuzzyThreshold").asDouble() : null);
                    rule.setTolerance(node.has("tolerance") ? node.get("tolerance").asDouble() : null);
                    rule.setPriority(node.has("priority") ? node.get("priority").asInt(0) : 0);
                    rule.setReason(node.has("reason") ? node.get("reason").asText() : null);
                    rules.add(rule);
                }
            }
            result.setRules(rules);
            return result;
        } catch (JsonProcessingException e) {
            log.error("Failed to parse AI rule suggestion response: {}", response);
            throw new AiServiceException("Failed to parse AI rule suggestions", e);
        }
    }

    private String buildExceptionSuggestionPrompt(String exceptionType, String sourceValue,
                                                  String targetValue, String fieldName, String context) {
        Map<String, String> variables = new HashMap<>();
        variables.put("exceptionType", exceptionType);
        variables.put("fieldName", fieldName);
        variables.put("sourceValue", sourceValue);
        variables.put("targetValue", targetValue);
        variables.put("context", context);

        return promptTemplateService.renderTemplate("prompts/ai/exception-suggestion.st", variables);
    }

    private String buildChatSystemPrompt(String context) {
        String contextValue = context;
        if (contextValue == null || contextValue.trim().isEmpty()) {
            contextValue = "No specific reconciliation or session context provided.";
        }

        Map<String, String> variables = new HashMap<>();
        variables.put("systemKnowledge", chatContextService.buildSystemKnowledge());
        variables.put("context", contextValue);

        return promptTemplateService.renderTemplate("prompts/ai/chat-system.st", variables);
    }

    public record PotentialMatchSuggestion(
            Map<String, Object> sourceRecord,
            Map<String, Object> targetRecord,
            double confidence,
            String reasoning) {}

    public List<PotentialMatchSuggestion> suggestPotentialMatches(
            List<Map<String, Object>> unmatchedSourceRecords,
            List<Map<String, Object>> unmatchedTargetRecords,
            List<FieldMapping> fieldMappings) {
        try {
            // Limit to 30 records per side to keep prompt size manageable
            List<Map<String, Object>> sources = unmatchedSourceRecords.subList(
                    0, Math.min(30, unmatchedSourceRecords.size()));
            List<Map<String, Object>> targets = unmatchedTargetRecords.subList(
                    0, Math.min(30, unmatchedTargetRecords.size()));

            String prompt = buildPotentialMatchPrompt(sources, targets, fieldMappings);

            ChatClient chatClient = ChatClient.create(chatModel);
            String response = chatClient.prompt().user(prompt).call().content();

            return parsePotentialMatchResponse(response, sources, targets);
        } catch (Exception e) {
            log.warn("AI potential match analysis failed: {}", e.getMessage());
            return List.of();
        }
    }

    private String buildPotentialMatchPrompt(List<Map<String, Object>> sources,
                                             List<Map<String, Object>> targets,
                                             List<FieldMapping> fieldMappings) {
        String keyFields = fieldMappings.stream()
                .filter(FieldMapping::getIsKey)
                .map(fm -> fm.getSourceField() + " -> " + fm.getTargetField())
                .collect(Collectors.joining(", "));

        if (keyFields.isEmpty()) {
            keyFields = "(none)";
        }

        Map<String, String> variables = new HashMap<>();
        variables.put("keyFields", keyFields);
        variables.put("sourceRecords", formatIndexedRecords(sources));
        variables.put("targetRecords", formatIndexedRecords(targets));

        return promptTemplateService.renderTemplate("prompts/ai/potential-match.st", variables);
    }

    private List<PotentialMatchSuggestion> parsePotentialMatchResponse(
            String response,
            List<Map<String, Object>> sources,
            List<Map<String, Object>> targets) {
        try {
            String cleaned = response.trim()
                    .replaceAll("^```json", "").replaceAll("^```", "").replaceAll("```$", "").trim();

            JsonNode root = objectMapper.readTree(cleaned);
            List<PotentialMatchSuggestion> results = new ArrayList<>();

            if (root.isArray()) {
                for (JsonNode node : root) {
                    int sourceIndex = node.has("sourceIndex") ? node.get("sourceIndex").asInt(-1) : -1;
                    int targetIndex = node.has("targetIndex") ? node.get("targetIndex").asInt(-1) : -1;
                    double confidence = node.has("confidence") ? node.get("confidence").asDouble(0) : 0;
                    String reasoning = node.has("reasoning") ? node.get("reasoning").asText("") : "";

                    if (sourceIndex >= 0 && sourceIndex < sources.size()
                            && targetIndex >= 0 && targetIndex < targets.size()
                            && confidence >= 0.65) {
                        results.add(new PotentialMatchSuggestion(
                                sources.get(sourceIndex), targets.get(targetIndex), confidence, reasoning));
                    }
                }
            }
            return results;
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse potential match response: {}", e.getMessage());
            return List.of();
        }
    }

    private AiMappingSuggestionResponse parseMappingSuggestionResponse(String response) {
        try {
            String cleanedResponse = response.trim();
            if (cleanedResponse.startsWith("```json")) {
                cleanedResponse = cleanedResponse.substring(7);
            }
            if (cleanedResponse.startsWith("```")) {
                cleanedResponse = cleanedResponse.substring(3);
            }
            if (cleanedResponse.endsWith("```")) {
                cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length() - 3);
            }
            cleanedResponse = cleanedResponse.trim();

            JsonNode root = objectMapper.readTree(cleanedResponse);

            List<AiMappingSuggestionResponse.SuggestedMapping> mappings = new ArrayList<>();
            JsonNode mappingsNode = root.get("mappings");
            if (mappingsNode != null && mappingsNode.isArray()) {
                for (JsonNode node : mappingsNode) {
                    AiMappingSuggestionResponse.SuggestedMapping mapping =
                            AiMappingSuggestionResponse.SuggestedMapping.builder()
                                    .sourceField(node.get("sourceField").asText())
                                    .targetField(node.get("targetField").asText())
                                    .confidence(node.has("confidence") ? node.get("confidence").asDouble() : 0.8)
                                    .reason(node.has("reason") ? node.get("reason").asText() : null)
                                    .isKey(node.has("isKey") ? node.get("isKey").asBoolean() : false)
                                    .suggestedTransform(node.has("suggestedTransform") ? node.get("suggestedTransform").asText() : null)
                                    .build();
                    mappings.add(mapping);
                }
            }

            String explanation = root.has("explanation") ? root.get("explanation").asText() : null;

            return AiMappingSuggestionResponse.builder()
                    .mappings(mappings)
                    .explanation(explanation)
                    .build();
        } catch (JsonProcessingException e) {
            log.error("Failed to parse AI response: {}", response);
            throw new AiServiceException("Failed to parse AI mapping suggestions", e);
        }
    }

    private String formatSchemaColumnsWithSamples(List<SchemaResponse.ColumnSchema> columns) {
        if (columns == null || columns.isEmpty()) {
            return "- (none)";
        }

        List<String> lines = new ArrayList<>();
        for (SchemaResponse.ColumnSchema col : columns) {
            List<String> sampleValues = col.getSampleValues();
            if (sampleValues == null) {
                sampleValues = List.of();
            }
            List<String> limitedSamples = sampleValues.subList(0, Math.min(3, sampleValues.size()));
            String samples = limitedSamples.isEmpty() ? "N/A" : String.join(", ", limitedSamples);
            lines.add("- " + col.getName() + " (type: " + col.getDetectedType() + ", samples: " + samples + ")");
        }
        return String.join("\n", lines);
    }

    private String formatSchemaTypes(List<SchemaResponse.ColumnSchema> columns) {
        if (columns == null || columns.isEmpty()) {
            return "- (none)";
        }

        List<String> lines = new ArrayList<>();
        for (SchemaResponse.ColumnSchema col : columns) {
            lines.add("- " + col.getName() + ": " + col.getDetectedType());
        }
        return String.join("\n", lines);
    }

    private String formatFieldMappings(List<AiMappingSuggestionResponse.SuggestedMapping> mappings) {
        if (mappings == null || mappings.isEmpty()) {
            return "- (none)";
        }

        List<String> lines = new ArrayList<>();
        for (AiMappingSuggestionResponse.SuggestedMapping mapping : mappings) {
            String line = "- " + mapping.getSourceField() + " -> " + mapping.getTargetField();
            if (Boolean.TRUE.equals(mapping.getIsKey())) {
                line += " [KEY FIELD]";
            }
            lines.add(line);
        }
        return String.join("\n", lines);
    }

    private String formatIndexedRecords(List<Map<String, Object>> records) {
        if (records == null || records.isEmpty()) {
            return "(none)";
        }

        List<String> lines = new ArrayList<>();
        for (int i = 0; i < records.size(); i++) {
            lines.add(i + ": " + records.get(i));
        }
        return String.join("\n", lines);
    }
}
