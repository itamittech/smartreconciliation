package com.amit.smartreconciliation.dto.response;

import java.util.List;
import java.util.Map;

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

    public DashboardMetricsResponse() {}

    public Integer getTotalReconciliations() { return totalReconciliations; }
    public void setTotalReconciliations(Integer totalReconciliations) { this.totalReconciliations = totalReconciliations; }
    public Integer getCompletedReconciliations() { return completedReconciliations; }
    public void setCompletedReconciliations(Integer completedReconciliations) { this.completedReconciliations = completedReconciliations; }
    public Integer getPendingReconciliations() { return pendingReconciliations; }
    public void setPendingReconciliations(Integer pendingReconciliations) { this.pendingReconciliations = pendingReconciliations; }
    public Integer getFailedReconciliations() { return failedReconciliations; }
    public void setFailedReconciliations(Integer failedReconciliations) { this.failedReconciliations = failedReconciliations; }
    public Double getOverallMatchRate() { return overallMatchRate; }
    public void setOverallMatchRate(Double overallMatchRate) { this.overallMatchRate = overallMatchRate; }
    public Integer getTotalExceptions() { return totalExceptions; }
    public void setTotalExceptions(Integer totalExceptions) { this.totalExceptions = totalExceptions; }
    public Integer getOpenExceptions() { return openExceptions; }
    public void setOpenExceptions(Integer openExceptions) { this.openExceptions = openExceptions; }
    public Integer getResolvedExceptions() { return resolvedExceptions; }
    public void setResolvedExceptions(Integer resolvedExceptions) { this.resolvedExceptions = resolvedExceptions; }
    public Integer getTotalFilesUploaded() { return totalFilesUploaded; }
    public void setTotalFilesUploaded(Integer totalFilesUploaded) { this.totalFilesUploaded = totalFilesUploaded; }
    public Integer getTotalRuleSets() { return totalRuleSets; }
    public void setTotalRuleSets(Integer totalRuleSets) { this.totalRuleSets = totalRuleSets; }
    public List<ReconciliationSummary> getRecentReconciliations() { return recentReconciliations; }
    public void setRecentReconciliations(List<ReconciliationSummary> recentReconciliations) { this.recentReconciliations = recentReconciliations; }
    public Map<String, Integer> getExceptionsByType() { return exceptionsByType; }
    public void setExceptionsByType(Map<String, Integer> exceptionsByType) { this.exceptionsByType = exceptionsByType; }
    public Map<String, Integer> getExceptionsBySeverity() { return exceptionsBySeverity; }
    public void setExceptionsBySeverity(Map<String, Integer> exceptionsBySeverity) { this.exceptionsBySeverity = exceptionsBySeverity; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final DashboardMetricsResponse r = new DashboardMetricsResponse();
        public Builder totalReconciliations(Integer v) { r.totalReconciliations = v; return this; }
        public Builder completedReconciliations(Integer v) { r.completedReconciliations = v; return this; }
        public Builder pendingReconciliations(Integer v) { r.pendingReconciliations = v; return this; }
        public Builder failedReconciliations(Integer v) { r.failedReconciliations = v; return this; }
        public Builder overallMatchRate(Double v) { r.overallMatchRate = v; return this; }
        public Builder totalExceptions(Integer v) { r.totalExceptions = v; return this; }
        public Builder openExceptions(Integer v) { r.openExceptions = v; return this; }
        public Builder resolvedExceptions(Integer v) { r.resolvedExceptions = v; return this; }
        public Builder totalFilesUploaded(Integer v) { r.totalFilesUploaded = v; return this; }
        public Builder totalRuleSets(Integer v) { r.totalRuleSets = v; return this; }
        public Builder recentReconciliations(List<ReconciliationSummary> v) { r.recentReconciliations = v; return this; }
        public Builder exceptionsByType(Map<String, Integer> v) { r.exceptionsByType = v; return this; }
        public Builder exceptionsBySeverity(Map<String, Integer> v) { r.exceptionsBySeverity = v; return this; }
        public DashboardMetricsResponse build() { return r; }
    }

    public static class ReconciliationSummary {
        private Long id;
        private String name;
        private String status;
        private Double matchRate;
        private Integer exceptionCount;
        private String createdAt;

        public ReconciliationSummary() {}

        public ReconciliationSummary(Long id, String name, String status, Double matchRate,
                                    Integer exceptionCount, String createdAt) {
            this.id = id;
            this.name = name;
            this.status = status;
            this.matchRate = matchRate;
            this.exceptionCount = exceptionCount;
            this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Double getMatchRate() { return matchRate; }
        public void setMatchRate(Double matchRate) { this.matchRate = matchRate; }
        public Integer getExceptionCount() { return exceptionCount; }
        public void setExceptionCount(Integer exceptionCount) { this.exceptionCount = exceptionCount; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private final ReconciliationSummary r = new ReconciliationSummary();
            public Builder id(Long v) { r.id = v; return this; }
            public Builder name(String v) { r.name = v; return this; }
            public Builder status(String v) { r.status = v; return this; }
            public Builder matchRate(Double v) { r.matchRate = v; return this; }
            public Builder exceptionCount(Integer v) { r.exceptionCount = v; return this; }
            public Builder createdAt(String v) { r.createdAt = v; return this; }
            public ReconciliationSummary build() { return r; }
        }
    }
}
