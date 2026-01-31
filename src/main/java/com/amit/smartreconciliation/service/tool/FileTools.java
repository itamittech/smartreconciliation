package com.amit.smartreconciliation.service.tool;

import com.amit.smartreconciliation.dto.response.SchemaResponse;
import com.amit.smartreconciliation.dto.response.tool.FileSummaryResponse;
import com.amit.smartreconciliation.entity.UploadedFile;
import com.amit.smartreconciliation.enums.FileStatus;
import com.amit.smartreconciliation.repository.UploadedFileRepository;
import com.amit.smartreconciliation.service.FileUploadService;
import com.amit.smartreconciliation.service.OrganizationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 🛠️ FILE TOOLS (Agentic AI)
 *
 * Provides AI chat with the ability to query uploaded files and their schemas.
 */
@Component
public class FileTools {

    private static final Logger log = LoggerFactory.getLogger(FileTools.class);

    private final UploadedFileRepository fileRepository;
    private final FileUploadService fileUploadService;
    private final OrganizationService organizationService;

    public FileTools(UploadedFileRepository fileRepository,
                    FileUploadService fileUploadService,
                    OrganizationService organizationService) {
        this.fileRepository = fileRepository;
        this.fileUploadService = fileUploadService;
        this.organizationService = organizationService;
    }

    @Tool(description = "Lists uploaded files with optional filters for status and filename search. Use this when the user asks about uploaded files, available data, or specific file names.")
    public List<FileSummaryResponse> listFiles(
            @ToolParam(description = "Filter by file status: UPLOADING, UPLOADED, PROCESSING, PROCESSED, FAILED. Leave null for all statuses.") String status,
            @ToolParam(description = "Search by filename (case-insensitive). Leave null to skip search filter.") String searchTerm,
            @ToolParam(description = "Maximum results (1-100). Defaults to 20 if null.") Integer limit) {

        log.info("🤖 Tool Call: listFiles(status={}, searchTerm={}, limit={})", status, searchTerm, limit);

        Long orgId = organizationService.getDefaultOrganization().getId();
        List<UploadedFile> files = fileRepository.findByOrganizationId(orgId);

        // Apply status filter
        if (status != null && !status.isBlank()) {
            try {
                FileStatus statusEnum = FileStatus.valueOf(status.toUpperCase());
                files = files.stream()
                        .filter(f -> f.getStatus() == statusEnum)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid file status filter: {}", status);
            }
        }

        // Apply search filter
        if (searchTerm != null && !searchTerm.isBlank()) {
            String searchLower = searchTerm.toLowerCase();
            files = files.stream()
                    .filter(f -> f.getOriginalFilename().toLowerCase().contains(searchLower))
                    .collect(Collectors.toList());
        }

        // Apply limit
        int maxResults = (limit != null && limit > 0 && limit <= 100) ? limit : 20;
        return files.stream()
                .limit(maxResults)
                .map(FileSummaryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Tool(description = "Retrieves the detected schema of a file including column names, data types, and sample values. Use this when the user asks about file structure, columns, or data types.")
    public SchemaResponse getFileSchema(
            @ToolParam(description = "The file ID to get schema for") Long fileId) {

        log.info("🤖 Tool Call: getFileSchema(id={})", fileId);

        if (fileId == null) {
            throw new IllegalArgumentException("File ID is required");
        }

        return fileUploadService.getSchema(fileId);
    }
}
