package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.UploadedFile;
import com.amit.smartreconciliation.enums.FileStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
    private boolean missing;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UploadedFileResponse() {}

    public static UploadedFileResponse fromEntity(UploadedFile entity) {
        return fromEntity(entity, false);
    }

    public static UploadedFileResponse fromEntity(UploadedFile entity, boolean missing) {
        UploadedFileResponse r = new UploadedFileResponse();
        r.id = entity.getId();
        r.originalFilename = entity.getOriginalFilename();
        r.contentType = entity.getContentType();
        r.fileSize = entity.getFileSize();
        r.status = entity.getStatus();
        r.detectedSchema = entity.getDetectedSchema();
        r.rowCount = entity.getRowCount();
        r.columnCount = entity.getColumnCount();
        r.processingError = entity.getProcessingError();
        r.missing = missing;
        r.createdAt = entity.getCreatedAt();
        r.updatedAt = entity.getUpdatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getOriginalFilename() { return originalFilename; }
    public String getContentType() { return contentType; }
    public Long getFileSize() { return fileSize; }
    public FileStatus getStatus() { return status; }
    public List<Map<String, Object>> getDetectedSchema() { return detectedSchema; }
    public Integer getRowCount() { return rowCount; }
    public Integer getColumnCount() { return columnCount; }
    public String getProcessingError() { return processingError; }
    public boolean isMissing() { return missing; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
