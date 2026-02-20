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
import com.amit.smartreconciliation.service.tool.DashboardTools;
import com.amit.smartreconciliation.service.tool.ExceptionTools;
import com.amit.smartreconciliation.service.tool.FileTools;
import com.amit.smartreconciliation.service.tool.KnowledgeTool;
import com.amit.smartreconciliation.service.tool.ReconciliationTools;
import com.amit.smartreconciliation.service.tool.RuleSetTools;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final ReconciliationRepository reconciliationRepository;
    private final OrganizationService organizationService;
    private final AiService aiService;
    private final ChatContextService chatContextService;
    private final DashboardTools dashboardTools;
    private final ExceptionTools exceptionTools;
    private final FileTools fileTools;
    private final KnowledgeTool knowledgeTool;
    private final ReconciliationTools reconciliationTools;
    private final RuleSetTools ruleSetTools;

    public ChatService(ChatSessionRepository sessionRepository,
                      ChatMessageRepository messageRepository,
                      ReconciliationRepository reconciliationRepository,
                      OrganizationService organizationService,
                      AiService aiService,
                      ChatContextService chatContextService,
                      DashboardTools dashboardTools,
                      ExceptionTools exceptionTools,
                      FileTools fileTools,
                      KnowledgeTool knowledgeTool,
                      ReconciliationTools reconciliationTools,
                      RuleSetTools ruleSetTools) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.reconciliationRepository = reconciliationRepository;
        this.organizationService = organizationService;
        this.aiService = aiService;
        this.chatContextService = chatContextService;
        this.dashboardTools = dashboardTools;
        this.exceptionTools = exceptionTools;
        this.fileTools = fileTools;
        this.knowledgeTool = knowledgeTool;
        this.reconciliationTools = reconciliationTools;
        this.ruleSetTools = ruleSetTools;
    }

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

        // Build comprehensive context using the new context service
        String context = buildEnhancedContext(session, request.getMessage());
        String aiResponse = aiService.chatSync(request.getMessage(), context,
                dashboardTools, exceptionTools, fileTools, knowledgeTool, reconciliationTools, ruleSetTools);

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
                .response(aiResponse)
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

        // Build comprehensive context using the new context service
        String context = buildEnhancedContext(session, request.getMessage());

        StringBuilder fullResponse = new StringBuilder();
        ChatSession finalSession = session;

        return aiService.chat(request.getMessage(), context,
                dashboardTools, exceptionTools, fileTools, knowledgeTool, reconciliationTools, ruleSetTools)
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

    /**
     * Builds enhanced context using ChatContextService.
     * Combines dynamic session context, recent activity, and smart context based on user message.
     */
    private String buildEnhancedContext(ChatSession session, String userMessage) {
        StringBuilder context = new StringBuilder();
        Long orgId = session.getOrganization().getId();

        // Add dynamic context (reconciliation details, recent activity, statistics)
        context.append(chatContextService.buildDynamicContext(session, orgId));

        // Add smart context based on what the user is asking about
        String smartContext = chatContextService.buildSmartContext(userMessage, orgId);
        if (!smartContext.trim().isEmpty()) {
            context.append(smartContext);
        }

        // Add recent conversation history
        List<ChatMessage> recentMessages = messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
        if (!recentMessages.isEmpty()) {
            context.append("\n## RECENT CONVERSATION\n\n");
            int start = Math.max(0, recentMessages.size() - 10);
            for (int i = start; i < recentMessages.size(); i++) {
                ChatMessage msg = recentMessages.get(i);
                context.append(msg.getRole().toUpperCase()).append(": ").append(msg.getContent()).append("\n\n");
            }
        }

        return context.toString();
    }
}
