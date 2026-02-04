package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.response.DashboardMetricsResponse;
import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.entity.ReconciliationException;
import com.amit.smartreconciliation.entity.UploadedFile;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.enums.ReconciliationStatus;
import com.amit.smartreconciliation.repository.ReconciliationExceptionRepository;
import com.amit.smartreconciliation.repository.ReconciliationRepository;
import com.amit.smartreconciliation.repository.RuleSetRepository;
import com.amit.smartreconciliation.repository.UploadedFileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

/**
 * Unit tests for DashboardService
 * Module: Dashboard & Analytics
 * Test Level: Unit Test
 * Total Test Cases: 3
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardService Unit Tests")
class DashboardServiceTest {

    @Mock
    private ReconciliationRepository reconciliationRepository;

    @Mock
    private ReconciliationExceptionRepository exceptionRepository;

    @Mock
    private UploadedFileRepository fileRepository;

    @Mock
    private RuleSetRepository ruleSetRepository;

    @Mock
    private OrganizationService organizationService;

    @InjectMocks
    private DashboardService dashboardService;

    private Organization organization;

    @BeforeEach
    void setUp() {
        organization = Organization.builder()
                .id(42L)
                .name("org-42")
                .build();
        when(organizationService.getDefaultOrganization()).thenReturn(organization);
    }

    @Test
    @DisplayName("TC-DS-001: Calculate Summary Statistics for Organization")
    void testCalculateSummaryStatistics() {
        // Given
        List<Reconciliation> reconciliations = List.of(
                buildReconciliation(1L, ReconciliationStatus.COMPLETED, 95.0, 10),
                buildReconciliation(2L, ReconciliationStatus.IN_PROGRESS, 0.0, 5),
                buildReconciliation(3L, ReconciliationStatus.FAILED, 0.0, 3)
        );
        when(reconciliationRepository.findByOrganizationId(organization.getId())).thenReturn(reconciliations);
        when(fileRepository.findByOrganizationId(organization.getId()))
                .thenReturn(List.of(new UploadedFile(), new UploadedFile()));
        when(ruleSetRepository.findByOrganizationId(organization.getId()))
                .thenReturn(List.of(new com.amit.smartreconciliation.entity.RuleSet()));

        for (Reconciliation rec : reconciliations) {
            when(exceptionRepository.countByReconciliationIdAndStatus(rec.getId(), ExceptionStatus.OPEN)).thenReturn(2L);
            when(exceptionRepository.countByReconciliationIdAndStatus(rec.getId(), ExceptionStatus.RESOLVED)).thenReturn(1L);
            when(exceptionRepository.findByReconciliationId(rec.getId()))
                    .thenReturn(List.of(buildException(ExceptionType.VALUE_MISMATCH, ExceptionSeverity.HIGH)));
        }

        when(reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(organization.getId()))
                .thenReturn(reconciliations);

        // When
        DashboardMetricsResponse response = dashboardService.getMetrics();

        // Then
        assertThat(response.getTotalReconciliations()).isEqualTo(3);
        assertThat(response.getCompletedReconciliations()).isEqualTo(1);
        assertThat(response.getPendingReconciliations()).isEqualTo(1);
        assertThat(response.getFailedReconciliations()).isEqualTo(1);
        assertThat(response.getTotalExceptions()).isEqualTo(18);
        assertThat(response.getOpenExceptions()).isEqualTo(6);
        assertThat(response.getResolvedExceptions()).isEqualTo(3);
        assertThat(response.getTotalFilesUploaded()).isEqualTo(2);
        assertThat(response.getTotalRuleSets()).isEqualTo(1);
        assertThat(response.getExceptionsByType()).containsEntry("VALUE_MISMATCH", 3);
        assertThat(response.getExceptionsBySeverity()).containsEntry("HIGH", 3);
    }

    @Test
    @DisplayName("TC-DS-002: Calculate Average Match Rate for Completed Reconciliations")
    void testCalculateAverageMatchRateForCompletedReconciliations() {
        // Given
        List<Reconciliation> reconciliations = List.of(
                buildReconciliation(1L, ReconciliationStatus.COMPLETED, 90.0, 0),
                buildReconciliation(2L, ReconciliationStatus.COMPLETED, 80.0, 0),
                buildReconciliation(3L, ReconciliationStatus.IN_PROGRESS, 0.0, 0)
        );
        when(reconciliationRepository.findByOrganizationId(organization.getId())).thenReturn(reconciliations);
        when(reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(organization.getId()))
                .thenReturn(reconciliations);
        when(fileRepository.findByOrganizationId(organization.getId())).thenReturn(List.of());
        when(ruleSetRepository.findByOrganizationId(organization.getId())).thenReturn(List.of());
        when(exceptionRepository.findByReconciliationId(anyLong())).thenReturn(List.of());
        when(exceptionRepository.countByReconciliationIdAndStatus(anyLong(), org.mockito.ArgumentMatchers.<ExceptionStatus>any()))
                .thenReturn(0L);

        // When
        DashboardMetricsResponse response = dashboardService.getMetrics();

        // Then
        assertThat(response.getOverallMatchRate()).isEqualTo(85.0);
    }

    @Test
    @DisplayName("TC-DS-003: Retrieve Recent Reconciliations")
    void testRetrieveRecentReconciliations() {
        // Given
        List<Reconciliation> reconciliations = List.of(
                buildReconciliationWithDate(1L, "Recon 1", LocalDateTime.now().minusDays(1)),
                buildReconciliationWithDate(2L, "Recon 2", LocalDateTime.now())
        );
        when(reconciliationRepository.findByOrganizationId(organization.getId())).thenReturn(reconciliations);
        when(reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(organization.getId()))
                .thenReturn(reconciliations);
        when(fileRepository.findByOrganizationId(organization.getId())).thenReturn(List.of());
        when(ruleSetRepository.findByOrganizationId(organization.getId())).thenReturn(List.of());
        when(exceptionRepository.findByReconciliationId(anyLong())).thenReturn(List.of());
        when(exceptionRepository.countByReconciliationIdAndStatus(anyLong(), any())).thenReturn(0L);

        // When
        DashboardMetricsResponse response = dashboardService.getMetrics();

        // Then
        assertThat(response.getRecentReconciliations()).hasSize(2);
        assertThat(response.getRecentReconciliations()).extracting("id")
                .containsExactly(1L, 2L);
        assertThat(response.getRecentReconciliations()).extracting("name")
                .containsExactly("Recon 1", "Recon 2");
    }

    private Reconciliation buildReconciliation(Long id, ReconciliationStatus status, double matchRate, int exceptionCount) {
        Reconciliation reconciliation = new Reconciliation();
        reconciliation.setId(id);
        reconciliation.setStatus(status);
        reconciliation.setMatchRate(matchRate);
        reconciliation.setExceptionCount(exceptionCount);
        return reconciliation;
    }

    private Reconciliation buildReconciliationWithDate(Long id, String name, LocalDateTime createdAt) {
        Reconciliation reconciliation = new Reconciliation();
        reconciliation.setId(id);
        reconciliation.setName(name);
        reconciliation.setStatus(ReconciliationStatus.COMPLETED);
        reconciliation.setMatchRate(90.0);
        reconciliation.setExceptionCount(2);
        return reconciliation;
    }

    private ReconciliationException buildException(ExceptionType type, ExceptionSeverity severity) {
        ReconciliationException exception = new ReconciliationException();
        exception.setType(type);
        exception.setSeverity(severity);
        exception.setStatus(ExceptionStatus.OPEN);
        return exception;
    }
}
