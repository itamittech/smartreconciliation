package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.dto.response.FilePreviewResponse;
import com.amit.smartreconciliation.dto.response.SchemaResponse;
import com.amit.smartreconciliation.dto.response.UploadedFileResponse;
import com.amit.smartreconciliation.service.FileUploadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final FileUploadService fileUploadService;

    public FileController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<UploadedFileResponse>>> uploadFiles(
            @RequestParam("files") MultipartFile[] files) {
        List<UploadedFileResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            UploadedFileResponse response = fileUploadService.uploadFile(file);
            responses.add(response);
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Files uploaded successfully", responses));
    }

    @PostMapping(value = "/upload/single", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UploadedFileResponse>> uploadFile(
            @RequestParam("file") MultipartFile file) {
        UploadedFileResponse response = fileUploadService.uploadFile(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("File uploaded successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UploadedFileResponse>> getById(@PathVariable Long id) {
        UploadedFileResponse response = fileUploadService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UploadedFileResponse>>> getAll() {
        List<UploadedFileResponse> response = fileUploadService.getAll();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<ApiResponse<FilePreviewResponse>> getPreview(
            @PathVariable Long id,
            @RequestParam(defaultValue = "100") int rows) {
        FilePreviewResponse response = fileUploadService.getPreview(id, rows);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/schema")
    public ResponseEntity<ApiResponse<SchemaResponse>> getSchema(@PathVariable Long id) {
        SchemaResponse response = fileUploadService.getSchema(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        fileUploadService.deleteFile(id);
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully", null));
    }
}
