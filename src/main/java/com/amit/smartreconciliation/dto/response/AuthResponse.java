package com.amit.smartreconciliation.dto.response;

public class AuthResponse {

    private String token;
    private String refreshToken;
    private long expiresIn;
    private UserSummary user;

    public AuthResponse() {}

    public AuthResponse(String token, String refreshToken, long expiresIn, UserSummary user) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }

    public UserSummary getUser() { return user; }
    public void setUser(UserSummary user) { this.user = user; }
}
