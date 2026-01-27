package com.amit.smartreconciliation.dto.request;

import com.amit.smartreconciliation.enums.ExceptionStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkExceptionRequest {
    @NotEmpty(message = "Exception IDs are required")
    private List<Long> exceptionIds;

    @NotNull(message = "Status is required")
    private ExceptionStatus status;

    private String resolution;
    private String resolvedBy;
}
