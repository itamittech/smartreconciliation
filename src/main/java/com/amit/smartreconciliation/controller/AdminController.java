package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.CreateUserRequest;
import com.amit.smartreconciliation.dto.request.UpdateUserRequest;
import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.dto.response.UserDetailResponse;
import com.amit.smartreconciliation.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDetailResponse>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.listUsers()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        AdminService.CreateUserResult result = adminService.createUser(request);
        Map<String, Object> body = Map.of(
                "user", result.user(),
                "tempPassword", result.tempPassword()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created. Share the temp password out-of-band.", body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailResponse>> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateUser(id, request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUser(id)));
    }
}
