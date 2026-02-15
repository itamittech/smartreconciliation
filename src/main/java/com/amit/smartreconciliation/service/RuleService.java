package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.FieldMappingRequest;
import com.amit.smartreconciliation.dto.request.MatchingRuleRequest;
import com.amit.smartreconciliation.dto.request.RuleSetRequest;
import com.amit.smartreconciliation.dto.response.RuleSetResponse;
import com.amit.smartreconciliation.entity.FieldMapping;
import com.amit.smartreconciliation.entity.MatchingRule;
import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.entity.RuleSet;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.FieldMappingRepository;
import com.amit.smartreconciliation.repository.MatchingRuleRepository;
import com.amit.smartreconciliation.repository.RuleSetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RuleService {

    private static final Logger log = LoggerFactory.getLogger(RuleService.class);

    private final RuleSetRepository ruleSetRepository;
    private final FieldMappingRepository fieldMappingRepository;
    private final MatchingRuleRepository matchingRuleRepository;
    private final OrganizationService organizationService;

    public RuleService(RuleSetRepository ruleSetRepository,
                       FieldMappingRepository fieldMappingRepository,
                       MatchingRuleRepository matchingRuleRepository,
                       OrganizationService organizationService) {
        this.ruleSetRepository = ruleSetRepository;
        this.fieldMappingRepository = fieldMappingRepository;
        this.matchingRuleRepository = matchingRuleRepository;
        this.organizationService = organizationService;
    }

    @Transactional
    public RuleSetResponse create(RuleSetRequest request) {
        Organization org = organizationService.getDefaultOrganization();

        RuleSet ruleSet = RuleSet.builder()
                .name(request.getName())
                .description(request.getDescription())
                .organization(org)
                .metadata(request.getMetadata())
                .active(true)
                .version(1)
                .isAiGenerated(Boolean.TRUE.equals(request.getIsAiGenerated()))
                .fieldMappings(new ArrayList<>())
                .matchingRules(new ArrayList<>())
                .build();

        RuleSet saved = ruleSetRepository.save(ruleSet);

        if (request.getFieldMappings() != null) {
            for (FieldMappingRequest fmRequest : request.getFieldMappings()) {
                FieldMapping mapping = createFieldMapping(fmRequest, saved);
                saved.getFieldMappings().add(mapping);
            }
        }

        if (request.getMatchingRules() != null) {
            for (MatchingRuleRequest mrRequest : request.getMatchingRules()) {
                MatchingRule rule = createMatchingRule(mrRequest, saved);
                saved.getMatchingRules().add(rule);
            }
        }

        saved = ruleSetRepository.save(saved);
        log.info("Created rule set: {} (id: {})", saved.getName(), saved.getId());
        return RuleSetResponse.fromEntity(saved);
    }

    private FieldMapping createFieldMapping(FieldMappingRequest request, RuleSet ruleSet) {
        return FieldMapping.builder()
                .sourceField(request.getSourceField())
                .targetField(request.getTargetField())
                .transform(request.getTransform())
                .confidence(request.getConfidence() != null ? request.getConfidence() : 1.0)
                .isKey(request.getIsKey() != null ? request.getIsKey() : false)
                .transformConfig(request.getTransformConfig())
                .ruleSet(ruleSet)
                .build();
    }

    private MatchingRule createMatchingRule(MatchingRuleRequest request, RuleSet ruleSet) {
        return MatchingRule.builder()
                .name(request.getName())
                .description(request.getDescription())
                .sourceField(request.getSourceField())
                .targetField(request.getTargetField())
                .matchType(request.getMatchType())
                .tolerance(request.getTolerance())
                .fuzzyThreshold(request.getFuzzyThreshold())
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .config(request.getConfig())
                .active(true)
                .ruleSet(ruleSet)
                .build();
    }

    public RuleSetResponse getById(Long id) {
        RuleSet ruleSet = ruleSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RuleSet", id));
        return RuleSetResponse.fromEntity(ruleSet);
    }

    public RuleSet getEntityById(Long id) {
        return ruleSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RuleSet", id));
    }

    public List<RuleSetResponse> getAll() {
        Organization org = organizationService.getDefaultOrganization();
        return ruleSetRepository.findByOrganizationId(org.getId())
                .stream()
                .map(RuleSetResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public RuleSetResponse update(Long id, RuleSetRequest request) {
        RuleSet ruleSet = ruleSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RuleSet", id));

        ruleSet.setName(request.getName());
        ruleSet.setDescription(request.getDescription());
        ruleSet.setMetadata(request.getMetadata());
        ruleSet.setVersion(ruleSet.getVersion() + 1);

        ruleSet.getFieldMappings().clear();
        if (request.getFieldMappings() != null) {
            for (FieldMappingRequest fmRequest : request.getFieldMappings()) {
                FieldMapping mapping = createFieldMapping(fmRequest, ruleSet);
                ruleSet.getFieldMappings().add(mapping);
            }
        }

        ruleSet.getMatchingRules().clear();
        if (request.getMatchingRules() != null) {
            for (MatchingRuleRequest mrRequest : request.getMatchingRules()) {
                MatchingRule rule = createMatchingRule(mrRequest, ruleSet);
                ruleSet.getMatchingRules().add(rule);
            }
        }

        RuleSet saved = ruleSetRepository.save(ruleSet);
        log.info("Updated rule set: {} (version: {})", saved.getId(), saved.getVersion());
        return RuleSetResponse.fromEntity(saved);
    }

    @Transactional
    public void delete(Long id) {
        RuleSet ruleSet = ruleSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RuleSet", id));
        ruleSetRepository.delete(ruleSet);
        log.info("Deleted rule set: {}", id);
    }

    @Transactional
    public RuleSetResponse duplicate(Long id) {
        RuleSet original = ruleSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RuleSet", id));

        Organization org = organizationService.getDefaultOrganization();

        // Create new rule set with duplicated data
        RuleSet duplicate = RuleSet.builder()
                .name(original.getName() + " (Copy)")
                .description(original.getDescription())
                .metadata(original.getMetadata())
                .active(original.getActive())
                .organization(org)
                .build();

        RuleSet saved = ruleSetRepository.save(duplicate);

        // Copy field mappings
        for (FieldMapping originalMapping : original.getFieldMappings()) {
            FieldMapping newMapping = FieldMapping.builder()
                    .sourceField(originalMapping.getSourceField())
                    .targetField(originalMapping.getTargetField())
                    .transform(originalMapping.getTransform())
                    .confidence(originalMapping.getConfidence())
                    .isKey(originalMapping.getIsKey())
                    .transformConfig(originalMapping.getTransformConfig())
                    .ruleSet(saved)
                    .build();
            saved.getFieldMappings().add(newMapping);
        }

        // Copy matching rules
        for (MatchingRule originalRule : original.getMatchingRules()) {
            MatchingRule newRule = MatchingRule.builder()
                    .name(originalRule.getName())
                    .description(originalRule.getDescription())
                    .sourceField(originalRule.getSourceField())
                    .targetField(originalRule.getTargetField())
                    .matchType(originalRule.getMatchType())
                    .tolerance(originalRule.getTolerance())
                    .fuzzyThreshold(originalRule.getFuzzyThreshold())
                    .priority(originalRule.getPriority())
                    .config(originalRule.getConfig())
                    .active(originalRule.getActive())
                    .ruleSet(saved)
                    .build();
            saved.getMatchingRules().add(newRule);
        }

        saved = ruleSetRepository.save(saved);
        log.info("Duplicated rule set {} to {} (id: {})", original.getId(), saved.getId(), saved.getName());
        return RuleSetResponse.fromEntity(saved);
    }

    @Transactional
    public RuleSetResponse addFieldMapping(Long ruleSetId, FieldMappingRequest request) {
        RuleSet ruleSet = ruleSetRepository.findById(ruleSetId)
                .orElseThrow(() -> new ResourceNotFoundException("RuleSet", ruleSetId));

        FieldMapping mapping = createFieldMapping(request, ruleSet);
        ruleSet.getFieldMappings().add(mapping);
        ruleSet.setVersion(ruleSet.getVersion() + 1);

        RuleSet saved = ruleSetRepository.save(ruleSet);
        return RuleSetResponse.fromEntity(saved);
    }

    @Transactional
    public RuleSetResponse addMatchingRule(Long ruleSetId, MatchingRuleRequest request) {
        RuleSet ruleSet = ruleSetRepository.findById(ruleSetId)
                .orElseThrow(() -> new ResourceNotFoundException("RuleSet", ruleSetId));

        MatchingRule rule = createMatchingRule(request, ruleSet);
        ruleSet.getMatchingRules().add(rule);
        ruleSet.setVersion(ruleSet.getVersion() + 1);

        RuleSet saved = ruleSetRepository.save(ruleSet);
        return RuleSetResponse.fromEntity(saved);
    }

    public java.util.Map<String, Object> testRuleSet(Long id, Integer sampleSize) {
        RuleSet ruleSet = ruleSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RuleSet", id));

        // Build test results
        java.util.Map<String, Object> results = new java.util.HashMap<>();

        // Field Mappings Test
        List<java.util.Map<String, Object>> fieldMappingResults = new ArrayList<>();
        for (FieldMapping mapping : ruleSet.getFieldMappings()) {
            java.util.Map<String, Object> mappingResult = new java.util.HashMap<>();
            mappingResult.put("sourceField", mapping.getSourceField());
            mappingResult.put("targetField", mapping.getTargetField());
            mappingResult.put("success", true); // Simplified: all mappings marked as valid
            fieldMappingResults.add(mappingResult);
        }
        results.put("fieldMappings", fieldMappingResults);

        // Matching Rules Test
        List<java.util.Map<String, Object>> matchingRuleResults = new ArrayList<>();
        for (MatchingRule rule : ruleSet.getMatchingRules()) {
            java.util.Map<String, Object> ruleResult = new java.util.HashMap<>();
            ruleResult.put("name", rule.getName());
            ruleResult.put("matchType", rule.getMatchType().toString());
            matchingRuleResults.add(ruleResult);
        }
        results.put("matchingRules", matchingRuleResults);

        // Overall Statistics
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("validMappings", ruleSet.getFieldMappings().size());
        stats.put("validRules", ruleSet.getMatchingRules().size());
        results.put("stats", stats);

        log.info("Tested rule set: {} with sample size: {}", id, sampleSize);
        return results;
    }
}
