package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.response.FilePreviewResponse;
import com.amit.smartreconciliation.dto.response.SchemaResponse;
import com.amit.smartreconciliation.dto.response.UploadedFileResponse;
import com.amit.smartreconciliation.entity.UploadedFile;
import com.amit.smartreconciliation.enums.FileStatus;
import com.amit.smartreconciliation.exception.FileProcessingException;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.service.FileUploadService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for FileController
 * Module: File Management
 * Test Level: Integration Test
 * Total Test Cases: 30+
 *
 * Coverage Areas:
 * - Single and Multiple File Upload
 * - File Details Retrieval
 * - File Preview and Schema Detection
 * - File Listing and Deletion
 * - Edge Cases and Error Scenarios
 * - Content-Type Validation
 * - File Size Limits
 * - ArgumentCaptor Verification
 */
@WebMvcTest(FileController.class)
@DisplayName("FileController Integration Tests")
class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FileUploadService fileUploadService;

    private UploadedFileResponse sampleFileResponse;

    @BeforeEach
    void setUp() {
        UploadedFile file = UploadedFile.builder()
                .originalFilename("test.csv")
                .storedFilename("uuid_test.csv")
                .contentType("text/csv")
                .fileSize(1024L)
                .status(FileStatus.UPLOADED)
                .build();
        file.setId(1L);
        sampleFileResponse = UploadedFileResponse.fromEntity(file);
    }

    // ==================== Single File Upload Tests ====================

    @Nested
    @DisplayName("Single File Upload Endpoint Tests")
    class SingleFileUploadTests {

        @Test
        @DisplayName("TC-FC-001: POST /api/v1/files/upload/single - Upload Single CSV File")
        void testUploadSingleCsvFile() throws Exception {
            // Given
            MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.csv",
                "text/csv",
                "id,name,amount\n1,John,100.00".getBytes()
            );

            when(fileUploadService.uploadFile(any())).thenReturn(sampleFileResponse);

            // When & Then
            mockMvc.perform(multipart("/api/v1/files/upload/single")
                    .file(file))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("File uploaded successfully"))
                    .andExpect(jsonPath("$.data.id").value(1))
                    .andExpect(jsonPath("$.data.originalFilename").value("test.csv"))
                    .andExpect(jsonPath("$.data.contentType").value("text/csv"))
                    .andExpect(jsonPath("$.data.fileSize").value(1024))
                    .andExpect(jsonPath("$.data.status").value("UPLOADED"));

            // Verify with ArgumentCaptor
            ArgumentCaptor<MultipartFile> fileCaptor = ArgumentCaptor.forClass(MultipartFile.class);
            verify(fileUploadService, times(1)).uploadFile(fileCaptor.capture());

            MultipartFile capturedFile = fileCaptor.getValue();
            assertThat(capturedFile.getOriginalFilename()).isEqualTo("test.csv");
            assertThat(capturedFile.getContentType()).isEqualTo("text/csv");
        }

        @ParameterizedTest
        @DisplayName("TC-FC-002: Upload Various File Types Successfully")
        @CsvSource({
            "data.xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "legacy.xls, application/vnd.ms-excel",
            "report.csv, text/csv",
            "export.tsv, text/tab-separated-values"
        })
        void testUploadVariousFileTypes(String filename, String contentType) throws Exception {
            // Given
            MockMultipartFile file = new MockMultipartFile(
                "file",
                filename,
                contentType,
                new byte[]{0x50, 0x4B, 0x03, 0x04}
            );

            UploadedFile uploadedFile = UploadedFile.builder()
                    .originalFilename(filename)
                    .contentType(contentType)
                    .status(FileStatus.UPLOADED)
                    .build();
            uploadedFile.setId(2L);
            UploadedFileResponse response = UploadedFileResponse.fromEntity(uploadedFile);

            when(fileUploadService.uploadFile(any())).thenReturn(response);

            // When & Then
            mockMvc.perform(multipart("/api/v1/files/upload/single")
                    .file(file))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.originalFilename").value(filename))
                    .andExpect(jsonPath("$.data.contentType").value(contentType));

            verify(fileUploadService, times(1)).uploadFile(any());
        }

        @Test
        @DisplayName("TC-FC-003: POST /api/v1/files/upload/single - Reject Invalid File Type")
        void testRejectInvalidFileType() throws Exception {
            // Given
            MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                "PDF content".getBytes()
            );

            when(fileUploadService.uploadFile(any()))
                .thenThrow(new FileProcessingException("Unsupported file type: pdf"));

            // When & Then
            mockMvc.perform(multipart("/api/v1/files/upload/single")
                    .file(pdfFile))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("Unsupported file type: pdf"));

            verify(fileUploadService, times(1)).uploadFile(any());
        }

        @ParameterizedTest
        @DisplayName("TC-FC-004: Reject Invalid Content-Type Headers")
        @ValueSource(strings = {"application/pdf", "image/png", "text/plain", "application/json"})
        void testRejectInvalidContentTypes(String invalidContentType) throws Exception {
            // Given
            MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.csv",
                invalidContentType,
                "id,name\n1,Test".getBytes()
            );

            when(fileUploadService.uploadFile(any()))
                .thenThrow(new FileProcessingException("Invalid content type: " + invalidContentType));

            // When & Then
            mockMvc.perform(multipart("/api/v1/files/upload/single")
                    .file(file))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message", containsString("Invalid content type")));

            verify(fileUploadService, times(1)).uploadFile(any());
        }

        @Test
        @DisplayName("TC-FC-005: Upload File with Special Characters in Filename")
        void testUploadFileWithSpecialCharactersInFilename() throws Exception {
            // Given
            String specialFilename = "Sales Report 2024 (Q1) - Final v2.0.csv";
            MockMultipartFile file = new MockMultipartFile(
                "file",
                specialFilename,
                "text/csv",
                "id,name,amount\n1,John,100.00".getBytes()
            );

            UploadedFile uploadedFile = UploadedFile.builder()
                    .originalFilename(specialFilename)
                    .contentType("text/csv")
                    .status(FileStatus.UPLOADED)
                    .build();
            uploadedFile.setId(3L);
            UploadedFileResponse response = UploadedFileResponse.fromEntity(uploadedFile);

            when(fileUploadService.uploadFile(any())).thenReturn(response);

            // When & Then
            mockMvc.perform(multipart("/api/v1/files/upload/single")
                    .file(file))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.originalFilename").value(specialFilename));

            ArgumentCaptor<MultipartFile> captor = ArgumentCaptor.forClass(MultipartFile.class);
            verify(fileUploadService, times(1)).uploadFile(captor.capture());
            assertThat(captor.getValue().getOriginalFilename()).isEqualTo(specialFilename);
        }

        @Test
        @DisplayName("TC-FC-006: Reject Empty File Upload")
        void testRejectEmptyFile() throws Exception {
            // Given
            MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.csv",
                "text/csv",
                new byte[0]
            );

            when(fileUploadService.uploadFile(any()))
                .thenThrow(new FileProcessingException("File is empty"));

            // When & Then
            mockMvc.perform(multipart("/api/v1/files/upload/single")
                    .file(emptyFile))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("File is empty"));

            verify(fileUploadService, times(1)).uploadFile(any());
        }

        @Test
        @DisplayName("TC-FC-007: Missing File Parameter Returns 400")
        void testMissingFileParameter() throws Exception {
            // When & Then
            mockMvc.perform(multipart("/api/v1/files/upload/single"))
                    .andExpect(status().isBadRequest());

            verify(fileUploadService, never()).uploadFile(any());
        }

        @Test
        @DisplayName("TC-FC-008: File Size Exceeds Maximum Limit")
        void testFileSizeExceedsLimit() throws Exception {
            // Given
            MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "large.csv",
                "text/csv",
                new byte[1024] // Simulated large file
            );

            when(fileUploadService.uploadFile(any()))
                .thenThrow(new MaxUploadSizeExceededException(100 * 1024 * 1024));

            // When & Then
            mockMvc.perform(multipart("/api/v1/files/upload/single")
                    .file(largeFile))
                    .andExpect(status().isPayloadTooLarge())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("File size exceeds maximum limit of 100MB"));

            verify(fileUploadService, times(1)).uploadFile(any());
        }
    }

    // ==================== Multiple Files Upload Tests ====================

    @Nested
    @DisplayName("Multiple Files Upload Endpoint Tests")
    class MultipleFilesUploadTests {

        @Test
        @DisplayName("TC-FC-009: POST /api/v1/files/upload - Upload Multiple Files Successfully")
        void testUploadMultipleFiles() throws Exception {
            // Given
            MockMultipartFile file1 = new MockMultipartFile(
                "files",
                "file1.csv",
                "text/csv",
                "id,name\n1,John".getBytes()
            );

            MockMultipartFile file2 = new MockMultipartFile(
                "files",
                "file2.csv",
                "text/csv",
                "id,amount\n1,100".getBytes()
            );

            MockMultipartFile file3 = new MockMultipartFile(
                "files",
                "file3.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                new byte[]{0x50, 0x4B}
            );

            List<UploadedFileResponse> responses = Arrays.asList(
                createTestFileResponse(1L, "file1.csv", "text/csv", FileStatus.UPLOADED),
                createTestFileResponse(2L, "file2.csv", "text/csv", FileStatus.UPLOADED),
                createTestFileResponse(3L, "file3.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", FileStatus.UPLOADED)
            );

            when(fileUploadService.uploadFile(any()))
                .thenReturn(responses.get(0), responses.get(1), responses.get(2));

            // When & Then
            mockMvc.perform(multipart("/api/v1/files/upload")
                    .file(file1)
                    .file(file2)
                    .file(file3))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Files uploaded successfully"))
                    .andExpect(jsonPath("$.data", hasSize(3)))
                    .andExpect(jsonPath("$.data[0].id").value(1))
                    .andExpect(jsonPath("$.data[0].originalFilename").value("file1.csv"))
                    .andExpect(jsonPath("$.data[1].id").value(2))
                    .andExpect(jsonPath("$.data[1].originalFilename").value("file2.csv"))
                    .andExpect(jsonPath("$.data[2].id").value(3))
                    .andExpect(jsonPath("$.data[2].originalFilename").value("file3.xlsx"));

            // Verify service called 3 times with ArgumentCaptor
            ArgumentCaptor<MultipartFile> captor = ArgumentCaptor.forClass(MultipartFile.class);
            verify(fileUploadService, times(3)).uploadFile(captor.capture());

            List<MultipartFile> capturedFiles = captor.getAllValues();
            assertThat(capturedFiles).hasSize(3);
            assertThat(capturedFiles.get(0).getOriginalFilename()).isEqualTo("file1.csv");
            assertThat(capturedFiles.get(1).getOriginalFilename()).isEqualTo("file2.csv");
            assertThat(capturedFiles.get(2).getOriginalFilename()).isEqualTo("file3.xlsx");
        }

        @Test
        @DisplayName("TC-FC-010: Upload Single File via Multiple Upload Endpoint")
        void testUploadSingleFileViaMultipleEndpoint() throws Exception {
            // Given
            MockMultipartFile file = new MockMultipartFile(
                "files",
                "single.csv",
                "text/csv",
                "id,name\n1,Test".getBytes()
            );

            UploadedFileResponse response = createTestFileResponse(1L, "single.csv", "text/csv", FileStatus.UPLOADED);
            when(fileUploadService.uploadFile(any())).thenReturn(response);

            // When & Then
            mockMvc.perform(multipart("/api/v1/files/upload")
                    .file(file))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].originalFilename").value("single.csv"));

            verify(fileUploadService, times(1)).uploadFile(any());
        }

        @Test
        @DisplayName("TC-FC-011: Partial Failure in Multiple Upload - First File Fails")
        void testPartialFailureFirstFileFails() throws Exception {
            // Given
            MockMultipartFile file1 = new MockMultipartFile(
                "files",
                "invalid.pdf",
                "application/pdf",
                "PDF".getBytes()
            );

            MockMultipartFile file2 = new MockMultipartFile(
                "files",
                "valid.csv",
                "text/csv",
                "id,name\n1,Test".getBytes()
            );

            when(fileUploadService.uploadFile(any()))
                .thenThrow(new FileProcessingException("Unsupported file type: pdf"));

            // When & Then
            mockMvc.perform(multipart("/api/v1/files/upload")
                    .file(file1)
                    .file(file2))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("Unsupported file type: pdf"));

            verify(fileUploadService, times(1)).uploadFile(any());
        }
    }

    // ==================== File Details Endpoint Tests ====================

    @Nested
    @DisplayName("File Details Retrieval Tests")
    class FileDetailsTests {

        @Test
        @DisplayName("TC-FC-012: GET /api/v1/files/{id} - Retrieve File Details")
        void testRetrieveFileDetails() throws Exception {
            // Given
            UploadedFile completedFile = UploadedFile.builder()
                    .originalFilename("test.csv")
                    .storedFilename("uuid_test.csv")
                    .contentType("text/csv")
                    .fileSize(2048L)
                    .status(FileStatus.PROCESSED)
                    .build();
            completedFile.setId(1L);
            completedFile.setRowCount(500);
            completedFile.setColumnCount(4);
            UploadedFileResponse completedFileResponse = UploadedFileResponse.fromEntity(completedFile);

            when(fileUploadService.getById(1L)).thenReturn(completedFileResponse);

            // When & Then
            mockMvc.perform(get("/api/v1/files/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(1))
                    .andExpect(jsonPath("$.data.originalFilename").value("test.csv"))
                    // Note: storedFilename is not exposed in UploadedFileResponse for security reasons
                    .andExpect(jsonPath("$.data.contentType").value("text/csv"))
                    .andExpect(jsonPath("$.data.fileSize").value(2048))
                    .andExpect(jsonPath("$.data.status").value("PROCESSED"))
                    .andExpect(jsonPath("$.data.rowCount").value(500))
                    .andExpect(jsonPath("$.data.columnCount").value(4));

            ArgumentCaptor<Long> idCaptor = ArgumentCaptor.forClass(Long.class);
            verify(fileUploadService, times(1)).getById(idCaptor.capture());
            assertThat(idCaptor.getValue()).isEqualTo(1L);
        }

        @Test
        @DisplayName("TC-FC-013: GET /api/v1/files/{id} - File Not Found")
        void testFileNotFound() throws Exception {
            // Given
            when(fileUploadService.getById(999L))
                .thenThrow(new ResourceNotFoundException("UploadedFile", 999L));

            // When & Then
            mockMvc.perform(get("/api/v1/files/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("UploadedFile not found with id: 999"));

            verify(fileUploadService, times(1)).getById(999L);
        }

        @Test
        @DisplayName("TC-FC-014: GET /api/v1/files/{id} - Invalid ID Format Returns 400")
        void testInvalidIdFormat() throws Exception {
            // When & Then
            mockMvc.perform(get("/api/v1/files/invalid"))
                    .andExpect(status().isBadRequest());

            verify(fileUploadService, never()).getById(anyLong());
        }
    }

    // ==================== Preview and Schema Endpoint Tests ====================

    @Nested
    @DisplayName("File Preview and Schema Detection Tests")
    class PreviewAndSchemaTests {

        @Test
        @DisplayName("TC-FC-015: GET /api/v1/files/{id}/preview - Get File Preview with Default Rows")
        void testGetFilePreviewWithDefaultRows() throws Exception {
            // Given
            FilePreviewResponse previewResponse = FilePreviewResponse.builder()
                    .fileId(1L)
                    .filename("test.csv")
                    .headers(List.of("id", "name", "amount"))
                    .rows(createSampleRows(100))
                    .totalRows(10000)
                    .previewRows(100)
                    .build();

            when(fileUploadService.getPreview(1L, 100)).thenReturn(previewResponse);

            // When & Then
            mockMvc.perform(get("/api/v1/files/1/preview"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.fileId").value(1))
                    .andExpect(jsonPath("$.data.filename").value("test.csv"))
                    .andExpect(jsonPath("$.data.previewRows").value(100))
                    .andExpect(jsonPath("$.data.totalRows").value(10000))
                    .andExpect(jsonPath("$.data.headers").isArray())
                    .andExpect(jsonPath("$.data.headers", hasSize(3)))
                    .andExpect(jsonPath("$.data.rows", hasSize(100)));

            ArgumentCaptor<Long> idCaptor = ArgumentCaptor.forClass(Long.class);
            ArgumentCaptor<Integer> rowsCaptor = ArgumentCaptor.forClass(Integer.class);
            verify(fileUploadService, times(1)).getPreview(idCaptor.capture(), rowsCaptor.capture());

            assertThat(idCaptor.getValue()).isEqualTo(1L);
            assertThat(rowsCaptor.getValue()).isEqualTo(100);
        }

        @Test
        @DisplayName("TC-FC-016: GET /api/v1/files/{id}/preview - Get Preview with Custom Row Count")
        void testGetFilePreviewWithCustomRows() throws Exception {
            // Given
            FilePreviewResponse previewResponse = FilePreviewResponse.builder()
                    .fileId(1L)
                    .filename("test.csv")
                    .headers(List.of("id", "name", "amount"))
                    .rows(createSampleRows(50))
                    .totalRows(10000)
                    .previewRows(50)
                    .build();

            when(fileUploadService.getPreview(1L, 50)).thenReturn(previewResponse);

            // When & Then
            mockMvc.perform(get("/api/v1/files/1/preview")
                    .param("rows", "50"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.previewRows").value(50))
                    .andExpect(jsonPath("$.data.rows", hasSize(50)));

            verify(fileUploadService, times(1)).getPreview(1L, 50);
        }

        @ParameterizedTest
        @DisplayName("TC-FC-017: Preview with Various Row Counts")
        @ValueSource(ints = {1, 10, 50, 100, 200, 500, 1000})
        void testPreviewWithVariousRowCounts(int rowCount) throws Exception {
            // Given
            FilePreviewResponse previewResponse = FilePreviewResponse.builder()
                    .fileId(1L)
                    .filename("test.csv")
                    .headers(List.of("id", "name"))
                    .rows(createSampleRows(rowCount))
                    .totalRows(10000)
                    .previewRows(rowCount)
                    .build();

            when(fileUploadService.getPreview(1L, rowCount)).thenReturn(previewResponse);

            // When & Then
            mockMvc.perform(get("/api/v1/files/1/preview")
                    .param("rows", String.valueOf(rowCount)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.previewRows").value(rowCount));

            verify(fileUploadService).getPreview(1L, rowCount);
        }

        @Test
        @DisplayName("TC-FC-018: Preview with Excessive Row Count")
        void testPreviewWithExcessiveRowCount() throws Exception {
            // Given - Service should handle excessive row count
            FilePreviewResponse previewResponse = FilePreviewResponse.builder()
                    .fileId(1L)
                    .filename("test.csv")
                    .headers(List.of("id", "name"))
                    .rows(createSampleRows(1000))
                    .totalRows(500)
                    .previewRows(500) // Service caps at actual total
                    .build();

            when(fileUploadService.getPreview(1L, 10000)).thenReturn(previewResponse);

            // When & Then
            mockMvc.perform(get("/api/v1/files/1/preview")
                    .param("rows", "10000"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.previewRows").value(500))
                    .andExpect(jsonPath("$.data.totalRows").value(500));

            verify(fileUploadService, times(1)).getPreview(1L, 10000);
        }

        @Test
        @DisplayName("TC-FC-019: Preview with Negative Row Count")
        void testPreviewWithNegativeRowCount() throws Exception {
            // Given
            when(fileUploadService.getPreview(1L, -10))
                .thenThrow(new FileProcessingException("Row count must be positive"));

            // When & Then
            mockMvc.perform(get("/api/v1/files/1/preview")
                    .param("rows", "-10"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("Row count must be positive"));

            verify(fileUploadService, times(1)).getPreview(1L, -10);
        }

        @Test
        @DisplayName("TC-FC-020: Preview with Zero Row Count")
        void testPreviewWithZeroRowCount() throws Exception {
            // Given
            when(fileUploadService.getPreview(1L, 0))
                .thenThrow(new FileProcessingException("Row count must be positive"));

            // When & Then
            mockMvc.perform(get("/api/v1/files/1/preview")
                    .param("rows", "0"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));

            verify(fileUploadService, times(1)).getPreview(1L, 0);
        }

        @Test
        @DisplayName("TC-FC-021: GET /api/v1/files/{id}/schema - Get Detected Schema")
        void testGetDetectedSchema() throws Exception {
            // Given
            List<SchemaResponse.ColumnSchema> columns = Arrays.asList(
                SchemaResponse.ColumnSchema.builder()
                    .name("id")
                    .detectedType("integer")
                    .nullCount(0)
                    .uniqueCount(4)
                    .sampleValues(List.of("1", "2", "3", "4"))
                    .build(),
                SchemaResponse.ColumnSchema.builder()
                    .name("name")
                    .detectedType("text")
                    .nullCount(0)
                    .uniqueCount(4)
                    .sampleValues(List.of("John", "Jane", "Bob", "Alice"))
                    .build(),
                SchemaResponse.ColumnSchema.builder()
                    .name("amount")
                    .detectedType("currency")
                    .nullCount(0)
                    .uniqueCount(4)
                    .sampleValues(List.of("$100", "$200", "$300", "$400"))
                    .build(),
                SchemaResponse.ColumnSchema.builder()
                    .name("date")
                    .detectedType("date")
                    .nullCount(0)
                    .uniqueCount(4)
                    .sampleValues(List.of("2024-01-15", "2024-01-16", "2024-01-17", "2024-01-18"))
                    .build()
            );

            SchemaResponse schemaResponse = SchemaResponse.builder()
                    .fileId(1L)
                    .filename("test.csv")
                    .columns(columns)
                    .totalRows(4)
                    .build();

            when(fileUploadService.getSchema(1L)).thenReturn(schemaResponse);

            // When & Then
            mockMvc.perform(get("/api/v1/files/1/schema"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.fileId").value(1))
                    .andExpect(jsonPath("$.data.filename").value("test.csv"))
                    .andExpect(jsonPath("$.data.totalRows").value(4))
                    .andExpect(jsonPath("$.data.columns", hasSize(4)))
                    .andExpect(jsonPath("$.data.columns[0].name").value("id"))
                    .andExpect(jsonPath("$.data.columns[0].detectedType").value("integer"))
                    .andExpect(jsonPath("$.data.columns[0].nullCount").value(0))
                    .andExpect(jsonPath("$.data.columns[0].uniqueCount").value(4))
                    .andExpect(jsonPath("$.data.columns[1].name").value("name"))
                    .andExpect(jsonPath("$.data.columns[1].detectedType").value("text"))
                    .andExpect(jsonPath("$.data.columns[2].name").value("amount"))
                    .andExpect(jsonPath("$.data.columns[2].detectedType").value("currency"))
                    .andExpect(jsonPath("$.data.columns[3].name").value("date"))
                    .andExpect(jsonPath("$.data.columns[3].detectedType").value("date"));

            ArgumentCaptor<Long> idCaptor = ArgumentCaptor.forClass(Long.class);
            verify(fileUploadService, times(1)).getSchema(idCaptor.capture());
            assertThat(idCaptor.getValue()).isEqualTo(1L);
        }

        @Test
        @DisplayName("TC-FC-022: Schema Detection for File Not Found")
        void testSchemaForNonExistentFile() throws Exception {
            // Given
            when(fileUploadService.getSchema(999L))
                .thenThrow(new ResourceNotFoundException("UploadedFile", 999L));

            // When & Then
            mockMvc.perform(get("/api/v1/files/999/schema"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("UploadedFile not found with id: 999"));

            verify(fileUploadService, times(1)).getSchema(999L);
        }
    }

    // ==================== List and Delete Endpoint Tests ====================

    @Nested
    @DisplayName("File Listing and Deletion Tests")
    class ListAndDeleteTests {

        @Test
        @DisplayName("TC-FC-023: GET /api/v1/files - List All Files for Organization")
        void testListAllFilesForOrganization() throws Exception {
            // Given
            List<UploadedFileResponse> files = Arrays.asList(
                createFileResponse(1L, "file1.csv", FileStatus.PROCESSED),
                createFileResponse(2L, "file2.csv", FileStatus.PROCESSED),
                createFileResponse(3L, "file3.csv", FileStatus.UPLOADED)
            );

            when(fileUploadService.getAll()).thenReturn(files);

            // When & Then
            mockMvc.perform(get("/api/v1/files"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data", hasSize(3)))
                    .andExpect(jsonPath("$.data[0].id").value(1))
                    .andExpect(jsonPath("$.data[0].originalFilename").value("file1.csv"))
                    .andExpect(jsonPath("$.data[0].status").value("PROCESSED"))
                    .andExpect(jsonPath("$.data[1].id").value(2))
                    .andExpect(jsonPath("$.data[1].originalFilename").value("file2.csv"))
                    .andExpect(jsonPath("$.data[1].status").value("PROCESSED"))
                    .andExpect(jsonPath("$.data[2].id").value(3))
                    .andExpect(jsonPath("$.data[2].originalFilename").value("file3.csv"))
                    .andExpect(jsonPath("$.data[2].status").value("UPLOADED"));

            verify(fileUploadService, times(1)).getAll();
        }

        @Test
        @DisplayName("TC-FC-024: GET /api/v1/files - Empty File List")
        void testGetAllFilesWhenEmpty() throws Exception {
            // Given
            when(fileUploadService.getAll()).thenReturn(Collections.emptyList());

            // When & Then
            mockMvc.perform(get("/api/v1/files"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data", hasSize(0)))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data").isEmpty());

            verify(fileUploadService, times(1)).getAll();
        }

        @Test
        @DisplayName("TC-FC-025: DELETE /api/v1/files/{id} - Delete File Successfully")
        void testDeleteFile() throws Exception {
            // Given
            doNothing().when(fileUploadService).deleteFile(1L);

            // When & Then
            mockMvc.perform(delete("/api/v1/files/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("File deleted successfully"))
                    .andExpect(jsonPath("$.data").doesNotExist()); // data field is excluded when null due to @JsonInclude(NON_NULL)

            ArgumentCaptor<Long> idCaptor = ArgumentCaptor.forClass(Long.class);
            verify(fileUploadService, times(1)).deleteFile(idCaptor.capture());
            assertThat(idCaptor.getValue()).isEqualTo(1L);
        }

        @Test
        @DisplayName("TC-FC-026: DELETE /api/v1/files/{id} - Delete Non-Existent File")
        void testDeleteNonExistentFile() throws Exception {
            // Given
            doThrow(new ResourceNotFoundException("UploadedFile", 999L))
                .when(fileUploadService).deleteFile(999L);

            // When & Then
            mockMvc.perform(delete("/api/v1/files/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("UploadedFile not found with id: 999"));

            verify(fileUploadService, times(1)).deleteFile(999L);
        }

        @Test
        @DisplayName("TC-FC-027: DELETE /api/v1/files/{id} - Delete File In Use")
        void testDeleteFileInUse() throws Exception {
            // Given
            doThrow(new FileProcessingException("Cannot delete file: currently in use by active reconciliation"))
                .when(fileUploadService).deleteFile(1L);

            // When & Then
            mockMvc.perform(delete("/api/v1/files/1"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message",
                        containsString("Cannot delete file: currently in use")));

            verify(fileUploadService, times(1)).deleteFile(1L);
        }
    }

    // ==================== Helper Methods ====================

    private List<List<Object>> createSampleRows(int count) {
        List<List<Object>> rows = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            rows.add(Arrays.asList(
                String.valueOf(i + 1),
                "User" + (i + 1),
                "100.00"
            ));
        }
        return rows;
    }

    private UploadedFileResponse createFileResponse(Long id, String filename, FileStatus status) {
        UploadedFile file = UploadedFile.builder()
                .originalFilename(filename)
                .status(status)
                .build();
        file.setId(id);
        return UploadedFileResponse.fromEntity(file);
    }

    /**
     * Test Data Builder for UploadedFileResponse
     * Reduces duplication and improves test readability
     */
    private UploadedFileResponse createTestFileResponse(
            Long id,
            String filename,
            String contentType,
            FileStatus status) {
        UploadedFile file = UploadedFile.builder()
                .originalFilename(filename)
                .contentType(contentType)
                .fileSize(1024L)
                .status(status)
                .build();
        file.setId(id);
        return UploadedFileResponse.fromEntity(file);
    }
}
