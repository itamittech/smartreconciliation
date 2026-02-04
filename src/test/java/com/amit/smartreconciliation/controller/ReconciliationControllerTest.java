package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.ReconciliationRequest;
import com.amit.smartreconciliation.dto.response.ReconciliationExceptionResponse;
import com.amit.smartreconciliation.dto.response.ReconciliationResponse;
import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.entity.ReconciliationException;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.enums.ReconciliationStatus;
import com.amit.smartreconciliation.service.ExceptionService;
import com.amit.smartreconciliation.service.ReconciliationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReconciliationController.class)
@DisplayName("ReconciliationController Integration Tests")
class ReconciliationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReconciliationService reconciliationService;

    @MockBean
    private ExceptionService exceptionService;

    @Test
    @DisplayName("TC-RC-001: POST /api/v1/reconciliations - Create Reconciliation")
    void testTcRc001_createReconciliation_returnsCreated() throws Exception {
        // Given
        String requestBody = """
            {
              "name": "Q1 2024 Reconciliation",
              "sourceFileId": 1,
              "targetFileId": 2,
              "ruleSetId": 3
            }
            """;

        Reconciliation entity = new Reconciliation();
        entity.setId(1L);
        entity.setName("Q1 2024 Reconciliation");
        entity.setStatus(ReconciliationStatus.PENDING);
        ReflectionTestUtils.setField(entity, "createdAt", LocalDateTime.of(2024, 1, 15, 10, 30));

        ReconciliationResponse response = ReconciliationResponse.fromEntity(entity);

        when(reconciliationService.create(any(ReconciliationRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/reconciliations")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Organization-Id", "org-123")
                .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Reconciliation started"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Q1 2024 Reconciliation"))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.createdAt").exists());
    }

    @Test
    @DisplayName("TC-RC-002: POST /api/v1/reconciliations - Missing Required Field")
    void testTcRc002_missingTargetFileId_returnsBadRequest() throws Exception {
        // Given
        String requestBody = """
            {
              "name": "Test Reconciliation",
              "sourceFileId": 1,
              "ruleSetId": 3
            }
            """;

        // When & Then
        mockMvc.perform(post("/api/v1/reconciliations")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Organization-Id", "org-123")
                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.targetFileId").value("Target file ID is required"));
    }

    @Test
    @DisplayName("TC-RC-003: GET /api/v1/reconciliations/{id} - Get Reconciliation Status")
    void testTcRc003_getReconciliationStatus_returnsDetails() throws Exception {
        // Given
        Reconciliation entity = new Reconciliation();
        entity.setId(123L);
        entity.setName("Q1 2024 Reconciliation");
        entity.setStatus(ReconciliationStatus.COMPLETED);
        entity.setMatchRate(85.5);
        entity.setTotalSourceRecords(1000);
        entity.setTotalTargetRecords(980);
        entity.setMatchedRecords(855);
        entity.setUnmatchedSourceRecords(145);
        entity.setUnmatchedTargetRecords(125);
        ReflectionTestUtils.setField(entity, "createdAt", LocalDateTime.of(2024, 1, 15, 10, 30));
        entity.setCompletedAt(LocalDateTime.of(2024, 1, 15, 10, 35));

        ReconciliationResponse response = ReconciliationResponse.fromEntity(entity);

        when(reconciliationService.getById(123L)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/v1/reconciliations/123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(123))
                .andExpect(jsonPath("$.data.name").value("Q1 2024 Reconciliation"))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.matchRate").value(85.5))
                .andExpect(jsonPath("$.data.totalSourceRecords").value(1000))
                .andExpect(jsonPath("$.data.totalTargetRecords").value(980))
                .andExpect(jsonPath("$.data.matchedRecords").value(855))
                .andExpect(jsonPath("$.data.unmatchedSourceRecords").value(145))
                .andExpect(jsonPath("$.data.createdAt").exists())
                .andExpect(jsonPath("$.data.completedAt").exists());
    }

    @Test
    @DisplayName("TC-RC-004: GET /api/v1/reconciliations/{id}/exceptions - List Exceptions")
    void testTcRc004_getExceptions_returnsFilteredPage() throws Exception {
        // Given
        Reconciliation reconciliation = new Reconciliation();
        reconciliation.setId(456L);
        reconciliation.setName("Recon 456");

        ReconciliationException ex1 = ReconciliationException.builder()
                .type(ExceptionType.VALUE_MISMATCH)
                .severity(ExceptionSeverity.HIGH)
                .status(ExceptionStatus.OPEN)
                .description("Value mismatch on amount")
                .fieldName("amount")
                .sourceValue("100")
                .targetValue("150")
                .reconciliation(reconciliation)
                .build();
        ex1.setId(1L);

        ReconciliationException ex2 = ReconciliationException.builder()
                .type(ExceptionType.VALUE_MISMATCH)
                .severity(ExceptionSeverity.HIGH)
                .status(ExceptionStatus.OPEN)
                .description("Value mismatch on name")
                .fieldName("name")
                .sourceValue("John")
                .targetValue("Jane")
                .reconciliation(reconciliation)
                .build();
        ex2.setId(2L);

        List<ReconciliationExceptionResponse> responses = List.of(
                ReconciliationExceptionResponse.fromEntity(ex1),
                ReconciliationExceptionResponse.fromEntity(ex2)
        );

        Page<ReconciliationExceptionResponse> page = new PageImpl<>(responses, PageRequest.of(0, 10), 2);

        when(exceptionService.getByReconciliationId(
                456L,
                ExceptionType.VALUE_MISMATCH,
                ExceptionSeverity.HIGH,
                null,
                PageRequest.of(0, 10)))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/v1/reconciliations/456/exceptions")
                .param("type", "VALUE_MISMATCH")
                .param("severity", "HIGH")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.content[0].type").value("VALUE_MISMATCH"))
                .andExpect(jsonPath("$.data.content[0].severity").value("HIGH"))
                .andExpect(jsonPath("$.data.content[1].type").value("VALUE_MISMATCH"))
                .andExpect(jsonPath("$.data.content[1].severity").value("HIGH"));
    }

    @Test
    @DisplayName("TC-RC-005: POST /api/v1/reconciliations/{id}/cancel - Cancel Reconciliation")
    void testTcRc005_cancelReconciliation_returnsOk() throws Exception {
        // Given
        doNothing().when(reconciliationService).cancel(789L);

        // When & Then
        mockMvc.perform(post("/api/v1/reconciliations/789/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Reconciliation cancelled"));
    }

    @Test
    @DisplayName("TC-RC-006: GET /api/v1/reconciliations - List All Reconciliations")
    void testTcRc006_getAllReconciliations_returnsList() throws Exception {
        // Given
        Reconciliation recon1 = new Reconciliation();
        recon1.setId(1L);
        recon1.setName("Recon New");
        recon1.setStatus(ReconciliationStatus.COMPLETED);
        recon1.setMatchRate(92.5);
        ReflectionTestUtils.setField(recon1, "createdAt", LocalDateTime.of(2024, 1, 16, 10, 30));

        Reconciliation recon2 = new Reconciliation();
        recon2.setId(2L);
        recon2.setName("Recon Old");
        recon2.setStatus(ReconciliationStatus.PENDING);
        recon2.setMatchRate(0.0);
        ReflectionTestUtils.setField(recon2, "createdAt", LocalDateTime.of(2024, 1, 15, 10, 30));

        List<ReconciliationResponse> responses = List.of(
                ReconciliationResponse.fromEntity(recon1),
                ReconciliationResponse.fromEntity(recon2)
        );

        when(reconciliationService.getAll()).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/api/v1/reconciliations")
                .header("X-Organization-Id", "org-123")
                .param("page", "0")
                .param("size", "10")
                .param("sort", "createdDate,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].name").value("Recon New"))
                .andExpect(jsonPath("$.data[0].createdAt").exists())
                .andExpect(jsonPath("$.data[1].id").value(2))
                .andExpect(jsonPath("$.data[1].name").value("Recon Old"))
                .andExpect(jsonPath("$.data[1].createdAt").exists());
    }

    @Test
    @DisplayName("TC-RC-007: GET /api/v1/reconciliations/{id}/results - Get Results")
    void testTcRc007_getResults_returnsStatistics() throws Exception {
        // Given
        Reconciliation entity = new Reconciliation();
        entity.setId(1L);
        entity.setName("Q1 2024 Reconciliation");
        entity.setStatus(ReconciliationStatus.COMPLETED);
        entity.setMatchRate(95.5);
        entity.setTotalSourceRecords(1000);
        entity.setTotalTargetRecords(980);
        entity.setMatchedRecords(955);
        entity.setUnmatchedSourceRecords(45);
        entity.setUnmatchedTargetRecords(25);
        entity.setExceptionCount(10);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalSourceRecords", 1000);
        stats.put("totalTargetRecords", 980);
        stats.put("matchedRecords", 955);
        stats.put("unmatchedSourceRecords", 45);
        stats.put("unmatchedTargetRecords", 25);
        stats.put("exceptionCount", 10);
        entity.setStatistics(stats);

        ReconciliationResponse response = ReconciliationResponse.fromEntity(entity);

        when(reconciliationService.getById(1L)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/v1/reconciliations/1/results"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.matchRate").value(95.5))
                .andExpect(jsonPath("$.data.statistics.totalSourceRecords").value(1000))
                .andExpect(jsonPath("$.data.statistics.totalTargetRecords").value(980))
                .andExpect(jsonPath("$.data.statistics.matchedRecords").value(955))
                .andExpect(jsonPath("$.data.statistics.unmatchedSourceRecords").value(45))
                .andExpect(jsonPath("$.data.statistics.unmatchedTargetRecords").value(25))
                .andExpect(jsonPath("$.data.statistics.exceptionCount").value(10));
    }

    @Test
    @DisplayName("TC-RC-008: GET /api/v1/reconciliations/{id}/status - Get Status")
    void testTcRc008_getStatus_returnsProgress() throws Exception {
        // Given
        Reconciliation entity = new Reconciliation();
        entity.setId(1L);
        entity.setName("Q1 2024 Reconciliation");
        entity.setStatus(ReconciliationStatus.IN_PROGRESS);
        entity.setProgress(40);

        ReconciliationResponse response = ReconciliationResponse.fromEntity(entity);

        when(reconciliationService.getStatus(1L)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/v1/reconciliations/1/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.data.progress").value(40));
    }
}
