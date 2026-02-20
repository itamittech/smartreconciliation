package com.amit.smartreconciliation.dto.request;

import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

public class AutoResolveExceptionsRequest {
    private Long reconciliationId;
    private ExceptionType type;
    private ExceptionSeverity severity;
    private ExceptionStatus status;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fromDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate toDate;
    private String resolutionTemplate;
    private String resolvedBy;

    public AutoResolveExceptionsRequest() {}

    public Long getReconciliationId() { return reconciliationId; }
    public void setReconciliationId(Long reconciliationId) { this.reconciliationId = reconciliationId; }
    public ExceptionType getType() { return type; }
    public void setType(ExceptionType type) { this.type = type; }
    public ExceptionSeverity getSeverity() { return severity; }
    public void setSeverity(ExceptionSeverity severity) { this.severity = severity; }
    public ExceptionStatus getStatus() { return status; }
    public void setStatus(ExceptionStatus status) { this.status = status; }
    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }
    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }
    public String getResolutionTemplate() { return resolutionTemplate; }
    public void setResolutionTemplate(String resolutionTemplate) { this.resolutionTemplate = resolutionTemplate; }
    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }
}
