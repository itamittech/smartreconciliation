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
}
