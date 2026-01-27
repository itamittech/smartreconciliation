package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.ChatRequest;
import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.dto.response.ChatMessageResponse;
import com.amit.smartreconciliation.dto.response.ChatResponse;
import com.amit.smartreconciliation.dto.response.ChatSessionResponse;
import com.amit.smartreconciliation.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ChatSessionResponse>> createSession(
            @RequestParam(required = false) Long reconciliationId) {
        ChatSessionResponse response = chatService.createSession(reconciliationId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Chat session created", response));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<ChatSessionResponse>>> getSessions() {
        List<ChatSessionResponse> response = chatService.getSessions();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<ChatSessionResponse>> getSession(@PathVariable Long id) {
        ChatSessionResponse response = chatService.getSession(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/sessions/{id}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(@PathVariable Long id) {
        List<ChatMessageResponse> response = chatService.getMessages(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable Long id) {
        chatService.deleteSession(id);
        return ResponseEntity.ok(ApiResponse.success("Chat session deleted", null));
    }

    @PostMapping("/message")
    public ResponseEntity<ApiResponse<ChatResponse>> sendMessage(
            @Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.sendMessage(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamMessage(@Valid @RequestBody ChatRequest request) {
        return chatService.streamMessage(request)
                .map(content -> "data: " + content + "\n\n");
    }
}
