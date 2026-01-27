package com.amit.smartreconciliation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReconciliationRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Source file ID is required")
    private Long sourceFileId;

    @NotNull(message = "Target file ID is required")
    private Long targetFileId;

    @NotNull(message = "Rule set ID is required")
    private Long ruleSetId;
}
