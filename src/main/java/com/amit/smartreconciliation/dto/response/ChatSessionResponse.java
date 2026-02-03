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

    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setReconciliationId(Long reconciliationId) { this.reconciliationId = reconciliationId; }
    public void setMessages(List<ChatMessageResponse> messages) { this.messages = messages; }
    public void setActive(Boolean active) { this.active = active; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ChatSessionResponse r = new ChatSessionResponse();
        public Builder id(Long v) { r.id = v; return this; }
        public Builder title(String v) { r.title = v; return this; }
        public Builder reconciliationId(Long v) { r.reconciliationId = v; return this; }
        public Builder messages(List<ChatMessageResponse> v) { r.messages = v; return this; }
        public Builder active(Boolean v) { r.active = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public Builder updatedAt(LocalDateTime v) { r.updatedAt = v; return this; }
        public ChatSessionResponse build() { return r; }
    }
}
