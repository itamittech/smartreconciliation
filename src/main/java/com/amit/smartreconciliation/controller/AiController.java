package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.AiMappingSuggestionRequest;
import com.amit.smartreconciliation.dto.request.AiRuleSuggestionRequest;
import com.amit.smartreconciliation.dto.response.AiMappingSuggestionResponse;
import com.amit.smartreconciliation.dto.response.AiRuleSuggestionResponse;
import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/suggest-mappings")
    public ResponseEntity<ApiResponse<AiMappingSuggestionResponse>> suggestMappings(
            @Valid @RequestBody AiMappingSuggestionRequest request) {
        AiMappingSuggestionResponse response = aiService.suggestMappings(request);
        return ResponseEntity.ok(ApiResponse.success("Mapping suggestions generated", response));
    }

    @PostMapping("/suggest-rules")
    public ResponseEntity<ApiResponse<AiRuleSuggestionResponse>> suggestRules(
            @Valid @RequestBody AiRuleSuggestionRequest request) {
        AiRuleSuggestionResponse response = aiService.suggestRules(
                request.getSourceFileId(), request.getTargetFileId(), request.getMappings());
        return ResponseEntity.ok(ApiResponse.success("Rule suggestions generated", response));
    }
}
