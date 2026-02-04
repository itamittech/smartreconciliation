package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.BulkExceptionRequest;
import com.amit.smartreconciliation.dto.request.ExceptionUpdateRequest;
import com.amit.smartreconciliation.dto.response.ReconciliationExceptionResponse;
import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.entity.ReconciliationException;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.repository.ReconciliationExceptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ExceptionService
 * Module: Exception Management
 * Test Level: Unit Test
 * Total Test Cases: 18
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ExceptionService Unit Tests")
class ExceptionServiceTest {

    @Mock
    private ReconciliationExceptionRepository exceptionRepository;

    @Mock
    private AiService aiService;

    @InjectMocks
    private ExceptionService exceptionService;

    private Reconciliation reconciliation;

    @BeforeEach
    void setUp() {
        reconciliation = new Reconciliation();
        reconciliation.setId(123L);
        reconciliation.setName("recon-123");
    }

    @Test
    @DisplayName("TC-ES-001: Filter Exceptions by Type")
    void testFilterExceptionsByType() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        List<ReconciliationException> exceptions = buildExceptions(4, ExceptionType.VALUE_MISMATCH,
                ExceptionSeverity.MEDIUM, ExceptionStatus.OPEN);
        when(exceptionRepository.findByFilters(123L, ExceptionType.VALUE_MISMATCH, null, null, pageable))
                .thenReturn(new PageImpl<>(exceptions, pageable, 4));

        // When
        Page<ReconciliationExceptionResponse> response = exceptionService.getByReconciliationId(
                123L, ExceptionType.VALUE_MISMATCH, null, null, pageable);

        // Then
        assertThat(response.getTotalElements()).isEqualTo(4);
        assertThat(response.getContent()).allMatch(r -> r.getType() == ExceptionType.VALUE_MISMATCH);
    }

    @Test
    @DisplayName("TC-ES-002: Filter Exceptions by Severity")
    void testFilterExceptionsBySeverity() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        List<ReconciliationException> exceptions = buildExceptions(5, ExceptionSeverity.HIGH);
        when(exceptionRepository.findByFilters(123L, null, ExceptionSeverity.HIGH, null, pageable))
                .thenReturn(new PageImpl<>(exceptions, pageable, 5));

        // When
        Page<ReconciliationExceptionResponse> response = exceptionService.getByReconciliationId(
                123L, null, ExceptionSeverity.HIGH, null, pageable);

        // Then
        assertThat(response.getTotalElements()).isEqualTo(5);
        assertThat(response.getContent()).allMatch(r -> r.getSeverity() == ExceptionSeverity.HIGH);
    }

    @Test
    @DisplayName("TC-ES-003: Filter Exceptions by Status")
    void testFilterExceptionsByStatus() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        List<ReconciliationException> exceptions = buildExceptions(10, ExceptionStatus.OPEN);
        when(exceptionRepository.findByFilters(123L, null, null, ExceptionStatus.OPEN, pageable))
                .thenReturn(new PageImpl<>(exceptions, pageable, 10));

        // When
        Page<ReconciliationExceptionResponse> response = exceptionService.getByReconciliationId(
                123L, null, null, ExceptionStatus.OPEN, pageable);

        // Then
        assertThat(response.getTotalElements()).isEqualTo(10);
        assertThat(response.getContent()).allMatch(r -> r.getStatus() == ExceptionStatus.OPEN);
    }

    @Test
    @DisplayName("TC-ES-004: Filter with Multiple Criteria")
    void testFilterWithMultipleCriteria() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        List<ReconciliationException> exceptions = buildExceptions(2, ExceptionType.VALUE_MISMATCH,
                ExceptionSeverity.CRITICAL, ExceptionStatus.OPEN);
        when(exceptionRepository.findByFilters(123L, ExceptionType.VALUE_MISMATCH,
                ExceptionSeverity.CRITICAL, ExceptionStatus.OPEN, pageable))
                .thenReturn(new PageImpl<>(exceptions, pageable, 2));

        // When
        Page<ReconciliationExceptionResponse> response = exceptionService.getByReconciliationId(
                123L, ExceptionType.VALUE_MISMATCH, ExceptionSeverity.CRITICAL, ExceptionStatus.OPEN, pageable);

        // Then
        assertThat(response.getTotalElements()).isEqualTo(2);
        assertThat(response.getContent())
                .allMatch(r -> r.getType() == ExceptionType.VALUE_MISMATCH
                        && r.getSeverity() == ExceptionSeverity.CRITICAL
                        && r.getStatus() == ExceptionStatus.OPEN);
    }

    @Test
    @DisplayName("TC-ES-005: Filter with No Matching Results")
    void testFilterWithNoMatchingResults() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        when(exceptionRepository.findByFilters(123L, ExceptionType.DUPLICATE, null, null, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        // When
        Page<ReconciliationExceptionResponse> response = exceptionService.getByReconciliationId(
                123L, ExceptionType.DUPLICATE, null, null, pageable);

        // Then
        assertThat(response.getTotalElements()).isZero();
        assertThat(response.getContent()).isEmpty();
    }

    @Test
    @DisplayName("TC-ES-006: Paginate Exception List")
    void testPaginateExceptionList() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<ReconciliationException> exceptions = buildExceptions(10, ExceptionStatus.OPEN);
        when(exceptionRepository.findByFilters(123L, null, null, null, pageable))
                .thenReturn(new PageImpl<>(exceptions, pageable, 50));

        // When
        Page<ReconciliationExceptionResponse> response = exceptionService.getByReconciliationId(
                123L, null, null, null, pageable);

        // Then
        assertThat(response.getContent()).hasSize(10);
        assertThat(response.getTotalPages()).isEqualTo(5);
        assertThat(response.getTotalElements()).isEqualTo(50);
    }

    @Test
    @DisplayName("TC-ES-007: Retrieve Second Page")
    void testRetrieveSecondPage() {
        // Given
        Pageable pageable = PageRequest.of(1, 10);
        List<ReconciliationException> exceptions = buildExceptions(10, ExceptionStatus.OPEN);
        when(exceptionRepository.findByFilters(123L, null, null, null, pageable))
                .thenReturn(new PageImpl<>(exceptions, pageable, 50));

        // When
        Page<ReconciliationExceptionResponse> response = exceptionService.getByReconciliationId(
                123L, null, null, null, pageable);

        // Then
        assertThat(response.getNumber()).isEqualTo(1);
        assertThat(response.getContent()).hasSize(10);
    }

    @Test
    @DisplayName("TC-ES-008: Update Exception Status to RESOLVED")
    void testUpdateExceptionStatusResolved() {
        // Given
        ReconciliationException exception = buildException(ExceptionStatus.OPEN);
        when(exceptionRepository.findById(1L)).thenReturn(Optional.of(exception));
        when(exceptionRepository.save(any(ReconciliationException.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExceptionUpdateRequest request = new ExceptionUpdateRequest();
        request.setStatus(ExceptionStatus.RESOLVED);
        request.setResolution("Corrected in source system");
        request.setResolvedBy("user-456");

        // When
        ReconciliationExceptionResponse response = exceptionService.update(1L, request);

        // Then
        assertThat(response.getStatus()).isEqualTo(ExceptionStatus.RESOLVED);
        assertThat(response.getResolution()).isEqualTo("Corrected in source system");
        assertThat(response.getResolvedBy()).isEqualTo("user-456");
        assertThat(response.getResolvedAt()).isNotNull();
    }

    @Test
    @DisplayName("TC-ES-009: Update Exception Status to ACKNOWLEDGED")
    void testUpdateExceptionStatusAcknowledged() {
        // Given
        ReconciliationException exception = buildException(ExceptionStatus.OPEN);
        when(exceptionRepository.findById(2L)).thenReturn(Optional.of(exception));
        when(exceptionRepository.save(any(ReconciliationException.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExceptionUpdateRequest request = new ExceptionUpdateRequest();
        request.setStatus(ExceptionStatus.ACKNOWLEDGED);

        // When
        ReconciliationExceptionResponse response = exceptionService.update(2L, request);

        // Then
        assertThat(response.getStatus()).isEqualTo(ExceptionStatus.ACKNOWLEDGED);
        assertThat(response.getAcknowledgedAt()).isNotNull();
        assertThat(response.getResolution()).isNull();
    }

    @Test
    @DisplayName("TC-ES-010: Cannot Reopen Resolved Exception")
    void testCannotReopenResolvedException() {
        // Given
        ReconciliationException exception = buildException(ExceptionStatus.RESOLVED);
        when(exceptionRepository.findById(3L)).thenReturn(Optional.of(exception));

        ExceptionUpdateRequest request = new ExceptionUpdateRequest();
        request.setStatus(ExceptionStatus.OPEN);

        // When & Then
        assertThatThrownBy(() -> exceptionService.update(3L, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Cannot reopen resolved exception");
    }

    @Test
    @DisplayName("TC-ES-011: Bulk Update Multiple Exceptions")
    void testBulkUpdateMultipleExceptions() {
        // Given
        List<ReconciliationException> exceptions = List.of(
                buildExceptionWithId(11L),
                buildExceptionWithId(12L),
                buildExceptionWithId(13L)
        );
        when(exceptionRepository.findAllById(List.of(11L, 12L, 13L))).thenReturn(exceptions);
        when(exceptionRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        BulkExceptionRequest request = new BulkExceptionRequest();
        request.setExceptionIds(List.of(11L, 12L, 13L));
        request.setStatus(ExceptionStatus.ACKNOWLEDGED);

        // When
        List<ReconciliationExceptionResponse> response = exceptionService.bulkUpdate(request);

        // Then
        assertThat(response).hasSize(3);
        assertThat(response).allMatch(r -> r.getStatus() == ExceptionStatus.ACKNOWLEDGED);
    }

    @Test
    @DisplayName("TC-ES-012: Bulk Update with Partial Failure")
    void testBulkUpdateWithPartialFailure() {
        // Given
        List<ReconciliationException> exceptions = List.of(
                buildExceptionWithId(111L),
                buildExceptionWithId(222L)
        );
        when(exceptionRepository.findAllById(List.of(111L, 222L, 999L))).thenReturn(exceptions);
        when(exceptionRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        BulkExceptionRequest request = new BulkExceptionRequest();
        request.setExceptionIds(List.of(111L, 222L, 999L));
        request.setStatus(ExceptionStatus.ACKNOWLEDGED);

        // When
        List<ReconciliationExceptionResponse> response = exceptionService.bulkUpdate(request);

        // Then
        assertThat(response).hasSize(2);
        assertThat(response).allMatch(r -> r.getStatus() == ExceptionStatus.ACKNOWLEDGED);
    }

    @Test
    @DisplayName("TC-ES-013: Generate AI Suggestion for Value Mismatch")
    void testGenerateAiSuggestionForValueMismatch() {
        // Given
        ReconciliationException exception = buildException(ExceptionStatus.OPEN);
        exception.setType(ExceptionType.VALUE_MISMATCH);
        exception.setFieldName("customer_name");
        exception.setSourceValue("John Smith");
        exception.setTargetValue("Jon Smith");
        exception.setDescription("Value mismatch");

        when(exceptionRepository.findById(55L)).thenReturn(Optional.of(exception));
        when(aiService.getExceptionSuggestion(any(), any(), any(), any(), any()))
                .thenReturn("Possible typo in source. Suggested: Update source to 'Jon Smith'");
        when(exceptionRepository.save(any(ReconciliationException.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        String suggestion = exceptionService.getSuggestion(55L);

        // Then
        assertThat(suggestion).contains("Possible typo in source");
        assertThat(exception.getAiSuggestion()).isNotNull();
        verify(aiService).getExceptionSuggestion(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("TC-ES-014: Return Cached AI Suggestion")
    void testReturnCachedAiSuggestion() {
        // Given
        ReconciliationException exception = buildException(ExceptionStatus.OPEN);
        exception.setAiSuggestion("Cached suggestion");
        when(exceptionRepository.findById(56L)).thenReturn(Optional.of(exception));

        // When
        String suggestion = exceptionService.getSuggestion(56L);

        // Then
        assertThat(suggestion).isEqualTo("Cached suggestion");
        verify(aiService, never()).getExceptionSuggestion(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("TC-ES-015: Count Exceptions by Status")
    void testCountExceptionsByStatus() {
        // Given
        when(exceptionRepository.countByReconciliationIdAndStatus(888L, ExceptionStatus.OPEN)).thenReturn(15L);
        when(exceptionRepository.countByReconciliationIdAndStatus(888L, ExceptionStatus.RESOLVED)).thenReturn(10L);
        when(exceptionRepository.countByReconciliationIdAndStatus(888L, ExceptionStatus.ACKNOWLEDGED)).thenReturn(5L);
        when(exceptionRepository.countByReconciliationIdAndStatus(888L, ExceptionStatus.IN_REVIEW)).thenReturn(0L);
        when(exceptionRepository.countByReconciliationIdAndStatus(888L, ExceptionStatus.IGNORED)).thenReturn(0L);

        // When
        Map<ExceptionStatus, Long> counts = exceptionService.countByStatus(888L);

        // Then
        assertThat(counts.get(ExceptionStatus.OPEN)).isEqualTo(15L);
        assertThat(counts.get(ExceptionStatus.RESOLVED)).isEqualTo(10L);
        assertThat(counts.get(ExceptionStatus.ACKNOWLEDGED)).isEqualTo(5L);
    }

    @Test
    @DisplayName("TC-ES-016: Assign Severity Based on Key Field")
    void testAssignSeverityBasedOnKeyField() {
        // When & Then
        assertThat(exceptionService.assignSeverity(true)).isEqualTo(ExceptionSeverity.CRITICAL);
        assertThat(exceptionService.assignSeverity(false)).isEqualTo(ExceptionSeverity.MEDIUM);
    }

    @Test
    @DisplayName("TC-ES-017: Update Exception Status to IN_REVIEW")
    void testUpdateExceptionStatusInReview() {
        // Given
        ReconciliationException exception = buildException(ExceptionStatus.OPEN);
        when(exceptionRepository.findById(901L)).thenReturn(Optional.of(exception));
        when(exceptionRepository.save(any(ReconciliationException.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExceptionUpdateRequest request = new ExceptionUpdateRequest();
        request.setStatus(ExceptionStatus.IN_REVIEW);

        // When
        ReconciliationExceptionResponse response = exceptionService.update(901L, request);

        // Then
        assertThat(response.getStatus()).isEqualTo(ExceptionStatus.IN_REVIEW);
        assertThat(response.getReviewedAt()).isNotNull();
    }

    @Test
    @DisplayName("TC-ES-018: Update Exception Status to IGNORED")
    void testUpdateExceptionStatusIgnored() {
        // Given
        ReconciliationException exception = buildException(ExceptionStatus.IN_REVIEW);
        when(exceptionRepository.findById(902L)).thenReturn(Optional.of(exception));
        when(exceptionRepository.save(any(ReconciliationException.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExceptionUpdateRequest request = new ExceptionUpdateRequest();
        request.setStatus(ExceptionStatus.IGNORED);
        request.setResolvedBy("user-902");

        // When
        ReconciliationExceptionResponse response = exceptionService.update(902L, request);

        // Then
        assertThat(response.getStatus()).isEqualTo(ExceptionStatus.IGNORED);
        assertThat(response.getIgnoredAt()).isNotNull();
        assertThat(response.getResolvedBy()).isEqualTo("user-902");
    }

    private List<ReconciliationException> buildExceptions(int count, ExceptionStatus status) {
        List<ReconciliationException> exceptions = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            exceptions.add(buildException(status));
        }
        return exceptions;
    }

    private List<ReconciliationException> buildExceptions(int count, ExceptionSeverity severity) {
        List<ReconciliationException> exceptions = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            ReconciliationException exception = buildException(ExceptionStatus.OPEN);
            exception.setSeverity(severity);
            exceptions.add(exception);
        }
        return exceptions;
    }

    private List<ReconciliationException> buildExceptions(int count,
                                                          ExceptionType type,
                                                          ExceptionSeverity severity,
                                                          ExceptionStatus status) {
        List<ReconciliationException> exceptions = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            ReconciliationException exception = buildException(status);
            exception.setType(type);
            exception.setSeverity(severity);
            exceptions.add(exception);
        }
        return exceptions;
    }

    private ReconciliationException buildException(ExceptionStatus status) {
        ReconciliationException exception = new ReconciliationException();
        exception.setId(1L);
        exception.setReconciliation(reconciliation);
        exception.setType(ExceptionType.VALUE_MISMATCH);
        exception.setSeverity(ExceptionSeverity.MEDIUM);
        exception.setStatus(status);
        exception.setDescription("Value mismatch");
        exception.setFieldName("amount");
        exception.setSourceValue("100.00");
        exception.setTargetValue("150.00");
        return exception;
    }

    private ReconciliationException buildExceptionWithId(Long id) {
        ReconciliationException exception = buildException(ExceptionStatus.OPEN);
        exception.setId(id);
        return exception;
    }
}
