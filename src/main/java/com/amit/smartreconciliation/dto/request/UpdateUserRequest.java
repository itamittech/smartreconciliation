package com.amit.smartreconciliation.dto.request;

import com.amit.smartreconciliation.enums.UserRole;

public class UpdateUserRequest {

    private UserRole role;
    private Boolean active;

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
