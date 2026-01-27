package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.ChatRequest;
import com.amit.smartreconciliation.dto.response.ChatMessageResponse;
import com.amit.smartreconciliation.dto.response.ChatResponse;
import com.amit.smartreconciliation.dto.response.ChatSessionResponse;
import com.amit.smartreconciliation.entity.ChatMessage;
import com.amit.smartreconciliation.entity.ChatSession;
import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.ChatMessageRepository;
import com.amit.smartreconciliation.repository.ChatSessionRepository;
import com.amit.smartreconciliation.repository.ReconciliationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final ReconciliationRepository reconciliationRepository;
    private final OrganizationService organizationService;
    private final AiService aiService;

    @Transactional
    public ChatSessionResponse createSession(Long reconciliationId) {
        Organization org = organizationService.getDefaultOrganization();

        ChatSession session = ChatSession.builder()
                .title("New Chat Session")
                .organization(org)
                .active(true)
                .build();

        if (reconciliationId != null) {
            Reconciliation reconciliation = reconciliationRepository.findById(reconciliationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Reconciliation", reconciliationId));
            session.setReconciliation(reconciliation);
            session.setTitle("Chat for: " + reconciliation.getName());
        }

        ChatSession saved = sessionRepository.save(session);
        log.info("Created chat session: {}", saved.getId());
        return ChatSessionResponse.fromEntity(saved);
    }

    public ChatSessionResponse getSession(Long sessionId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", sessionId));
        return ChatSessionResponse.fromEntity(session);
    }

    public List<ChatSessionResponse> getSessions() {
        Organization org = organizationService.getDefaultOrganization();
        return sessionRepository.findByOrganizationIdAndActiveTrueOrderByUpdatedAtDesc(org.getId())
                .stream()
                .map(ChatSessionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatResponse sendMessage(ChatRequest request) {
        ChatSession session;

        if (request.getSessionId() != null) {
            session = sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException("ChatSession", request.getSessionId()));
        } else {
            ChatSessionResponse newSession = createSession(request.getReconciliationId());
            session = sessionRepository.findById(newSession.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("ChatSession", newSession.getId()));
        }

        ChatMessage userMessage = ChatMessage.builder()
                .role("user")
                .content(request.getMessage())
                .session(session)
                .build();
        messageRepository.save(userMessage);

        String context = buildContext(session);
        String aiResponse = aiService.chatSync(request.getMessage(), context);

        ChatMessage assistantMessage = ChatMessage.builder()
                .role("assistant")
                .content(aiResponse)
                .session(session)
                .build();
        ChatMessage savedAssistantMessage = messageRepository.save(assistantMessage);

        return ChatResponse.builder()
                .sessionId(session.getId())
                .messageId(savedAssistantMessage.getId())
                .role("assistant")
                .content(aiResponse)
                .createdAt(savedAssistantMessage.getCreatedAt())
                .build();
    }

    @Transactional
    public Flux<String> streamMessage(ChatRequest request) {
        ChatSession session;

        if (request.getSessionId() != null) {
            session = sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException("ChatSession", request.getSessionId()));
        } else {
            ChatSessionResponse newSession = createSession(request.getReconciliationId());
            session = sessionRepository.findById(newSession.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("ChatSession", newSession.getId()));
        }

        ChatMessage userMessage = ChatMessage.builder()
                .role("user")
                .content(request.getMessage())
                .session(session)
                .build();
        messageRepository.save(userMessage);

        String context = buildContext(session);

        StringBuilder fullResponse = new StringBuilder();
        ChatSession finalSession = session;

        return aiService.chat(request.getMessage(), context)
                .doOnNext(fullResponse::append)
                .doOnComplete(() -> {
                    ChatMessage assistantMessage = ChatMessage.builder()
                            .role("assistant")
                            .content(fullResponse.toString())
                            .session(finalSession)
                            .build();
                    messageRepository.save(assistantMessage);
                });
    }

    public List<ChatMessageResponse> getMessages(Long sessionId) {
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .map(ChatMessageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSession(Long sessionId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", sessionId));
        session.setActive(false);
        sessionRepository.save(session);
        log.info("Deleted chat session: {}", sessionId);
    }

    private String buildContext(ChatSession session) {
        StringBuilder context = new StringBuilder();

        if (session.getReconciliation() != null) {
            Reconciliation rec = session.getReconciliation();
            context.append("Current Reconciliation: ").append(rec.getName()).append("\n");
            context.append("Status: ").append(rec.getStatus()).append("\n");
            context.append("Match Rate: ").append(String.format("%.2f%%", rec.getMatchRate())).append("\n");
            context.append("Total Exceptions: ").append(rec.getExceptionCount()).append("\n");
            context.append("Source File: ").append(rec.getSourceFile().getOriginalFilename()).append("\n");
            context.append("Target File: ").append(rec.getTargetFile().getOriginalFilename()).append("\n");
        }

        List<ChatMessage> recentMessages = messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
        if (!recentMessages.isEmpty()) {
            context.append("\nRecent conversation:\n");
            int start = Math.max(0, recentMessages.size() - 10);
            for (int i = start; i < recentMessages.size(); i++) {
                ChatMessage msg = recentMessages.get(i);
                context.append(msg.getRole()).append(": ").append(msg.getContent()).append("\n");
            }
        }

        return context.toString();
    }
}
