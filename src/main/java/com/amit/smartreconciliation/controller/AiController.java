package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.AiConfigRequest;
import com.amit.smartreconciliation.dto.request.AiMappingSuggestionRequest;
import com.amit.smartreconciliation.dto.request.AiRuleSuggestionRequest;
import com.amit.smartreconciliation.dto.response.AiConfigResponse;
import com.amit.smartreconciliation.dto.response.AiMappingSuggestionResponse;
import com.amit.smartreconciliation.dto.response.AiRuleSuggestionResponse;
import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.service.AiService;
import com.amit.smartreconciliation.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final AiService aiService;
    private final SettingsService settingsService;

    public AiController(AiService aiService, SettingsService settingsService) {
        this.aiService = aiService;
        this.settingsService = settingsService;
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

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<AiConfigResponse>> getConfig() {
        AiConfigResponse response = settingsService.getAiConfig();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/config")
    public ResponseEntity<ApiResponse<AiConfigResponse>> updateConfig(
            @Valid @RequestBody AiConfigRequest request) {
        AiConfigResponse response = settingsService.updateAiProvider(request);
        String message = "AI provider updated to " + request.getProvider() +
                        ". Restart the application for changes to take effect.";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }
}
