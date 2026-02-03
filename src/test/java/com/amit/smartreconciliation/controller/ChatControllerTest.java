package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.ChatRequest;
import com.amit.smartreconciliation.dto.response.ChatMessageResponse;
import com.amit.smartreconciliation.dto.response.ChatResponse;
import com.amit.smartreconciliation.dto.response.ChatSessionResponse;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Comprehensive Integration tests for ChatController
 * Feature: Chat System
 * Test Level: Integration Test (Controller Layer with MockMvc)
 * Total Test Cases: 6
 *
 * Testing Strategy:
 * - Use @WebMvcTest to test controller layer in isolation
 * - Mock ChatService to avoid actual business logic execution
 * - Test all REST endpoints with proper HTTP methods and status codes
 * - Validate request/response JSON serialization
 * - Test error handling and validation
 * - Test Server-Sent Events (SSE) streaming endpoint
 */
@WebMvcTest(ChatController.class)
@DisplayName("ChatController Integration Tests")
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatService chatService;

    // ==================== Session Creation Tests ====================

    @Nested
    @DisplayName("POST /api/v1/chat/sessions")
    class CreateSessionTests {

        @Test
        @DisplayName("TC-CC-001: Create Chat Session with reconciliationId")
        void shouldCreateChatSessionWithReconciliation() throws Exception {
            // Given
            Long reconciliationId = 1L;
            ChatSessionResponse response = ChatSessionResponse.builder()
                .id(1L)
                .title("Chat for: Test Reconciliation")
                .reconciliationId(reconciliationId)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

            when(chatService.createSession(reconciliationId)).thenReturn(response);

            // When & Then
            mockMvc.perform(post("/api/v1/chat/sessions")
                    .param("reconciliationId", reconciliationId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Chat session created"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.reconciliationId").value(reconciliationId))
                .andExpect(jsonPath("$.data.active").value(true))
                .andExpect(jsonPath("$.data.title").value("Chat for: Test Reconciliation"));

            verify(chatService).createSession(reconciliationId);
        }

        @Test
        @DisplayName("TC-CC-001: Create Chat Session without reconciliationId")
        void shouldCreateChatSessionWithoutReconciliation() throws Exception {
            // Given
            ChatSessionResponse response = ChatSessionResponse.builder()
                .id(2L)
                .title("New Chat Session")
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

            when(chatService.createSession(null)).thenReturn(response);

            // When & Then
            mockMvc.perform(post("/api/v1/chat/sessions")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(2))
                .andExpect(jsonPath("$.data.reconciliationId").doesNotExist())
                .andExpect(jsonPath("$.data.title").value("New Chat Session"));

            verify(chatService).createSession(null);
        }

        @Test
        @DisplayName("Should return 404 when reconciliation not found")
        void shouldReturn404WhenReconciliationNotFound() throws Exception {
            // Given
            Long invalidReconciliationId = 999L;
            when(chatService.createSession(invalidReconciliationId))
                .thenThrow(new ResourceNotFoundException("Reconciliation", invalidReconciliationId));

            // When & Then
            mockMvc.perform(post("/api/v1/chat/sessions")
                    .param("reconciliationId", invalidReconciliationId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

            verify(chatService).createSession(invalidReconciliationId);
        }
    }

    // ==================== Message Sending Tests ====================

    @Nested
    @DisplayName("POST /api/v1/chat/message")
    class SendMessageTests {

        @Test
        @DisplayName("TC-CC-002: Send Message to Existing Session")
        void shouldSendMessageToExistingSession() throws Exception {
            // Given
            ChatRequest request = new ChatRequest();
            request.setSessionId(1L);
            request.setMessage("What is the match rate?");

            ChatResponse response = ChatResponse.builder()
                .sessionId(1L)
                .messageId(2L)
                .role("assistant")
                .response("The current match rate is 85.5%")
                .createdAt(LocalDateTime.now())
                .build();

            when(chatService.sendMessage(any(ChatRequest.class))).thenReturn(response);

            // When & Then
            mockMvc.perform(post("/api/v1/chat/message")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sessionId").value(1))
                .andExpect(jsonPath("$.data.messageId").value(2))
                .andExpect(jsonPath("$.data.role").value("assistant"))
                .andExpect(jsonPath("$.data.response").value("The current match rate is 85.5%"))
                .andExpect(jsonPath("$.data.createdAt").exists());

            verify(chatService).sendMessage(any(ChatRequest.class));
        }

        @Test
        @DisplayName("TC-CC-002: Send Message without Session (Auto-create)")
        void shouldSendMessageWithoutSession() throws Exception {
            // Given
            ChatRequest request = new ChatRequest();
            request.setReconciliationId(1L);
            request.setMessage("What are the exceptions?");

            ChatResponse response = ChatResponse.builder()
                .sessionId(100L) // Auto-created session
                .messageId(1L)
                .role("assistant")
                .response("There are 77 open exceptions")
                .createdAt(LocalDateTime.now())
                .build();

            when(chatService.sendMessage(any(ChatRequest.class))).thenReturn(response);

            // When & Then
            mockMvc.perform(post("/api/v1/chat/message")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.sessionId").value(100))
                .andExpect(jsonPath("$.data.response").value("There are 77 open exceptions"));

            verify(chatService).sendMessage(any(ChatRequest.class));
        }

        @Test
        @DisplayName("Should return 400 when message is blank")
        void shouldReturn400WhenMessageIsBlank() throws Exception {
            // Given
            ChatRequest request = new ChatRequest();
            request.setSessionId(1L);
            request.setMessage(""); // Blank message

            // When & Then
            mockMvc.perform(post("/api/v1/chat/message")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

            verify(chatService, never()).sendMessage(any(ChatRequest.class));
        }

        @Test
        @DisplayName("Should return 404 when session not found")
        void shouldReturn404WhenSessionNotFound() throws Exception {
            // Given
            ChatRequest request = new ChatRequest();
            request.setSessionId(999L);
            request.setMessage("Test message");

            when(chatService.sendMessage(any(ChatRequest.class)))
                .thenThrow(new ResourceNotFoundException("ChatSession", 999L));

            // When & Then
            mockMvc.perform(post("/api/v1/chat/message")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());

            verify(chatService).sendMessage(any(ChatRequest.class));
        }
    }

    // ==================== Streaming Tests ====================

    @Nested
    @DisplayName("POST /api/v1/chat/stream")
    class StreamMessageTests {

        @Test
        @DisplayName("TC-CC-003: Stream AI Response using Server-Sent Events")
        void shouldStreamAiResponse() throws Exception {
            // Given
            ChatRequest request = new ChatRequest();
            request.setSessionId(1L);
            request.setMessage("Explain fuzzy matching");

            Flux<String> streamResponse = Flux.just(
                "Fuzzy ",
                "matching ",
                "uses ",
                "Levenshtein ",
                "distance"
            );

            when(chatService.streamMessage(any(ChatRequest.class))).thenReturn(streamResponse);

            // When & Then
            mockMvc.perform(post("/api/v1/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/event-stream"))
                .andExpect(content().string(containsString("data: Fuzzy ")))
                .andExpect(content().string(containsString("data: matching ")))
                .andExpect(content().string(containsString("data: uses ")))
                .andExpect(content().string(containsString("data: Levenshtein ")))
                .andExpect(content().string(containsString("data: distance")));

            verify(chatService).streamMessage(any(ChatRequest.class));
        }

        @Test
        @DisplayName("Should return 400 when message is blank in streaming")
        void shouldReturn400WhenMessageIsBlankInStreaming() throws Exception {
            // Given
            ChatRequest request = new ChatRequest();
            request.setSessionId(1L);
            request.setMessage("");

            // When & Then
            mockMvc.perform(post("/api/v1/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

            verify(chatService, never()).streamMessage(any(ChatRequest.class));
        }
    }

    // ==================== Message History Tests ====================

    @Nested
    @DisplayName("GET /api/v1/chat/sessions/{id}/messages")
    class GetMessagesTests {

        @Test
        @DisplayName("TC-CC-004: Get Message History for Session")
        void shouldGetMessageHistory() throws Exception {
            // Given
            Long sessionId = 1L;
            List<ChatMessageResponse> messages = Arrays.asList(
                ChatMessageResponse.builder()
                    .id(1L)
                    .sessionId(sessionId)
                    .role("user")
                    .content("What is the match rate?")
                    .createdAt(LocalDateTime.now().minusMinutes(5))
                    .build(),
                ChatMessageResponse.builder()
                    .id(2L)
                    .sessionId(sessionId)
                    .role("assistant")
                    .content("The match rate is 85.5%")
                    .createdAt(LocalDateTime.now().minusMinutes(4))
                    .build(),
                ChatMessageResponse.builder()
                    .id(3L)
                    .sessionId(sessionId)
                    .role("user")
                    .content("How many exceptions?")
                    .createdAt(LocalDateTime.now().minusMinutes(3))
                    .build(),
                ChatMessageResponse.builder()
                    .id(4L)
                    .sessionId(sessionId)
                    .role("assistant")
                    .content("There are 77 exceptions")
                    .createdAt(LocalDateTime.now().minusMinutes(2))
                    .build()
            );

            when(chatService.getMessages(sessionId)).thenReturn(messages);

            // When & Then
            mockMvc.perform(get("/api/v1/chat/sessions/{id}/messages", sessionId)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(4)))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].role").value("user"))
                .andExpect(jsonPath("$.data[0].content").value("What is the match rate?"))
                .andExpect(jsonPath("$.data[1].role").value("assistant"))
                .andExpect(jsonPath("$.data[2].role").value("user"))
                .andExpect(jsonPath("$.data[3].role").value("assistant"));

            verify(chatService).getMessages(sessionId);
        }

        @Test
        @DisplayName("Should return empty list when session has no messages")
        void shouldReturnEmptyListWhenNoMessages() throws Exception {
            // Given
            Long sessionId = 1L;
            when(chatService.getMessages(sessionId)).thenReturn(Arrays.asList());

            // When & Then
            mockMvc.perform(get("/api/v1/chat/sessions/{id}/messages", sessionId)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(0)));

            verify(chatService).getMessages(sessionId);
        }
    }

    // ==================== Session Management Tests ====================

    @Nested
    @DisplayName("Session Management Endpoints")
    class SessionManagementTests {

        @Test
        @DisplayName("TC-CC-005: List User Sessions")
        void shouldListUserSessions() throws Exception {
            // Given
            List<ChatSessionResponse> sessions = Arrays.asList(
                ChatSessionResponse.builder()
                    .id(1L)
                    .title("Chat for: Reconciliation A")
                    .reconciliationId(10L)
                    .active(true)
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .build(),
                ChatSessionResponse.builder()
                    .id(2L)
                    .title("General Chat")
                    .active(true)
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build(),
                ChatSessionResponse.builder()
                    .id(3L)
                    .title("Chat for: Reconciliation B")
                    .reconciliationId(20L)
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .build()
            );

            when(chatService.getSessions()).thenReturn(sessions);

            // When & Then
            mockMvc.perform(get("/api/v1/chat/sessions")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(3)))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].reconciliationId").value(10))
                .andExpect(jsonPath("$.data[0].active").value(true))
                .andExpect(jsonPath("$.data[1].reconciliationId").doesNotExist())
                .andExpect(jsonPath("$.data[2].reconciliationId").value(20));

            verify(chatService).getSessions();
        }

        @Test
        @DisplayName("Should get single session by ID")
        void shouldGetSingleSession() throws Exception {
            // Given
            Long sessionId = 1L;
            ChatSessionResponse response = ChatSessionResponse.builder()
                .id(sessionId)
                .title("Test Session")
                .reconciliationId(10L)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

            when(chatService.getSession(sessionId)).thenReturn(response);

            // When & Then
            mockMvc.perform(get("/api/v1/chat/sessions/{id}", sessionId)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(sessionId))
                .andExpect(jsonPath("$.data.title").value("Test Session"))
                .andExpect(jsonPath("$.data.reconciliationId").value(10));

            verify(chatService).getSession(sessionId);
        }

        @Test
        @DisplayName("Should return 404 when session not found")
        void shouldReturn404WhenSessionNotFound() throws Exception {
            // Given
            Long invalidSessionId = 999L;
            when(chatService.getSession(invalidSessionId))
                .thenThrow(new ResourceNotFoundException("ChatSession", invalidSessionId));

            // When & Then
            mockMvc.perform(get("/api/v1/chat/sessions/{id}", invalidSessionId)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

            verify(chatService).getSession(invalidSessionId);
        }

        @Test
        @DisplayName("TC-CC-006: Delete Session")
        void shouldDeleteSession() throws Exception {
            // Given
            Long sessionId = 1L;
            doNothing().when(chatService).deleteSession(sessionId);

            // When & Then
            mockMvc.perform(delete("/api/v1/chat/sessions/{id}", sessionId)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Chat session deleted"));

            verify(chatService).deleteSession(sessionId);
        }

        @Test
        @DisplayName("Should return 404 when deleting non-existent session")
        void shouldReturn404WhenDeletingNonExistentSession() throws Exception {
            // Given
            Long invalidSessionId = 999L;
            doThrow(new ResourceNotFoundException("ChatSession", invalidSessionId))
                .when(chatService).deleteSession(invalidSessionId);

            // When & Then
            mockMvc.perform(delete("/api/v1/chat/sessions/{id}", invalidSessionId)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

            verify(chatService).deleteSession(invalidSessionId);
        }
    }

    // ==================== Integration Scenarios ====================

    @Nested
    @DisplayName("Integration Scenarios")
    class IntegrationScenarios {

        @Test
        @DisplayName("Complete chat flow: create session -> send message -> get messages")
        void shouldHandleCompleteChatFlow() throws Exception {
            // Step 1: Create session
            Long reconciliationId = 1L;
            ChatSessionResponse sessionResponse = ChatSessionResponse.builder()
                .id(1L)
                .title("Chat for: Test Reconciliation")
                .reconciliationId(reconciliationId)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

            when(chatService.createSession(reconciliationId)).thenReturn(sessionResponse);

            mockMvc.perform(post("/api/v1/chat/sessions")
                    .param("reconciliationId", reconciliationId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1));

            // Step 2: Send message
            ChatRequest request = new ChatRequest();
            request.setSessionId(1L);
            request.setMessage("What is the match rate?");

            ChatResponse chatResponse = ChatResponse.builder()
                .sessionId(1L)
                .messageId(2L)
                .role("assistant")
                .response("The match rate is 85.5%")
                .createdAt(LocalDateTime.now())
                .build();

            when(chatService.sendMessage(any(ChatRequest.class))).thenReturn(chatResponse);

            mockMvc.perform(post("/api/v1/chat/message")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.response").value("The match rate is 85.5%"));

            // Step 3: Get messages
            List<ChatMessageResponse> messages = Arrays.asList(
                ChatMessageResponse.builder()
                    .id(1L)
                    .sessionId(1L)
                    .role("user")
                    .content("What is the match rate?")
                    .createdAt(LocalDateTime.now())
                    .build(),
                ChatMessageResponse.builder()
                    .id(2L)
                    .sessionId(1L)
                    .role("assistant")
                    .content("The match rate is 85.5%")
                    .createdAt(LocalDateTime.now())
                    .build()
            );

            when(chatService.getMessages(1L)).thenReturn(messages);

            mockMvc.perform(get("/api/v1/chat/sessions/{id}/messages", 1L)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));

            // Verify all service calls
            verify(chatService).createSession(reconciliationId);
            verify(chatService).sendMessage(any(ChatRequest.class));
            verify(chatService).getMessages(1L);
        }
    }
}
