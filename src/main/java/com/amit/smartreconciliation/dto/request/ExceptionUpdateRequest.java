package com.amit.smartreconciliation.dto.request;

import com.amit.smartreconciliation.enums.ExceptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExceptionUpdateRequest {
    private ExceptionStatus status;
    private String resolution;
    private String resolvedBy;
}
