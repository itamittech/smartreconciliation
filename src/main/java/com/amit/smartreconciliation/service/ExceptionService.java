package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.BulkExceptionRequest;
import com.amit.smartreconciliation.dto.request.ExceptionUpdateRequest;
import com.amit.smartreconciliation.dto.response.ReconciliationExceptionResponse;
import com.amit.smartreconciliation.entity.ReconciliationException;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.ReconciliationExceptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExceptionService {

    private final ReconciliationExceptionRepository exceptionRepository;
    private final AiService aiService;

    public Page<ReconciliationExceptionResponse> getByReconciliationId(
            Long reconciliationId,
            ExceptionType type,
            ExceptionSeverity severity,
            ExceptionStatus status,
            Pageable pageable) {

        return exceptionRepository.findByFilters(reconciliationId, type, severity, status, pageable)
                .map(ReconciliationExceptionResponse::fromEntity);
    }

    public List<ReconciliationExceptionResponse> getAllByReconciliationId(Long reconciliationId) {
        return exceptionRepository.findByReconciliationId(reconciliationId)
                .stream()
                .map(ReconciliationExceptionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ReconciliationExceptionResponse getById(Long id) {
        ReconciliationException exception = exceptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReconciliationException", id));
        return ReconciliationExceptionResponse.fromEntity(exception);
    }

    @Transactional
    public ReconciliationExceptionResponse update(Long id, ExceptionUpdateRequest request) {
        ReconciliationException exception = exceptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReconciliationException", id));

        if (request.getStatus() != null) {
            exception.setStatus(request.getStatus());
            if (request.getStatus() == ExceptionStatus.RESOLVED) {
                exception.setResolvedAt(LocalDateTime.now());
            }
        }

        if (request.getResolution() != null) {
            exception.setResolution(request.getResolution());
        }

        if (request.getResolvedBy() != null) {
            exception.setResolvedBy(request.getResolvedBy());
        }

        ReconciliationException saved = exceptionRepository.save(exception);
        log.info("Updated exception: {} (status: {})", id, saved.getStatus());
        return ReconciliationExceptionResponse.fromEntity(saved);
    }

    @Transactional
    public List<ReconciliationExceptionResponse> bulkUpdate(BulkExceptionRequest request) {
        List<ReconciliationException> exceptions = exceptionRepository.findAllById(request.getExceptionIds());

        for (ReconciliationException exception : exceptions) {
            exception.setStatus(request.getStatus());
            if (request.getStatus() == ExceptionStatus.RESOLVED) {
                exception.setResolvedAt(LocalDateTime.now());
            }
            if (request.getResolution() != null) {
                exception.setResolution(request.getResolution());
            }
            if (request.getResolvedBy() != null) {
                exception.setResolvedBy(request.getResolvedBy());
            }
        }

        List<ReconciliationException> saved = exceptionRepository.saveAll(exceptions);
        log.info("Bulk updated {} exceptions to status: {}", saved.size(), request.getStatus());
        return saved.stream()
                .map(ReconciliationExceptionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public String getSuggestion(Long id) {
        ReconciliationException exception = exceptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReconciliationException", id));

        if (exception.getAiSuggestion() != null) {
            return exception.getAiSuggestion();
        }

        String suggestion = aiService.getExceptionSuggestion(
                exception.getType().name(),
                exception.getSourceValue(),
                exception.getTargetValue(),
                exception.getFieldName(),
                exception.getDescription()
        );

        exception.setAiSuggestion(suggestion);
        exceptionRepository.save(exception);

        return suggestion;
    }

    public long countByStatus(Long reconciliationId, ExceptionStatus status) {
        return exceptionRepository.countByReconciliationIdAndStatus(reconciliationId, status);
    }
}
