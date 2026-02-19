package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.ReconciliationRequest;
import com.amit.smartreconciliation.dto.response.ReconciliationResponse;
import com.amit.smartreconciliation.entity.FieldMapping;
import com.amit.smartreconciliation.entity.MatchingRule;
import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.entity.ReconciliationException;
import com.amit.smartreconciliation.entity.RuleSet;
import com.amit.smartreconciliation.entity.UploadedFile;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.enums.MatchType;
import com.amit.smartreconciliation.enums.ReconciliationStatus;
import com.amit.smartreconciliation.exception.FileProcessingException;
import com.amit.smartreconciliation.repository.ReconciliationExceptionRepository;
import com.amit.smartreconciliation.repository.ReconciliationRepository;
import com.amit.smartreconciliation.service.AiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ReconciliationService
 * Module: Reconciliation Engine
 * Test Level: Unit Test
 * Total Test Cases: 1
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ReconciliationService Unit Tests")
class ReconciliationServiceTest {

    @Mock
    private ReconciliationRepository reconciliationRepository;

    @Mock
    private ReconciliationExceptionRepository exceptionRepository;

    @Mock
    private OrganizationService organizationService;

    @Mock
    private FileUploadService fileUploadService;

    @Mock
    private RuleService ruleService;

    @Mock
    private FileParserService fileParserService;

    @Mock
    private AiService aiService;

    private ReconciliationService reconciliationService;

    @BeforeEach
    void setUp() {
        reconciliationService = org.mockito.Mockito.spy(new ReconciliationService(
                reconciliationRepository,
                exceptionRepository,
                organizationService,
                fileUploadService,
                ruleService,
                fileParserService,
                aiService
        ));

        // Default: files exist on disk for all tests unless overridden
        org.mockito.Mockito.lenient().when(fileUploadService.existsOnDisk(any())).thenReturn(true);
    }

    @Test
    @DisplayName("TC-RS-001: Create Reconciliation with Valid Inputs")
    void testTcRs001_createReconciliationWithValidInputs() {
        // Given
        Organization organization = Organization.builder()
                .id(123L)
                .name("org-123")
                .description("Test org")
                .active(true)
                .build();

        UploadedFile sourceFile = new UploadedFile();
        sourceFile.setId(1L);
        sourceFile.setOriginalFilename("source.csv");
        sourceFile.setOrganization(organization);

        UploadedFile targetFile = new UploadedFile();
        targetFile.setId(2L);
        targetFile.setOriginalFilename("target.csv");
        targetFile.setOrganization(organization);

        RuleSet ruleSet = new RuleSet();
        ruleSet.setId(3L);
        ruleSet.setName("rule-001");
        ruleSet.setOrganization(organization);

        ReconciliationRequest request = new ReconciliationRequest();
        request.setName("Q1 2024 Reconciliation");
        request.setDescription("Quarterly reconciliation");
        request.setSourceFileId(1L);
        request.setTargetFileId(2L);
        request.setRuleSetId(3L);

        when(organizationService.getDefaultOrganization()).thenReturn(organization);
        when(fileUploadService.getEntityById(1L)).thenReturn(sourceFile);
        when(fileUploadService.getEntityById(2L)).thenReturn(targetFile);
        when(ruleService.getEntityById(3L)).thenReturn(ruleSet);

        LocalDateTime createdAt = LocalDateTime.of(2024, 1, 15, 10, 30);
        when(reconciliationRepository.save(any(Reconciliation.class))).thenAnswer(invocation -> {
            Reconciliation saved = invocation.getArgument(0);
            saved.setId(10L);
            ReflectionTestUtils.setField(saved, "createdAt", createdAt);
            return saved;
        });

        // When
        ReconciliationResponse response = reconciliationService.create(request);

        // Then
        ArgumentCaptor<Reconciliation> reconciliationCaptor = ArgumentCaptor.forClass(Reconciliation.class);
        verify(reconciliationRepository).save(reconciliationCaptor.capture());
        Reconciliation saved = reconciliationCaptor.getValue();

        assertThat(saved.getStatus()).isEqualTo(ReconciliationStatus.PENDING);
        assertThat(saved.getSourceFile()).isEqualTo(sourceFile);
        assertThat(saved.getTargetFile()).isEqualTo(targetFile);
        assertThat(saved.getRuleSet()).isEqualTo(ruleSet);
        assertThat(saved.getOrganization()).isEqualTo(organization);

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getStatus()).isEqualTo(ReconciliationStatus.PENDING);
        assertThat(response.getCreatedAt()).isEqualTo(createdAt);

        // create() no longer auto-starts; execution is triggered via separate start() call
        org.mockito.Mockito.verify(reconciliationService, org.mockito.Mockito.never())
                .executeReconciliationAsync(anyLong());
    }

    @Test
    @DisplayName("TC-RS-009: Fuzzy Match with High Similarity (Threshold 0.85)")
    void testTcRs009_fuzzyMatchHighSimilarity() {
        // Given
        MatchingRule rule = buildRule(MatchType.FUZZY, null, 0.85);

        // When
        boolean matches = invokeCompareValues("John Smith", "Jon Smith", rule);

        // Then
        assertThat(matches).isTrue();
    }

    @Test
    @DisplayName("TC-RS-010: Fuzzy Match Below Threshold")
    void testTcRs010_fuzzyMatchBelowThreshold() {
        // Given
        MatchingRule rule = buildRule(MatchType.FUZZY, null, 0.85);

        // When
        boolean matches = invokeCompareValues("John Smith", "Jane Doe", rule);

        // Then
        assertThat(matches).isFalse();
    }

    @Test
    @DisplayName("TC-RS-011: Fuzzy Match with Case Insensitivity")
    void testTcRs011_fuzzyMatchCaseInsensitivity() {
        // Given
        MatchingRule rule = buildRule(MatchType.FUZZY, null, 0.95);

        // When
        boolean matches = invokeCompareValues("JOHN SMITH", "john smith", rule);

        // Then
        assertThat(matches).isTrue();
    }

    @Test
    @DisplayName("TC-RS-012: Levenshtein Distance Algorithm Accuracy")
    void testTcRs012_levenshteinSimilarityScore() {
        // Given
        String source = "kitten";
        String target = "sitting";

        // When
        Double similarity = ReflectionTestUtils.invokeMethod(reconciliationService,
                "calculateSimilarity", source, target);

        // Then
        assertThat(similarity).isCloseTo(0.57, within(0.01));
    }

    @Test
    @DisplayName("TC-RS-013: Range Match Within Tolerance")
    void testTcRs013_rangeMatchWithinTolerance() {
        // Given
        MatchingRule rule = buildRule(MatchType.RANGE, 0.50, null);

        // When
        boolean matches = invokeCompareValues(100.00, 100.30, rule);

        // Then
        assertThat(matches).isTrue();
    }

    @Test
    @DisplayName("TC-RS-014: Range Match Exceeding Tolerance")
    void testTcRs014_rangeMatchExceedingTolerance() {
        // Given
        MatchingRule rule = buildRule(MatchType.RANGE, 0.50, null);

        // When
        boolean matches = invokeCompareValues(100.00, 101.00, rule);

        // Then
        assertThat(matches).isFalse();
    }

    @Test
    @DisplayName("TC-RS-015: Range Match with Negative Numbers")
    void testTcRs015_rangeMatchNegativeNumbers() {
        // Given
        MatchingRule rule = buildRule(MatchType.RANGE, 0.50, null);

        // When
        boolean matches = invokeCompareValues(-100.00, -99.70, rule);

        // Then
        assertThat(matches).isTrue();
    }

    @Test
    @DisplayName("TC-RS-016: Pattern Match - CONTAINS")
    void testTcRs016_patternContains() {
        // Given
        MatchingRule rule = buildRule(MatchType.CONTAINS, null, null);

        // When
        boolean matches = invokeCompareValues("January", "INV-January-2024", rule);

        // Then
        assertThat(matches).isTrue();
    }

    @Test
    @DisplayName("TC-RS-017: Pattern Match - STARTS_WITH")
    void testTcRs017_patternStartsWith() {
        // Given
        MatchingRule rule = buildRule(MatchType.STARTS_WITH, null, null);

        // When
        boolean matches = invokeCompareValues("INV-", "INV-67890", rule);

        // Then
        assertThat(matches).isTrue();
    }

    @Test
    @DisplayName("TC-RS-018: Pattern Match - ENDS_WITH")
    void testTcRs018_patternEndsWith() {
        // Given
        MatchingRule rule = buildRule(MatchType.ENDS_WITH, null, null);

        // When
        boolean matches = invokeCompareValues("@example.com", "admin@example.com", rule);

        // Then
        assertThat(matches).isTrue();
    }

    @Test
    @DisplayName("TC-RS-019: Pattern Match Failure")
    void testTcRs019_patternMatchFailure() {
        // Given
        MatchingRule rule = buildRule(MatchType.STARTS_WITH, null, null);

        // When
        boolean matches = invokeCompareValues("ABC", "XYZ789", rule);

        // Then
        assertThat(matches).isFalse();
    }

    @Test
    @DisplayName("TC-RS-002: Exact Match Reconciliation - 100% Match")
    void testTcRs002_exactMatchReconciliation() {
        // Given
        RuleSet ruleSet = buildRuleSet(
                List.of(
                        buildMapping("id", "id", true),
                        buildMapping("amount", "amount", false)
                ),
                List.of(
                        buildMatchingRule("id", "id", MatchType.EXACT),
                        buildMatchingRule("amount", "amount", MatchType.EXACT)
                )
        );

        FileParserService.ParseResult source = buildParseResult(
                List.of("id", "name", "amount"),
                List.of(
                        List.of(1, "John", 100),
                        List.of(2, "Jane", 200),
                        List.of(3, "Bob", 300)
                )
        );
        FileParserService.ParseResult target = buildParseResult(
                List.of("id", "name", "amount"),
                List.of(
                        List.of(1, "John", 100),
                        List.of(2, "Jane", 200),
                        List.of(3, "Bob", 300)
                )
        );

        // When
        Object result = invokePerformReconciliation(source, target, ruleSet);

        // Then
        assertThat(getMatchedCount(result)).isEqualTo(3);
        assertThat(getUnmatchedSourceCount(result)).isEqualTo(0);
        assertThat(getUnmatchedTargetCount(result)).isEqualTo(0);
        assertThat(getExceptions(result)).isEmpty();
    }

    @Test
    @DisplayName("TC-RS-004: Detect Missing Target Records")
    void testTcRs004_detectMissingTargetRecords() {
        // Given
        RuleSet ruleSet = buildRuleSet(
                List.of(buildMapping("id", "id", true)),
                List.of(buildMatchingRule("id", "id", MatchType.EXACT))
        );

        FileParserService.ParseResult source = buildParseResult(
                List.of("id"),
                List.of(
                        List.of(1),
                        List.of(2),
                        List.of(3),
                        List.of(4)
                )
        );
        FileParserService.ParseResult target = buildParseResult(
                List.of("id"),
                List.of(
                        List.of(1),
                        List.of(2)
                )
        );

        // When
        Object result = invokePerformReconciliation(source, target, ruleSet);

        // Then
        assertThat(getMatchedCount(result)).isEqualTo(2);
        assertThat(getUnmatchedSourceCount(result)).isEqualTo(2);
        assertThat(getExceptions(result)).hasSize(2);
        assertThat(getExceptions(result))
                .allMatch(ex -> ex.getType() == com.amit.smartreconciliation.enums.ExceptionType.MISSING_TARGET);
    }

    @Test
    @DisplayName("TC-RS-005: Detect Missing Source Records")
    void testTcRs005_detectMissingSourceRecords() {
        // Given
        RuleSet ruleSet = buildRuleSet(
                List.of(buildMapping("id", "id", true)),
                List.of(buildMatchingRule("id", "id", MatchType.EXACT))
        );

        FileParserService.ParseResult source = buildParseResult(
                List.of("id"),
                List.of(
                        List.of(1),
                        List.of(2)
                )
        );
        FileParserService.ParseResult target = buildParseResult(
                List.of("id"),
                List.of(
                        List.of(1),
                        List.of(2),
                        List.of(3),
                        List.of(4)
                )
        );

        // When
        Object result = invokePerformReconciliation(source, target, ruleSet);

        // Then
        assertThat(getMatchedCount(result)).isEqualTo(2);
        assertThat(getUnmatchedTargetCount(result)).isEqualTo(2);
        assertThat(getExceptions(result)).hasSize(2);
        assertThat(getExceptions(result))
                .allMatch(ex -> ex.getType() == com.amit.smartreconciliation.enums.ExceptionType.MISSING_SOURCE);
    }

    @Test
    @DisplayName("TC-RS-006: Detect Value Mismatch in Key Field")
    void testTcRs006_detectValueMismatchKeyField() {
        // Given
        RuleSet ruleSet = buildRuleSet(
                List.of(
                        buildMapping("id", "id", true),
                        buildMapping("amount", "amount", true)
                ),
                List.of(
                        buildMatchingRule("id", "id", MatchType.EXACT),
                        buildMatchingRule("amount", "amount", MatchType.EXACT)
                )
        );

        FileParserService.ParseResult source = buildParseResult(
                List.of("id", "amount"),
                List.of(List.of(1, 100))
        );
        FileParserService.ParseResult target = buildParseResult(
                List.of("id", "amount"),
                List.of(List.of(1, 150))
        );

        // When
        Object result = invokePerformReconciliation(source, target, ruleSet);

        // Then
        List<ReconciliationException> exceptions = getExceptions(result);
        assertThat(exceptions).hasSize(2);
        assertThat(exceptions)
                .anyMatch(ex -> ex.getType() == com.amit.smartreconciliation.enums.ExceptionType.MISSING_TARGET)
                .anyMatch(ex -> ex.getType() == com.amit.smartreconciliation.enums.ExceptionType.MISSING_SOURCE);
    }

    @Test
    @DisplayName("TC-RS-007: Detect Value Mismatch in Non-Key Field")
    void testTcRs007_detectValueMismatchNonKeyField() {
        // Given
        RuleSet ruleSet = buildRuleSet(
                List.of(
                        buildMapping("id", "id", true),
                        buildMapping("name", "name", false)
                ),
                List.of(
                        buildMatchingRule("id", "id", MatchType.EXACT),
                        buildMatchingRule("name", "name", MatchType.EXACT)
                )
        );

        FileParserService.ParseResult source = buildParseResult(
                List.of("id", "name"),
                List.of(List.of(1, "John"))
        );
        FileParserService.ParseResult target = buildParseResult(
                List.of("id", "name"),
                List.of(List.of(1, "Jane"))
        );

        // When
        Object result = invokePerformReconciliation(source, target, ruleSet);

        // Then
        List<ReconciliationException> exceptions = getExceptions(result);
        assertThat(exceptions).hasSize(1);
        ReconciliationException exception = exceptions.get(0);
        assertThat(exception.getType()).isEqualTo(com.amit.smartreconciliation.enums.ExceptionType.VALUE_MISMATCH);
        assertThat(exception.getSeverity()).isEqualTo(com.amit.smartreconciliation.enums.ExceptionSeverity.MEDIUM);
        assertThat(exception.getFieldName()).isEqualTo("name");
    }

    @Test
    @DisplayName("TC-RS-008: Multiple Value Mismatches in Single Row")
    void testTcRs008_multipleValueMismatchesSingleRow() {
        // Given
        RuleSet ruleSet = buildRuleSet(
                List.of(
                        buildMapping("id", "id", true),
                        buildMapping("name", "name", false),
                        buildMapping("amount", "amount", false),
                        buildMapping("date", "date", false)
                ),
                List.of(
                        buildMatchingRule("id", "id", MatchType.EXACT),
                        buildMatchingRule("name", "name", MatchType.EXACT),
                        buildMatchingRule("amount", "amount", MatchType.EXACT),
                        buildMatchingRule("date", "date", MatchType.EXACT)
                )
        );

        FileParserService.ParseResult source = buildParseResult(
                List.of("id", "name", "amount", "date"),
                List.of(List.of(1, "John", 100, "2024-01-01"))
        );
        FileParserService.ParseResult target = buildParseResult(
                List.of("id", "name", "amount", "date"),
                List.of(List.of(1, "Jane", 150, "2024-02-01"))
        );

        // When
        Object result = invokePerformReconciliation(source, target, ruleSet);

        // Then
        List<ReconciliationException> exceptions = getExceptions(result);
        assertThat(exceptions).hasSize(3);
        assertThat(exceptions)
                .allMatch(ex -> ex.getType() == com.amit.smartreconciliation.enums.ExceptionType.VALUE_MISMATCH);
    }

    @Test
    @DisplayName("TC-RS-022: Match on Composite Key Fields")
    void testTcRs022_matchOnCompositeKeyFields() {
        // Given
        List<FieldMapping> keyMappings = List.of(
                buildMapping("id", "id", true),
                buildMapping("category", "category", true)
        );
        FileParserService.ParseResult source = buildParseResult(
                List.of("id", "category"),
                List.of(List.of(1, "A"))
        );

        // When
        @SuppressWarnings("unchecked")
        var indexed = (java.util.Map<String, List<java.util.Map<String, Object>>>) ReflectionTestUtils.invokeMethod(
                reconciliationService, "indexByKey", source, keyMappings, true);

        // Then
        assertThat(indexed).containsKey("1|A|");
    }

    @Test
    @DisplayName("TC-RS-023: Mismatch on Composite Key")
    void testTcRs023_mismatchOnCompositeKey() {
        // Given
        RuleSet ruleSet = buildRuleSet(
                List.of(
                        buildMapping("id", "id", true),
                        buildMapping("category", "category", true)
                ),
                List.of(
                        buildMatchingRule("id", "id", MatchType.EXACT),
                        buildMatchingRule("category", "category", MatchType.EXACT)
                )
        );

        FileParserService.ParseResult source = buildParseResult(
                List.of("id", "category"),
                List.of(List.of(1, "A"))
        );
        FileParserService.ParseResult target = buildParseResult(
                List.of("id", "category"),
                List.of(List.of(1, "B"))
        );

        // When
        Object result = invokePerformReconciliation(source, target, ruleSet);

        // Then
        List<ReconciliationException> exceptions = getExceptions(result);
        assertThat(exceptions).hasSize(2);
        assertThat(exceptions)
                .anyMatch(ex -> ex.getType() == com.amit.smartreconciliation.enums.ExceptionType.MISSING_TARGET)
                .anyMatch(ex -> ex.getType() == com.amit.smartreconciliation.enums.ExceptionType.MISSING_SOURCE);
    }

    @Test
    @DisplayName("TC-RS-030: Calculate Match Rate Correctly")
    void testTcRs030_calculateMatchRateCorrectly() throws Exception {
        // Given
        Class<?> resultClass = Class.forName(
                "com.amit.smartreconciliation.service.ReconciliationService$ReconciliationResult");
        Constructor<?> ctor = resultClass.getDeclaredConstructor(int.class, int.class, int.class, List.class);
        ctor.setAccessible(true);
        Object result = ctor.newInstance(850, 150, 0, Collections.emptyList());

        // When
        Double matchRate = ReflectionTestUtils.invokeMethod(reconciliationService,
                "calculateMatchRate", result, 1000);

        // Then
        assertThat(matchRate).isEqualTo(85.0);
    }

    @Test
    @DisplayName("TC-RS-020: Detect Duplicate Keys in Source")
    void testTcRs020_detectDuplicateKeysInSource() {
        // Given
        RuleSet ruleSet = buildRuleSet(
                List.of(buildMapping("id", "id", true)),
                List.of(buildMatchingRule("id", "id", MatchType.EXACT))
        );

        FileParserService.ParseResult source = buildParseResult(
                List.of("id"),
                List.of(List.of(1), List.of(1))
        );
        FileParserService.ParseResult target = buildParseResult(
                List.of("id"),
                List.of(List.of(1))
        );

        // When
        Object result = invokePerformReconciliation(source, target, ruleSet);

        // Then
        List<ReconciliationException> exceptions = getExceptions(result);
        assertThat(exceptions).hasSize(1);
        ReconciliationException exception = exceptions.get(0);
        assertThat(exception.getType()).isEqualTo(ExceptionType.DUPLICATE);
        assertThat(exception.getSeverity()).isEqualTo(ExceptionSeverity.HIGH);
    }

    @Test
    @DisplayName("TC-RS-021: Detect Duplicate Keys in Target")
    void testTcRs021_detectDuplicateKeysInTarget() {
        // Given
        RuleSet ruleSet = buildRuleSet(
                List.of(buildMapping("id", "id", true)),
                List.of(buildMatchingRule("id", "id", MatchType.EXACT))
        );

        FileParserService.ParseResult source = buildParseResult(
                List.of("id"),
                List.of(List.of(1))
        );
        FileParserService.ParseResult target = buildParseResult(
                List.of("id"),
                List.of(List.of(1), List.of(1))
        );

        // When
        Object result = invokePerformReconciliation(source, target, ruleSet);

        // Then
        List<ReconciliationException> exceptions = getExceptions(result);
        assertThat(exceptions).hasSize(1);
        ReconciliationException exception = exceptions.get(0);
        assertThat(exception.getType()).isEqualTo(ExceptionType.DUPLICATE);
    }

    @Test
    @DisplayName("TC-RS-024: Reconcile 10,000 Row Dataset")
    void testTcRs024_reconcileTenThousandRows() {
        // Given
        RuleSet ruleSet = buildRuleSet(
                List.of(buildMapping("id", "id", true)),
                List.of(buildMatchingRule("id", "id", MatchType.EXACT))
        );

        List<List<Object>> sourceRows = new ArrayList<>();
        List<List<Object>> targetRows = new ArrayList<>();
        for (int i = 1; i <= 10000; i++) {
            sourceRows.add(List.of(i));
            if (i <= 9500) {
                targetRows.add(List.of(i));
            }
        }

        FileParserService.ParseResult source = buildParseResult(List.of("id"), sourceRows);
        FileParserService.ParseResult target = buildParseResult(List.of("id"), targetRows);

        // When
        Object result = invokePerformReconciliation(source, target, ruleSet);

        // Then
        assertThat(getMatchedCount(result)).isEqualTo(9500);
        assertThat(getUnmatchedSourceCount(result)).isEqualTo(500);
        assertThat(getExceptions(result)).hasSize(500);
        assertThat(getExceptions(result))
                .allMatch(ex -> ex.getType() == ExceptionType.MISSING_TARGET);
    }

    @Test
    @DisplayName("TC-RS-025: Update Progress During Long Reconciliation")
    void testTcRs025_progressUpdatesDuringReconciliation() {
        // Given
        Reconciliation reconciliation = buildReconciliationForAsync();
        when(reconciliationRepository.findById(1L)).thenReturn(Optional.of(reconciliation));

        FileParserService.ParseResult source = buildParseResult(
                List.of("id"), List.of(List.of(1), List.of(2)));
        FileParserService.ParseResult target = buildParseResult(
                List.of("id"), List.of(List.of(1), List.of(2)));

        when(fileParserService.parseFile(any(java.nio.file.Path.class)))
                .thenReturn(source)
                .thenReturn(target);

        List<Integer> progressUpdates = new ArrayList<>();
        when(reconciliationRepository.save(any(Reconciliation.class))).thenAnswer(invocation -> {
            Reconciliation saved = invocation.getArgument(0);
            progressUpdates.add(saved.getProgress());
            return saved;
        });

        // When
        reconciliationService.executeReconciliationAsync(1L);

        // Then
        assertThat(progressUpdates).contains(5, 20, 40, 90, 100);
    }

    @Test
    @DisplayName("TC-RS-026: Cancel In-Progress Reconciliation")
    void testTcRs026_cancelInProgressReconciliation() {
        // Given
        Reconciliation reconciliation = new Reconciliation();
        reconciliation.setId(11L);
        reconciliation.setStatus(ReconciliationStatus.IN_PROGRESS);
        when(reconciliationRepository.findById(11L)).thenReturn(Optional.of(reconciliation));

        // When
        reconciliationService.cancel(11L);

        // Then
        assertThat(reconciliation.getStatus()).isEqualTo(ReconciliationStatus.CANCELLED);
        verify(reconciliationRepository).save(reconciliation);
    }

    @Test
    @DisplayName("TC-RS-027: Cannot Cancel Completed Reconciliation")
    void testTcRs027_cannotCancelCompletedReconciliation() {
        // Given
        Reconciliation reconciliation = new Reconciliation();
        reconciliation.setId(12L);
        reconciliation.setStatus(ReconciliationStatus.COMPLETED);
        when(reconciliationRepository.findById(12L)).thenReturn(Optional.of(reconciliation));

        // When & Then
        assertThatThrownBy(() -> reconciliationService.cancel(12L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Cannot cancel completed reconciliation");
    }

    @Test
    @DisplayName("TC-RS-028: Handle Missing Source File")
    void testTcRs028_handleMissingSourceFile() {
        // Given
        Reconciliation reconciliation = buildReconciliationForAsync();
        when(reconciliationRepository.findById(1L)).thenReturn(Optional.of(reconciliation));

        when(fileParserService.parseFile(any(java.nio.file.Path.class)))
                .thenThrow(new FileProcessingException("Source file not found"));

        Reconciliation saved = new Reconciliation();
        when(reconciliationRepository.save(any(Reconciliation.class))).thenAnswer(invocation -> {
            Reconciliation arg = invocation.getArgument(0);
            saved.setStatus(arg.getStatus());
            saved.setErrorMessage(arg.getErrorMessage());
            return arg;
        });

        // When
        reconciliationService.executeReconciliationAsync(1L);

        // Then
        assertThat(saved.getStatus()).isEqualTo(ReconciliationStatus.FAILED);
        assertThat(saved.getErrorMessage()).contains("Source file not found");
    }

    @Test
    @DisplayName("TC-RS-029: Handle Invalid Rule Set")
    void testTcRs029_handleInvalidRuleSet() {
        // Given
        Reconciliation reconciliation = buildReconciliationForAsync();
        reconciliation.setRuleSet(buildRuleSet(
                List.of(buildMapping("id", "id", false)),
                List.of(buildMatchingRule("id", "id", MatchType.EXACT))
        ));
        when(reconciliationRepository.findById(1L)).thenReturn(Optional.of(reconciliation));

        FileParserService.ParseResult source = buildParseResult(List.of("id"), List.of(List.of(1)));
        FileParserService.ParseResult target = buildParseResult(List.of("id"), List.of(List.of(1)));

        when(fileParserService.parseFile(any(java.nio.file.Path.class)))
                .thenReturn(source)
                .thenReturn(target);

        Reconciliation saved = new Reconciliation();
        when(reconciliationRepository.save(any(Reconciliation.class))).thenAnswer(invocation -> {
            Reconciliation arg = invocation.getArgument(0);
            saved.setStatus(arg.getStatus());
            saved.setErrorMessage(arg.getErrorMessage());
            return arg;
        });

        // When
        reconciliationService.executeReconciliationAsync(1L);

        // Then
        assertThat(saved.getStatus()).isEqualTo(ReconciliationStatus.FAILED);
        assertThat(saved.getErrorMessage()).isEqualTo("Rule set must have at least one key field");
    }

    @Test
    @DisplayName("TC-RS-031: Store Reconciliation Statistics JSONB")
    void testTcRs031_storeStatisticsJsonb() {
        // Given
        Reconciliation reconciliation = buildReconciliationForAsync();
        when(reconciliationRepository.findById(1L)).thenReturn(Optional.of(reconciliation));

        FileParserService.ParseResult source = buildParseResult(
                List.of("id"), List.of(List.of(1), List.of(2)));
        FileParserService.ParseResult target = buildParseResult(
                List.of("id"), List.of(List.of(1), List.of(2)));

        when(fileParserService.parseFile(any(java.nio.file.Path.class)))
                .thenReturn(source)
                .thenReturn(target);

        Reconciliation lastSaved = new Reconciliation();
        when(reconciliationRepository.save(any(Reconciliation.class))).thenAnswer(invocation -> {
            Reconciliation arg = invocation.getArgument(0);
            lastSaved.setStatistics(arg.getStatistics());
            return arg;
        });

        // When
        reconciliationService.executeReconciliationAsync(1L);

        // Then
        assertThat(lastSaved.getStatistics()).isNotNull();
        assertThat(lastSaved.getStatistics()).containsKeys(
                "totalSourceRecords",
                "totalTargetRecords",
                "matchedRecords",
                "unmatchedSourceRecords",
                "unmatchedTargetRecords",
                "exceptionCount"
        );
    }

    @Test
    @DisplayName("TC-RS-033: Cancellation Sets Status to CANCELLED")
    void testTcRs033_cancellationSetsStatusCancelled() {
        // Given
        Reconciliation reconciliation = new Reconciliation();
        reconciliation.setId(13L);
        reconciliation.setStatus(ReconciliationStatus.PENDING);
        when(reconciliationRepository.findById(13L)).thenReturn(Optional.of(reconciliation));

        // When
        reconciliationService.cancel(13L);

        // Then
        assertThat(reconciliation.getStatus()).isEqualTo(ReconciliationStatus.CANCELLED);
        verify(reconciliationRepository).save(reconciliation);
    }

    @Test
    @DisplayName("TC-RS-003: Exact Match with Null Key Fields")
    void testTcRs003_exactMatchWithNullKeyFields() {
        // Given
        RuleSet ruleSet = buildRuleSet(
                List.of(buildMapping("id", "id", true)),
                List.of(buildMatchingRule("id", "id", MatchType.EXACT))
        );

        FileParserService.ParseResult source = buildParseResult(
                List.of("id", "name", "amount"),
                List.of(Arrays.asList(null, "John", 100))
        );
        FileParserService.ParseResult target = buildParseResult(
                List.of("id", "name", "amount"),
                List.of(Arrays.asList(null, "John", 100))
        );

        // When
        Object result = invokePerformReconciliation(source, target, ruleSet);

        // Then
        List<ReconciliationException> exceptions = getExceptions(result);
        assertThat(exceptions).hasSize(1);
        ReconciliationException exception = exceptions.get(0);
        assertThat(exception.getType()).isEqualTo(ExceptionType.MISSING_SOURCE);
        assertThat(exception.getSeverity()).isEqualTo(ExceptionSeverity.CRITICAL);
    }

    @Test
    @DisplayName("TC-RS-032: Progress Updates at Milestones")
    void testTcRs032_progressUpdatesAtMilestones() {
        // Given
        Reconciliation reconciliation = buildReconciliationForAsync();
        when(reconciliationRepository.findById(1L)).thenReturn(Optional.of(reconciliation));

        FileParserService.ParseResult source = buildParseResult(
                List.of("id"), List.of(List.of(1), List.of(2)));
        FileParserService.ParseResult target = buildParseResult(
                List.of("id"), List.of(List.of(1), List.of(2)));

        when(fileParserService.parseFile(any(java.nio.file.Path.class)))
                .thenReturn(source)
                .thenReturn(target);

        List<Integer> progressUpdates = new ArrayList<>();
        when(reconciliationRepository.save(any(Reconciliation.class))).thenAnswer(invocation -> {
            Reconciliation saved = invocation.getArgument(0);
            if (saved.getProgress() != null) {
                progressUpdates.add(saved.getProgress());
            }
            return saved;
        });

        // When
        reconciliationService.executeReconciliationAsync(1L);

        // Then
        assertThat(progressUpdates).contains(20, 40, 90, 100);
    }

    private MatchingRule buildRule(MatchType matchType, Double tolerance, Double fuzzyThreshold) {
        MatchingRule rule = new MatchingRule();
        rule.setMatchType(matchType);
        rule.setTolerance(tolerance);
        rule.setFuzzyThreshold(fuzzyThreshold);
        return rule;
    }

    private boolean invokeCompareValues(Object sourceValue, Object targetValue, MatchingRule rule) {
        Boolean matches = ReflectionTestUtils.invokeMethod(reconciliationService,
                "compareValues", sourceValue, targetValue, rule);
        return Boolean.TRUE.equals(matches);
    }

    private RuleSet buildRuleSet(List<FieldMapping> mappings, List<MatchingRule> rules) {
        RuleSet ruleSet = new RuleSet();
        ruleSet.setFieldMappings(new ArrayList<>(mappings));
        ruleSet.setMatchingRules(new ArrayList<>(rules));
        for (FieldMapping mapping : mappings) {
            mapping.setRuleSet(ruleSet);
        }
        for (MatchingRule rule : rules) {
            rule.setRuleSet(ruleSet);
        }
        return ruleSet;
    }

    private FieldMapping buildMapping(String sourceField, String targetField, boolean isKey) {
        FieldMapping mapping = new FieldMapping();
        mapping.setSourceField(sourceField);
        mapping.setTargetField(targetField);
        mapping.setIsKey(isKey);
        return mapping;
    }

    private MatchingRule buildMatchingRule(String sourceField, String targetField, MatchType matchType) {
        MatchingRule rule = new MatchingRule();
        rule.setSourceField(sourceField);
        rule.setTargetField(targetField);
        rule.setMatchType(matchType);
        rule.setActive(true);
        return rule;
    }

    private FileParserService.ParseResult buildParseResult(List<String> headers, List<List<Object>> rows) {
        return new FileParserService.ParseResult(headers, rows);
    }

    private Object invokePerformReconciliation(FileParserService.ParseResult source,
                                               FileParserService.ParseResult target,
                                               RuleSet ruleSet) {
        Reconciliation reconciliation = new Reconciliation();
        return ReflectionTestUtils.invokeMethod(reconciliationService,
                "performReconciliation", reconciliation, source, target, ruleSet);
    }

    private Reconciliation buildReconciliationForAsync() {
        Reconciliation reconciliation = new Reconciliation();
        reconciliation.setId(1L);

        UploadedFile sourceFile = new UploadedFile();
        sourceFile.setId(1L);
        sourceFile.setFilePath("source.csv");

        UploadedFile targetFile = new UploadedFile();
        targetFile.setId(2L);
        targetFile.setFilePath("target.csv");

        reconciliation.setSourceFile(sourceFile);
        reconciliation.setTargetFile(targetFile);

        RuleSet ruleSet = buildRuleSet(
                List.of(buildMapping("id", "id", true)),
                List.of(buildMatchingRule("id", "id", MatchType.EXACT))
        );
        reconciliation.setRuleSet(ruleSet);
        return reconciliation;
    }

    private int getMatchedCount(Object result) {
        Integer value = ReflectionTestUtils.invokeMethod(result, "matchedCount");
        return value != null ? value : 0;
    }

    private int getUnmatchedSourceCount(Object result) {
        Integer value = ReflectionTestUtils.invokeMethod(result, "unmatchedSourceCount");
        return value != null ? value : 0;
    }

    private int getUnmatchedTargetCount(Object result) {
        Integer value = ReflectionTestUtils.invokeMethod(result, "unmatchedTargetCount");
        return value != null ? value : 0;
    }

    @SuppressWarnings("unchecked")
    private List<ReconciliationException> getExceptions(Object result) {
        List<ReconciliationException> exceptions = ReflectionTestUtils.invokeMethod(result, "exceptions");
        return exceptions != null ? exceptions : List.of();
    }
}
