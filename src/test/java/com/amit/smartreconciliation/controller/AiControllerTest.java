package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.AiMappingSuggestionRequest;
import com.amit.smartreconciliation.dto.response.AiMappingSuggestionResponse;
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
        String mockRuleSuggestions = """
            Suggested Matching Rules:

            1. **customer_name** (TEXT) → client_name:
               - Rule Type: FUZZY
               - Threshold: 0.85
               - Reasoning: Text field with potential typos

            2. **total_amount** (CURRENCY) → amount:
               - Rule Type: RANGE
               - Tolerance: 0.50
               - Reasoning: Currency field with potential rounding differences

            3. **invoice_ref** (TEXT) → reference:
               - Rule Type: EXACT
               - Reasoning: Reference field requiring exact match
            """;

        when(aiService.suggestRules(eq(1L), eq(2L), anyList()))
            .thenReturn(mockRuleSuggestions);

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
            .andExpect(jsonPath("$.data").isString())
            .andExpect(jsonPath("$.data", containsString("FUZZY")))
            .andExpect(jsonPath("$.data", containsString("RANGE")))
            .andExpect(jsonPath("$.data", containsString("EXACT")))
            .andExpect(jsonPath("$.data", containsString("0.85")))
            .andExpect(jsonPath("$.data", containsString("0.50")))
            .andExpect(jsonPath("$.data", containsString("customer_name")))
            .andExpect(jsonPath("$.data", containsString("total_amount")))
            .andExpect(jsonPath("$.data", containsString("invoice_ref")));
    }

    @Test
    @DisplayName("TC-AIC-002b: POST /api/v1/ai/suggest-rules - Without Mapped Fields")
    void testGetMatchingRuleSuggestionsWithoutMappedFields() throws Exception {
        // Given
        String mockRuleSuggestions = """
            Please provide field mappings to generate matching rule suggestions.
            """;

        when(aiService.suggestRules(eq(1L), eq(2L), eq(List.of())))
            .thenReturn(mockRuleSuggestions);

        // When & Then
        mockMvc.perform(post("/api/v1/ai/suggest-rules")
                .param("sourceFileId", "1")
                .param("targetFileId", "2")
                .header("X-Organization-Id", "org-123"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Rule suggestions generated"))
            .andExpect(jsonPath("$.data").isString());
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
