package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.BulkExceptionRequest;
import com.amit.smartreconciliation.dto.request.ExceptionUpdateRequest;
import com.amit.smartreconciliation.dto.response.ReconciliationExceptionResponse;
import com.amit.smartreconciliation.entity.ReconciliationException;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.enums.UserRole;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.ReconciliationExceptionRepository;
import com.amit.smartreconciliation.security.CustomUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExceptionService {

    private static final Logger log = LoggerFactory.getLogger(ExceptionService.class);

    private final ReconciliationExceptionRepository exceptionRepository;
    private final AiService aiService;
    private final ExceptionPermissionService permissionService;

    public ExceptionService(ReconciliationExceptionRepository exceptionRepository,
                            AiService aiService,
                            ExceptionPermissionService permissionService) {
        this.exceptionRepository = exceptionRepository;
        this.aiService = aiService;
        this.permissionService = permissionService;
    }

    private UserRole getCurrentUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getRole();
        }
        // Default to VIEWER (most restrictive) when no auth context
        return UserRole.VIEWER;
    }

    public Page<ReconciliationExceptionResponse> getByReconciliationId(
            Long reconciliationId,
            ExceptionType type,
            ExceptionSeverity severity,
            ExceptionStatus status,
            Pageable pageable) {

        return exceptionRepository.findByFilters(reconciliationId, type, severity, status, pageable)
                .map(ReconciliationExceptionResponse::fromEntity);
    }

    public Page<ReconciliationExceptionResponse> getAll(
            ExceptionType type,
            ExceptionSeverity severity,
            ExceptionStatus status,
            Pageable pageable) {

        return exceptionRepository.findAllByFilters(type, severity, status, pageable)
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

        UserRole role = getCurrentUserRole();
        if (!permissionService.canAction(role, exception.getType())) {
            throw new AccessDeniedException(
                    "You do not have permission to action this exception type: " + exception.getType());
        }

        if (request.getStatus() != null) {
            if (exception.getStatus() == ExceptionStatus.RESOLVED
                    && request.getStatus() != ExceptionStatus.RESOLVED) {
                throw new IllegalStateException("Cannot reopen resolved exception");
            }
            exception.setStatus(request.getStatus());
            if (request.getStatus() == ExceptionStatus.RESOLVED) {
                exception.setResolvedAt(LocalDateTime.now());
            } else if (request.getStatus() == ExceptionStatus.ACKNOWLEDGED) {
                exception.setAcknowledgedAt(LocalDateTime.now());
            } else if (request.getStatus() == ExceptionStatus.IN_REVIEW) {
                exception.setReviewedAt(LocalDateTime.now());
            } else if (request.getStatus() == ExceptionStatus.IGNORED) {
                exception.setIgnoredAt(LocalDateTime.now());
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
        List<Long> ids = request.getExceptionIds();
        List<ReconciliationException> exceptions = exceptionRepository.findAllById(ids);
        if (exceptions.size() != ids.size()) {
            // log missing IDs (existing behavior)
            List<Long> foundIds = exceptions.stream().map(ReconciliationException::getId).toList();
            ids.stream()
                    .filter(id -> !foundIds.contains(id))
                    .forEach(missingId -> log.error("Bulk update failed for missing exception: {}", missingId));
        }

        UserRole role = getCurrentUserRole();
        for (ReconciliationException exception : exceptions) {
            if (!permissionService.canAction(role, exception.getType())) {
                throw new AccessDeniedException(
                        "You do not have permission to action exception type: " + exception.getType());
            }
            exception.setStatus(request.getStatus());
            if (request.getStatus() == ExceptionStatus.RESOLVED) {
                exception.setResolvedAt(LocalDateTime.now());
            } else if (request.getStatus() == ExceptionStatus.ACKNOWLEDGED) {
                exception.setAcknowledgedAt(LocalDateTime.now());
            } else if (request.getStatus() == ExceptionStatus.IN_REVIEW) {
                exception.setReviewedAt(LocalDateTime.now());
            } else if (request.getStatus() == ExceptionStatus.IGNORED) {
                exception.setIgnoredAt(LocalDateTime.now());
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

    public java.util.Map<ExceptionStatus, Long> countByStatus(Long reconciliationId) {
        java.util.EnumMap<ExceptionStatus, Long> counts = new java.util.EnumMap<>(ExceptionStatus.class);
        for (ExceptionStatus status : ExceptionStatus.values()) {
            counts.put(status, exceptionRepository.countByReconciliationIdAndStatus(reconciliationId, status));
        }
        return counts;
    }

    public ExceptionSeverity assignSeverity(boolean isKeyField) {
        return isKeyField ? ExceptionSeverity.CRITICAL : ExceptionSeverity.MEDIUM;
    }
}
