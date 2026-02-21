package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.AutoResolveExceptionsRequest;
import com.amit.smartreconciliation.dto.request.BulkExceptionRequest;
import com.amit.smartreconciliation.dto.request.ExceptionUpdateRequest;
import com.amit.smartreconciliation.dto.response.AutoResolveExceptionsResponse;
import com.amit.smartreconciliation.dto.response.ExceptionRunSummaryResponse;
import com.amit.smartreconciliation.dto.response.ReconciliationExceptionResponse;
import com.amit.smartreconciliation.entity.ReconciliationException;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.enums.UserRole;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.ReconciliationExceptionRepository;
import com.amit.smartreconciliation.repository.ReconciliationExceptionSpec;
import com.amit.smartreconciliation.security.SecurityUtils;
import com.amit.smartreconciliation.security.CustomUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    private Long getCurrentOrgIdOrNull() {
        try {
            return SecurityUtils.getCurrentOrgId();
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private void assertCurrentOrgAccess(ReconciliationException exception) {
        Long currentOrgId = getCurrentOrgIdOrNull();
        if (currentOrgId == null || exception.getReconciliation() == null
                || exception.getReconciliation().getOrganization() == null
                || exception.getReconciliation().getOrganization().getId() == null) {
            return;
        }
        Long exceptionOrgId = exception.getReconciliation().getOrganization().getId();
        if (!currentOrgId.equals(exceptionOrgId)) {
            throw new AccessDeniedException("You do not have access to this exception.");
        }
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

    public Page<ReconciliationExceptionResponse> getByReconciliationId(
            Long reconciliationId,
            ExceptionType type,
            ExceptionSeverity severity,
            ExceptionStatus status,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable) {

        Specification<ReconciliationException> spec = buildSpec(
                reconciliationId, type, severity, status, fromDate, toDate);
        return exceptionRepository.findAll(spec, pageable)
                .map(ReconciliationExceptionResponse::fromEntity);
    }

    public Page<ReconciliationExceptionResponse> getAll(
            ExceptionType type,
            ExceptionSeverity severity,
            ExceptionStatus status,
            Pageable pageable) {

        Specification<ReconciliationException> spec = buildSpec(
                null, type, severity, status, null, null);
        return exceptionRepository.findAll(spec, pageable)
                .map(ReconciliationExceptionResponse::fromEntity);
    }

    public Page<ReconciliationExceptionResponse> getAll(
            ExceptionType type,
            ExceptionSeverity severity,
            ExceptionStatus status,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable) {

        Specification<ReconciliationException> spec = buildSpec(
                null, type, severity, status, fromDate, toDate);
        return exceptionRepository.findAll(spec, pageable)
                .map(ReconciliationExceptionResponse::fromEntity);
    }

    public List<ReconciliationExceptionResponse> getAllByReconciliationId(Long reconciliationId) {
        Specification<ReconciliationException> spec = buildSpec(
                reconciliationId, null, null, null, null, null);
        return exceptionRepository.findAll(spec)
                .stream()
                .map(ReconciliationExceptionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ExceptionRunSummaryResponse> getRunSummaries(
            ExceptionType type,
            ExceptionSeverity severity,
            ExceptionStatus status,
            LocalDate fromDate,
            LocalDate toDate) {

        Specification<ReconciliationException> spec = buildSpec(
                null, type, severity, status, fromDate, toDate);
        List<ReconciliationException> exceptions = exceptionRepository.findAll(spec);

        return exceptions.stream()
                .collect(Collectors.groupingBy(e -> e.getReconciliation().getId()))
                .entrySet().stream()
                .map(entry -> {
                    List<ReconciliationException> group = entry.getValue();
                    ReconciliationException first = group.get(0);
                    ExceptionRunSummaryResponse response = new ExceptionRunSummaryResponse();
                    response.setReconciliationId(first.getReconciliation().getId());
                    response.setReconciliationName(first.getReconciliation().getName());
                    response.setDomain(first.getReconciliation().getDomain());
                    response.setCreatedAt(first.getReconciliation().getCreatedAt());
                    response.setOpenCount(group.stream()
                            .filter(e -> e.getStatus() == ExceptionStatus.OPEN).count());
                    response.setInReviewCount(group.stream()
                            .filter(e -> e.getStatus() == ExceptionStatus.IN_REVIEW).count());
                    response.setCriticalOpenCount(group.stream()
                            .filter(e -> e.getStatus() == ExceptionStatus.OPEN
                                    && e.getSeverity() == ExceptionSeverity.CRITICAL).count());
                    response.setAiActionableCount(group.stream()
                            .filter(e -> e.getStatus() == ExceptionStatus.OPEN
                                    && e.getAiSuggestion() != null
                                    && !e.getAiSuggestion().isBlank()).count());
                    response.setTotalInScope((long) group.size());
                    return response;
                })
                .sorted(Comparator.comparing(ExceptionRunSummaryResponse::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public ReconciliationExceptionResponse getById(Long id) {
        ReconciliationException exception = exceptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReconciliationException", id));
        assertCurrentOrgAccess(exception);
        return ReconciliationExceptionResponse.fromEntity(exception);
    }

    @Transactional
    public ReconciliationExceptionResponse update(Long id, ExceptionUpdateRequest request) {
        ReconciliationException exception = exceptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReconciliationException", id));
        assertCurrentOrgAccess(exception);

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
            assertCurrentOrgAccess(exception);
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

    @Transactional
    public AutoResolveExceptionsResponse bulkAutoResolve(AutoResolveExceptionsRequest request) {
        Specification<ReconciliationException> spec = buildSpec(
                request.getReconciliationId(),
                request.getType(),
                request.getSeverity(),
                request.getStatus(),
                request.getFromDate(),
                request.getToDate());
        List<ReconciliationException> exceptions = exceptionRepository.findAll(spec);

        List<ReconciliationException> candidates = exceptions.stream()
                .filter(e -> e.getStatus() == ExceptionStatus.OPEN)
                .filter(e -> e.getAiSuggestion() != null && !e.getAiSuggestion().isBlank())
                .collect(Collectors.toList());

        Map<String, Long> skippedReasonCounts = new HashMap<>();
        skippedReasonCounts.put("not_open", exceptions.stream().filter(e -> e.getStatus() != ExceptionStatus.OPEN).count());
        skippedReasonCounts.put("missing_ai_suggestion", exceptions.stream()
                .filter(e -> e.getStatus() == ExceptionStatus.OPEN)
                .filter(e -> e.getAiSuggestion() == null || e.getAiSuggestion().isBlank())
                .count());

        UserRole role = getCurrentUserRole();
        for (ReconciliationException exception : candidates) {
            if (!permissionService.canAction(role, exception.getType())) {
                throw new AccessDeniedException(
                        "You do not have permission to action exception type: " + exception.getType());
            }
        }

        String resolutionTemplate = request.getResolutionTemplate() != null
                ? request.getResolutionTemplate()
                : "Resolved automatically from AI suggestion";
        String resolvedBy = request.getResolvedBy() != null
                ? request.getResolvedBy()
                : "AI Auto Resolver";
        LocalDateTime now = LocalDateTime.now();

        for (ReconciliationException exception : candidates) {
            exception.setStatus(ExceptionStatus.RESOLVED);
            exception.setResolution(resolutionTemplate);
            exception.setResolvedBy(resolvedBy);
            exception.setResolvedAt(now);
        }

        List<ReconciliationException> saved = exceptionRepository.saveAll(candidates);
        AutoResolveExceptionsResponse response = new AutoResolveExceptionsResponse();
        response.setUpdatedCount(saved.size());
        response.setSkippedCount(Math.max(0, exceptions.size() - saved.size()));
        response.setUpdatedIds(saved.stream().map(ReconciliationException::getId).toList());
        response.setSkippedReasonCounts(skippedReasonCounts);
        return response;
    }

    public String getSuggestion(Long id) {
        ReconciliationException exception = exceptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReconciliationException", id));
        assertCurrentOrgAccess(exception);

        if (exception.getAiSuggestion() != null) {
            return exception.getAiSuggestion();
        }

        String suggestion = aiService.getExceptionSuggestion(
                exception.getType().name(),
                exception.getSourceValue(),
                exception.getTargetValue(),
                exception.getFieldName(),
                exception.getDescription(),
                exception.getDomain()
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

    private Specification<ReconciliationException> buildSpec(
            Long reconciliationId,
            ExceptionType type,
            ExceptionSeverity severity,
            ExceptionStatus status,
            LocalDate fromDate,
            LocalDate toDate) {
        Long currentOrgId = getCurrentOrgIdOrNull();
        return Specification
                .where(ReconciliationExceptionSpec.withOrganizationId(currentOrgId))
                .and(ReconciliationExceptionSpec.withReconciliationId(reconciliationId))
                .and(ReconciliationExceptionSpec.withType(type))
                .and(ReconciliationExceptionSpec.withSeverity(severity))
                .and(ReconciliationExceptionSpec.withStatus(status))
                .and(ReconciliationExceptionSpec.withFromCreatedAt(toStartOfDay(fromDate)))
                .and(ReconciliationExceptionSpec.withToCreatedAt(toEndExclusive(toDate)));
    }

    private LocalDateTime toStartOfDay(LocalDate date) {
        return date != null ? date.atStartOfDay() : null;
    }

    private LocalDateTime toEndExclusive(LocalDate date) {
        return date != null ? date.plusDays(1).atStartOfDay() : null;
    }
}
