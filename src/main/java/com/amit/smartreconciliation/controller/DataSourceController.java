package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.DataSourceRequest;
import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.dto.response.DataSourceResponse;
import com.amit.smartreconciliation.enums.DataSourceType;
import com.amit.smartreconciliation.service.DataSourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/datasources")
@RequiredArgsConstructor
public class DataSourceController {

    private final DataSourceService dataSourceService;

    @PostMapping
    public ResponseEntity<ApiResponse<DataSourceResponse>> create(
            @Valid @RequestBody DataSourceRequest request) {
        DataSourceResponse response = dataSourceService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Data source created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DataSourceResponse>> getById(@PathVariable Long id) {
        DataSourceResponse response = dataSourceService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DataSourceResponse>>> getAll(
            @RequestParam(required = false) DataSourceType type) {
        List<DataSourceResponse> response;
        if (type != null) {
            response = dataSourceService.getByType(type);
        } else {
            response = dataSourceService.getAll();
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DataSourceResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody DataSourceRequest request) {
        DataSourceResponse response = dataSourceService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Data source updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        dataSourceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Data source deleted successfully", null));
    }

    @PostMapping("/{id}/test")
    public ResponseEntity<ApiResponse<DataSourceResponse>> testConnection(@PathVariable Long id) {
        DataSourceResponse response = dataSourceService.testConnection(id);
        String message = response.getLastTestSuccessful() ?
                "Connection test successful" : "Connection test failed: " + response.getLastTestError();
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }
}
