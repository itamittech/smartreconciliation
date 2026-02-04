package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.DataSourceRequest;
import com.amit.smartreconciliation.dto.response.DataSourceResponse;
import com.amit.smartreconciliation.enums.DataSourceType;
import com.amit.smartreconciliation.service.DataSourceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for DataSourceController
 * Module: Data Source Management
 * Test Level: Integration Test
 * Total Test Cases: 8
 */
@WebMvcTest(DataSourceController.class)
@DisplayName("DataSourceController Integration Tests")
class DataSourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DataSourceService dataSourceService;

    @Test
    @DisplayName("TC-DSC-001: POST /api/v1/datasources - Create FILE Source")
    void testCreateFileSource() throws Exception {
        // Given
        DataSourceRequest request = new DataSourceRequest();
        request.setName("File Source");
        request.setDescription("CSV uploads");
        request.setType(DataSourceType.FILE);
        request.setConfig(Map.of("path", "/uploads"));

        DataSourceResponse response = buildResponse(1L, DataSourceType.FILE, true);
        when(dataSourceService.create(any(DataSourceRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/datasources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Data source created successfully"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.type").value("FILE"));

        verify(dataSourceService).create(any(DataSourceRequest.class));
    }

    @Test
    @DisplayName("TC-DSC-002: POST /api/v1/datasources - Validation Error")
    void testCreateValidationError() throws Exception {
        // Given
        DataSourceRequest request = new DataSourceRequest();
        request.setName("");

        // When & Then
        mockMvc.perform(post("/api/v1/datasources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.name").value("Name is required"))
                .andExpect(jsonPath("$.data.type").value("Type is required"));
    }

    @Test
    @DisplayName("TC-DSC-003: GET /api/v1/datasources - List All")
    void testListAll() throws Exception {
        // Given
        List<DataSourceResponse> responses = List.of(
                buildResponse(1L, DataSourceType.FILE, true),
                buildResponse(2L, DataSourceType.DATABASE, true)
        );
        when(dataSourceService.getAll()).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/api/v1/datasources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].type").value("FILE"))
                .andExpect(jsonPath("$.data[1].type").value("DATABASE"));

        verify(dataSourceService).getAll();
    }

    @Test
    @DisplayName("TC-DSC-004: GET /api/v1/datasources?type=DATABASE - Filter by Type")
    void testFilterByType() throws Exception {
        // Given
        List<DataSourceResponse> responses = List.of(buildResponse(3L, DataSourceType.DATABASE, true));
        when(dataSourceService.getByType(DataSourceType.DATABASE)).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/api/v1/datasources")
                .param("type", "DATABASE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].type").value("DATABASE"));

        verify(dataSourceService).getByType(DataSourceType.DATABASE);
    }

    @Test
    @DisplayName("TC-DSC-005: GET /api/v1/datasources/{id} - Retrieve Details")
    void testRetrieveDetails() throws Exception {
        // Given
        DataSourceResponse response = buildResponse(4L, DataSourceType.API, true);
        when(dataSourceService.getById(4L)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/v1/datasources/4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(4))
                .andExpect(jsonPath("$.data.type").value("API"));
    }

    @Test
    @DisplayName("TC-DSC-006: PUT /api/v1/datasources/{id} - Update Source")
    void testUpdateSource() throws Exception {
        // Given
        DataSourceRequest request = new DataSourceRequest();
        request.setName("Updated");
        request.setDescription("Updated");
        request.setType(DataSourceType.API);

        DataSourceResponse response = buildResponse(5L, DataSourceType.API, true);
        when(dataSourceService.update(eq(5L), any(DataSourceRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(put("/api/v1/datasources/5")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Data source updated successfully"))
                .andExpect(jsonPath("$.data.id").value(5));

        verify(dataSourceService).update(eq(5L), any(DataSourceRequest.class));
    }

    @Test
    @DisplayName("TC-DSC-007: DELETE /api/v1/datasources/{id} - Delete Source")
    void testDeleteSource() throws Exception {
        // Given
        doNothing().when(dataSourceService).delete(6L);

        // When & Then
        mockMvc.perform(delete("/api/v1/datasources/6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Data source deleted successfully"));

        verify(dataSourceService).delete(6L);
    }

    @Test
    @DisplayName("TC-DSC-008: POST /api/v1/datasources/{id}/test - Test Connection")
    void testTestConnection() throws Exception {
        // Given
        DataSourceResponse response = buildResponse(7L, DataSourceType.DATABASE, false);
        response = withTestResult(response, false, "Connection test failed");
        when(dataSourceService.testConnection(7L)).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/datasources/7/test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Connection test failed: Connection test failed"))
                .andExpect(jsonPath("$.data.lastTestSuccessful").value(false))
                .andExpect(jsonPath("$.data.lastTestError").value("Connection test failed"));
    }

    private DataSourceResponse buildResponse(Long id, DataSourceType type, boolean active) {
        DataSourceResponse response = new DataSourceResponse();
        setField(response, "id", id);
        setField(response, "name", "Source " + id);
        setField(response, "type", type);
        setField(response, "active", active);
        return response;
    }

    private DataSourceResponse withTestResult(DataSourceResponse response, boolean success, String error) {
        setField(response, "lastTestSuccessful", success);
        setField(response, "lastTestError", error);
        setField(response, "lastTestedAt", LocalDateTime.now());
        return response;
    }

    private void setField(DataSourceResponse response, String fieldName, Object value) {
        try {
            var field = DataSourceResponse.class.getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(response, value);
        } catch (Exception ignored) {
        }
    }
}
