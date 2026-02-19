package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.config.FileStorageConfig;
import com.amit.smartreconciliation.dto.response.FilePreviewResponse;
import com.amit.smartreconciliation.dto.response.SchemaResponse;
import com.amit.smartreconciliation.dto.response.UploadedFileResponse;
import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.entity.UploadedFile;
import com.amit.smartreconciliation.enums.FileStatus;
import com.amit.smartreconciliation.exception.FileProcessingException;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.UploadedFileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileUploadService {

    private static final Logger log = LoggerFactory.getLogger(FileUploadService.class);

    private final UploadedFileRepository uploadedFileRepository;
    private final OrganizationService organizationService;
    private final FileStorageConfig fileStorageConfig;
    private final FileParserService fileParserService;
    private final SchemaDetectionService schemaDetectionService;

    public FileUploadService(UploadedFileRepository uploadedFileRepository,
                            OrganizationService organizationService,
                            FileStorageConfig fileStorageConfig,
                            FileParserService fileParserService,
                            SchemaDetectionService schemaDetectionService) {
        this.uploadedFileRepository = uploadedFileRepository;
        this.organizationService = organizationService;
        this.fileStorageConfig = fileStorageConfig;
        this.fileParserService = fileParserService;
        this.schemaDetectionService = schemaDetectionService;
    }

    @Transactional
    public UploadedFileResponse uploadFile(MultipartFile file) {
        Organization org = organizationService.getDefaultOrganization();
        String originalFilename = file.getOriginalFilename();
        String storedFilename = UUID.randomUUID() + "_" + originalFilename;

        UploadedFile uploadedFile = UploadedFile.builder()
                .originalFilename(originalFilename)
                .storedFilename(storedFilename)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .status(FileStatus.UPLOADING)
                .organization(org)
                .build();

        UploadedFile saved = uploadedFileRepository.save(uploadedFile);

        try {
            Path uploadPath = Paths.get(fileStorageConfig.getUploadDir()).toAbsolutePath();
            Path filePath = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            saved.setFilePath(filePath.toString());
            saved.setStatus(FileStatus.UPLOADED);
            saved = uploadedFileRepository.save(saved);

            processFileAsync(saved.getId());

            log.info("File uploaded successfully: {} (id: {})", originalFilename, saved.getId());
            return UploadedFileResponse.fromEntity(saved);
        } catch (IOException e) {
            saved.setStatus(FileStatus.FAILED);
            saved.setProcessingError("Failed to store file: " + e.getMessage());
            uploadedFileRepository.save(saved);
            throw new FileProcessingException("Failed to store file: " + e.getMessage(), e);
        }
    }

    public boolean existsOnDisk(UploadedFile file) {
        if (file == null || file.getFilePath() == null) {
            return false;
        }
        return Files.exists(Paths.get(file.getFilePath()));
    }

    @Async
    @Transactional
    public void processFileAsync(Long fileId) {
        UploadedFile file = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("UploadedFile", fileId));

        try {
            file.setStatus(FileStatus.PROCESSING);
            uploadedFileRepository.save(file);

            Path filePath = Paths.get(file.getFilePath());
            FileParserService.ParseResult parseResult = fileParserService.parseFile(filePath);

            List<Map<String, Object>> schema = schemaDetectionService.detectSchemaAsMap(
                    parseResult.headers(), parseResult.rows());

            int previewSize = Math.min(100, parseResult.rows().size());
            List<List<Object>> previewData = new ArrayList<>();
            previewData.add(new ArrayList<>(parseResult.headers()));
            previewData.addAll(parseResult.rows().subList(0, previewSize));

            file.setDetectedSchema(schema);
            file.setRowCount(parseResult.getRowCount());
            file.setColumnCount(parseResult.getColumnCount());
            file.setPreviewData(previewData);
            file.setStatus(FileStatus.PROCESSED);
            uploadedFileRepository.save(file);

            log.info("File processed successfully: {} (rows: {}, columns: {})",
                    file.getOriginalFilename(), parseResult.getRowCount(), parseResult.getColumnCount());
        } catch (Exception e) {
            log.error("Error processing file {}: {}", fileId, e.getMessage(), e);
            file.setStatus(FileStatus.FAILED);
            file.setProcessingError(e.getMessage());
            uploadedFileRepository.save(file);
        }
    }

    public UploadedFileResponse getById(Long id) {
        UploadedFile file = uploadedFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UploadedFile", id));
        return UploadedFileResponse.fromEntity(file, !existsOnDisk(file));
    }

    public UploadedFile getEntityById(Long id) {
        return uploadedFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UploadedFile", id));
    }

    public List<UploadedFileResponse> getAll() {
        Organization org = organizationService.getDefaultOrganization();
        return uploadedFileRepository.findByOrganizationId(org.getId())
                .stream()
                .map(file -> UploadedFileResponse.fromEntity(file, !existsOnDisk(file)))
                .collect(Collectors.toList());
    }

    public FilePreviewResponse getPreview(Long id, int rows) {
        UploadedFile file = uploadedFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UploadedFile", id));

        if (file.getStatus() != FileStatus.PROCESSED) {
            throw new FileProcessingException("File is not yet processed. Current status: " + file.getStatus());
        }

        List<List<Object>> previewData = file.getPreviewData();
        if (previewData == null || previewData.isEmpty()) {
            throw new FileProcessingException("No preview data available for file");
        }

        List<String> headers = previewData.get(0).stream()
                .map(Object::toString)
                .collect(Collectors.toList());

        int previewSize = Math.min(rows + 1, previewData.size());
        List<List<Object>> dataRows = previewData.subList(1, previewSize);

        return FilePreviewResponse.builder()
                .fileId(id)
                .filename(file.getOriginalFilename())
                .headers(headers)
                .rows(dataRows)
                .totalRows(file.getRowCount())
                .previewRows(dataRows.size())
                .build();
    }

    public SchemaResponse getSchema(Long id) {
        UploadedFile file = uploadedFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UploadedFile", id));

        if (file.getStatus() != FileStatus.PROCESSED) {
            throw new FileProcessingException("File is not yet processed. Current status: " + file.getStatus());
        }

        List<Map<String, Object>> schemaMap = file.getDetectedSchema();
        if (schemaMap == null) {
            throw new FileProcessingException("No schema data available for file");
        }

        List<SchemaResponse.ColumnSchema> columns = schemaMap.stream()
                .map(m -> SchemaResponse.ColumnSchema.builder()
                        .name((String) m.get("name"))
                        .detectedType((String) m.get("detectedType"))
                        .nullCount((Integer) m.get("nullCount"))
                        .uniqueCount((Integer) m.get("uniqueCount"))
                        .sampleValues((List<String>) m.get("sampleValues"))
                        .build())
                .collect(Collectors.toList());

        return SchemaResponse.builder()
                .fileId(id)
                .filename(file.getOriginalFilename())
                .columns(columns)
                .totalRows(file.getRowCount())
                .build();
    }

    @Transactional
    public void deleteFile(Long id) {
        UploadedFile file = uploadedFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UploadedFile", id));

        if (file.getFilePath() != null) {
            try {
                Files.deleteIfExists(Paths.get(file.getFilePath()));
            } catch (IOException e) {
                log.warn("Failed to delete physical file: {}", file.getFilePath());
            }
        }

        uploadedFileRepository.delete(file);
        log.info("Deleted file: {}", id);
    }
}
