package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.LoginRequest;
import com.amit.smartreconciliation.dto.request.RefreshTokenRequest;
import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.dto.response.AuthResponse;
import com.amit.smartreconciliation.dto.response.UserSummary;
import com.amit.smartreconciliation.security.CustomUserDetails;
import com.amit.smartreconciliation.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummary>> me(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        UserSummary user = authService.getCurrentUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
