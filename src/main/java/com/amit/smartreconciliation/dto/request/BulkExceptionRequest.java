package com.amit.smartreconciliation.dto.request;

import com.amit.smartreconciliation.enums.ExceptionStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class BulkExceptionRequest {
    @NotEmpty(message = "Exception IDs are required")
    private List<Long> exceptionIds;
    @NotNull(message = "Status is required")
    private ExceptionStatus status;
    private String resolution;
    private String resolvedBy;

    public BulkExceptionRequest() {}

    public List<Long> getExceptionIds() { return exceptionIds; }
    public void setExceptionIds(List<Long> exceptionIds) { this.exceptionIds = exceptionIds; }
    public ExceptionStatus getStatus() { return status; }
    public void setStatus(ExceptionStatus status) { this.status = status; }
    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }
    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }
}
