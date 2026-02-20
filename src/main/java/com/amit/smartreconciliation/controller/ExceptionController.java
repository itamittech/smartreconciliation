package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.AutoResolveExceptionsRequest;
import com.amit.smartreconciliation.dto.request.BulkExceptionRequest;
import com.amit.smartreconciliation.dto.request.ExceptionUpdateRequest;
import com.amit.smartreconciliation.dto.response.AutoResolveExceptionsResponse;
import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.dto.response.ExceptionRunSummaryResponse;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
            @RequestParam(required = false) Long reconciliationId,
            @RequestParam(required = false) ExceptionType type,
            @RequestParam(required = false) ExceptionSeverity severity,
            @RequestParam(required = false) ExceptionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ReconciliationExceptionResponse> response;
        if (reconciliationId != null) {
            response = exceptionService.getByReconciliationId(
                    reconciliationId, type, severity, status, fromDate, toDate, pageable);
        } else {
            response = exceptionService.getAll(type, severity, status, fromDate, toDate, pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/runs")
    public ResponseEntity<ApiResponse<List<ExceptionRunSummaryResponse>>> getRunSummaries(
            @RequestParam(required = false) ExceptionType type,
            @RequestParam(required = false) ExceptionSeverity severity,
            @RequestParam(required = false) ExceptionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        List<ExceptionRunSummaryResponse> response =
                exceptionService.getRunSummaries(type, severity, status, fromDate, toDate);
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

    @PostMapping("/bulk-update")
    public ResponseEntity<ApiResponse<List<ReconciliationExceptionResponse>>> bulkUpdateStatus(
            @Valid @RequestBody BulkExceptionRequest request) {
        List<ReconciliationExceptionResponse> response = exceptionService.bulkUpdate(request);
        String message = response.size() + " exceptions updated successfully";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    @PostMapping("/bulk-auto-resolve")
    public ResponseEntity<ApiResponse<AutoResolveExceptionsResponse>> bulkAutoResolve(
            @Valid @RequestBody AutoResolveExceptionsRequest request) {
        AutoResolveExceptionsResponse response = exceptionService.bulkAutoResolve(request);
        return ResponseEntity.ok(ApiResponse.success("Auto-resolve completed", response));
    }

    @GetMapping("/{id}/suggestions")
    public ResponseEntity<ApiResponse<String>> getSuggestion(@PathVariable Long id) {
        String suggestion = exceptionService.getSuggestion(id);
        return ResponseEntity.ok(ApiResponse.success(suggestion));
    }
}
