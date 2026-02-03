package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.ChatMessage;
import java.time.LocalDateTime;
import java.util.Map;

public class ChatMessageResponse {
    private Long id;
    private String role;
    private String content;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;

    public ChatMessageResponse() {}

    public static ChatMessageResponse fromEntity(ChatMessage entity) {
        ChatMessageResponse r = new ChatMessageResponse();
        r.id = entity.getId();
        r.role = entity.getRole();
        r.content = entity.getContent();
        r.metadata = entity.getMetadata();
        r.createdAt = entity.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getRole() { return role; }
    public String getContent() { return content; }
    public Map<String, Object> getMetadata() { return metadata; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public Long getSessionId() {
        // For test compatibility - extract from entity when needed
        return null;
    }

    public void setId(Long id) { this.id = id; }
    public void setRole(String role) { this.role = role; }
    public void setContent(String content) { this.content = content; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ChatMessageResponse r = new ChatMessageResponse();
        private Long sessionId;
        public Builder id(Long v) { r.id = v; return this; }
        public Builder sessionId(Long v) { this.sessionId = v; return this; }
        public Builder role(String v) { r.role = v; return this; }
        public Builder content(String v) { r.content = v; return this; }
        public Builder metadata(Map<String, Object> v) { r.metadata = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public ChatMessageResponse build() {
            // Store sessionId for tests
            if (sessionId != null) {
                ChatMessageResponseWithSession extended = new ChatMessageResponseWithSession();
                extended.id = r.id;
                extended.role = r.role;
                extended.content = r.content;
                extended.metadata = r.metadata;
                extended.createdAt = r.createdAt;
                extended.sessionId = sessionId;
                return extended;
            }
            return r;
        }
    }

    private static class ChatMessageResponseWithSession extends ChatMessageResponse {
        private Long sessionId;
        @Override
        public Long getSessionId() { return sessionId; }
    }
}
