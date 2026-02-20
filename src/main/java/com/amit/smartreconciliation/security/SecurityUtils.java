package com.amit.smartreconciliation.security;

import com.amit.smartreconciliation.enums.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static CustomUserDetails getCurrentUserDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails;
        }
        throw new IllegalStateException("No authenticated user in security context");
    }

    public static Long getCurrentUserId() {
        return getCurrentUserDetails().getUserId();
    }

    public static UserRole getCurrentUserRole() {
        return getCurrentUserDetails().getRole();
    }

    public static Long getCurrentOrgId() {
        return getCurrentUserDetails().getOrgId();
    }
}
