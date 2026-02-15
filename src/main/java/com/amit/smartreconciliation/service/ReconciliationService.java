package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.ReconciliationRequest;
import com.amit.smartreconciliation.dto.response.ReconciliationResponse;
import com.amit.smartreconciliation.entity.*;
import com.amit.smartreconciliation.enums.*;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.ReconciliationExceptionRepository;
import com.amit.smartreconciliation.repository.ReconciliationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReconciliationService {

    private static final Logger log = LoggerFactory.getLogger(ReconciliationService.class);

    private static final int AI_SUGGESTION_BATCH_SIZE = 10;
    private static final int AI_SUGGESTION_MAX_EXCEPTIONS = 50;

    private final ReconciliationRepository reconciliationRepository;
    private final ReconciliationExceptionRepository exceptionRepository;
    private final OrganizationService organizationService;
    private final FileUploadService fileUploadService;
    private final RuleService ruleService;
    private final FileParserService fileParserService;
    private final AiService aiService;

    public ReconciliationService(ReconciliationRepository reconciliationRepository,
                                ReconciliationExceptionRepository exceptionRepository,
                                OrganizationService organizationService,
                                FileUploadService fileUploadService,
                                RuleService ruleService,
                                FileParserService fileParserService,
                                AiService aiService) {
        this.reconciliationRepository = reconciliationRepository;
        this.exceptionRepository = exceptionRepository;
        this.organizationService = organizationService;
        this.fileUploadService = fileUploadService;
        this.ruleService = ruleService;
        this.fileParserService = fileParserService;
        this.aiService = aiService;
    }

    @Transactional
    public ReconciliationResponse create(ReconciliationRequest request) {
        Organization org = organizationService.getDefaultOrganization();
        UploadedFile sourceFile = fileUploadService.getEntityById(request.getSourceFileId());
        UploadedFile targetFile = fileUploadService.getEntityById(request.getTargetFileId());
        RuleSet ruleSet = ruleService.getEntityById(request.getRuleSetId());

        Reconciliation reconciliation = Reconciliation.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(ReconciliationStatus.PENDING)
                .sourceFile(sourceFile)
                .targetFile(targetFile)
                .ruleSet(ruleSet)
                .organization(org)
                .progress(0)
                .build();

        Reconciliation saved = reconciliationRepository.save(reconciliation);
        log.info("Created reconciliation: {} (id: {})", saved.getName(), saved.getId());

        executeReconciliationAsync(saved.getId());

        return ReconciliationResponse.fromEntity(saved);
    }

    @Async
    @Transactional
    public void executeReconciliationAsync(Long reconciliationId) {
        Reconciliation reconciliation = reconciliationRepository.findById(reconciliationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reconciliation", reconciliationId));

        try {
            reconciliation.setStatus(ReconciliationStatus.IN_PROGRESS);
            reconciliation.setStartedAt(LocalDateTime.now());
            reconciliation.setProgress(5);
            reconciliationRepository.save(reconciliation);

            FileParserService.ParseResult sourceData = fileParserService.parseFile(
                    Paths.get(reconciliation.getSourceFile().getFilePath()));
            reconciliation.setProgress(20);
            reconciliation.setTotalSourceRecords(sourceData.getRowCount());
            reconciliationRepository.save(reconciliation);

            FileParserService.ParseResult targetData = fileParserService.parseFile(
                    Paths.get(reconciliation.getTargetFile().getFilePath()));
            reconciliation.setProgress(40);
            reconciliation.setTotalTargetRecords(targetData.getRowCount());
            reconciliationRepository.save(reconciliation);

            ReconciliationResult result = performReconciliation(
                    reconciliation, sourceData, targetData, reconciliation.getRuleSet());

            reconciliation.setProgress(90);
            reconciliation.setMatchedRecords(result.matchedCount);
            reconciliation.setUnmatchedSourceRecords(result.unmatchedSourceCount);
            reconciliation.setUnmatchedTargetRecords(result.unmatchedTargetCount);
            reconciliation.setExceptionCount(result.exceptions.size());
            reconciliation.setMatchRate(calculateMatchRate(result, sourceData.getRowCount()));

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalSourceRecords", sourceData.getRowCount());
            stats.put("totalTargetRecords", targetData.getRowCount());
            stats.put("matchedRecords", result.matchedCount);
            stats.put("unmatchedSourceRecords", result.unmatchedSourceCount);
            stats.put("unmatchedTargetRecords", result.unmatchedTargetCount);
            stats.put("exceptionCount", result.exceptions.size());
            reconciliation.setStatistics(stats);
            reconciliationRepository.save(reconciliation);

            // Save all exceptions
            List<ReconciliationException> savedExceptions = new ArrayList<>();
            for (ReconciliationException exception : result.exceptions) {
                exception.setReconciliation(reconciliation);
                savedExceptions.add(exceptionRepository.save(exception));
            }

            // Populate AI suggestions for up to the first AI_SUGGESTION_MAX_EXCEPTIONS exceptions
            populateAiSuggestions(savedExceptions, reconciliation.getName());

            // AI second-pass: find potential matches among unmatched records (capped at 200 total)
            long unmatchedCount = savedExceptions.stream()
                    .filter(e -> e.getType() == ExceptionType.MISSING_TARGET || e.getType() == ExceptionType.MISSING_SOURCE)
                    .count();
            if (unmatchedCount > 0 && unmatchedCount <= 200) {
                runAiSecondPass(savedExceptions, reconciliation);
            }

            reconciliation.setStatus(ReconciliationStatus.COMPLETED);
            reconciliation.setCompletedAt(LocalDateTime.now());
            reconciliation.setProgress(100);
            reconciliationRepository.save(reconciliation);

            log.info("Reconciliation completed: {} (matched: {}, exceptions: {})",
                    reconciliationId, result.matchedCount, result.exceptions.size());

        } catch (Exception e) {
            log.error("Reconciliation failed: {} - {}", reconciliationId, e.getMessage(), e);
            reconciliation.setStatus(ReconciliationStatus.FAILED);
            reconciliation.setErrorMessage(e.getMessage());
            reconciliation.setCompletedAt(LocalDateTime.now());
            reconciliationRepository.save(reconciliation);
        }
    }

    private ReconciliationResult performReconciliation(
            Reconciliation reconciliation,
            FileParserService.ParseResult sourceData,
            FileParserService.ParseResult targetData,
            RuleSet ruleSet) {

        List<FieldMapping> keyMappings = ruleSet.getFieldMappings().stream()
                .filter(FieldMapping::getIsKey)
                .collect(Collectors.toList());

        if (keyMappings.isEmpty()) {
            throw new IllegalStateException("Rule set must have at least one key field");
        }

        Map<String, List<Map<String, Object>>> sourceByKey = indexByKey(sourceData, keyMappings, true);
        Map<String, List<Map<String, Object>>> targetByKey = indexByKey(targetData, keyMappings, false);

        List<ReconciliationException> exceptions = new ArrayList<>();
        int matchedCount = 0;
        Set<String> matchedTargetKeys = new HashSet<>();

        for (Map.Entry<String, List<Map<String, Object>>> sourceEntry : sourceByKey.entrySet()) {
            String key = sourceEntry.getKey();
            List<Map<String, Object>> sourceRecords = sourceEntry.getValue();

            if (!targetByKey.containsKey(key)) {
                for (Map<String, Object> sourceRecord : sourceRecords) {
                    ReconciliationException exception = ReconciliationException.builder()
                            .type(ExceptionType.MISSING_TARGET)
                            .severity(ExceptionSeverity.HIGH)
                            .status(ExceptionStatus.OPEN)
                            .description("No matching record found in target")
                            .sourceData(sourceRecord)
                            .build();
                    exceptions.add(exception);
                }
            } else {
                List<Map<String, Object>> targetRecords = targetByKey.get(key);
                matchedTargetKeys.add(key);

                for (int i = 0; i < sourceRecords.size(); i++) {
                    Map<String, Object> sourceRecord = sourceRecords.get(i);

                    if (i < targetRecords.size()) {
                        Map<String, Object> targetRecord = targetRecords.get(i);
                        List<ReconciliationException> fieldExceptions =
                                compareRecords(sourceRecord, targetRecord, ruleSet);

                        if (fieldExceptions.isEmpty()) {
                            matchedCount++;
                        } else {
                            exceptions.addAll(fieldExceptions);
                        }
                    } else {
                        ReconciliationException exception = ReconciliationException.builder()
                                .type(ExceptionType.DUPLICATE)
                                .severity(ExceptionSeverity.HIGH)
                                .status(ExceptionStatus.OPEN)
                                .description("Duplicate key in source with no matching target record")
                                .sourceData(sourceRecord)
                                .build();
                        exceptions.add(exception);
                    }
                }
            }
        }

        for (Map.Entry<String, List<Map<String, Object>>> targetEntry : targetByKey.entrySet()) {
            if (sourceByKey.containsKey(targetEntry.getKey())) {
                List<Map<String, Object>> sourceRecords = sourceByKey.get(targetEntry.getKey());
                List<Map<String, Object>> targetRecords = targetEntry.getValue();
                if (targetRecords.size() > sourceRecords.size()) {
                    for (int i = sourceRecords.size(); i < targetRecords.size(); i++) {
                        ReconciliationException exception = ReconciliationException.builder()
                                .type(ExceptionType.DUPLICATE)
                                .severity(ExceptionSeverity.HIGH)
                                .status(ExceptionStatus.OPEN)
                                .description("Duplicate key in target with no matching source record")
                                .targetData(targetRecords.get(i))
                                .build();
                        exceptions.add(exception);
                    }
                }
            }
            if (!matchedTargetKeys.contains(targetEntry.getKey())) {
                for (Map<String, Object> targetRecord : targetEntry.getValue()) {
                    ReconciliationException exception = ReconciliationException.builder()
                            .type(ExceptionType.MISSING_SOURCE)
                            .severity(ExceptionSeverity.HIGH)
                            .status(ExceptionStatus.OPEN)
                            .description("No matching record found in source")
                            .targetData(targetRecord)
                            .build();
                    exceptions.add(exception);
                }
            }
        }

        return new ReconciliationResult(
                matchedCount,
                sourceData.getRowCount() - matchedCount,
                targetData.getRowCount() - matchedCount,
                exceptions
        );
    }

    private Map<String, List<Map<String, Object>>> indexByKey(
            FileParserService.ParseResult data,
            List<FieldMapping> keyMappings,
            boolean isSource) {

        Map<String, List<Map<String, Object>>> indexed = new HashMap<>();
        List<String> headers = data.headers();

        for (List<Object> row : data.rows()) {
            Map<String, Object> record = new HashMap<>();
            for (int i = 0; i < headers.size() && i < row.size(); i++) {
                record.put(headers.get(i), row.get(i));
            }

            StringBuilder keyBuilder = new StringBuilder();
            for (FieldMapping mapping : keyMappings) {
                String fieldName = isSource ? mapping.getSourceField() : mapping.getTargetField();
                Object value = record.get(fieldName);
                keyBuilder.append(value != null ? value.toString() : "null").append("|");
            }
            String key = keyBuilder.toString();

            indexed.computeIfAbsent(key, k -> new ArrayList<>()).add(record);
        }

        return indexed;
    }

    private List<ReconciliationException> compareRecords(
            Map<String, Object> sourceRecord,
            Map<String, Object> targetRecord,
            RuleSet ruleSet) {

        List<ReconciliationException> exceptions = new ArrayList<>();

        for (FieldMapping mapping : ruleSet.getFieldMappings()) {
            Object sourceValue = sourceRecord.get(mapping.getSourceField());
            Object targetValue = targetRecord.get(mapping.getTargetField());

            if (Boolean.TRUE.equals(mapping.getIsKey()) && (sourceValue == null || targetValue == null)) {
                ExceptionType type = sourceValue == null
                        ? ExceptionType.MISSING_SOURCE
                        : ExceptionType.MISSING_TARGET;
                ReconciliationException exception = ReconciliationException.builder()
                        .type(type)
                        .severity(ExceptionSeverity.CRITICAL)
                        .status(ExceptionStatus.OPEN)
                        .description(String.format("Key field '%s' is null", mapping.getSourceField()))
                        .fieldName(mapping.getSourceField())
                        .sourceValue(sourceValue != null ? sourceValue.toString() : null)
                        .targetValue(targetValue != null ? targetValue.toString() : null)
                        .sourceData(sourceRecord)
                        .targetData(targetRecord)
                        .build();
                exceptions.add(exception);
                continue;
            }

            MatchingRule matchingRule = ruleSet.getMatchingRules().stream()
                    .filter(r -> r.getSourceField().equals(mapping.getSourceField()) && r.getActive())
                    .findFirst()
                    .orElse(null);

            boolean matches = compareValues(sourceValue, targetValue, matchingRule);

            if (!matches) {
                ExceptionSeverity severity = mapping.getIsKey() ?
                        ExceptionSeverity.CRITICAL : ExceptionSeverity.MEDIUM;

                ReconciliationException exception = ReconciliationException.builder()
                        .type(ExceptionType.VALUE_MISMATCH)
                        .severity(severity)
                        .status(ExceptionStatus.OPEN)
                        .description(String.format("Value mismatch for field %s", mapping.getSourceField()))
                        .fieldName(mapping.getSourceField())
                        .sourceValue(sourceValue != null ? sourceValue.toString() : null)
                        .targetValue(targetValue != null ? targetValue.toString() : null)
                        .sourceData(sourceRecord)
                        .targetData(targetRecord)
                        .build();
                exceptions.add(exception);
            }
        }

        return exceptions;
    }

    private boolean compareValues(Object sourceValue, Object targetValue, MatchingRule rule) {
        if (sourceValue == null && targetValue == null) return true;
        if (sourceValue == null || targetValue == null) return false;

        if (rule == null || rule.getMatchType() == MatchType.EXACT) {
            return sourceValue.toString().equals(targetValue.toString());
        }

        switch (rule.getMatchType()) {
            case FUZZY:
                double threshold = rule.getFuzzyThreshold() != null ? rule.getFuzzyThreshold() : 0.8;
                return calculateSimilarity(sourceValue.toString(), targetValue.toString()) >= threshold;

            case RANGE:
                if (sourceValue instanceof Number && targetValue instanceof Number) {
                    double tolerance = rule.getTolerance() != null ? rule.getTolerance() : 0.0;
                    double diff = Math.abs(((Number) sourceValue).doubleValue() - ((Number) targetValue).doubleValue());
                    return diff <= tolerance;
                }
                try {
                    double sourceNum = Double.parseDouble(sourceValue.toString().replaceAll("[^0-9.-]", ""));
                    double targetNum = Double.parseDouble(targetValue.toString().replaceAll("[^0-9.-]", ""));
                    double tolerance = rule.getTolerance() != null ? rule.getTolerance() : 0.0;
                    return Math.abs(sourceNum - targetNum) <= tolerance;
                } catch (NumberFormatException e) {
                    return false;
                }

            case CONTAINS:
                return targetValue.toString().toLowerCase().contains(sourceValue.toString().toLowerCase()) ||
                       sourceValue.toString().toLowerCase().contains(targetValue.toString().toLowerCase());

            case STARTS_WITH:
                return targetValue.toString().toLowerCase().startsWith(sourceValue.toString().toLowerCase()) ||
                       sourceValue.toString().toLowerCase().startsWith(targetValue.toString().toLowerCase());

            case ENDS_WITH:
                return targetValue.toString().toLowerCase().endsWith(sourceValue.toString().toLowerCase()) ||
                       sourceValue.toString().toLowerCase().endsWith(targetValue.toString().toLowerCase());

            default:
                return sourceValue.toString().equals(targetValue.toString());
        }
    }

    private double calculateSimilarity(String s1, String s2) {
        String longer = s1.length() > s2.length() ? s1 : s2;
        String shorter = s1.length() > s2.length() ? s2 : s1;

        if (longer.length() == 0) return 1.0;

        int distance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
        return (longer.length() - distance) / (double) longer.length();
    }

    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= s2.length(); j++) dp[0][j] = j;

        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                int cost = s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1), dp[i - 1][j - 1] + cost);
            }
        }

        return dp[s1.length()][s2.length()];
    }

    private double calculateMatchRate(ReconciliationResult result, int totalSource) {
        if (totalSource == 0) return 0.0;
        return (result.matchedCount * 100.0) / totalSource;
    }

    public ReconciliationResponse getById(Long id) {
        Reconciliation reconciliation = reconciliationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reconciliation", id));
        return ReconciliationResponse.fromEntity(reconciliation);
    }

    public List<ReconciliationResponse> getAll() {
        Organization org = organizationService.getDefaultOrganization();
        return reconciliationRepository.findByOrganizationIdOrderByCreatedAtDesc(org.getId())
                .stream()
                .map(ReconciliationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<ReconciliationResponse> getAll(Pageable pageable) {
        Organization org = organizationService.getDefaultOrganization();
        return reconciliationRepository.findByOrganizationId(org.getId(), pageable)
                .map(ReconciliationResponse::fromEntity);
    }

    public ReconciliationResponse getStatus(Long id) {
        return getById(id);
    }

    @Transactional
    public void cancel(Long id) {
        Reconciliation reconciliation = reconciliationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reconciliation", id));

        if (reconciliation.getStatus() == ReconciliationStatus.PENDING ||
            reconciliation.getStatus() == ReconciliationStatus.IN_PROGRESS) {
            reconciliation.setStatus(ReconciliationStatus.CANCELLED);
            reconciliationRepository.save(reconciliation);
            log.info("Cancelled reconciliation: {}", id);
        } else if (reconciliation.getStatus() == ReconciliationStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel completed reconciliation");
        }
    }

    @Transactional
    public void delete(Long id) {
        Reconciliation reconciliation = reconciliationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reconciliation", id));

        reconciliationRepository.delete(reconciliation);
        log.info("Deleted reconciliation: {}", id);
    }

    @Transactional
    public Map<String, Object> deleteAll(List<Long> ids) {
        int successCount = 0;
        int failedCount = 0;
        List<String> errors = new ArrayList<>();

        for (Long id : ids) {
            try {
                Reconciliation reconciliation = reconciliationRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Reconciliation", id));
                reconciliationRepository.delete(reconciliation);
                successCount++;
                log.info("Bulk deleted reconciliation: {}", id);
            } catch (Exception e) {
                failedCount++;
                errors.add(String.format("Failed to delete ID %d: %s", id, e.getMessage()));
                log.error("Failed to bulk delete reconciliation: {} - {}", id, e.getMessage());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalRequested", ids.size());
        result.put("successCount", successCount);
        result.put("failedCount", failedCount);
        if (!errors.isEmpty()) {
            result.put("errors", errors);
        }

        return result;
    }

    private void runAiSecondPass(List<ReconciliationException> savedExceptions, Reconciliation reconciliation) {
        List<Map<String, Object>> unmatchedSources = savedExceptions.stream()
                .filter(e -> e.getType() == ExceptionType.MISSING_TARGET && e.getSourceData() != null)
                .map(ReconciliationException::getSourceData)
                .collect(Collectors.toList());

        List<Map<String, Object>> unmatchedTargets = savedExceptions.stream()
                .filter(e -> e.getType() == ExceptionType.MISSING_SOURCE && e.getTargetData() != null)
                .map(ReconciliationException::getTargetData)
                .collect(Collectors.toList());

        if (unmatchedSources.isEmpty() || unmatchedTargets.isEmpty()) return;

        log.info("Running AI second-pass: {} unmatched source, {} unmatched target records",
                unmatchedSources.size(), unmatchedTargets.size());

        List<AiService.PotentialMatchSuggestion> suggestions = aiService.suggestPotentialMatches(
                unmatchedSources, unmatchedTargets, reconciliation.getRuleSet().getFieldMappings());

        for (AiService.PotentialMatchSuggestion suggestion : suggestions) {
            ReconciliationException potentialMatch = ReconciliationException.builder()
                    .type(ExceptionType.POTENTIAL_MATCH)
                    .severity(ExceptionSeverity.MEDIUM)
                    .status(ExceptionStatus.OPEN)
                    .description("AI identified a potential match missed by key-based matching")
                    .sourceData(suggestion.sourceRecord())
                    .targetData(suggestion.targetRecord())
                    .reconciliation(reconciliation)
                    .build();
            potentialMatch.setAiSuggestion(String.format("%.0f%% confidence — %s",
                    suggestion.confidence() * 100, suggestion.reasoning()));
            exceptionRepository.save(potentialMatch);
        }

        if (!suggestions.isEmpty()) {
            log.info("AI second-pass found {} potential matches for reconciliation {}",
                    suggestions.size(), reconciliation.getId());
        }
    }

    private void populateAiSuggestions(List<ReconciliationException> exceptions, String reconciliationName) {
        int limit = Math.min(exceptions.size(), AI_SUGGESTION_MAX_EXCEPTIONS);
        log.info("Populating AI suggestions for {} exceptions (reconciliation: {})", limit, reconciliationName);

        for (int i = 0; i < limit; i += AI_SUGGESTION_BATCH_SIZE) {
            List<ReconciliationException> batch = exceptions.subList(i, Math.min(i + AI_SUGGESTION_BATCH_SIZE, limit));
            for (ReconciliationException exception : batch) {
                try {
                    String suggestion = aiService.getExceptionSuggestion(
                            exception.getType().name(),
                            exception.getSourceValue() != null ? exception.getSourceValue() : "N/A",
                            exception.getTargetValue() != null ? exception.getTargetValue() : "N/A",
                            exception.getFieldName() != null ? exception.getFieldName() : "N/A",
                            reconciliationName
                    );
                    exception.setAiSuggestion(suggestion);
                    exceptionRepository.save(exception);
                } catch (Exception e) {
                    log.warn("AI suggestion failed for exception {}: {}", exception.getId(), e.getMessage());
                }
            }
        }
    }

    private record ReconciliationResult(
            int matchedCount,
            int unmatchedSourceCount,
            int unmatchedTargetCount,
            List<ReconciliationException> exceptions
    ) {}
}
