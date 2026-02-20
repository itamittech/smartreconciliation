package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.enums.KnowledgeDomain;

import java.time.LocalDateTime;

public class ExceptionRunSummaryResponse {
    private Long reconciliationId;
    private String reconciliationName;
    private KnowledgeDomain domain;
    private LocalDateTime createdAt;
    private Long openCount;
    private Long inReviewCount;
    private Long criticalOpenCount;
    private Long aiActionableCount;
    private Long totalInScope;

    public ExceptionRunSummaryResponse() {}

    public Long getReconciliationId() { return reconciliationId; }
    public void setReconciliationId(Long reconciliationId) { this.reconciliationId = reconciliationId; }
    public String getReconciliationName() { return reconciliationName; }
    public void setReconciliationName(String reconciliationName) { this.reconciliationName = reconciliationName; }
    public KnowledgeDomain getDomain() { return domain; }
    public void setDomain(KnowledgeDomain domain) { this.domain = domain; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Long getOpenCount() { return openCount; }
    public void setOpenCount(Long openCount) { this.openCount = openCount; }
    public Long getInReviewCount() { return inReviewCount; }
    public void setInReviewCount(Long inReviewCount) { this.inReviewCount = inReviewCount; }
    public Long getCriticalOpenCount() { return criticalOpenCount; }
    public void setCriticalOpenCount(Long criticalOpenCount) { this.criticalOpenCount = criticalOpenCount; }
    public Long getAiActionableCount() { return aiActionableCount; }
    public void setAiActionableCount(Long aiActionableCount) { this.aiActionableCount = aiActionableCount; }
    public Long getTotalInScope() { return totalInScope; }
    public void setTotalInScope(Long totalInScope) { this.totalInScope = totalInScope; }
}
