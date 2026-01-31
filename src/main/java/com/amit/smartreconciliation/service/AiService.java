package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.AiMappingSuggestionRequest;
import com.amit.smartreconciliation.dto.response.AiMappingSuggestionResponse;
import com.amit.smartreconciliation.dto.response.SchemaResponse;
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

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final ChatModel chatModel;
    private final FileUploadService fileUploadService;
    private final ObjectMapper objectMapper;
    private final ChatContextService chatContextService;

    public AiService(ChatModel chatModel,
                     FileUploadService fileUploadService,
                     ObjectMapper objectMapper,
                     ChatContextService chatContextService) {
        this.chatModel = chatModel;
        this.fileUploadService = fileUploadService;
        this.objectMapper = objectMapper;
        this.chatContextService = chatContextService;
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

    public String suggestRules(Long sourceFileId, Long targetFileId, List<String> mappedFields) {
        try {
            SchemaResponse sourceSchema = fileUploadService.getSchema(sourceFileId);
            SchemaResponse targetSchema = fileUploadService.getSchema(targetFileId);

            String prompt = buildRuleSuggestionPrompt(sourceSchema, targetSchema, mappedFields);

            ChatClient chatClient = ChatClient.create(chatModel);
            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
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
        try {
            String systemPrompt = buildChatSystemPrompt(context);

            ChatClient chatClient = ChatClient.create(chatModel);
            return chatClient.prompt()
                    .system(systemPrompt)
                    .user(message)
                    .stream()
                    .content();
        } catch (Exception e) {
            log.error("Error in AI chat: {}", e.getMessage(), e);
            return Flux.error(new AiServiceException("Chat error: " + e.getMessage(), e));
        }
    }

    public String chatSync(String message, String context) {
        try {
            String systemPrompt = buildChatSystemPrompt(context);

            ChatClient chatClient = ChatClient.create(chatModel);
            return chatClient.prompt()
                    .system(systemPrompt)
                    .user(message)
                    .call()
                    .content();
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
                                              List<String> mappedFields) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a data reconciliation expert. Based on these schemas and mappings, suggest matching rules.\n\n");

        sb.append("SOURCE SCHEMA:\n");
        for (SchemaResponse.ColumnSchema col : sourceSchema.getColumns()) {
            sb.append("- ").append(col.getName()).append(" (").append(col.getDetectedType()).append(")\n");
        }

        sb.append("\nTARGET SCHEMA:\n");
        for (SchemaResponse.ColumnSchema col : targetSchema.getColumns()) {
            sb.append("- ").append(col.getName()).append(" (").append(col.getDetectedType()).append(")\n");
        }

        sb.append("\nMAPPED FIELDS: ").append(String.join(", ", mappedFields)).append("\n");

        sb.append("\nSuggest matching rules considering:\n");
        sb.append("- Which fields should be key identifiers\n");
        sb.append("- Which fields need exact matching vs fuzzy matching\n");
        sb.append("- Appropriate tolerances for numeric fields\n");
        sb.append("- Date format considerations\n");

        return sb.toString();
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
