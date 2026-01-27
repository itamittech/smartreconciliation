package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.response.DashboardMetricsResponse;
import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ReconciliationStatus;
import com.amit.smartreconciliation.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final ReconciliationRepository reconciliationRepository;
    private final ReconciliationExceptionRepository exceptionRepository;
    private final UploadedFileRepository fileRepository;
    private final RuleSetRepository ruleSetRepository;
    private final OrganizationService organizationService;

    public DashboardMetricsResponse getMetrics() {
        Organization org = organizationService.getDefaultOrganization();

        List<Reconciliation> allReconciliations = reconciliationRepository.findByOrganizationId(org.getId());

        int totalReconciliations = allReconciliations.size();
        int completedReconciliations = (int) allReconciliations.stream()
                .filter(r -> r.getStatus() == ReconciliationStatus.COMPLETED).count();
        int pendingReconciliations = (int) allReconciliations.stream()
                .filter(r -> r.getStatus() == ReconciliationStatus.PENDING ||
                             r.getStatus() == ReconciliationStatus.IN_PROGRESS).count();
        int failedReconciliations = (int) allReconciliations.stream()
                .filter(r -> r.getStatus() == ReconciliationStatus.FAILED).count();

        double overallMatchRate = allReconciliations.stream()
                .filter(r -> r.getStatus() == ReconciliationStatus.COMPLETED)
                .mapToDouble(Reconciliation::getMatchRate)
                .average()
                .orElse(0.0);

        int totalExceptions = allReconciliations.stream()
                .mapToInt(Reconciliation::getExceptionCount)
                .sum();

        int openExceptions = 0;
        int resolvedExceptions = 0;
        Map<String, Integer> exceptionsByType = new HashMap<>();
        Map<String, Integer> exceptionsBySeverity = new HashMap<>();

        for (Reconciliation rec : allReconciliations) {
            openExceptions += (int) exceptionRepository.countByReconciliationIdAndStatus(
                    rec.getId(), ExceptionStatus.OPEN);
            resolvedExceptions += (int) exceptionRepository.countByReconciliationIdAndStatus(
                    rec.getId(), ExceptionStatus.RESOLVED);

            exceptionRepository.findByReconciliationId(rec.getId()).forEach(ex -> {
                exceptionsByType.merge(ex.getType().name(), 1, Integer::sum);
                exceptionsBySeverity.merge(ex.getSeverity().name(), 1, Integer::sum);
            });
        }

        int totalFilesUploaded = fileRepository.findByOrganizationId(org.getId()).size();
        int totalRuleSets = ruleSetRepository.findByOrganizationId(org.getId()).size();

        List<DashboardMetricsResponse.ReconciliationSummary> recentReconciliations =
                reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(org.getId())
                        .stream()
                        .limit(10)
                        .map(r -> DashboardMetricsResponse.ReconciliationSummary.builder()
                                .id(r.getId())
                                .name(r.getName())
                                .status(r.getStatus().name())
                                .matchRate(r.getMatchRate())
                                .exceptionCount(r.getExceptionCount())
                                .createdAt(r.getCreatedAt() != null ?
                                        r.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null)
                                .build())
                        .collect(Collectors.toList());

        return DashboardMetricsResponse.builder()
                .totalReconciliations(totalReconciliations)
                .completedReconciliations(completedReconciliations)
                .pendingReconciliations(pendingReconciliations)
                .failedReconciliations(failedReconciliations)
                .overallMatchRate(overallMatchRate)
                .totalExceptions(totalExceptions)
                .openExceptions(openExceptions)
                .resolvedExceptions(resolvedExceptions)
                .totalFilesUploaded(totalFilesUploaded)
                .totalRuleSets(totalRuleSets)
                .recentReconciliations(recentReconciliations)
                .exceptionsByType(exceptionsByType)
                .exceptionsBySeverity(exceptionsBySeverity)
                .build();
    }
}
