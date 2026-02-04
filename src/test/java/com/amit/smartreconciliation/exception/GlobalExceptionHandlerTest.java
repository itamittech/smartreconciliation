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
    @DisplayName("TC-GEH-001: Validation Error Response")
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
                .andExpect(jsonPath("$.data.targetFileId").value("Target file ID is required"));
    }
}
