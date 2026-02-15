package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.AiMappingSuggestionRequest;
import com.amit.smartreconciliation.dto.response.AiMappingSuggestionResponse;
import com.amit.smartreconciliation.dto.response.AiRuleSuggestionResponse;
import com.amit.smartreconciliation.dto.response.SchemaResponse;
import com.amit.smartreconciliation.entity.FieldMapping;
import com.amit.smartreconciliation.exception.AiServiceException;
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
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final ChatModel chatModel;
    private final FileUploadService fileUploadService;
    private final ObjectMapper objectMapper;
    private final ChatContextService chatContextService;
    private final ChatClient chatClient;

    public AiService(ChatModel chatModel,
                     FileUploadService fileUploadService,
                     ObjectMapper objectMapper,
                     ChatContextService chatContextService) {
        this.chatModel = chatModel;
        this.fileUploadService = fileUploadService;
        this.objectMapper = objectMapper;
        this.chatContextService = chatContextService;

        // Build ChatClient - Spring AI will auto-discover @Tool annotated methods from @Component classes
        this.chatClient = ChatClient.builder(chatModel).build();
    }

    public AiMappingSuggestionResponse suggestMappings(AiMappingSuggestionRequest request) {
        try {
            SchemaResponse sourceSchema = fileUploadService.getSchema(request.getSourceFileId());
            SchemaResponse targetSchema = fileUploadService.getSchema(request.getTargetFileId());

            String prompt = buildMappingSuggestionPrompt(sourceSchema, targetSchema);

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
        try {
            SchemaResponse sourceSchema = fileUploadService.getSchema(sourceFileId);
            SchemaResponse targetSchema = fileUploadService.getSchema(targetFileId);

            String prompt = buildRuleSuggestionPrompt(sourceSchema, targetSchema, mappings);

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
        try {
            String prompt = buildExceptionSuggestionPrompt(exceptionType, sourceValue, targetValue, fieldName, context);

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

    private String buildMappingSuggestionPrompt(SchemaResponse sourceSchema, SchemaResponse targetSchema) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a data reconciliation expert. Analyze these two file schemas and suggest field mappings.\n\n");

        sb.append("SOURCE FILE: ").append(sourceSchema.getFilename()).append("\n");
        sb.append("Columns:\n");
        for (SchemaResponse.ColumnSchema col : sourceSchema.getColumns()) {
            sb.append("- ").append(col.getName())
              .append(" (type: ").append(col.getDetectedType())
              .append(", samples: ").append(String.join(", ", col.getSampleValues().subList(0, Math.min(3, col.getSampleValues().size()))))
              .append(")\n");
        }

        sb.append("\nTARGET FILE: ").append(targetSchema.getFilename()).append("\n");
        sb.append("Columns:\n");
        for (SchemaResponse.ColumnSchema col : targetSchema.getColumns()) {
            sb.append("- ").append(col.getName())
              .append(" (type: ").append(col.getDetectedType())
              .append(", samples: ").append(String.join(", ", col.getSampleValues().subList(0, Math.min(3, col.getSampleValues().size()))))
              .append(")\n");
        }

        sb.append("\nProvide field mappings as JSON array with format:\n");
        sb.append("{\n");
        sb.append("  \"mappings\": [\n");
        sb.append("    {\n");
        sb.append("      \"sourceField\": \"source_column_name\",\n");
        sb.append("      \"targetField\": \"target_column_name\",\n");
        sb.append("      \"confidence\": 0.95,\n");
        sb.append("      \"reason\": \"Why these fields match\",\n");
        sb.append("      \"isKey\": true/false,\n");
        sb.append("      \"suggestedTransform\": \"optional transform like UPPERCASE, DATE_FORMAT, etc.\"\n");
        sb.append("    }\n");
        sb.append("  ],\n");
        sb.append("  \"explanation\": \"Overall explanation of the mappings\"\n");
        sb.append("}\n");
        sb.append("\nOnly return valid JSON, no markdown code blocks or additional text.");

        return sb.toString();
    }

    private String buildRuleSuggestionPrompt(SchemaResponse sourceSchema, SchemaResponse targetSchema,
                                              List<AiMappingSuggestionResponse.SuggestedMapping> mappings) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a data reconciliation expert. Based on these field mappings and schemas, suggest matching rules.\n\n");

        sb.append("FIELD MAPPINGS TO CREATE RULES FOR:\n");
        for (AiMappingSuggestionResponse.SuggestedMapping m : mappings) {
            sb.append("- ").append(m.getSourceField()).append(" → ").append(m.getTargetField());
            if (Boolean.TRUE.equals(m.getIsKey())) sb.append(" [KEY FIELD]");
            sb.append("\n");
        }

        sb.append("\nSOURCE SCHEMA (types for context):\n");
        for (SchemaResponse.ColumnSchema col : sourceSchema.getColumns()) {
            sb.append("- ").append(col.getName()).append(": ").append(col.getDetectedType()).append("\n");
        }

        sb.append("\nReturn ONLY valid JSON (no markdown):\n");
        sb.append("{\n  \"rules\": [\n    {\n");
        sb.append("      \"name\": \"Descriptive rule name\",\n");
        sb.append("      \"sourceField\": \"source_column\",\n");
        sb.append("      \"targetField\": \"target_column\",\n");
        sb.append("      \"matchType\": \"EXACT|FUZZY|RANGE|CONTAINS|STARTS_WITH|ENDS_WITH\",\n");
        sb.append("      \"isKey\": true|false,\n");
        sb.append("      \"fuzzyThreshold\": 0.85,\n");
        sb.append("      \"tolerance\": 0.01,\n");
        sb.append("      \"priority\": 1,\n");
        sb.append("      \"reason\": \"Why this match type\"\n");
        sb.append("    }\n  ],\n  \"explanation\": \"Overall matching strategy\"\n}");

        return sb.toString();
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
        return String.format("""
            You are a data reconciliation expert. Analyze this exception and suggest a resolution.

            Exception Type: %s
            Field: %s
            Source Value: %s
            Target Value: %s
            Context: %s

            Provide a brief, actionable suggestion for resolving this discrepancy.
            Consider common causes like formatting differences, rounding, timing, or data entry errors.
            """, exceptionType, fieldName, sourceValue, targetValue, context);
    }

    private String buildChatSystemPrompt(String context) {
        // Build comprehensive system prompt with detailed knowledge
        StringBuilder systemPrompt = new StringBuilder();

        // Add comprehensive system knowledge
        systemPrompt.append(chatContextService.buildSystemKnowledge());

        // Add dynamic context
        systemPrompt.append("\n## CURRENT SESSION CONTEXT\n\n");
        if (context != null && !context.trim().isEmpty()) {
            systemPrompt.append(context);
        } else {
            systemPrompt.append("No specific reconciliation or session context provided.\n");
        }

        systemPrompt.append("""

            ## RESPONSE GUIDELINES

            - Be concise, helpful, and technically accurate
            - Always reference actual system components (table names, field names, enum values) from the system knowledge above
            - When explaining how the system works, describe the actual implementation, not hypothetical scenarios
            - If you don't have specific information in the context, say so clearly
            - Provide actionable guidance based on the actual system capabilities
            - Use markdown formatting for better readability
            """);

        return systemPrompt.toString();
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
                .map(fm -> fm.getSourceField() + " → " + fm.getTargetField())
                .reduce("", (a, b) -> a.isEmpty() ? b : a + ", " + b);

        StringBuilder sb = new StringBuilder();
        sb.append("You are a data reconciliation expert. The following records failed exact key-based matching. ");
        sb.append("Identify pairs that likely represent the same entity despite formatting differences ");
        sb.append("(e.g., case differences, leading zeros, date formats, abbreviations, typos).\n\n");
        sb.append("KEY FIELDS: ").append(keyFields).append("\n\n");

        sb.append("UNMATCHED SOURCE RECORDS (index: data):\n");
        for (int i = 0; i < sources.size(); i++) {
            sb.append(i).append(": ").append(sources.get(i)).append("\n");
        }

        sb.append("\nUNMATCHED TARGET RECORDS (index: data):\n");
        for (int i = 0; i < targets.size(); i++) {
            sb.append(i).append(": ").append(targets.get(i)).append("\n");
        }

        sb.append("\nReturn ONLY a valid JSON array (no markdown) of potential matches:\n");
        sb.append("[{\"sourceIndex\":0,\"targetIndex\":2,\"confidence\":0.85,\"reasoning\":\"Why they match\"}]\n");
        sb.append("Only include pairs with confidence >= 0.65. Return empty array [] if none found.");

        return sb.toString();
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
}
