package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.FieldMappingRequest;
import com.amit.smartreconciliation.dto.request.MatchingRuleRequest;
import com.amit.smartreconciliation.dto.request.RuleSetRequest;
import com.amit.smartreconciliation.dto.response.RuleSetResponse;
import com.amit.smartreconciliation.entity.FieldMapping;
import com.amit.smartreconciliation.entity.MatchingRule;
import com.amit.smartreconciliation.entity.RuleSet;
import com.amit.smartreconciliation.enums.MatchType;
import com.amit.smartreconciliation.service.RuleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

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
 * Integration tests for RuleController
 * Module: Rule Management
 * Test Level: Integration Test
 * Total Test Cases: 8
 */
@WebMvcTest(RuleController.class)
@DisplayName("RuleController Integration Tests")
class RuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RuleService ruleService;

    @Test
    @DisplayName("TC-RUC-001: POST /api/v1/rules - Create Rule Set with Field Mappings")
    void testCreateRuleSetWithFieldMappings() throws Exception {
        // Given
        RuleSetRequest request = new RuleSetRequest();
        request.setName("Rule Set A");
        request.setFieldMappings(List.of(buildFieldMappingRequest("id", "id", true)));

        RuleSetResponse response = buildRuleSetResponse(1L, "Rule Set A", 1);
        when(ruleService.create(any(RuleSetRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/rules")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Rule set created successfully"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Rule Set A"))
                .andExpect(jsonPath("$.data.fieldMappings", hasSize(1)));

        verify(ruleService).create(any(RuleSetRequest.class));
    }

    @Test
    @DisplayName("TC-RUC-002: POST /api/v1/rules - Validation Error for Missing Key Field")
    void testCreateRuleSetValidationErrorMissingKeyField() throws Exception {
        // Given
        RuleSetRequest request = new RuleSetRequest();
        request.setName("");

        // When & Then
        mockMvc.perform(post("/api/v1/rules")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.name").value("Name is required"));
    }

    @Test
    @DisplayName("TC-RUC-003: PUT /api/v1/rules/{id} - Update Rule Set")
    void testUpdateRuleSet() throws Exception {
        // Given
        RuleSetRequest request = new RuleSetRequest();
        request.setName("Updated Rule Set");

        RuleSetResponse response = buildRuleSetResponse(10L, "Updated Rule Set", 2);
        when(ruleService.update(eq(10L), any(RuleSetRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(put("/api/v1/rules/10")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Rule set updated successfully"))
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.version").value(2));

        verify(ruleService).update(eq(10L), any(RuleSetRequest.class));
    }

    @Test
    @DisplayName("TC-RUC-004: POST /api/v1/rules/{id}/mappings - Add Field Mapping")
    void testAddFieldMapping() throws Exception {
        // Given
        FieldMappingRequest request = buildFieldMappingRequest("amount", "amount", false);
        RuleSetResponse response = buildRuleSetResponse(2L, "Rule Set B", 2);
        when(ruleService.addFieldMapping(eq(2L), any(FieldMappingRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/rules/2/mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Field mapping added successfully"))
                .andExpect(jsonPath("$.data.id").value(2));

        verify(ruleService).addFieldMapping(eq(2L), any(FieldMappingRequest.class));
    }

    @Test
    @DisplayName("TC-RUC-005: POST /api/v1/rules/{id}/matching-rules - Add Matching Rule")
    void testAddMatchingRule() throws Exception {
        // Given
        MatchingRuleRequest request = buildMatchingRuleRequest("Fuzzy Match", "name", "name", MatchType.FUZZY);
        RuleSetResponse response = buildRuleSetResponse(3L, "Rule Set C", 2);
        when(ruleService.addMatchingRule(eq(3L), any(MatchingRuleRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/rules/3/matching-rules")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Matching rule added successfully"))
                .andExpect(jsonPath("$.data.id").value(3));

        verify(ruleService).addMatchingRule(eq(3L), any(MatchingRuleRequest.class));
    }

    @Test
    @DisplayName("TC-RUC-006: GET /api/v1/rules - List All Rule Sets")
    void testListAllRuleSets() throws Exception {
        // Given
        List<RuleSetResponse> responses = List.of(
                buildRuleSetResponse(1L, "Rule Set 1", 1),
                buildRuleSetResponse(2L, "Rule Set 2", 1)
        );
        when(ruleService.getAll()).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/api/v1/rules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].name").value("Rule Set 1"))
                .andExpect(jsonPath("$.data[1].name").value("Rule Set 2"));

        verify(ruleService).getAll();
    }

    @Test
    @DisplayName("TC-RUC-007: DELETE /api/v1/rules/{id} - Delete Rule Set")
    void testDeleteRuleSet() throws Exception {
        // Given
        doNothing().when(ruleService).delete(5L);

        // When & Then
        mockMvc.perform(delete("/api/v1/rules/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Rule set deleted successfully"))
                .andExpect(jsonPath("$.data").doesNotExist());

        verify(ruleService).delete(5L);
    }

    @Test
    @DisplayName("TC-RUC-008: GET /api/v1/rules/{id} - Retrieve Rule Set Details")
    void testGetRuleSetDetails() throws Exception {
        // Given
        RuleSetResponse response = buildRuleSetResponse(6L, "Rule Set Detail", 1);
        when(ruleService.getById(6L)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/v1/rules/6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(6))
                .andExpect(jsonPath("$.data.name").value("Rule Set Detail"));

        verify(ruleService).getById(6L);
    }

    private RuleSetResponse buildRuleSetResponse(Long id, String name, int version) {
        RuleSet ruleSet = new RuleSet();
        ruleSet.setId(id);
        ruleSet.setName(name);
        ruleSet.setVersion(version);
        ruleSet.setActive(true);
        ruleSet.setFieldMappings(List.of(buildFieldMapping()));
        ruleSet.setMatchingRules(List.of(buildMatchingRule()));
        return RuleSetResponse.fromEntity(ruleSet);
    }

    private FieldMapping buildFieldMapping() {
        FieldMapping mapping = new FieldMapping();
        mapping.setId(1L);
        mapping.setSourceField("id");
        mapping.setTargetField("id");
        mapping.setIsKey(true);
        return mapping;
    }

    private MatchingRule buildMatchingRule() {
        MatchingRule rule = new MatchingRule();
        rule.setId(1L);
        rule.setName("Exact");
        rule.setSourceField("id");
        rule.setTargetField("id");
        rule.setMatchType(MatchType.EXACT);
        rule.setActive(true);
        return rule;
    }

    private FieldMappingRequest buildFieldMappingRequest(String source, String target, boolean isKey) {
        FieldMappingRequest request = new FieldMappingRequest();
        request.setSourceField(source);
        request.setTargetField(target);
        request.setIsKey(isKey);
        request.setTransform("NONE");
        return request;
    }

    private MatchingRuleRequest buildMatchingRuleRequest(String name, String source, String target, MatchType type) {
        MatchingRuleRequest request = new MatchingRuleRequest();
        request.setName(name);
        request.setSourceField(source);
        request.setTargetField(target);
        request.setMatchType(type);
        request.setConfig(Map.of("note", "test"));
        return request;
    }
}
