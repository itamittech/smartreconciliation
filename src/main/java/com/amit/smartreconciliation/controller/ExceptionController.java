package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.BulkExceptionRequest;
import com.amit.smartreconciliation.dto.request.ExceptionUpdateRequest;
import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.dto.response.ReconciliationExceptionResponse;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.service.ExceptionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exceptions")
public class ExceptionController {

    private final ExceptionService exceptionService;

    public ExceptionController(ExceptionService exceptionService) {
        this.exceptionService = exceptionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReconciliationExceptionResponse>>> getExceptions(
            @RequestParam Long reconciliationId,
            @RequestParam(required = false) ExceptionType type,
            @RequestParam(required = false) ExceptionSeverity severity,
            @RequestParam(required = false) ExceptionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ReconciliationExceptionResponse> response =
                exceptionService.getByReconciliationId(reconciliationId, type, severity, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReconciliationExceptionResponse>> getById(@PathVariable Long id) {
        ReconciliationExceptionResponse response = exceptionService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReconciliationExceptionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ExceptionUpdateRequest request) {
        ReconciliationExceptionResponse response = exceptionService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Exception updated successfully", response));
    }

    @PostMapping("/bulk-resolve")
    public ResponseEntity<ApiResponse<List<ReconciliationExceptionResponse>>> bulkUpdate(
            @Valid @RequestBody BulkExceptionRequest request) {
        List<ReconciliationExceptionResponse> response = exceptionService.bulkUpdate(request);
        return ResponseEntity.ok(ApiResponse.success("Exceptions updated successfully", response));
    }

    @GetMapping("/{id}/suggestions")
    public ResponseEntity<ApiResponse<String>> getSuggestion(@PathVariable Long id) {
        String suggestion = exceptionService.getSuggestion(id);
        return ResponseEntity.ok(ApiResponse.success(suggestion));
    }
}
