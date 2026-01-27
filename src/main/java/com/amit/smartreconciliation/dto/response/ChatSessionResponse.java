package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.ChatSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatSessionResponse {
    private Long id;
    private String title;
    private Long reconciliationId;
    private List<ChatMessageResponse> messages;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ChatSessionResponse fromEntity(ChatSession entity) {
        return ChatSessionResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .reconciliationId(entity.getReconciliation() != null ? entity.getReconciliation().getId() : null)
                .messages(entity.getMessages() != null ?
                        entity.getMessages().stream()
                                .map(ChatMessageResponse::fromEntity)
                                .collect(Collectors.toList()) : null)
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
