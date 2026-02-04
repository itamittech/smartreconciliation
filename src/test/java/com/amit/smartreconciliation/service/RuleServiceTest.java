package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.FieldMappingRequest;
import com.amit.smartreconciliation.dto.request.MatchingRuleRequest;
import com.amit.smartreconciliation.dto.request.RuleSetRequest;
import com.amit.smartreconciliation.dto.response.RuleSetResponse;
import com.amit.smartreconciliation.entity.FieldMapping;
import com.amit.smartreconciliation.entity.MatchingRule;
import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.entity.RuleSet;
import com.amit.smartreconciliation.enums.MatchType;
import com.amit.smartreconciliation.repository.FieldMappingRepository;
import com.amit.smartreconciliation.repository.MatchingRuleRepository;
import com.amit.smartreconciliation.repository.RuleSetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for RuleService
 * Module: Rule Management
 * Test Level: Unit Test
 * Total Test Cases: 15
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("RuleService Unit Tests")
class RuleServiceTest {

    @Mock
    private RuleSetRepository ruleSetRepository;

    @Mock
    private FieldMappingRepository fieldMappingRepository;

    @Mock
    private MatchingRuleRepository matchingRuleRepository;

    @Mock
    private OrganizationService organizationService;

    @InjectMocks
    private RuleService ruleService;

    private Organization organization;

    @BeforeEach
    void setUp() {
        organization = Organization.builder()
                .id(10L)
                .name("Test Org")
                .build();
        when(organizationService.getDefaultOrganization()).thenReturn(organization);
    }

    @Test
    @DisplayName("TC-RUS-001: Create Rule Set with Field Mappings")
    void testCreateRuleSetWithFieldMappings() {
        // Given
        RuleSetRequest request = buildRuleSetRequest(
                "Rule Set A",
                List.of(buildFieldMapping("source_id", "target_id", true, null, null)),
                null
        );

        stubRuleSetSave();

        // When
        RuleSetResponse response = ruleService.create(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Rule Set A");
        assertThat(response.getFieldMappings()).hasSize(1);
        assertThat(response.getFieldMappings().get(0).getSourceField()).isEqualTo("source_id");
        assertThat(response.getFieldMappings().get(0).getIsKey()).isTrue();
    }

    @Test
    @DisplayName("TC-RUS-002: Create Rule Set with Matching Rules")
    void testCreateRuleSetWithMatchingRules() {
        // Given
        RuleSetRequest request = buildRuleSetRequest(
                "Rule Set B",
                null,
                List.of(buildMatchingRule("Amount Match", "amount", "amount", MatchType.EXACT))
        );

        stubRuleSetSave();

        // When
        RuleSetResponse response = ruleService.create(request);

        // Then
        assertThat(response.getMatchingRules()).hasSize(1);
        assertThat(response.getMatchingRules().get(0).getMatchType()).isEqualTo(MatchType.EXACT);
    }

    @Test
    @DisplayName("TC-RUS-003: Create Rule Set with Field Transforms")
    void testCreateRuleSetWithFieldTransforms() {
        // Given
        FieldMappingRequest mapping = buildFieldMapping(
                "source_name",
                "target_name",
                false,
                "TRIM",
                Map.of("strip", true)
        );
        RuleSetRequest request = buildRuleSetRequest("Rule Set C", List.of(mapping), null);

        stubRuleSetSave();

        // When
        RuleSetResponse response = ruleService.create(request);

        // Then
        assertThat(response.getFieldMappings()).hasSize(1);
        assertThat(response.getFieldMappings().get(0).getTransform()).isEqualTo("TRIM");
        assertThat(response.getFieldMappings().get(0).getTransformConfig()).containsEntry("strip", true);
    }

    @Test
    @DisplayName("TC-RUS-004: Create Rule Set with Multiple Key Fields (Composite Key)")
    void testCreateRuleSetWithMultipleKeyFields() {
        // Given
        RuleSetRequest request = buildRuleSetRequest(
                "Rule Set D",
                List.of(
                        buildFieldMapping("id", "id", true, null, null),
                        buildFieldMapping("category", "category", true, null, null)
                ),
                null
        );

        stubRuleSetSave();

        // When
        RuleSetResponse response = ruleService.create(request);

        // Then
        assertThat(response.getFieldMappings()).hasSize(2);
        assertThat(response.getFieldMappings()).allMatch(mapping -> Boolean.TRUE.equals(mapping.getIsKey()));
    }

    @Test
    @DisplayName("TC-RUS-005: Update Rule Set - Increment Version")
    void testUpdateRuleSetIncrementsVersion() {
        // Given
        RuleSet existing = buildRuleSetWithVersion(2);
        when(ruleSetRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(ruleSetRepository.save(any(RuleSet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RuleSetRequest request = buildRuleSetRequest("Updated Name", null, null);

        // When
        RuleSetResponse response = ruleService.update(1L, request);

        // Then
        assertThat(response.getVersion()).isEqualTo(3);
    }

    @Test
    @DisplayName("TC-RUS-006: Update Matching Rule Threshold")
    void testUpdateMatchingRuleThreshold() {
        // Given
        RuleSet existing = buildRuleSetWithVersion(1);
        existing.setMatchingRules(new ArrayList<>());
        when(ruleSetRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(ruleSetRepository.save(any(RuleSet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MatchingRuleRequest ruleRequest = buildMatchingRule("Fuzzy Match", "name", "name", MatchType.FUZZY);
        ruleRequest.setFuzzyThreshold(0.9);
        RuleSetRequest request = buildRuleSetRequest("Rule Set E", null, List.of(ruleRequest));

        // When
        RuleSetResponse response = ruleService.update(2L, request);

        // Then
        assertThat(response.getMatchingRules()).hasSize(1);
        assertThat(response.getMatchingRules().get(0).getFuzzyThreshold()).isEqualTo(0.9);
    }

    @Test
    @DisplayName("TC-RUS-007: Add Field Mapping to Existing Rule Set")
    void testAddFieldMappingToExistingRuleSet() {
        // Given
        RuleSet existing = buildRuleSetWithVersion(1);
        existing.setFieldMappings(new ArrayList<>());
        when(ruleSetRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(ruleSetRepository.save(any(RuleSet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FieldMappingRequest request = buildFieldMapping("amount", "amount", false, null, null);

        // When
        RuleSetResponse response = ruleService.addFieldMapping(3L, request);

        // Then
        assertThat(response.getVersion()).isEqualTo(2);
        assertThat(response.getFieldMappings()).hasSize(1);
        assertThat(response.getFieldMappings().get(0).getSourceField()).isEqualTo("amount");
    }

    @Test
    @DisplayName("TC-RUS-008: Configure Transform Types")
    void testConfigureTransformTypes() {
        // Given
        FieldMappingRequest mapping = buildFieldMapping(
                "description",
                "description",
                false,
                "UPPERCASE",
                Map.of("locale", "en-US")
        );
        RuleSetRequest request = buildRuleSetRequest("Rule Set F", List.of(mapping), null);

        stubRuleSetSave();

        // When
        RuleSetResponse response = ruleService.create(request);

        // Then
        assertThat(response.getFieldMappings()).hasSize(1);
        assertThat(response.getFieldMappings().get(0).getTransform()).isEqualTo("UPPERCASE");
        assertThat(response.getFieldMappings().get(0).getTransformConfig()).containsEntry("locale", "en-US");
    }

    @Test
    @DisplayName("TC-RUS-009: Configure Fuzzy Matching Rule")
    void testConfigureFuzzyMatchingRule() {
        // Given
        MatchingRuleRequest rule = buildMatchingRule("Fuzzy Name", "name", "name", MatchType.FUZZY);
        rule.setFuzzyThreshold(0.85);
        RuleSetRequest request = buildRuleSetRequest("Rule Set G", null, List.of(rule));

        stubRuleSetSave();

        // When
        RuleSetResponse response = ruleService.create(request);

        // Then
        assertThat(response.getMatchingRules()).hasSize(1);
        assertThat(response.getMatchingRules().get(0).getMatchType()).isEqualTo(MatchType.FUZZY);
        assertThat(response.getMatchingRules().get(0).getFuzzyThreshold()).isEqualTo(0.85);
    }

    @Test
    @DisplayName("TC-RUS-010: Configure Range Matching Rule")
    void testConfigureRangeMatchingRule() {
        // Given
        MatchingRuleRequest rule = buildMatchingRule("Range Amount", "amount", "amount", MatchType.RANGE);
        rule.setTolerance(5.0);
        RuleSetRequest request = buildRuleSetRequest("Rule Set H", null, List.of(rule));

        stubRuleSetSave();

        // When
        RuleSetResponse response = ruleService.create(request);

        // Then
        assertThat(response.getMatchingRules()).hasSize(1);
        assertThat(response.getMatchingRules().get(0).getMatchType()).isEqualTo(MatchType.RANGE);
        assertThat(response.getMatchingRules().get(0).getTolerance()).isEqualTo(5.0);
    }

    @Test
    @DisplayName("TC-RUS-011: Configure Exact Matching Rule")
    void testConfigureExactMatchingRule() {
        // Given
        MatchingRuleRequest rule = buildMatchingRule("Exact Id", "id", "id", MatchType.EXACT);
        RuleSetRequest request = buildRuleSetRequest("Rule Set I", null, List.of(rule));

        stubRuleSetSave();

        // When
        RuleSetResponse response = ruleService.create(request);

        // Then
        assertThat(response.getMatchingRules()).hasSize(1);
        assertThat(response.getMatchingRules().get(0).getMatchType()).isEqualTo(MatchType.EXACT);
    }

    @Test
    @DisplayName("TC-RUS-012: Configure Pattern Matching Rule")
    void testConfigurePatternMatchingRule() {
        // Given
        MatchingRuleRequest rule = buildMatchingRule("Pattern Email", "email", "email", MatchType.CONTAINS);
        rule.setConfig(Map.of("pattern", "@example.com"));
        RuleSetRequest request = buildRuleSetRequest("Rule Set J", null, List.of(rule));

        stubRuleSetSave();

        // When
        RuleSetResponse response = ruleService.create(request);

        // Then
        assertThat(response.getMatchingRules()).hasSize(1);
        assertThat(response.getMatchingRules().get(0).getMatchType()).isEqualTo(MatchType.CONTAINS);
        assertThat(response.getMatchingRules().get(0).getConfig()).containsEntry("pattern", "@example.com");
    }

    @Test
    @DisplayName("TC-RUS-013: Delete Rule Set")
    void testDeleteRuleSet() {
        // Given
        RuleSet existing = buildRuleSetWithVersion(1);
        when(ruleSetRepository.findById(4L)).thenReturn(Optional.of(existing));

        // When
        ruleService.delete(4L);

        // Then
        verify(ruleSetRepository).delete(existing);
    }

    @Test
    @DisplayName("TC-RUS-014: List Rule Sets by Organization")
    void testListRuleSetsByOrganization() {
        // Given
        RuleSet rs1 = buildRuleSetWithVersion(1);
        rs1.setId(1L);
        rs1.setName("Rule Set 1");
        rs1.setOrganization(organization);

        RuleSet rs2 = buildRuleSetWithVersion(1);
        rs2.setId(2L);
        rs2.setName("Rule Set 2");
        rs2.setOrganization(organization);

        when(ruleSetRepository.findByOrganizationId(organization.getId()))
                .thenReturn(List.of(rs1, rs2));

        // When
        List<RuleSetResponse> response = ruleService.getAll();

        // Then
        assertThat(response).hasSize(2);
        assertThat(response).extracting(RuleSetResponse::getName).containsExactly("Rule Set 1", "Rule Set 2");
    }

    @Test
    @DisplayName("TC-RUS-015: Store Rule Set Version History")
    void testStoreRuleSetVersionHistory() {
        // Given
        RuleSet existing = buildRuleSetWithVersion(5);
        when(ruleSetRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(ruleSetRepository.save(any(RuleSet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RuleSetRequest request = buildRuleSetRequest("Rule Set History", null, null);

        // When
        ruleService.update(5L, request);

        // Then
        ArgumentCaptor<RuleSet> captor = ArgumentCaptor.forClass(RuleSet.class);
        verify(ruleSetRepository).save(captor.capture());
        assertThat(captor.getValue().getVersion()).isEqualTo(6);
    }

    @Test
    private void stubRuleSetSave() {
        when(ruleSetRepository.save(any(RuleSet.class))).thenAnswer(invocation -> {
            RuleSet saved = invocation.getArgument(0);
            if (saved.getId() == null) {
                saved.setId(1L);
            }
            return saved;
        });
    }

    private RuleSetRequest buildRuleSetRequest(String name,
                                               List<FieldMappingRequest> fieldMappings,
                                               List<MatchingRuleRequest> matchingRules) {
        RuleSetRequest request = new RuleSetRequest();
        request.setName(name);
        request.setDescription("desc");
        request.setFieldMappings(fieldMappings);
        request.setMatchingRules(matchingRules);
        request.setMetadata(Map.of("source", "unit-test"));
        return request;
    }

    private FieldMappingRequest buildFieldMapping(String source,
                                                  String target,
                                                  boolean isKey,
                                                  String transform,
                                                  Map<String, Object> transformConfig) {
        FieldMappingRequest request = new FieldMappingRequest();
        request.setSourceField(source);
        request.setTargetField(target);
        request.setIsKey(isKey);
        request.setTransform(transform);
        request.setTransformConfig(transformConfig);
        return request;
    }

    private MatchingRuleRequest buildMatchingRule(String name,
                                                  String source,
                                                  String target,
                                                  MatchType matchType) {
        MatchingRuleRequest request = new MatchingRuleRequest();
        request.setName(name);
        request.setSourceField(source);
        request.setTargetField(target);
        request.setMatchType(matchType);
        request.setPriority(1);
        return request;
    }

    private RuleSet buildRuleSetWithVersion(int version) {
        RuleSet ruleSet = new RuleSet();
        ruleSet.setId(1L);
        ruleSet.setName("Rule Set");
        ruleSet.setVersion(version);
        ruleSet.setActive(true);
        ruleSet.setOrganization(organization);
        ruleSet.setFieldMappings(new ArrayList<>());
        ruleSet.setMatchingRules(new ArrayList<>());
        return ruleSet;
    }
}
