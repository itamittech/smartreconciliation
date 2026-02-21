package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.ReconciliationRequest;
import com.amit.smartreconciliation.dto.request.ReconciliationDomainDetectionRequest;
import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.dto.response.DomainDetectionResponse;
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
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','FINANCE','IT_ADMIN','OPERATIONS','COMPLIANCE')")
    @PostMapping("/detect-domain")
    public ResponseEntity<ApiResponse<DomainDetectionResponse>> detectDomain(
            @Valid @RequestBody ReconciliationDomainDetectionRequest request) {
        DomainDetectionResponse response = reconciliationService.detectDomain(request);
        return ResponseEntity.ok(ApiResponse.success("Reconciliation domain detected", response));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','FINANCE','IT_ADMIN','OPERATIONS','COMPLIANCE')")
    @PostMapping
    public ResponseEntity<ApiResponse<ReconciliationResponse>> create(
            @Valid @RequestBody ReconciliationRequest request) {
        ReconciliationResponse response = reconciliationService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reconciliation started", response));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','FINANCE','IT_ADMIN','OPERATIONS','COMPLIANCE')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReconciliationResponse>> getById(@PathVariable Long id) {
        ReconciliationResponse response = reconciliationService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','FINANCE','IT_ADMIN','OPERATIONS','COMPLIANCE')")
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String order) {

        // If pagination parameters provided, return paginated result
        if (page != null || size != null) {
            int pageNumber = page != null ? page : 0;
            int pageSize = size != null ? size : 20;

            Sort sortOrder = Sort.unsorted();
            if (sort != null) {
                Sort.Direction direction = "desc".equalsIgnoreCase(order)
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
                sortOrder = Sort.by(direction, sort);
            } else {
                // Default sort by createdAt descending
                sortOrder = Sort.by(Sort.Direction.DESC, "createdAt");
            }

            Pageable pageable = PageRequest.of(pageNumber, pageSize, sortOrder);
            Page<ReconciliationResponse> response = reconciliationService.getAll(pageable);
            return ResponseEntity.ok(ApiResponse.success(response));
        }

        // Otherwise return all as list (backward compatibility)
        List<ReconciliationResponse> response = reconciliationService.getAll();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','FINANCE','IT_ADMIN','OPERATIONS','COMPLIANCE')")
    @GetMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ReconciliationResponse>> getStatus(@PathVariable Long id) {
        ReconciliationResponse response = reconciliationService.getStatus(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','FINANCE','IT_ADMIN','OPERATIONS','COMPLIANCE')")
    @GetMapping("/{id}/results")
    public ResponseEntity<ApiResponse<ReconciliationResponse>> getResults(@PathVariable Long id) {
        ReconciliationResponse response = reconciliationService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','FINANCE','IT_ADMIN','OPERATIONS','COMPLIANCE')")
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

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','FINANCE','IT_ADMIN','OPERATIONS','COMPLIANCE')")
    @PostMapping("/{id}/start")
    public ResponseEntity<ApiResponse<ReconciliationResponse>> start(@PathVariable Long id) {
        ReconciliationResponse response = reconciliationService.start(id);
        return ResponseEntity.ok(ApiResponse.success("Reconciliation started", response));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','FINANCE','IT_ADMIN','OPERATIONS','COMPLIANCE')")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long id) {
        reconciliationService.cancel(id);
        return ResponseEntity.ok(ApiResponse.success("Reconciliation cancelled", null));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        reconciliationService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Reconciliation deleted successfully", null));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @DeleteMapping("/bulk")
    public ResponseEntity<ApiResponse<Map<String, Object>>> bulkDelete(@RequestBody List<Long> ids) {
        Map<String, Object> result = reconciliationService.deleteAll(ids);
        return ResponseEntity.ok(ApiResponse.success("Bulk delete completed", result));
    }
}
