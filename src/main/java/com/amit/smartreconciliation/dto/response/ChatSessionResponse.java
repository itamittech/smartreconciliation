package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.ChatSession;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class ChatSessionResponse {
    private Long id;
    private String title;
    private Long reconciliationId;
    private List<ChatMessageResponse> messages;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ChatSessionResponse() {}

    public static ChatSessionResponse fromEntity(ChatSession entity) {
        ChatSessionResponse r = new ChatSessionResponse();
        r.id = entity.getId();
        r.title = entity.getTitle();
        r.reconciliationId = entity.getReconciliation() != null ? entity.getReconciliation().getId() : null;
        r.messages = entity.getMessages() != null ?
                entity.getMessages().stream().map(ChatMessageResponse::fromEntity).collect(Collectors.toList()) : null;
        r.active = entity.getActive();
        r.createdAt = entity.getCreatedAt();
        r.updatedAt = entity.getUpdatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public Long getReconciliationId() { return reconciliationId; }
    public List<ChatMessageResponse> getMessages() { return messages; }
    public Boolean getActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
