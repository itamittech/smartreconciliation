package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.BulkExceptionRequest;
import com.amit.smartreconciliation.dto.request.ExceptionUpdateRequest;
import com.amit.smartreconciliation.dto.response.ReconciliationExceptionResponse;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.service.ExceptionService;
import com.amit.smartreconciliation.service.ReconciliationService;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for ExceptionController
 * Module: Exception Management
 * Test Level: Integration Test
 * Total Test Cases: 7
 */
@WebMvcTest(controllers = {ExceptionController.class, ReconciliationController.class})
@DisplayName("ExceptionController Integration Tests")
class ExceptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExceptionService exceptionService;

    @MockBean
    private ReconciliationService reconciliationService;

    @Test
    @DisplayName("TC-EC-001: GET /api/v1/reconciliations/{id}/exceptions - List with Filters")
    void testListExceptionsWithFilters() throws Exception {
        // Given
        List<ReconciliationExceptionResponse> content = List.of(
                buildExceptionResponse(1L, ExceptionType.VALUE_MISMATCH, ExceptionSeverity.HIGH, ExceptionStatus.OPEN),
                buildExceptionResponse(2L, ExceptionType.VALUE_MISMATCH, ExceptionSeverity.HIGH, ExceptionStatus.OPEN)
        );
        Page<ReconciliationExceptionResponse> page = new PageImpl<>(content, PageRequest.of(0, 10), 2);
        when(exceptionService.getByReconciliationId(eq(123L), eq(ExceptionType.VALUE_MISMATCH),
                eq(ExceptionSeverity.HIGH), eq(ExceptionStatus.OPEN), any()))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/v1/reconciliations/123/exceptions")
                .param("type", "VALUE_MISMATCH")
                .param("severity", "HIGH")
                .param("status", "OPEN")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.totalPages").value(1))
                .andExpect(jsonPath("$.data.number").value(0))
                .andExpect(jsonPath("$.data.size").value(10));

        verify(exceptionService).getByReconciliationId(eq(123L), eq(ExceptionType.VALUE_MISMATCH),
                eq(ExceptionSeverity.HIGH), eq(ExceptionStatus.OPEN), any());
    }

    @Test
    @DisplayName("TC-EC-002: GET /api/v1/reconciliations/{id}/exceptions - No Filters")
    void testListExceptionsNoFilters() throws Exception {
        // Given
        List<ReconciliationExceptionResponse> content = List.of(
                buildExceptionResponse(3L, ExceptionType.MISSING_TARGET, ExceptionSeverity.MEDIUM, ExceptionStatus.OPEN)
        );
        Page<ReconciliationExceptionResponse> page = new PageImpl<>(content, PageRequest.of(0, 20), 1);
        when(exceptionService.getByReconciliationId(eq(456L), isNull(), isNull(), isNull(), any()))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/v1/reconciliations/456/exceptions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.size").value(20));
    }

    @Test
    @DisplayName("TC-EC-003: GET /api/v1/exceptions/{id} - Retrieve Exception Details")
    void testGetExceptionDetails() throws Exception {
        // Given
        ReconciliationExceptionResponse response = buildExceptionResponse(789L,
                ExceptionType.VALUE_MISMATCH, ExceptionSeverity.HIGH, ExceptionStatus.OPEN);
        when(exceptionService.getById(789L)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/v1/exceptions/789"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(789))
                .andExpect(jsonPath("$.data.type").value("VALUE_MISMATCH"))
                .andExpect(jsonPath("$.data.severity").value("HIGH"))
                .andExpect(jsonPath("$.data.status").value("OPEN"))
                .andExpect(jsonPath("$.data.fieldName").value("amount"))
                .andExpect(jsonPath("$.data.sourceValue").value("100.00"))
                .andExpect(jsonPath("$.data.targetValue").value("150.00"));
    }

    @Test
    @DisplayName("TC-EC-004: PUT /api/v1/exceptions/{id} - Update Exception Status")
    void testUpdateExceptionStatus() throws Exception {
        // Given
        ExceptionUpdateRequest request = new ExceptionUpdateRequest();
        request.setStatus(ExceptionStatus.RESOLVED);
        request.setResolution("Corrected in source system");
        request.setResolvedBy("user-456");

        ReconciliationExceptionResponse response = buildExceptionResponse(111L,
                ExceptionType.VALUE_MISMATCH, ExceptionSeverity.HIGH, ExceptionStatus.RESOLVED);
        response = enrichResolved(response);
        when(exceptionService.update(eq(111L), any(ExceptionUpdateRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(put("/api/v1/exceptions/111")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Exception updated successfully"))
                .andExpect(jsonPath("$.data.status").value("RESOLVED"))
                .andExpect(jsonPath("$.data.resolution").value("Corrected in source system"))
                .andExpect(jsonPath("$.data.resolvedBy").value("user-456"))
                .andExpect(jsonPath("$.data.resolvedAt").exists());
    }

    @Test
    @DisplayName("TC-EC-005: POST /api/v1/exceptions/bulk-update - Bulk Update Exceptions")
    void testBulkUpdateExceptions() throws Exception {
        // Given
        BulkExceptionRequest request = new BulkExceptionRequest();
        request.setExceptionIds(List.of(1L, 2L, 3L));
        request.setStatus(ExceptionStatus.ACKNOWLEDGED);

        List<ReconciliationExceptionResponse> responses = List.of(
                buildExceptionResponse(1L, ExceptionType.MISSING_SOURCE, ExceptionSeverity.MEDIUM, ExceptionStatus.ACKNOWLEDGED),
                buildExceptionResponse(2L, ExceptionType.MISSING_TARGET, ExceptionSeverity.MEDIUM, ExceptionStatus.ACKNOWLEDGED),
                buildExceptionResponse(3L, ExceptionType.DUPLICATE, ExceptionSeverity.HIGH, ExceptionStatus.ACKNOWLEDGED)
        );
        when(exceptionService.bulkUpdate(any(BulkExceptionRequest.class))).thenReturn(responses);

        // When & Then
        mockMvc.perform(post("/api/v1/exceptions/bulk-update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("3 exceptions updated successfully"))
                .andExpect(jsonPath("$.data", hasSize(3)));
    }

    @Test
    @DisplayName("TC-EC-006: POST /api/v1/exceptions/bulk-resolve - Bulk Resolve Exceptions")
    void testBulkResolveExceptions() throws Exception {
        // Given
        BulkExceptionRequest request = new BulkExceptionRequest();
        request.setExceptionIds(List.of(10L, 11L));
        request.setStatus(ExceptionStatus.RESOLVED);

        List<ReconciliationExceptionResponse> responses = List.of(
                buildExceptionResponse(10L, ExceptionType.MISSING_SOURCE, ExceptionSeverity.MEDIUM, ExceptionStatus.RESOLVED),
                buildExceptionResponse(11L, ExceptionType.MISSING_TARGET, ExceptionSeverity.MEDIUM, ExceptionStatus.RESOLVED)
        );
        when(exceptionService.bulkUpdate(any(BulkExceptionRequest.class))).thenReturn(responses);

        // When & Then
        mockMvc.perform(post("/api/v1/exceptions/bulk-resolve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Exceptions updated successfully"))
                .andExpect(jsonPath("$.data", hasSize(2)));
    }

    @Test
    @DisplayName("TC-EC-007: GET /api/v1/exceptions/{id}/suggestions - AI Suggestion")
    void testGetAiSuggestion() throws Exception {
        // Given
        when(exceptionService.getSuggestion(555L)).thenReturn("Suggested fix for mismatch");

        // When & Then
        mockMvc.perform(get("/api/v1/exceptions/555/suggestions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("Suggested fix for mismatch"));
    }

    private ReconciliationExceptionResponse buildExceptionResponse(Long id,
                                                                   ExceptionType type,
                                                                   ExceptionSeverity severity,
                                                                   ExceptionStatus status) {
        ReconciliationExceptionResponse response = new ReconciliationExceptionResponse();
        setField(response, "id", id);
        setField(response, "type", type);
        setField(response, "severity", severity);
        setField(response, "status", status);
        setField(response, "fieldName", "amount");
        setField(response, "sourceValue", "100.00");
        setField(response, "targetValue", "150.00");
        setField(response, "description", "Value mismatch in field 'amount'");
        setField(response, "reconciliationId", 123L);
        setField(response, "reconciliationName", "recon-123");
        setField(response, "createdAt", LocalDateTime.of(2024, 1, 15, 10, 30));
        return response;
    }

    private ReconciliationExceptionResponse enrichResolved(ReconciliationExceptionResponse response) {
        setField(response, "resolution", "Corrected in source system");
        setField(response, "resolvedBy", "user-456");
        setField(response, "resolvedAt", LocalDateTime.of(2024, 1, 15, 11, 0));
        return response;
    }

    private void setField(ReconciliationExceptionResponse response, String fieldName, Object value) {
        try {
            var field = ReconciliationExceptionResponse.class.getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(response, value);
        } catch (Exception ignored) {
        }
    }
}
