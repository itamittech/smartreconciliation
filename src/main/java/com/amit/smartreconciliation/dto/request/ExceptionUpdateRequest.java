package com.amit.smartreconciliation.dto.request;

import com.amit.smartreconciliation.enums.ExceptionStatus;

public class ExceptionUpdateRequest {
    private ExceptionStatus status;
    private String resolution;
    private String resolvedBy;

    public ExceptionUpdateRequest() {}

    public ExceptionStatus getStatus() { return status; }
    public void setStatus(ExceptionStatus status) { this.status = status; }
    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }
    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }
}
