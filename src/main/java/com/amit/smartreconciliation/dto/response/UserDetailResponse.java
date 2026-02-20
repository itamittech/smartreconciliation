package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.User;
import com.amit.smartreconciliation.enums.UserRole;

import java.time.LocalDateTime;

public class UserDetailResponse {

    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private Boolean active;
    private Boolean mustChangePassword;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserDetailResponse fromEntity(User user) {
        UserDetailResponse r = new UserDetailResponse();
        r.id = user.getId();
        r.name = user.getName();
        r.email = user.getEmail();
        r.role = user.getRole();
        r.active = user.getActive();
        r.mustChangePassword = user.getMustChangePassword();
        r.createdAt = user.getCreatedAt();
        r.updatedAt = user.getUpdatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public UserRole getRole() { return role; }
    public Boolean getActive() { return active; }
    public Boolean getMustChangePassword() { return mustChangePassword; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
