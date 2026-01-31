package com.amit.smartreconciliation.dto.response.tool;

import com.amit.smartreconciliation.entity.UploadedFile;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * File summary for list operations.
 */
public record FileSummaryResponse(
    @JsonProperty("id")
    Long id,

    @JsonProperty("original_filename")
    String originalFilename,

    @JsonProperty("file_size")
    Long fileSize,

    @JsonProperty("row_count")
    Integer rowCount,

    @JsonProperty("column_count")
    Integer columnCount,

    @JsonProperty("status")
    String status,

    @JsonProperty("created_at")
    String createdAt
) {
    public static FileSummaryResponse fromEntity(UploadedFile file) {
        return new FileSummaryResponse(
            file.getId(),
            file.getOriginalFilename(),
            file.getFileSize(),
            file.getRowCount(),
            file.getColumnCount(),
            file.getStatus().name(),
            file.getCreatedAt() != null ? file.getCreatedAt().toString() : null
        );
    }
}
