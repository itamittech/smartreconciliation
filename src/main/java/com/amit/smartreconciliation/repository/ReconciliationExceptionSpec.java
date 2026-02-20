package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.ReconciliationException;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class ReconciliationExceptionSpec {

    private ReconciliationExceptionSpec() {}

    public static Specification<ReconciliationException> withReconciliationId(Long reconciliationId) {
        return (root, query, cb) -> reconciliationId == null ? null :
                cb.equal(root.get("reconciliation").get("id"), reconciliationId);
    }

    public static Specification<ReconciliationException> withType(ExceptionType type) {
        return (root, query, cb) -> type == null ? null :
                cb.equal(root.get("type"), type);
    }

    public static Specification<ReconciliationException> withSeverity(ExceptionSeverity severity) {
        return (root, query, cb) -> severity == null ? null :
                cb.equal(root.get("severity"), severity);
    }

    public static Specification<ReconciliationException> withStatus(ExceptionStatus status) {
        return (root, query, cb) -> status == null ? null :
                cb.equal(root.get("status"), status);
    }

    public static Specification<ReconciliationException> withFromCreatedAt(LocalDateTime fromCreatedAt) {
        return (root, query, cb) -> fromCreatedAt == null ? null :
                cb.greaterThanOrEqualTo(root.get("reconciliation").get("createdAt"), fromCreatedAt);
    }

    public static Specification<ReconciliationException> withToCreatedAt(LocalDateTime toCreatedAt) {
        return (root, query, cb) -> toCreatedAt == null ? null :
                cb.lessThan(root.get("reconciliation").get("createdAt"), toCreatedAt);
    }
}
