package com.amit.smartreconciliation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsResponse {
    private Integer totalReconciliations;
    private Integer completedReconciliations;
    private Integer pendingReconciliations;
    private Integer failedReconciliations;
    private Double overallMatchRate;
    private Integer totalExceptions;
    private Integer openExceptions;
    private Integer resolvedExceptions;
    private Integer totalFilesUploaded;
    private Integer totalRuleSets;
    private List<ReconciliationSummary> recentReconciliations;
    private Map<String, Integer> exceptionsByType;
    private Map<String, Integer> exceptionsBySeverity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReconciliationSummary {
        private Long id;
        private String name;
        private String status;
        private Double matchRate;
        private Integer exceptionCount;
        private String createdAt;
    }
}
