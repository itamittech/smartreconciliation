package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.ReconciliationRequest;
import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.dto.response.ReconciliationExceptionResponse;
import com.amit.smartreconciliation.dto.response.ReconciliationResponse;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.service.ExceptionService;
import com.amit.smartreconciliation.service.ReconciliationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reconciliations")
public class ReconciliationController {

    private final ReconciliationService reconciliationService;
    private final ExceptionService exceptionService;

    public ReconciliationController(ReconciliationService reconciliationService,
                                    ExceptionService exceptionService) {
        this.reconciliationService = reconciliationService;
        this.exceptionService = exceptionService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReconciliationResponse>> create(
            @Valid @RequestBody ReconciliationRequest request) {
        ReconciliationResponse response = reconciliationService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reconciliation started", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReconciliationResponse>> getById(@PathVariable Long id) {
        ReconciliationResponse response = reconciliationService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReconciliationResponse>>> getAll() {
        List<ReconciliationResponse> response = reconciliationService.getAll();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ReconciliationResponse>> getStatus(@PathVariable Long id) {
        ReconciliationResponse response = reconciliationService.getStatus(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<ApiResponse<ReconciliationResponse>> getResults(@PathVariable Long id) {
        ReconciliationResponse response = reconciliationService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/exceptions")
    public ResponseEntity<ApiResponse<Page<ReconciliationExceptionResponse>>> getExceptions(
            @PathVariable Long id,
            @RequestParam(required = false) ExceptionType type,
            @RequestParam(required = false) ExceptionSeverity severity,
            @RequestParam(required = false) ExceptionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ReconciliationExceptionResponse> response =
                exceptionService.getByReconciliationId(id, type, severity, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long id) {
        reconciliationService.cancel(id);
        return ResponseEntity.ok(ApiResponse.success("Reconciliation cancelled", null));
    }
}
