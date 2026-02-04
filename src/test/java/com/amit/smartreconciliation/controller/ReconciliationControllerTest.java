package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.response.ReconciliationResponse;
import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.enums.ReconciliationStatus;
import com.amit.smartreconciliation.service.ExceptionService;
import com.amit.smartreconciliation.service.ReconciliationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.mockito.Mockito.when;
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
