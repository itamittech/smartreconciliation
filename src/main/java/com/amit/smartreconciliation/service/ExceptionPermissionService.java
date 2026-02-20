package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.enums.UserRole;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

@Service
public class ExceptionPermissionService {

    private static final Map<ExceptionType, Set<UserRole>> PERMISSION_MAP = new EnumMap<>(ExceptionType.class);

    static {
        PERMISSION_MAP.put(ExceptionType.MISSING_SOURCE,
                Set.of(UserRole.ADMIN, UserRole.ANALYST, UserRole.IT_ADMIN));
        PERMISSION_MAP.put(ExceptionType.MISSING_TARGET,
                Set.of(UserRole.ADMIN, UserRole.ANALYST, UserRole.IT_ADMIN));
        PERMISSION_MAP.put(ExceptionType.VALUE_MISMATCH,
                Set.of(UserRole.ADMIN, UserRole.ANALYST, UserRole.FINANCE));
        PERMISSION_MAP.put(ExceptionType.DUPLICATE,
                Set.of(UserRole.ADMIN, UserRole.ANALYST, UserRole.OPERATIONS, UserRole.COMPLIANCE));
        PERMISSION_MAP.put(ExceptionType.FORMAT_ERROR,
                Set.of(UserRole.ADMIN, UserRole.ANALYST, UserRole.IT_ADMIN));
        PERMISSION_MAP.put(ExceptionType.TOLERANCE_EXCEEDED,
                Set.of(UserRole.ADMIN, UserRole.ANALYST, UserRole.FINANCE, UserRole.COMPLIANCE));
        PERMISSION_MAP.put(ExceptionType.POTENTIAL_MATCH,
                Set.of(UserRole.ADMIN, UserRole.ANALYST, UserRole.OPERATIONS));
    }

    public boolean canAction(UserRole role, ExceptionType type) {
        Set<UserRole> allowed = PERMISSION_MAP.get(type);
        return allowed != null && allowed.contains(role);
    }
}
