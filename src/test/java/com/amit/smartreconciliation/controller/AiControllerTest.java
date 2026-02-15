package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.AiMappingSuggestionRequest;
import com.amit.smartreconciliation.dto.response.AiMappingSuggestionResponse;
import com.amit.smartreconciliation.dto.response.AiRuleSuggestionResponse;
import com.amit.smartreconciliation.exception.AiServiceException;
import com.amit.smartreconciliation.service.AiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AiController
 * Module: AI Integration
 * Test Level: Integration Test
 * Total Test Cases: 2
 */
@WebMvcTest(AiController.class)
@DisplayName("AiController Integration Tests")
class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AiService aiService;

    private AiMappingSuggestionResponse mockMappingResponse;

    @BeforeEach
    void setUp() {
        // Setup mock mapping response
        mockMappingResponse = createMockMappingResponse();
    }

    // ==================== Mapping Suggestion Tests ====================

    @Test
    @DisplayName("TC-AIC-001: POST /api/v1/ai/suggest-mapping - Get Field Mapping Suggestions")
    void testGetFieldMappingSuggestions() throws Exception {
        // Given
        AiMappingSuggestionRequest request = new AiMappingSuggestionRequest();
        request.setSourceFileId(1L);
        request.setTargetFileId(2L);

        when(aiService.suggestMappings(any(AiMappingSuggestionRequest.class)))
            .thenReturn(mockMappingResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/ai/suggest-mapping")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Organization-Id", "org-123")
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Mapping suggestions generated"))
            .andExpect(jsonPath("$.data").isNotEmpty())
            .andExpect(jsonPath("$.data.mappings").isArray())
            .andExpect(jsonPath("$.data.mappings", hasSize(3)))

            // Verify first mapping
            .andExpect(jsonPath("$.data.mappings[0].sourceField").value("invoice_id"))
            .andExpect(jsonPath("$.data.mappings[0].targetField").value("id"))
            .andExpect(jsonPath("$.data.mappings[0].confidence").value(0.95))
            .andExpect(jsonPath("$.data.mappings[0].isKey").value(true))
            .andExpect(jsonPath("$.data.mappings[0].reason").value("Both are unique identifier fields"))

            // Verify second mapping
            .andExpect(jsonPath("$.data.mappings[1].sourceField").value("customer_name"))
            .andExpect(jsonPath("$.data.mappings[1].targetField").value("client_name"))
            .andExpect(jsonPath("$.data.mappings[1].confidence").value(0.88))
            .andExpect(jsonPath("$.data.mappings[1].isKey").value(false))

            // Verify third mapping
            .andExpect(jsonPath("$.data.mappings[2].sourceField").value("total_amount"))
            .andExpect(jsonPath("$.data.mappings[2].targetField").value("amount"))
            .andExpect(jsonPath("$.data.mappings[2].confidence").value(0.92))
            .andExpect(jsonPath("$.data.mappings[2].isKey").value(false))

            // Verify explanation
            .andExpect(jsonPath("$.data.explanation").value(containsString("field name similarity")));
    }

    @Test
    @DisplayName("TC-AIC-001b: POST /api/v1/ai/suggest-mapping - Validation Error for Missing Fields")
    void testGetFieldMappingSuggestionsValidationError() throws Exception {
        // Given - Request with missing required fields
        AiMappingSuggestionRequest request = new AiMappingSuggestionRequest();
        // sourceFileId and targetFileId are null

        // When & Then
        mockMvc.perform(post("/api/v1/ai/suggest-mapping")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Organization-Id", "org-123")
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-AIC-001c: POST /api/v1/ai/suggest-mapping - AI Service Unavailable")
    void testGetFieldMappingSuggestionsServiceError() throws Exception {
        // Given
        AiMappingSuggestionRequest request = new AiMappingSuggestionRequest();
        request.setSourceFileId(1L);
        request.setTargetFileId(2L);

        when(aiService.suggestMappings(any(AiMappingSuggestionRequest.class)))
            .thenThrow(new AiServiceException("AI service unavailable"));

        // When & Then
        mockMvc.perform(post("/api/v1/ai/suggest-mapping")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Organization-Id", "org-123")
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isServiceUnavailable()); // 503 from global exception handler
    }

    // ==================== Rule Suggestion Tests ====================

    @Test
    @DisplayName("TC-AIC-002: POST /api/v1/ai/suggest-rules - Get Matching Rule Suggestions")
    void testGetMatchingRuleSuggestions() throws Exception {
        // Given
        AiRuleSuggestionResponse mockResponse = new AiRuleSuggestionResponse();
        
        AiRuleSuggestionResponse.SuggestedRule rule1 = new AiRuleSuggestionResponse.SuggestedRule();
        rule1.setSourceField("customer_name");
        rule1.setTargetField("client_name");
        rule1.setMatchType("FUZZY");
        rule1.setFuzzyThreshold(0.85);
        rule1.setReason("Text field with potential typos");

        AiRuleSuggestionResponse.SuggestedRule rule2 = new AiRuleSuggestionResponse.SuggestedRule();
        rule2.setSourceField("total_amount");
        rule2.setTargetField("amount");
        rule2.setMatchType("RANGE");
        rule2.setTolerance(0.50);
        rule2.setReason("Currency field with potential rounding differences");

        AiRuleSuggestionResponse.SuggestedRule rule3 = new AiRuleSuggestionResponse.SuggestedRule();
        rule3.setSourceField("invoice_ref");
        rule3.setTargetField("reference");
        rule3.setMatchType("EXACT");
        rule3.setReason("Reference field requiring exact match");

        mockResponse.setRules(Arrays.asList(rule1, rule2, rule3));
        mockResponse.setExplanation("Suggested rules based on field mappings.");

        when(aiService.suggestRules(eq(1L), eq(2L), anyList()))
            .thenReturn(mockResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/ai/suggest-rules")
                .param("sourceFileId", "1")
                .param("targetFileId", "2")
                .param("mappedFields", "customer_name", "total_amount", "invoice_ref")
                .header("X-Organization-Id", "org-123"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Rule suggestions generated"))
            .andExpect(jsonPath("$.data.rules", hasSize(3)))
            .andExpect(jsonPath("$.data.rules[0].matchType").value("FUZZY"))
            .andExpect(jsonPath("$.data.rules[1].matchType").value("RANGE"))
            .andExpect(jsonPath("$.data.rules[2].matchType").value("EXACT"))
            .andExpect(jsonPath("$.data.explanation").value("Suggested rules based on field mappings."));
    }

    @Test
    @DisplayName("TC-AIC-002b: POST /api/v1/ai/suggest-rules - Without Mapped Fields")
    void testGetMatchingRuleSuggestionsWithoutMappedFields() throws Exception {
        // Given
        AiRuleSuggestionResponse mockResponse = new AiRuleSuggestionResponse();
        mockResponse.setRules(List.of());
        mockResponse.setExplanation("Please provide field mappings to generate matching rule suggestions.");

        when(aiService.suggestRules(eq(1L), eq(2L), eq(List.of())))
            .thenReturn(mockResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/ai/suggest-rules")
                .param("sourceFileId", "1")
                .param("targetFileId", "2")
                .header("X-Organization-Id", "org-123"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Rule suggestions generated"))
            .andExpect(jsonPath("$.data.rules", hasSize(0)))
            .andExpect(jsonPath("$.data.explanation").value("Please provide field mappings to generate matching rule suggestions."));
    }

    @Test
    @DisplayName("TC-AIC-002c: POST /api/v1/ai/suggest-rules - Missing Required Parameters")
    void testGetMatchingRuleSuggestionsMissingParams() throws Exception {
        // Given - Request missing sourceFileId

        // When & Then
        mockMvc.perform(post("/api/v1/ai/suggest-rules")
                .param("targetFileId", "2")
                .param("mappedFields", "customer_name")
                .header("X-Organization-Id", "org-123"))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-AIC-002d: POST /api/v1/ai/suggest-rules - AI Service Error")
    void testGetMatchingRuleSuggestionsServiceError() throws Exception {
        // Given
        when(aiService.suggestRules(eq(1L), eq(2L), anyList()))
            .thenThrow(new AiServiceException("AI service unavailable"));

        // When & Then
        mockMvc.perform(post("/api/v1/ai/suggest-rules")
                .param("sourceFileId", "1")
                .param("targetFileId", "2")
                .param("mappedFields", "customer_name")
                .header("X-Organization-Id", "org-123"))
            .andExpect(status().isServiceUnavailable()); // 503 from global exception handler
    }

    // ==================== Helper Methods ====================

    private AiMappingSuggestionResponse createMockMappingResponse() {
        List<AiMappingSuggestionResponse.SuggestedMapping> mappings = Arrays.asList(
            AiMappingSuggestionResponse.SuggestedMapping.builder()
                .sourceField("invoice_id")
                .targetField("id")
                .confidence(0.95)
                .reason("Both are unique identifier fields")
                .isKey(true)
                .suggestedTransform(null)
                .build(),
            AiMappingSuggestionResponse.SuggestedMapping.builder()
                .sourceField("customer_name")
                .targetField("client_name")
                .confidence(0.88)
                .reason("Name fields with similar semantics")
                .isKey(false)
                .suggestedTransform(null)
                .build(),
            AiMappingSuggestionResponse.SuggestedMapping.builder()
                .sourceField("total_amount")
                .targetField("amount")
                .confidence(0.92)
                .reason("Both are amount fields")
                .isKey(false)
                .suggestedTransform(null)
                .build()
        );

        return AiMappingSuggestionResponse.builder()
            .mappings(mappings)
            .explanation("Suggested mappings based on field name similarity and data type matching")
            .build();
    }
}
