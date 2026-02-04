package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.ChatRequest;
import com.amit.smartreconciliation.dto.response.ChatMessageResponse;
import com.amit.smartreconciliation.dto.response.ChatResponse;
import com.amit.smartreconciliation.dto.response.ChatSessionResponse;
import com.amit.smartreconciliation.entity.*;
import com.amit.smartreconciliation.enums.ReconciliationStatus;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.ChatMessageRepository;
import com.amit.smartreconciliation.repository.ChatSessionRepository;
import com.amit.smartreconciliation.repository.ReconciliationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Comprehensive Unit tests for ChatService
 * Feature: Chat System
 * Test Level: Unit Test
 * Total Test Cases: 11
 *
 * Testing Strategy:
 * - Mock all repository dependencies, AI service, and context service
 * - Test session creation with and without reconciliation context
 * - Test message sending (sync and streaming)
 * - Test auto-session creation when no sessionId provided
 * - Test streaming error handling with Flux
 * - Verify transaction boundaries and data persistence
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ChatService Unit Tests")
class ChatServiceTest {

    @Mock
    private ChatSessionRepository sessionRepository;

    @Mock
    private ChatMessageRepository messageRepository;

    @Mock
    private ReconciliationRepository reconciliationRepository;

    @Mock
    private OrganizationService organizationService;

    @Mock
    private AiService aiService;

    @Mock
    private ChatContextService chatContextService;

    private ChatService chatService;

    private Organization testOrganization;
    private Reconciliation testReconciliation;
    private ChatSession testSession;
    private UploadedFile sourceFile;
    private UploadedFile targetFile;

    @BeforeEach
    void setUp() {
        chatService = new ChatService(
            sessionRepository,
            messageRepository,
            reconciliationRepository,
            organizationService,
            aiService,
            chatContextService
        );

        // Setup test data
        testOrganization = createTestOrganization();
        sourceFile = createTestFile(1L, "source.csv", 1000, 10);
        targetFile = createTestFile(2L, "target.csv", 1000, 10);
        testReconciliation = createTestReconciliation(1L, "Test Reconciliation");
        testSession = createTestSession(1L, testReconciliation);

        // Default mock behavior
        lenient().when(organizationService.getDefaultOrganization()).thenReturn(testOrganization);
    }

    // ==================== Session Creation Tests ====================

    @Nested
    @DisplayName("Session Creation Tests")
    class SessionCreationTests {

        @Test
        @DisplayName("TC-CS-001: Create Chat Session with Reconciliation Context")
        void shouldCreateChatSessionWithReconciliationContext() {
            // Given - reconciliation "recon-123" exists and user "user-456" belongs to organization "org-789"
            Long reconciliationId = 1L;
            when(reconciliationRepository.findById(reconciliationId))
                .thenReturn(Optional.of(testReconciliation));

            ChatSession savedSession = ChatSession.builder()
                .organization(testOrganization)
                .reconciliation(testReconciliation)
                .title("Chat for: Test Reconciliation")
                .active(true)
                .build();
            savedSession.setId(1L);

            when(sessionRepository.save(any(ChatSession.class))).thenReturn(savedSession);

            // When - createSession() is called with reconciliationId and userId
            ChatSessionResponse response = chatService.createSession(reconciliationId);

            // Then - ChatSession entity is created with unique ID
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);

            // And session links to reconciliationId "recon-123"
            assertThat(response.getReconciliationId()).isEqualTo(reconciliationId);

            // And session status is ACTIVE
            assertThat(response.getActive()).isTrue();

            // Verify session was saved with correct properties
            ArgumentCaptor<ChatSession> sessionCaptor = ArgumentCaptor.forClass(ChatSession.class);
            verify(sessionRepository).save(sessionCaptor.capture());
            ChatSession capturedSession = sessionCaptor.getValue();

            assertThat(capturedSession.getOrganization()).isEqualTo(testOrganization);
            assertThat(capturedSession.getReconciliation()).isEqualTo(testReconciliation);
            assertThat(capturedSession.getActive()).isTrue();
            assertThat(capturedSession.getTitle()).contains("Test Reconciliation");
        }

        @Test
        @DisplayName("TC-CS-002: Create Chat Session without Reconciliation")
        void shouldCreateChatSessionWithoutReconciliation() {
            // Given - user "user-456" wants general assistance
            ChatSession savedSession = ChatSession.builder()
                .organization(testOrganization)
                .title("New Chat Session")
                .active(true)
                .build();
            savedSession.setId(2L);

            when(sessionRepository.save(any(ChatSession.class))).thenReturn(savedSession);

            // When - createSession() is called with userId only (no reconciliationId)
            ChatSessionResponse response = chatService.createSession(null);

            // Then - ChatSession is created without reconciliation link
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(2L);
            assertThat(response.getReconciliationId()).isNull();

            // And session is general-purpose (not context-specific)
            assertThat(response.getTitle()).isEqualTo("New Chat Session");

            // And session status is ACTIVE
            assertThat(response.getActive()).isTrue();

            // Verify reconciliation was not set
            ArgumentCaptor<ChatSession> sessionCaptor = ArgumentCaptor.forClass(ChatSession.class);
            verify(sessionRepository).save(sessionCaptor.capture());
            assertThat(sessionCaptor.getValue().getReconciliation()).isNull();
        }

        @Test
        @DisplayName("Should throw exception when reconciliation not found")
        void shouldThrowExceptionWhenReconciliationNotFound() {
            // Given
            Long invalidReconciliationId = 999L;
            when(reconciliationRepository.findById(invalidReconciliationId))
                .thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> chatService.createSession(invalidReconciliationId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Reconciliation")
                .hasMessageContaining("999");
        }
    }

    // ==================== Message Sending Tests ====================

    @Nested
    @DisplayName("Message Sending Tests")
    class MessageSendingTests {

        @Test
        @DisplayName("TC-CS-003: Send User Message")
        void shouldSendUserMessage() {
            // Given - chat session "session-111" exists and user message content
            Long sessionId = 1L;
            String messageContent = "What is the current match rate?";

            ChatRequest request = new ChatRequest();
            request.setSessionId(sessionId);
            request.setMessage(messageContent);

            when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));

            ChatMessage savedUserMessage = ChatMessage.builder()
                .role("user")
                .content(messageContent)
                .session(testSession)
                .build();
            savedUserMessage.setId(1L);

            ChatMessage savedAssistantMessage = ChatMessage.builder()
                .role("assistant")
                .content("The match rate is 85.5%")
                .session(testSession)
                .build();
            savedAssistantMessage.setId(2L);

            when(messageRepository.save(any(ChatMessage.class)))
                .thenReturn(savedUserMessage, savedAssistantMessage);
            when(chatContextService.buildDynamicContext(any(), anyLong())).thenReturn("Context");
            when(chatContextService.buildSmartContext(anyString(), anyLong())).thenReturn("");
            when(messageRepository.findBySessionIdOrderByCreatedAtAsc(anyLong())).thenReturn(Arrays.asList());
            when(aiService.chatSync(anyString(), anyString())).thenReturn("The match rate is 85.5%");

            // When - sendMessage() is called with sessionId and message
            ChatResponse response = chatService.sendMessage(request);

            // Then - ChatMessage entity is created with role USER
            ArgumentCaptor<ChatMessage> messageCaptor = ArgumentCaptor.forClass(ChatMessage.class);
            verify(messageRepository, times(2)).save(messageCaptor.capture());

            List<ChatMessage> savedMessages = messageCaptor.getAllValues();
            ChatMessage userMessage = savedMessages.get(0);

            assertThat(userMessage.getRole()).isEqualTo("user");

            // And message content is stored
            assertThat(userMessage.getContent()).isEqualTo(messageContent);

            // And message is linked to session "session-111"
            assertThat(userMessage.getSession()).isEqualTo(testSession);

            // And AI response is returned
            assertThat(response).isNotNull();
            assertThat(response.getSessionId()).isEqualTo(sessionId);
            assertThat(response.getRole()).isEqualTo("assistant");
            assertThat(response.getResponse()).isEqualTo("The match rate is 85.5%");
        }

        @Test
        @DisplayName("TC-CS-004: Generate AI Response Message")
        void shouldGenerateAiResponseMessage() {
            // Given - chat session with user message and reconciliation context
            Long sessionId = 1L;
            testReconciliation.setMatchRate(85.5);
            testReconciliation.setStatus(ReconciliationStatus.COMPLETED);

            ChatRequest request = new ChatRequest();
            request.setSessionId(sessionId);
            request.setMessage("What is the match rate?");

            when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));

            String contextWithStats = "Reconciliation Statistics: Match Rate: 85.5%";
            when(chatContextService.buildDynamicContext(any(ChatSession.class), anyLong()))
                .thenReturn(contextWithStats);
            when(chatContextService.buildSmartContext(anyString(), anyLong())).thenReturn("");
            when(messageRepository.findBySessionIdOrderByCreatedAtAsc(anyLong())).thenReturn(Arrays.asList());

            String aiResponse = "Based on the reconciliation data, the current match rate is 85.5%";
            when(aiService.chatSync(anyString(), anyString())).thenReturn(aiResponse);

            ChatMessage savedAssistantMessage = ChatMessage.builder()
                .role("assistant")
                .content(aiResponse)
                .session(testSession)
                .build();
            savedAssistantMessage.setId(2L);

            when(messageRepository.save(any(ChatMessage.class)))
                .thenReturn(new ChatMessage(), savedAssistantMessage);

            // When - generateAiResponse() is called (via sendMessage)
            ChatResponse response = chatService.sendMessage(request);

            // Then - context is built with reconciliation statistics
            verify(chatContextService).buildDynamicContext(testSession, testOrganization.getId());

            // And AI service is invoked with context + user message
            verify(aiService).chatSync(eq("What is the match rate?"), anyString());

            // And AI response is returned
            assertThat(response.getResponse()).isEqualTo(aiResponse);

            // And ChatMessage entity is created with role ASSISTANT
            ArgumentCaptor<ChatMessage> messageCaptor = ArgumentCaptor.forClass(ChatMessage.class);
            verify(messageRepository, times(2)).save(messageCaptor.capture());

            ChatMessage assistantMessage = messageCaptor.getAllValues().get(1);
            assertThat(assistantMessage.getRole()).isEqualTo("assistant");
            assertThat(assistantMessage.getContent()).isEqualTo(aiResponse);
        }
    }

    // ==================== Auto-Session Creation Tests ====================

    @Nested
    @DisplayName("Auto-Session Creation Tests")
    class AutoSessionCreationTests {

        @Test
        @DisplayName("TC-CS-007: Auto-Create Session on First Message")
        void shouldAutoCreateSessionOnFirstMessage() {
            // Given - no active session exists for user and message for reconciliation
            Long reconciliationId = 1L;
            String userMessage = "What are the exceptions?";

            ChatRequest request = new ChatRequest();
            request.setSessionId(null); // No existing session
            request.setReconciliationId(reconciliationId);
            request.setMessage(userMessage);

            when(reconciliationRepository.findById(reconciliationId))
                .thenReturn(Optional.of(testReconciliation));

            ChatSession newSession = ChatSession.builder()
                .organization(testOrganization)
                .reconciliation(testReconciliation)
                .title("Chat for: Test Reconciliation")
                .active(true)
                .build();
            newSession.setId(100L);

            when(sessionRepository.save(any(ChatSession.class))).thenReturn(newSession);
            when(sessionRepository.findById(100L)).thenReturn(Optional.of(newSession));

            when(chatContextService.buildDynamicContext(any(), anyLong())).thenReturn("Context");
            when(chatContextService.buildSmartContext(anyString(), anyLong())).thenReturn("");
            when(messageRepository.findBySessionIdOrderByCreatedAtAsc(anyLong())).thenReturn(Arrays.asList());
            when(aiService.chatSync(anyString(), anyString())).thenReturn("AI Response");

            ChatMessage savedMessage = ChatMessage.builder()
                .role("assistant")
                .content("AI Response")
                .session(newSession)
                .build();
            savedMessage.setId(1L);

            when(messageRepository.save(any(ChatMessage.class)))
                .thenReturn(new ChatMessage(), savedMessage);

            // When - sendMessage() is called without sessionId
            ChatResponse response = chatService.sendMessage(request);

            // Then - new session is automatically created
            verify(sessionRepository).save(any(ChatSession.class));

            // And session is linked to reconciliation
            ArgumentCaptor<ChatSession> sessionCaptor = ArgumentCaptor.forClass(ChatSession.class);
            verify(sessionRepository).save(sessionCaptor.capture());
            assertThat(sessionCaptor.getValue().getReconciliation()).isEqualTo(testReconciliation);

            // And user message is added to new session
            ArgumentCaptor<ChatMessage> messageCaptor = ArgumentCaptor.forClass(ChatMessage.class);
            verify(messageRepository, times(2)).save(messageCaptor.capture());
            ChatMessage firstMessage = messageCaptor.getAllValues().get(0);
            assertThat(firstMessage.getContent()).isEqualTo(userMessage);

            // And session ID is returned
            assertThat(response.getSessionId()).isEqualTo(100L);
        }
    }

    // ==================== Message Streaming Tests ====================

    @Nested
    @DisplayName("Message Streaming Tests")
    class MessageStreamingTests {

        @Test
        @DisplayName("TC-CS-008: Stream AI Response")
        void shouldStreamAiResponse() {
            // Given - chat session and user message
            Long sessionId = 1L;
            String userMessage = "Explain fuzzy matching algorithm";

            ChatRequest request = new ChatRequest();
            request.setSessionId(sessionId);
            request.setMessage(userMessage);

            when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));

            when(chatContextService.buildDynamicContext(any(), anyLong())).thenReturn("Context");
            when(chatContextService.buildSmartContext(anyString(), anyLong())).thenReturn("");
            when(messageRepository.findBySessionIdOrderByCreatedAtAsc(anyLong())).thenReturn(Arrays.asList());

            // Simulate streaming response
            Flux<String> streamResponse = Flux.just("Fuzzy ", "matching ", "uses ", "Levenshtein ", "distance");
            when(aiService.chat(anyString(), anyString())).thenReturn(streamResponse);

            when(messageRepository.save(any(ChatMessage.class))).thenReturn(new ChatMessage());

            // When - streamAiResponse() is called
            Flux<String> result = chatService.streamMessage(request);

            // Then - Flux<String> is returned for streaming
            assertThat(result).isNotNull();

            // And tokens are emitted as they're generated
            StepVerifier.create(result)
                .expectNext("Fuzzy ")
                .expectNext("matching ")
                .expectNext("uses ")
                .expectNext("Levenshtein ")
                .expectNext("distance")
                .verifyComplete();

            // And complete response is assembled and saved to database
            verify(messageRepository, times(2)).save(any(ChatMessage.class));

            // Verify the assistant message was saved with complete content
            ArgumentCaptor<ChatMessage> messageCaptor = ArgumentCaptor.forClass(ChatMessage.class);
            verify(messageRepository, times(2)).save(messageCaptor.capture());

            List<ChatMessage> savedMessages = messageCaptor.getAllValues();
            ChatMessage userMsg = savedMessages.get(0);
            ChatMessage assistantMsg = savedMessages.get(1);

            assertThat(userMsg.getRole()).isEqualTo("user");
            assertThat(userMsg.getContent()).isEqualTo(userMessage);

            assertThat(assistantMsg.getRole()).isEqualTo("assistant");
            assertThat(assistantMsg.getContent()).isEqualTo("Fuzzy matching uses Levenshtein distance");
        }

        @Test
        @DisplayName("TC-CS-009: Handle Streaming Error")
        void shouldHandleStreamingError() {
            // Given - streaming is in progress and AI service connection drops mid-stream
            Long sessionId = 1L;
            ChatRequest request = new ChatRequest();
            request.setSessionId(sessionId);
            request.setMessage("Test message");

            when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));
            when(chatContextService.buildDynamicContext(any(), anyLong())).thenReturn("Context");
            when(chatContextService.buildSmartContext(anyString(), anyLong())).thenReturn("");
            when(messageRepository.findBySessionIdOrderByCreatedAtAsc(anyLong())).thenReturn(Arrays.asList());

            // Simulate streaming error
            Flux<String> errorStream = Flux.concat(
                Flux.just("Partial ", "response "),
                Flux.error(new RuntimeException("Connection dropped"))
            );
            when(aiService.chat(anyString(), anyString())).thenReturn(errorStream);
            when(messageRepository.save(any(ChatMessage.class))).thenReturn(new ChatMessage());

            // When - Flux error occurs
            Flux<String> result = chatService.streamMessage(request);

            // Then - error is propagated
            StepVerifier.create(result)
                .expectNext("Partial ")
                .expectNext("response ")
                .expectError(RuntimeException.class)
                .verify();

            // Note: In production, you might want to handle errors in doOnError
            // and save partial responses with error flags
        }
    }

    // ==================== Message History Tests ====================

    @Nested
    @DisplayName("Message History Tests")
    class MessageHistoryTests {

        @Test
        @DisplayName("TC-CS-010: Retrieve Message History")
        void shouldRetrieveMessageHistory() {
            // Given - session has 20 messages
            Long sessionId = 1L;
            List<ChatMessage> messages = createMessageList(20, testSession);

            when(messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId))
                .thenReturn(messages);

            // When - getMessages() is called
            List<ChatMessageResponse> result = chatService.getMessages(sessionId);

            // Then - messages are returned
            assertThat(result).hasSize(20);

            // And messages are ordered by timestamp ascending (verified by repository method name)
            verify(messageRepository).findBySessionIdOrderByCreatedAtAsc(sessionId);

            // And each message includes required fields
            for (int i = 0; i < result.size(); i++) {
                ChatMessageResponse msg = result.get(i);
                assertThat(msg.getId()).isNotNull();
                assertThat(msg.getSessionId()).isEqualTo(sessionId);
                assertThat(msg.getRole()).isIn("user", "assistant");
                assertThat(msg.getContent()).isNotBlank();
                assertThat(msg.getCreatedAt()).isNotNull();
            }
        }
    }

    // ==================== Session Management Tests ====================

    @Nested
    @DisplayName("Session Management Tests")
    class SessionManagementTests {

        @Test
        @DisplayName("TC-CS-011: List Active Sessions for User")
        void shouldListActiveSessionsForUser() {
            // Given - user has 3 ACTIVE sessions and 2 CLOSED sessions
            Long orgId = testOrganization.getId();

            ChatSession session1 = createTestSession(1L, testReconciliation);
            session1.setActive(true);

            ChatSession session2 = createTestSession(2L, null);
            session2.setActive(true);

            ChatSession session3 = createTestSession(3L, testReconciliation);
            session3.setActive(true);

            List<ChatSession> activeSessions = Arrays.asList(session1, session2, session3);

            when(sessionRepository.findByOrganizationIdAndActiveTrueOrderByUpdatedAtDesc(orgId))
                .thenReturn(activeSessions);

            // When - listSessions() is called
            List<ChatSessionResponse> result = chatService.getSessions();

            // Then - only 3 ACTIVE sessions are returned
            assertThat(result).hasSize(3);

            // And sessions are ordered by last message timestamp descending
            verify(sessionRepository).findByOrganizationIdAndActiveTrueOrderByUpdatedAtDesc(orgId);

            // And each session includes required fields
            for (ChatSessionResponse session : result) {
                assertThat(session.getId()).isNotNull();
                assertThat(session.getTitle()).isNotBlank();
                assertThat(session.getActive()).isTrue();
                assertThat(session.getCreatedAt()).isNotNull();
            }

            // Verify some sessions have reconciliationId
            assertThat(result.stream().filter(s -> s.getReconciliationId() != null).count())
                .isGreaterThan(0);
        }

        @Test
        @DisplayName("Should get single session by ID")
        void shouldGetSingleSessionById() {
            // Given
            Long sessionId = 1L;
            when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));

            // When
            ChatSessionResponse result = chatService.getSession(sessionId);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(sessionId);
            assertThat(result.getReconciliationId()).isEqualTo(testReconciliation.getId());
        }

        @Test
        @DisplayName("Should throw exception when session not found")
        void shouldThrowExceptionWhenSessionNotFound() {
            // Given
            Long invalidSessionId = 999L;
            when(sessionRepository.findById(invalidSessionId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> chatService.getSession(invalidSessionId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("ChatSession")
                .hasMessageContaining("999");
        }

        @Test
        @DisplayName("Should delete session by setting active flag to false")
        void shouldDeleteSessionBySoftDelete() {
            // Given
            Long sessionId = 1L;
            when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));
            when(sessionRepository.save(any(ChatSession.class))).thenReturn(testSession);

            // When
            chatService.deleteSession(sessionId);

            // Then
            ArgumentCaptor<ChatSession> sessionCaptor = ArgumentCaptor.forClass(ChatSession.class);
            verify(sessionRepository).save(sessionCaptor.capture());

            ChatSession updatedSession = sessionCaptor.getValue();
            assertThat(updatedSession.getActive()).isFalse();
        }
    }

    // ==================== Context Building Tests ====================

    @Nested
    @DisplayName("Context Building Integration Tests")
    class ContextBuildingTests {

        @Test
        @DisplayName("TC-CS-005: Build Context with Reconciliation Statistics")
        void shouldBuildContextWithReconciliationStatistics() {
            // Given - session linked to reconciliation with statistics
            testReconciliation.setMatchRate(92.3);
            testReconciliation.setTotalSourceRecords(1000);
            testReconciliation.setMatchedRecords(923);
            testReconciliation.setUnmatchedSourceRecords(77);
            testReconciliation.setStatus(ReconciliationStatus.COMPLETED);

            Long sessionId = 1L;
            ChatRequest request = new ChatRequest();
            request.setSessionId(sessionId);
            request.setMessage("What is the match rate?");

            when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));

            String expectedContext = "Match Rate: 92.3%, Total: 1000, Matched: 923, Unmatched: 77";
            when(chatContextService.buildDynamicContext(testSession, testOrganization.getId()))
                .thenReturn(expectedContext);
            when(chatContextService.buildSmartContext(anyString(), anyLong())).thenReturn("");
            when(messageRepository.findBySessionIdOrderByCreatedAtAsc(anyLong())).thenReturn(Arrays.asList());
            when(aiService.chatSync(anyString(), anyString())).thenReturn("Response");
            when(messageRepository.save(any(ChatMessage.class))).thenReturn(new ChatMessage());

            // When - message is sent (context is built internally)
            chatService.sendMessage(request);

            // Then - context includes reconciliation statistics
            verify(chatContextService).buildDynamicContext(testSession, testOrganization.getId());

            // Verify the context was passed to AI service
            ArgumentCaptor<String> contextCaptor = ArgumentCaptor.forClass(String.class);
            verify(aiService).chatSync(anyString(), contextCaptor.capture());

            String actualContext = contextCaptor.getValue();
            assertThat(actualContext).contains(expectedContext);
        }

        @Test
        @DisplayName("TC-CS-006: Include Recent Messages in Context")
        void shouldIncludeRecentMessagesInContext() {
            // Given - session has 10 previous messages
            Long sessionId = 1L;
            List<ChatMessage> previousMessages = createMessageList(10, testSession);

            ChatRequest request = new ChatRequest();
            request.setSessionId(sessionId);
            request.setMessage("Follow-up question");

            when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));
            when(chatContextService.buildDynamicContext(any(), anyLong())).thenReturn("Stats context");
            when(chatContextService.buildSmartContext(anyString(), anyLong())).thenReturn("");

            // Return previous messages when building context
            when(messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId))
                .thenReturn(previousMessages);

            when(aiService.chatSync(anyString(), anyString())).thenReturn("Response");
            when(messageRepository.save(any(ChatMessage.class))).thenReturn(new ChatMessage());

            // When - message is sent
            chatService.sendMessage(request);

            // Then - recent messages are retrieved for context
            verify(messageRepository).findBySessionIdOrderByCreatedAtAsc(sessionId);

            // And context is built with conversation history
            ArgumentCaptor<String> contextCaptor = ArgumentCaptor.forClass(String.class);
            verify(aiService).chatSync(anyString(), contextCaptor.capture());

            String actualContext = contextCaptor.getValue();
            assertThat(actualContext).contains("RECENT CONVERSATION");
            assertThat(actualContext).contains("USER:");
            assertThat(actualContext).contains("ASSISTANT:");
        }
    }

    // ==================== Test Data Helpers ====================

    private Organization createTestOrganization() {
        Organization org = new Organization();
        org.setId(1L);
        org.setName("Test Organization");
        return org;
    }

    private Reconciliation createTestReconciliation(Long id, String name) {
        Reconciliation rec = new Reconciliation();
        rec.setId(id);
        rec.setName(name);
        rec.setOrganization(testOrganization);
        rec.setSourceFile(sourceFile);
        rec.setTargetFile(targetFile);
        rec.setStatus(ReconciliationStatus.COMPLETED);
        rec.setMatchRate(85.5);
        rec.setTotalSourceRecords(1000);
        rec.setMatchedRecords(855);
        rec.setUnmatchedSourceRecords(145);
        return rec;
    }

    private ChatSession createTestSession(Long id, Reconciliation reconciliation) {
        ChatSession session = ChatSession.builder()
            .organization(testOrganization)
            .reconciliation(reconciliation)
            .title(reconciliation != null ? "Chat for: " + reconciliation.getName() : "General Chat")
            .active(true)
            .build();
        session.setId(id);
        ReflectionTestUtils.setField(session, "createdAt", LocalDateTime.now().minusMinutes(id));
        ReflectionTestUtils.setField(session, "updatedAt", LocalDateTime.now().minusMinutes(id));
        return session;
    }

    private UploadedFile createTestFile(Long id, String filename, int rows, int columns) {
        UploadedFile file = new UploadedFile();
        file.setId(id);
        file.setOriginalFilename(filename);
        file.setRowCount(rows);
        file.setColumnCount(columns);
        return file;
    }

    private List<ChatMessage> createMessageList(int count, ChatSession session) {
        List<ChatMessage> messages = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            ChatMessage msg = ChatMessage.builder()
                .role(i % 2 == 0 ? "user" : "assistant")
                .content("Message " + (i + 1))
                .session(session)
                .build();
            msg.setId((long) (i + 1));
            ReflectionTestUtils.setField(msg, "createdAt", LocalDateTime.now().minusMinutes(count - i));
            messages.add(msg);
        }
        return messages;
    }
}
