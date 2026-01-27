package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.AiMappingSuggestionRequest;
import com.amit.smartreconciliation.dto.response.AiMappingSuggestionResponse;
import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/suggest-mapping")
    public ResponseEntity<ApiResponse<AiMappingSuggestionResponse>> suggestMapping(
            @Valid @RequestBody AiMappingSuggestionRequest request) {
        AiMappingSuggestionResponse response = aiService.suggestMappings(request);
        return ResponseEntity.ok(ApiResponse.success("Mapping suggestions generated", response));
    }

    @PostMapping("/suggest-rules")
    public ResponseEntity<ApiResponse<String>> suggestRules(
            @RequestParam Long sourceFileId,
            @RequestParam Long targetFileId,
            @RequestParam(required = false) List<String> mappedFields) {
        String response = aiService.suggestRules(sourceFileId, targetFileId,
                mappedFields != null ? mappedFields : List.of());
        return ResponseEntity.ok(ApiResponse.success("Rule suggestions generated", response));
    }
}
