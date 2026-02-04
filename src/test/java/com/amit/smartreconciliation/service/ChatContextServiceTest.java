package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.entity.*;
import com.amit.smartreconciliation.enums.*;
import com.amit.smartreconciliation.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Comprehensive Unit tests for ChatContextService
 * Feature: Chat System
 * Test Level: Unit Test
 *
 * Testing Strategy:
 * - Test system knowledge generation
 * - Test dynamic context building with reconciliation data
 * - Test recent activity context
 * - Test system statistics context
 * - Test smart context based on user message keywords
 * - Verify proper data aggregation and formatting
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ChatContextService Unit Tests")
class ChatContextServiceTest {

    @Mock
    private ReconciliationRepository reconciliationRepository;

    @Mock
    private ReconciliationExceptionRepository exceptionRepository;

    @Mock
    private RuleSetRepository ruleSetRepository;

    @Mock
    private UploadedFileRepository fileRepository;

    @Mock
    private DashboardService dashboardService;

    private ChatContextService contextService;

    private Organization testOrganization;
    private Reconciliation testReconciliation;
    private ChatSession testSession;
    private UploadedFile sourceFile;
    private UploadedFile targetFile;
    private RuleSet testRuleSet;

    @BeforeEach
    void setUp() {
        contextService = new ChatContextService(
            reconciliationRepository,
            exceptionRepository,
            ruleSetRepository,
            fileRepository,
            dashboardService
        );

        // Setup test data
        testOrganization = createTestOrganization();
        sourceFile = createTestFile(1L, "source.csv", 1000, 10);
        targetFile = createTestFile(2L, "target.csv", 1000, 10);
        testRuleSet = createTestRuleSet();
        testReconciliation = createTestReconciliation();
        testSession = createTestSession();
    }

    // ==================== System Knowledge Tests ====================

    @Nested
    @DisplayName("System Knowledge Tests")
    class SystemKnowledgeTests {

        @Test
        @DisplayName("Should generate comprehensive system knowledge")
        void shouldGenerateSystemKnowledge() {
            // When
            String knowledge = contextService.buildSystemKnowledge();

            // Then - should include database schema
            assertThat(knowledge).contains("DATABASE SCHEMA");
            assertThat(knowledge).contains("rule_sets");
            assertThat(knowledge).contains("field_mappings");
            assertThat(knowledge).contains("matching_rules");
            assertThat(knowledge).contains("reconciliations");
            assertThat(knowledge).contains("reconciliation_exceptions");
            assertThat(knowledge).contains("uploaded_files");

            // And matching strategies
            assertThat(knowledge).contains("MATCHING STRATEGIES");
            assertThat(knowledge).contains("EXACT");
            assertThat(knowledge).contains("FUZZY");
            assertThat(knowledge).contains("RANGE");
            assertThat(knowledge).contains("CONTAINS");

            // And exception types
            assertThat(knowledge).contains("EXCEPTION TYPES");
            assertThat(knowledge).contains("MISSING_SOURCE");
            assertThat(knowledge).contains("MISSING_TARGET");
            assertThat(knowledge).contains("VALUE_MISMATCH");

            // And workflow information
            assertThat(knowledge).contains("WORKFLOW");

            // And API endpoints
            assertThat(knowledge).contains("API ENDPOINTS");
            assertThat(knowledge).contains("/api/v1/files/upload");
            assertThat(knowledge).contains("/api/v1/reconciliations");

            // And guidelines
            assertThat(knowledge).contains("IMPORTANT GUIDELINES");
        }

        @Test
        @DisplayName("Should include severity assignment logic")
        void shouldIncludeSeverityLogic() {
            // When
            String knowledge = contextService.buildSystemKnowledge();

            // Then
            assertThat(knowledge).contains("CRITICAL");
            assertThat(knowledge).contains("HIGH");
            assertThat(knowledge).contains("MEDIUM");
            assertThat(knowledge).contains("LOW");
            assertThat(knowledge).contains("severity");
        }
    }

    // ==================== Dynamic Context Tests ====================

    @Nested
    @DisplayName("Dynamic Context Tests")
    class DynamicContextTests {

        @Test
        @DisplayName("Should build dynamic context with reconciliation details")
        void shouldBuildDynamicContextWithReconciliation() {
            // Given - session with reconciliation
            testReconciliation.setStatus(ReconciliationStatus.COMPLETED);
            testReconciliation.setMatchRate(92.3);
            testReconciliation.setTotalSourceRecords(1000);
            testReconciliation.setTotalTargetRecords(1000);
            testReconciliation.setMatchedRecords(923);
            testReconciliation.setUnmatchedSourceRecords(77);
            testReconciliation.setUnmatchedTargetRecords(0);
            testReconciliation.setExceptionCount(77);

            when(exceptionRepository.findByReconciliationId(testReconciliation.getId()))
                .thenReturn(createTestExceptions());
            when(reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(testOrganization.getId()))
                .thenReturn(Arrays.asList(testReconciliation));
            when(ruleSetRepository.findByOrganizationIdAndActiveTrue(testOrganization.getId()))
                .thenReturn(Arrays.asList(testRuleSet));
            when(fileRepository.findByOrganizationId(testOrganization.getId()))
                .thenReturn(Arrays.asList(sourceFile, targetFile));
            when(dashboardService.getMetrics()).thenReturn(createDashboardMetrics());

            // When
            String context = contextService.buildDynamicContext(testSession, testOrganization.getId());

            // Then - includes reconciliation context
            assertThat(context).contains("CURRENT RECONCILIATION CONTEXT");
            assertThat(context).contains("Reconciliation ID: " + testReconciliation.getId());
            assertThat(context).contains("Name: Test Reconciliation");
            assertThat(context).contains("Status: COMPLETED");
            assertThat(context).contains("Match Rate: 92.3%");
            assertThat(context).contains("Total Source Records: 1000");
            assertThat(context).contains("Matched Records: 923");
            assertThat(context).contains("Unmatched Source: 77");

            // And file information
            assertThat(context).contains("Source File: source.csv");
            assertThat(context).contains("Target File: target.csv");

            // And rule set information
            assertThat(context).contains("Rule Set: Test Rule Set");

            // And exception breakdown
            assertThat(context).contains("Exception Breakdown");

            // And recent activity
            assertThat(context).contains("RECENT SYSTEM ACTIVITY");

            // And system statistics
            assertThat(context).contains("SYSTEM STATISTICS");
        }

        @Test
        @DisplayName("Should build context without reconciliation")
        void shouldBuildContextWithoutReconciliation() {
            // Given - session without reconciliation
            testSession.setReconciliation(null);

            when(reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(testOrganization.getId()))
                .thenReturn(Arrays.asList(testReconciliation));
            when(ruleSetRepository.findByOrganizationIdAndActiveTrue(testOrganization.getId()))
                .thenReturn(Arrays.asList(testRuleSet));
            when(fileRepository.findByOrganizationId(testOrganization.getId()))
                .thenReturn(Arrays.asList(sourceFile, targetFile));
            when(dashboardService.getMetrics()).thenReturn(createDashboardMetrics());

            // When
            String context = contextService.buildDynamicContext(testSession, testOrganization.getId());

            // Then - should not include specific reconciliation context
            assertThat(context).doesNotContain("CURRENT RECONCILIATION CONTEXT");

            // But should include general activity and statistics
            assertThat(context).contains("RECENT SYSTEM ACTIVITY");
            assertThat(context).contains("SYSTEM STATISTICS");
        }

        @Test
        @DisplayName("Should include recent activity with 5 recent reconciliations")
        void shouldIncludeRecentActivity() {
            // Given
            List<Reconciliation> recentRecs = Arrays.asList(
                createReconciliation(1L, "Rec 1", 95.0),
                createReconciliation(2L, "Rec 2", 88.5),
                createReconciliation(3L, "Rec 3", 92.0),
                createReconciliation(4L, "Rec 4", 87.3),
                createReconciliation(5L, "Rec 5", 91.1)
            );

            when(reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(testOrganization.getId()))
                .thenReturn(recentRecs);
            when(ruleSetRepository.findByOrganizationIdAndActiveTrue(testOrganization.getId()))
                .thenReturn(Arrays.asList(testRuleSet));
            when(fileRepository.findByOrganizationId(testOrganization.getId()))
                .thenReturn(Arrays.asList(sourceFile, targetFile));
            when(dashboardService.getMetrics()).thenReturn(createDashboardMetrics());

            testSession.setReconciliation(null);

            // When
            String context = contextService.buildDynamicContext(testSession, testOrganization.getId());

            // Then
            assertThat(context).contains("Last 5 reconciliations:");
            assertThat(context).contains("Rec 1");
            assertThat(context).contains("95.0%");
            assertThat(context).contains("Rec 5");

            // And active rule sets count
            assertThat(context).contains("Active rule sets: 1");

            // And total files count
            assertThat(context).contains("Total uploaded files: 2");
        }

        @Test
        @DisplayName("Should include system statistics from dashboard")
        void shouldIncludeSystemStatistics() {
            // Given
            var metrics = createDashboardMetrics();

            when(dashboardService.getMetrics()).thenReturn(metrics);
            when(reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(anyLong()))
                .thenReturn(Arrays.asList());
            when(ruleSetRepository.findByOrganizationIdAndActiveTrue(anyLong()))
                .thenReturn(Arrays.asList());
            when(fileRepository.findByOrganizationId(anyLong()))
                .thenReturn(Arrays.asList());

            testSession.setReconciliation(null);

            // When
            String context = contextService.buildDynamicContext(testSession, testOrganization.getId());

            // Then
            assertThat(context).contains("SYSTEM STATISTICS");
            assertThat(context).contains("Total reconciliations: 10");
            assertThat(context).contains("Completed: 8");
            assertThat(context).contains("Pending: 1");
            assertThat(context).contains("Failed: 1");
            assertThat(context).contains("Overall match rate: 89.50%");
            assertThat(context).contains("Open exceptions: 45");
            assertThat(context).contains("Resolved exceptions: 123");
        }

        @Test
        @DisplayName("Should include exception breakdown when reconciliation has exceptions")
        void shouldIncludeExceptionBreakdown() {
            // Given
            testReconciliation.setStatus(ReconciliationStatus.COMPLETED);
            testReconciliation.setExceptionCount(100);

            List<ReconciliationException> exceptions = createTestExceptions();
            when(exceptionRepository.findByReconciliationId(testReconciliation.getId()))
                .thenReturn(exceptions);
            when(reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(anyLong()))
                .thenReturn(Arrays.asList(testReconciliation));
            when(ruleSetRepository.findByOrganizationIdAndActiveTrue(anyLong()))
                .thenReturn(Arrays.asList());
            when(fileRepository.findByOrganizationId(anyLong()))
                .thenReturn(Arrays.asList());
            when(dashboardService.getMetrics()).thenReturn(createDashboardMetrics());

            // When
            String context = contextService.buildDynamicContext(testSession, testOrganization.getId());

            // Then
            assertThat(context).contains("Exception Breakdown");
            assertThat(context).contains("By Type:");
            assertThat(context).contains("By Severity:");
            assertThat(context).contains("By Status:");
        }

        @Test
        @DisplayName("Should include key fields from rule set")
        void shouldIncludeKeyFields() {
            // Given
            when(exceptionRepository.findByReconciliationId(anyLong()))
                .thenReturn(Arrays.asList());
            when(reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(anyLong()))
                .thenReturn(Arrays.asList());
            when(ruleSetRepository.findByOrganizationIdAndActiveTrue(anyLong()))
                .thenReturn(Arrays.asList());
            when(fileRepository.findByOrganizationId(anyLong()))
                .thenReturn(Arrays.asList());
            when(dashboardService.getMetrics()).thenReturn(createDashboardMetrics());

            // When
            String context = contextService.buildDynamicContext(testSession, testOrganization.getId());

            // Then
            assertThat(context).contains("Key fields for matching:");
            assertThat(context).contains("invoice_id -> id");
        }
    }

    // ==================== Smart Context Tests ====================

    @Nested
    @DisplayName("Smart Context Tests")
    class SmartContextTests {

        @Test
        @DisplayName("Should build smart context for reconciliation queries")
        void shouldBuildSmartContextForReconciliationQueries() {
            // Given - user asks about recent reconciliations
            String userMessage = "What are the latest reconciliations?";

            List<Reconciliation> recentRecs = Arrays.asList(
                createReconciliation(1L, "Latest Rec", 95.0),
                createReconciliation(2L, "Second Rec", 88.0),
                createReconciliation(3L, "Third Rec", 92.0)
            );

            when(reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(testOrganization.getId()))
                .thenReturn(recentRecs);

            // When
            String context = contextService.buildSmartContext(userMessage, testOrganization.getId());

            // Then
            assertThat(context).contains("RECENT RECONCILIATIONS");
            assertThat(context).contains("Latest Rec");
            assertThat(context).contains("95.0%");
            assertThat(context).contains("Match Rate:");
        }

        @Test
        @DisplayName("Should build smart context for exception queries")
        void shouldBuildSmartContextForExceptionQueries() {
            // Given - user asks about exceptions
            String userMessage = "How many exceptions are open?";

            var metrics = createDashboardMetrics();
            when(dashboardService.getMetrics()).thenReturn(metrics);

            // When
            String context = contextService.buildSmartContext(userMessage, testOrganization.getId());

            // Then
            assertThat(context).contains("EXCEPTION OVERVIEW");
            assertThat(context).contains("Open exceptions: 45");
            assertThat(context).contains("Resolved exceptions: 123");
            assertThat(context).contains("By type:");
            assertThat(context).contains("By severity:");
        }

        @Test
        @DisplayName("Should build smart context for rule queries")
        void shouldBuildSmartContextForRuleQueries() {
            // Given - user asks about rules
            String userMessage = "What rules are configured?";

            List<RuleSet> ruleSets = Arrays.asList(
                createRuleSet(1L, "Rule Set 1", 5, 3),
                createRuleSet(2L, "Rule Set 2", 8, 4)
            );

            when(ruleSetRepository.findByOrganizationIdAndActiveTrue(testOrganization.getId()))
                .thenReturn(ruleSets);

            // When
            String context = contextService.buildSmartContext(userMessage, testOrganization.getId());

            // Then
            assertThat(context).contains("ACTIVE RULE SETS");
            assertThat(context).contains("Rule Set 1");
            assertThat(context).contains("5 mappings");
            assertThat(context).contains("3 rules");
            assertThat(context).contains("Rule Set 2");
        }

        @Test
        @DisplayName("Should return empty context when no keywords match")
        void shouldReturnEmptyContextWhenNoKeywordsMatch() {
            // Given - generic message
            String userMessage = "Hello, how are you?";

            // When
            String context = contextService.buildSmartContext(userMessage, testOrganization.getId());

            // Then
            assertThat(context).isEmpty();
        }

        @Test
        @DisplayName("Should handle case-insensitive keyword matching")
        void shouldHandleCaseInsensitiveMatching() {
            // Given - mixed case message
            String userMessage = "Show me the LATEST RECONCILIATION";

            when(reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(anyLong()))
                .thenReturn(Arrays.asList(createReconciliation(1L, "Test", 90.0)));

            // When
            String context = contextService.buildSmartContext(userMessage, testOrganization.getId());

            // Then
            assertThat(context).contains("RECENT RECONCILIATIONS");
        }

        @Test
        @DisplayName("Should not provide rule context when asking about matching rules")
        void shouldNotProvideRuleContextForMatchingRules() {
            // Given - asking about matching rules specifically
            String userMessage = "How does fuzzy matching rule work?";

            // When
            String context = contextService.buildSmartContext(userMessage, testOrganization.getId());

            // Then - should not trigger rule set listing
            assertThat(context).doesNotContain("ACTIVE RULE SETS");
        }
    }

    // ==================== Test Data Helpers ====================

    private Organization createTestOrganization() {
        Organization org = new Organization();
        org.setId(1L);
        org.setName("Test Organization");
        return org;
    }

    private Reconciliation createTestReconciliation() {
        Reconciliation rec = new Reconciliation();
        rec.setId(1L);
        rec.setName("Test Reconciliation");
        rec.setOrganization(testOrganization);
        rec.setSourceFile(sourceFile);
        rec.setTargetFile(targetFile);
        rec.setRuleSet(testRuleSet);
        rec.setStatus(ReconciliationStatus.COMPLETED);
        rec.setMatchRate(92.3);
        rec.setTotalSourceRecords(1000);
        rec.setMatchedRecords(923);
        rec.setUnmatchedSourceRecords(77);
        rec.setExceptionCount(77);
        return rec;
    }

    private Reconciliation createReconciliation(Long id, String name, Double matchRate) {
        Reconciliation rec = new Reconciliation();
        rec.setId(id);
        rec.setName(name);
        rec.setOrganization(testOrganization);
        rec.setStatus(ReconciliationStatus.COMPLETED);
        rec.setMatchRate(matchRate);
        return rec;
    }

    private ChatSession createTestSession() {
        ChatSession session = ChatSession.builder()
            .organization(testOrganization)
            .reconciliation(testReconciliation)
            .title("Test Chat Session")
            .active(true)
            .build();
        session.setId(1L);
        return session;
    }

    private UploadedFile createTestFile(Long id, String filename, int rows, int columns) {
        UploadedFile file = new UploadedFile();
        file.setId(id);
        file.setOriginalFilename(filename);
        file.setRowCount(rows);
        file.setColumnCount(columns);
        return file;
    }

    private RuleSet createTestRuleSet() {
        RuleSet ruleSet = new RuleSet();
        ruleSet.setId(1L);
        ruleSet.setName("Test Rule Set");
        ruleSet.setVersion(1);
        ruleSet.setActive(true);
        ruleSet.setOrganization(testOrganization);

        FieldMapping keyMapping = new FieldMapping();
        keyMapping.setSourceField("invoice_id");
        keyMapping.setTargetField("id");
        keyMapping.setIsKey(true);
        keyMapping.setRuleSet(ruleSet);

        FieldMapping normalMapping = new FieldMapping();
        normalMapping.setSourceField("amount");
        normalMapping.setTargetField("total");
        normalMapping.setIsKey(false);
        normalMapping.setRuleSet(ruleSet);

        ruleSet.setFieldMappings(Arrays.asList(keyMapping, normalMapping));

        MatchingRule rule1 = new MatchingRule();
        rule1.setSourceField("invoice_id");
        rule1.setTargetField("id");
        rule1.setMatchType(MatchType.EXACT);
        rule1.setRuleSet(ruleSet);

        MatchingRule rule2 = new MatchingRule();
        rule2.setSourceField("customer_name");
        rule2.setTargetField("customer_name");
        rule2.setMatchType(MatchType.FUZZY);
        rule2.setFuzzyThreshold(0.85);
        rule2.setRuleSet(ruleSet);

        ruleSet.setMatchingRules(Arrays.asList(rule1, rule2));

        return ruleSet;
    }

    private RuleSet createRuleSet(Long id, String name, int mappingCount, int ruleCount) {
        RuleSet ruleSet = new RuleSet();
        ruleSet.setId(id);
        ruleSet.setName(name);
        ruleSet.setVersion(1);

        List<FieldMapping> mappings = new java.util.ArrayList<>();
        for (int i = 0; i < mappingCount; i++) {
            mappings.add(new FieldMapping());
        }
        ruleSet.setFieldMappings(mappings);

        List<MatchingRule> rules = new java.util.ArrayList<>();
        for (int i = 0; i < ruleCount; i++) {
            rules.add(new MatchingRule());
        }
        ruleSet.setMatchingRules(rules);

        return ruleSet;
    }

    private List<ReconciliationException> createTestExceptions() {
        ReconciliationException ex1 = new ReconciliationException();
        ex1.setType(ExceptionType.MISSING_SOURCE);
        ex1.setSeverity(ExceptionSeverity.HIGH);
        ex1.setStatus(ExceptionStatus.OPEN);

        ReconciliationException ex2 = new ReconciliationException();
        ex2.setType(ExceptionType.VALUE_MISMATCH);
        ex2.setSeverity(ExceptionSeverity.MEDIUM);
        ex2.setStatus(ExceptionStatus.OPEN);

        ReconciliationException ex3 = new ReconciliationException();
        ex3.setType(ExceptionType.VALUE_MISMATCH);
        ex3.setSeverity(ExceptionSeverity.LOW);
        ex3.setStatus(ExceptionStatus.RESOLVED);

        return Arrays.asList(ex1, ex2, ex3);
    }

    private com.amit.smartreconciliation.dto.response.DashboardMetricsResponse createDashboardMetrics() {
        Map<String, Integer> exceptionsByType = new HashMap<>();
        exceptionsByType.put("MISSING_SOURCE", 20);
        exceptionsByType.put("VALUE_MISMATCH", 25);

        Map<String, Integer> exceptionsBySeverity = new HashMap<>();
        exceptionsBySeverity.put("HIGH", 30);
        exceptionsBySeverity.put("MEDIUM", 15);

        return com.amit.smartreconciliation.dto.response.DashboardMetricsResponse.builder()
            .totalReconciliations(10)
            .completedReconciliations(8)
            .pendingReconciliations(1)
            .failedReconciliations(1)
            .overallMatchRate(89.5)
            .openExceptions(45)
            .resolvedExceptions(123)
            .exceptionsByType(exceptionsByType)
            .exceptionsBySeverity(exceptionsBySeverity)
            .build();
    }
}
