package com.amit.smartreconciliation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiMappingSuggestionRequest {
    @NotNull(message = "Source file ID is required")
    private Long sourceFileId;

    @NotNull(message = "Target file ID is required")
    private Long targetFileId;
}
