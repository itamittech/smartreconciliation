package com.amit.smartreconciliation.dto.response;

import java.time.LocalDateTime;

public class ChatResponse {
    private Long sessionId;
    private Long messageId;
    private String role;
    private String content;
    private LocalDateTime createdAt;

    public ChatResponse() {}

    public ChatResponse(Long sessionId, Long messageId, String role, String content, LocalDateTime createdAt) {
        this.sessionId = sessionId;
        this.messageId = messageId;
        this.role = role;
        this.content = content;
        this.createdAt = createdAt;
    }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ChatResponse r = new ChatResponse();
        public Builder sessionId(Long v) { r.sessionId = v; return this; }
        public Builder messageId(Long v) { r.messageId = v; return this; }
        public Builder role(String v) { r.role = v; return this; }
        public Builder content(String v) { r.content = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public ChatResponse build() { return r; }
    }
}
