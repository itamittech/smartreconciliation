package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.request.FieldMappingRequest;
import com.amit.smartreconciliation.dto.request.MatchingRuleRequest;
import com.amit.smartreconciliation.dto.request.RuleSetRequest;
import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.dto.response.RuleSetResponse;
import com.amit.smartreconciliation.service.RuleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rules")
public class RuleController {

    private final RuleService ruleService;

    public RuleController(RuleService ruleService) {
        this.ruleService = ruleService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RuleSetResponse>> create(
            @Valid @RequestBody RuleSetRequest request) {
        RuleSetResponse response = ruleService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Rule set created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RuleSetResponse>> getById(@PathVariable Long id) {
        RuleSetResponse response = ruleService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RuleSetResponse>>> getAll() {
        List<RuleSetResponse> response = ruleService.getAll();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RuleSetResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody RuleSetRequest request) {
        RuleSetResponse response = ruleService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Rule set updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        ruleService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Rule set deleted successfully", null));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ApiResponse<RuleSetResponse>> duplicate(@PathVariable Long id) {
        RuleSetResponse response = ruleService.duplicate(id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Rule set duplicated successfully", response));
    }

    @PostMapping("/{id}/mappings")
    public ResponseEntity<ApiResponse<RuleSetResponse>> addFieldMapping(
            @PathVariable Long id,
            @Valid @RequestBody FieldMappingRequest request) {
        RuleSetResponse response = ruleService.addFieldMapping(id, request);
        return ResponseEntity.ok(ApiResponse.success("Field mapping added successfully", response));
    }

    @PostMapping("/{id}/matching-rules")
    public ResponseEntity<ApiResponse<RuleSetResponse>> addMatchingRule(
            @PathVariable Long id,
            @Valid @RequestBody MatchingRuleRequest request) {
        RuleSetResponse response = ruleService.addMatchingRule(id, request);
        return ResponseEntity.ok(ApiResponse.success("Matching rule added successfully", response));
    }
}
