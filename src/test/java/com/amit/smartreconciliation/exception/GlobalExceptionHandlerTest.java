package com.amit.smartreconciliation.exception;

import com.amit.smartreconciliation.controller.ReconciliationController;
import com.amit.smartreconciliation.service.ExceptionService;
import com.amit.smartreconciliation.service.ReconciliationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReconciliationController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("GlobalExceptionHandler Integration Tests")
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReconciliationService reconciliationService;

    @MockBean
    private ExceptionService exceptionService;

    @Test
    @DisplayName("TC-GEH-001: Validation Error Response - Returns 400 BAD_REQUEST with field errors")
    void testTcGeh001_validationErrorResponse() throws Exception {
        // Given
        String payload = """
            {
              "name": "Q1 2024 Reconciliation",
              "sourceFileId": 1,
              "ruleSetId": 10
            }
            """;

        // When & Then
        mockMvc.perform(post("/api/v1/reconciliations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.targetFileId").value("Target file ID is required"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("TC-GEH-002: ResourceNotFoundException - Returns 404 NOT_FOUND")
    void testTcGeh002_resourceNotFoundResponse() throws Exception {
        // Given
        Long nonExistentId = 999L;
        when(reconciliationService.getById(nonExistentId))
                .thenThrow(new ResourceNotFoundException("Reconciliation", nonExistentId));

        // When & Then
        mockMvc.perform(get("/api/v1/reconciliations/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Reconciliation not found with id: 999"))
                .andExpect(jsonPath("$.data").doesNotExist())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("TC-GEH-003: FileProcessingException - Returns 400 BAD_REQUEST")
    void testTcGeh003_fileProcessingExceptionResponse() throws Exception {
        // Given
        String payload = """
            {
              "name": "Test Reconciliation",
              "sourceFileId": 1,
              "targetFileId": 2,
              "ruleSetId": 1
            }
            """;

        when(reconciliationService.create(any())).thenThrow(
                new FileProcessingException("Invalid CSV format: missing header row"));

        // When & Then
        mockMvc.perform(post("/api/v1/reconciliations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid CSV format: missing header row"))
                .andExpect(jsonPath("$.data").doesNotExist())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("TC-GEH-004: ReconciliationException - Returns 500 INTERNAL_SERVER_ERROR")
    void testTcGeh004_reconciliationExceptionResponse() throws Exception {
        // Given
        String payload = """
            {
              "name": "Test Reconciliation",
              "sourceFileId": 1,
              "targetFileId": 2,
              "ruleSetId": 1
            }
            """;

        when(reconciliationService.create(any())).thenThrow(
                new ReconciliationException("Failed to execute reconciliation rules"));

        // When & Then
        mockMvc.perform(post("/api/v1/reconciliations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to execute reconciliation rules"))
                .andExpect(jsonPath("$.data").doesNotExist())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("TC-GEH-005: AiServiceException - Returns 503 SERVICE_UNAVAILABLE")
    void testTcGeh005_aiServiceExceptionResponse() throws Exception {
        // Given
        String payload = """
            {
              "name": "AI-Powered Reconciliation",
              "sourceFileId": 1,
              "targetFileId": 2,
              "ruleSetId": 1
            }
            """;

        when(reconciliationService.create(any())).thenThrow(
                new AiServiceException("Claude API rate limit exceeded"));

        // When & Then
        mockMvc.perform(post("/api/v1/reconciliations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("AI service temporarily unavailable")))
                .andExpect(jsonPath("$.message").value(containsString("Claude API rate limit exceeded")))
                .andExpect(jsonPath("$.data").doesNotExist())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("TC-GEH-006: Generic Exception - Returns 500 INTERNAL_SERVER_ERROR")
    void testTcGeh006_genericExceptionResponse() throws Exception {
        // Given
        when(reconciliationService.getById(anyLong())).thenThrow(
                new RuntimeException("Unexpected database connection error"));

        // When & Then
        mockMvc.perform(get("/api/v1/reconciliations/{id}", 1L))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("An unexpected error occurred")))
                .andExpect(jsonPath("$.message").value(containsString("Unexpected database connection error")))
                .andExpect(jsonPath("$.data").doesNotExist())
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
