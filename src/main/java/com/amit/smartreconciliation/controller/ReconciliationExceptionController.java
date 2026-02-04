package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.dto.response.ReconciliationExceptionResponse;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.service.ExceptionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reconciliations")
public class ReconciliationExceptionController {

    private final ExceptionService exceptionService;

    public ReconciliationExceptionController(ExceptionService exceptionService) {
        this.exceptionService = exceptionService;
    }

    @GetMapping("/{id}/exceptions")
    public ResponseEntity<ApiResponse<Page<ReconciliationExceptionResponse>>> getExceptionsForReconciliation(
            @PathVariable Long id,
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
                exceptionService.getByReconciliationId(id, type, severity, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
