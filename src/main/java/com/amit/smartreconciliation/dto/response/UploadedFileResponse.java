package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.UploadedFile;
import com.amit.smartreconciliation.enums.FileStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadedFileResponse {
    private Long id;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private FileStatus status;
    private List<Map<String, Object>> detectedSchema;
    private Integer rowCount;
    private Integer columnCount;
    private String processingError;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UploadedFileResponse fromEntity(UploadedFile entity) {
        return UploadedFileResponse.builder()
                .id(entity.getId())
                .originalFilename(entity.getOriginalFilename())
                .contentType(entity.getContentType())
                .fileSize(entity.getFileSize())
                .status(entity.getStatus())
                .detectedSchema(entity.getDetectedSchema())
                .rowCount(entity.getRowCount())
                .columnCount(entity.getColumnCount())
                .processingError(entity.getProcessingError())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
