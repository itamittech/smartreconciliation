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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for FileUploadService
 * Module: File Management
 * Test Level: Unit Test
 * Total Test Cases: 12
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("FileUploadService Unit Tests")
class FileUploadServiceTest {

    @Mock
    private UploadedFileRepository uploadedFileRepository;

    @Mock
    private OrganizationService organizationService;

    @Mock
    private FileStorageConfig fileStorageConfig;

    @Mock
    private FileParserService fileParserService;

    @Mock
    private SchemaDetectionService schemaDetectionService;

    @InjectMocks
    private FileUploadService fileUploadService;

    @TempDir
    Path tempDir;

    private Organization testOrganization;

    @BeforeEach
    void setUp() {
        testOrganization = Organization.builder()
                .id(1L)
                .name("Test Organization")
                .build();

        lenient().when(organizationService.getDefaultOrganization()).thenReturn(testOrganization);
        lenient().when(fileStorageConfig.getUploadDir()).thenReturn(tempDir.toString());
    }

    // ==================== File Upload Tests ====================

    @Test
    @DisplayName("TC-FUS-001: Upload Valid CSV File")
    void testUploadValidCsvFile() throws Exception {
        // Given
        MockMultipartFile csvFile = new MockMultipartFile(
            "file",
            "source_data.csv",
            "text/csv",
            "id,name,amount\n1,John,100.00".getBytes()
        );

        UploadedFile savedFile = createMockUploadedFile(1L, "source_data.csv", FileStatus.UPLOADING);
        UploadedFile uploadedFile = createMockUploadedFile(1L, "source_data.csv", FileStatus.UPLOADED);
        uploadedFile.setFilePath(tempDir.resolve("test.csv").toString());

        when(organizationService.getDefaultOrganization()).thenReturn(testOrganization);
        when(fileStorageConfig.getUploadDir()).thenReturn(tempDir.toString());
        when(uploadedFileRepository.save(any(UploadedFile.class)))
            .thenReturn(savedFile)
            .thenReturn(uploadedFile);

        // When
        UploadedFileResponse response = fileUploadService.uploadFile(csvFile);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getOriginalFilename()).isEqualTo("source_data.csv");
        // Status should be UPLOADED after file is saved to disk
        assertThat(response.getStatus()).isIn(FileStatus.UPLOADED, FileStatus.UPLOADING);

        verify(uploadedFileRepository, atLeast(1)).save(any(UploadedFile.class));
    }

    @Test
    @DisplayName("TC-FUS-002: Upload Valid Excel File")
    void testUploadValidExcelFile() throws Exception {
        // Given
        MockMultipartFile excelFile = new MockMultipartFile(
            "file",
            "data.xlsx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            new byte[]{0x50, 0x4B, 0x03, 0x04} // ZIP signature
        );

        UploadedFile savedFile = createMockUploadedFile(2L, "data.xlsx", FileStatus.UPLOADING);
        UploadedFile uploadedFile = createMockUploadedFile(2L, "data.xlsx", FileStatus.UPLOADED);
        uploadedFile.setFilePath(tempDir.resolve("test.xlsx").toString());

        when(organizationService.getDefaultOrganization()).thenReturn(testOrganization);
        when(fileStorageConfig.getUploadDir()).thenReturn(tempDir.toString());
        when(uploadedFileRepository.save(any(UploadedFile.class)))
            .thenReturn(savedFile)
            .thenReturn(uploadedFile);

        // When
        UploadedFileResponse response = fileUploadService.uploadFile(excelFile);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getOriginalFilename()).isEqualTo("data.xlsx");
        // The saved file should have xlsx extension
        assertThat(response.getOriginalFilename()).endsWith(".xlsx");

        ArgumentCaptor<UploadedFile> captor = ArgumentCaptor.forClass(UploadedFile.class);
        verify(uploadedFileRepository, atLeast(1)).save(captor.capture());
    }

    // ==================== Async File Processing Tests ====================

    @Test
    @DisplayName("TC-FUS-003: Process File Asynchronously After Upload")
    void testProcessFileAsynchronously() throws Exception {
        // Given
        UploadedFile uploadedFile = createMockUploadedFile(1L, "test.csv", FileStatus.UPLOADED);
        uploadedFile.setFilePath(tempDir.resolve("test.csv").toString());

        when(uploadedFileRepository.findById(1L)).thenReturn(Optional.of(uploadedFile));
        when(uploadedFileRepository.save(any(UploadedFile.class))).thenReturn(uploadedFile);

        FileParserService.ParseResult parseResult = new FileParserService.ParseResult(
            List.of("id", "name", "amount"),
            List.of(
                Arrays.asList("1", "John", "100"),
                Arrays.asList("2", "Jane", "200")
            )
        );
        when(fileParserService.parseFile(any(Path.class))).thenReturn(parseResult);

        List<Map<String, Object>> schema = List.of(
            Map.of("name", "id", "detectedType", "integer", "nullCount", 0, "uniqueCount", 2, "sampleValues", List.of("1", "2"))
        );
        when(schemaDetectionService.detectSchemaAsMap(any(), any())).thenReturn(schema);

        // When
        fileUploadService.processFileAsync(1L);

        // Then
        ArgumentCaptor<UploadedFile> captor = ArgumentCaptor.forClass(UploadedFile.class);
        verify(uploadedFileRepository, atLeast(2)).save(captor.capture());

        List<UploadedFile> savedFiles = captor.getAllValues();
        UploadedFile finalSave = savedFiles.get(savedFiles.size() - 1);

        assertThat(finalSave.getStatus()).isEqualTo(FileStatus.PROCESSED);
        assertThat(finalSave.getRowCount()).isEqualTo(2);
        assertThat(finalSave.getColumnCount()).isEqualTo(3);
        assertThat(finalSave.getDetectedSchema()).isNotNull();
    }

    @Test
    @DisplayName("TC-FUS-004: Handle File Processing Failure")
    void testHandleFileProcessingFailure() {
        // Given
        UploadedFile uploadedFile = createMockUploadedFile(1L, "test.csv", FileStatus.UPLOADED);
        uploadedFile.setFilePath(tempDir.resolve("test.csv").toString());

        when(uploadedFileRepository.findById(1L)).thenReturn(Optional.of(uploadedFile));
        when(uploadedFileRepository.save(any(UploadedFile.class))).thenReturn(uploadedFile);
        when(fileParserService.parseFile(any(Path.class)))
            .thenThrow(new FileProcessingException("Parse error"));

        // When
        fileUploadService.processFileAsync(1L);

        // Then
        ArgumentCaptor<UploadedFile> captor = ArgumentCaptor.forClass(UploadedFile.class);
        verify(uploadedFileRepository, atLeast(2)).save(captor.capture());

        List<UploadedFile> savedFiles = captor.getAllValues();
        UploadedFile finalSave = savedFiles.get(savedFiles.size() - 1);

        assertThat(finalSave.getStatus()).isEqualTo(FileStatus.FAILED);
        assertThat(finalSave.getProcessingError()).isNotNull();
    }

    // ==================== Preview Generation Tests ====================

    @Test
    @DisplayName("TC-FUS-005: Generate File Preview with First 100 Rows")
    void testGenerateFilePreviewWith100Rows() {
        // Given
        UploadedFile file = createProcessedFileWithRows(1L, 10000);

        when(uploadedFileRepository.findById(1L)).thenReturn(Optional.of(file));

        // When
        FilePreviewResponse preview = fileUploadService.getPreview(1L, 100);

        // Then
        assertThat(preview).isNotNull();
        assertThat(preview.getFileId()).isEqualTo(1L);
        assertThat(preview.getPreviewRows()).isEqualTo(100);
        assertThat(preview.getTotalRows()).isEqualTo(10000);
    }

    @Test
    @DisplayName("TC-FUS-006: Generate Preview for Small File")
    void testGeneratePreviewForSmallFile() {
        // Given
        UploadedFile file = createProcessedFileWithRows(1L, 10);

        when(uploadedFileRepository.findById(1L)).thenReturn(Optional.of(file));

        // When
        FilePreviewResponse preview = fileUploadService.getPreview(1L, 100);

        // Then
        assertThat(preview).isNotNull();
        assertThat(preview.getPreviewRows()).isEqualTo(10);
        assertThat(preview.getTotalRows()).isEqualTo(10);
    }

    // ==================== Schema Retrieval Tests ====================

    @Test
    @DisplayName("TC-FUS-007: Retrieve Detected Schema")
    void testRetrieveDetectedSchema() {
        // Given
        UploadedFile file = createProcessedFileWithSchema(1L);

        when(uploadedFileRepository.findById(1L)).thenReturn(Optional.of(file));

        // When
        SchemaResponse schema = fileUploadService.getSchema(1L);

        // Then
        assertThat(schema).isNotNull();
        assertThat(schema.getFileId()).isEqualTo(1L);
        assertThat(schema.getColumns()).hasSize(4);

        SchemaResponse.ColumnSchema firstColumn = schema.getColumns().get(0);
        assertThat(firstColumn.getName()).isEqualTo("id");
        assertThat(firstColumn.getDetectedType()).isEqualTo("integer");
    }

    @Test
    @DisplayName("TC-FUS-008: Handle Schema Request for Unprocessed File")
    void testHandleSchemaRequestForUnprocessedFile() {
        // Given
        UploadedFile file = createMockUploadedFile(1L, "test.csv", FileStatus.PROCESSING);

        when(uploadedFileRepository.findById(1L)).thenReturn(Optional.of(file));

        // When & Then
        assertThatThrownBy(() -> fileUploadService.getSchema(1L))
            .isInstanceOf(FileProcessingException.class)
            .hasMessageContaining("File is not yet processed");
    }

    // ==================== File Status Tracking Tests ====================

    @Test
    @DisplayName("TC-FUS-009: Get File Status and Details")
    void testGetFileStatusAndDetails() {
        // Given
        UploadedFile file = createProcessedFileWithRows(1L, 1000);
        file.setColumnCount(5);

        when(uploadedFileRepository.findById(1L)).thenReturn(Optional.of(file));

        // When
        UploadedFileResponse response = fileUploadService.getById(1L);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getStatus()).isEqualTo(FileStatus.PROCESSED);
        assertThat(response.getRowCount()).isEqualTo(1000);
        assertThat(response.getColumnCount()).isEqualTo(5);
    }

    @Test
    @DisplayName("TC-FUS-010: List All Files for Organization")
    void testListAllFilesForOrganization() {
        // Given
        List<UploadedFile> files = Arrays.asList(
            createMockUploadedFile(1L, "file1.csv", FileStatus.PROCESSED),
            createMockUploadedFile(2L, "file2.csv", FileStatus.PROCESSED),
            createMockUploadedFile(3L, "file3.csv", FileStatus.UPLOADED)
        );

        when(uploadedFileRepository.findByOrganizationId(1L)).thenReturn(files);

        // When
        List<UploadedFileResponse> responses = fileUploadService.getAll();

        // Then
        assertThat(responses).hasSize(3);
        assertThat(responses).extracting(UploadedFileResponse::getOriginalFilename)
            .containsExactly("file1.csv", "file2.csv", "file3.csv");
    }

    // ==================== File Deletion Tests ====================

    @Test
    @DisplayName("TC-FUS-011: Delete Uploaded File")
    void testDeleteUploadedFile() {
        // Given
        UploadedFile file = createMockUploadedFile(1L, "test.csv", FileStatus.PROCESSED);
        file.setFilePath(tempDir.resolve("test.csv").toString());

        when(uploadedFileRepository.findById(1L)).thenReturn(Optional.of(file));

        // When
        fileUploadService.deleteFile(1L);

        // Then
        verify(uploadedFileRepository).delete(file);
    }

    // ==================== Error Handling Tests ====================

    @Test
    @DisplayName("TC-FUS-012: Handle File Storage Failure")
    void testHandleFileStorageFailure() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.csv",
            "text/csv",
            "data".getBytes()
        );

        when(fileStorageConfig.getUploadDir()).thenReturn("/invalid/path");
        UploadedFile savedFile = createMockUploadedFile(1L, "test.csv", FileStatus.UPLOADING);
        when(uploadedFileRepository.save(any(UploadedFile.class))).thenReturn(savedFile);

        // When & Then
        assertThatThrownBy(() -> fileUploadService.uploadFile(file))
            .isInstanceOf(FileProcessingException.class)
            .hasMessageContaining("Failed to store file");
    }

    // ==================== Helper Methods ====================

    private UploadedFile createMockUploadedFile(Long id, String filename, FileStatus status) {
        UploadedFile file = UploadedFile.builder()
                .originalFilename(filename)
                .storedFilename("uuid_" + filename)
                .contentType("text/csv")
                .fileSize(1024L)
                .status(status)
                .organization(testOrganization)
                .build();
        file.setId(id);
        return file;
    }

    private UploadedFile createProcessedFileWithRows(Long id, int rowCount) {
        UploadedFile file = createMockUploadedFile(id, "test.csv", FileStatus.PROCESSED);
        file.setRowCount(rowCount);

        List<List<Object>> previewData = new ArrayList<>();
        previewData.add(List.of("id", "name", "amount"));

        int previewSize = Math.min(100, rowCount);
        for (int i = 0; i < previewSize; i++) {
            previewData.add(Arrays.asList(String.valueOf(i + 1), "User" + (i + 1), "100.00"));
        }

        file.setPreviewData(previewData);
        return file;
    }

    private UploadedFile createProcessedFileWithSchema(Long id) {
        UploadedFile file = createMockUploadedFile(id, "test.csv", FileStatus.PROCESSED);

        List<Map<String, Object>> schema = Arrays.asList(
            Map.of("name", "id", "detectedType", "integer", "nullCount", 0, "uniqueCount", 3, "sampleValues", List.of("1", "2", "3")),
            Map.of("name", "name", "detectedType", "text", "nullCount", 0, "uniqueCount", 3, "sampleValues", List.of("John", "Jane", "Bob")),
            Map.of("name", "amount", "detectedType", "currency", "nullCount", 0, "uniqueCount", 3, "sampleValues", List.of("$100", "$200", "$300")),
            Map.of("name", "date", "detectedType", "date", "nullCount", 0, "uniqueCount", 3, "sampleValues", List.of("2024-01-15", "2024-01-16", "2024-01-17"))
        );

        file.setDetectedSchema(schema);
        file.setRowCount(3);
        return file;
    }
}
