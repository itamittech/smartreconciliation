package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.LoginRequest;
import com.amit.smartreconciliation.dto.request.RefreshTokenRequest;
import com.amit.smartreconciliation.dto.response.AuthResponse;
import com.amit.smartreconciliation.dto.response.UserSummary;
import com.amit.smartreconciliation.security.CustomUserDetails;
import com.amit.smartreconciliation.security.JwtService;
import com.amit.smartreconciliation.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    @Value("${app.security.jwt.access-token-expiry}")
    private long accessTokenExpiry;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UserDetailsServiceImpl userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        UserSummary userSummary = new UserSummary(
                userDetails.getUserId(),
                userDetails.getDisplayName(),
                userDetails.getEmail(),
                userDetails.getRole()
        );

        return new AuthResponse(accessToken, refreshToken, accessTokenExpiry, userSummary);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String email = jwtService.extractEmail(request.getRefreshToken());
        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(email);

        if (!jwtService.isTokenValid(request.getRefreshToken(), userDetails)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        String newAccessToken = jwtService.generateAccessToken(userDetails);
        UserSummary userSummary = new UserSummary(
                userDetails.getUserId(),
                userDetails.getDisplayName(),
                userDetails.getEmail(),
                userDetails.getRole()
        );

        return new AuthResponse(newAccessToken, request.getRefreshToken(), accessTokenExpiry, userSummary);
    }

    public UserSummary getCurrentUser(CustomUserDetails userDetails) {
        return new UserSummary(
                userDetails.getUserId(),
                userDetails.getDisplayName(),
                userDetails.getEmail(),
                userDetails.getRole()
        );
    }
}
