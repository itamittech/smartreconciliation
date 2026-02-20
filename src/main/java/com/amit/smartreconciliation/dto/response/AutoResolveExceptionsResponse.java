package com.amit.smartreconciliation.dto.response;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class AutoResolveExceptionsResponse {
    private int updatedCount;
    private int skippedCount;
    private List<Long> updatedIds = new ArrayList<>();
    private Map<String, Long> skippedReasonCounts;

    public AutoResolveExceptionsResponse() {}

    public int getUpdatedCount() { return updatedCount; }
    public void setUpdatedCount(int updatedCount) { this.updatedCount = updatedCount; }
    public int getSkippedCount() { return skippedCount; }
    public void setSkippedCount(int skippedCount) { this.skippedCount = skippedCount; }
    public List<Long> getUpdatedIds() { return updatedIds; }
    public void setUpdatedIds(List<Long> updatedIds) { this.updatedIds = updatedIds; }
    public Map<String, Long> getSkippedReasonCounts() { return skippedReasonCounts; }
    public void setSkippedReasonCounts(Map<String, Long> skippedReasonCounts) { this.skippedReasonCounts = skippedReasonCounts; }
}
