package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.dto.response.DomainDetectionResponse;
import com.amit.smartreconciliation.dto.response.KnowledgeDocumentResponse;
import com.amit.smartreconciliation.entity.KnowledgeDocument;
import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.entity.User;
import com.amit.smartreconciliation.enums.KnowledgeDomain;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.KnowledgeDocumentRepository;
import com.amit.smartreconciliation.repository.UserRepository;
import com.amit.smartreconciliation.security.SecurityUtils;
import com.amit.smartreconciliation.service.AiService;
import com.amit.smartreconciliation.service.KnowledgeIngestionService;
import com.amit.smartreconciliation.service.OrganizationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * REST endpoints for the domain knowledge base.
 *
 * POST   /api/v1/knowledge/detect-domain  — ADMIN, ANALYST
 * POST   /api/v1/knowledge/upload         — ADMIN, ANALYST
 * GET    /api/v1/knowledge                — all authenticated users
 * DELETE /api/v1/knowledge/{id}           — ADMIN, ANALYST
 */
@RestController
@RequestMapping("/api/v1/knowledge")
public class KnowledgeController {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeController.class);

    private final KnowledgeIngestionService ingestionService;
    private final KnowledgeDocumentRepository documentRepository;
    private final AiService aiService;
    private final OrganizationService organizationService;
    private final UserRepository userRepository;

    public KnowledgeController(
            KnowledgeIngestionService ingestionService,
            KnowledgeDocumentRepository documentRepository,
            AiService aiService,
            OrganizationService organizationService,
            UserRepository userRepository) {
        this.ingestionService = ingestionService;
        this.documentRepository = documentRepository;
        this.aiService = aiService;
        this.organizationService = organizationService;
        this.userRepository = userRepository;
    }

    /**
     * Classify the first ~2000 chars of a file into a reconciliation domain.
     * The frontend calls this on file drop, before confirming the upload.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @PostMapping("/detect-domain")
    public ResponseEntity<ApiResponse<DomainDetectionResponse>> detectDomain(
            @RequestBody String sampleContent) {
        DomainDetectionResponse result = aiService.detectDomain(sampleContent);
        return ResponseEntity.ok(ApiResponse.success("Domain detected", result));
    }

    /**
     * Upload and ingest a knowledge file (.md, .pdf, .txt).
     * Parses → embeds → stores in PgVector with the given domain tag.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<KnowledgeDocumentResponse>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("domain") String domain) throws IOException {

        KnowledgeDomain knowledgeDomain;
        try {
            knowledgeDomain = KnowledgeDomain.valueOf(domain.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid domain: " + domain));
        }

        Long orgId = SecurityUtils.getCurrentOrgId();
        Long userId = SecurityUtils.getCurrentUserId();

        Organization org = organizationService.getById(orgId);
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        log.info("Upload request: file='{}' domain={} orgId={}", file.getOriginalFilename(), knowledgeDomain, orgId);

        KnowledgeDocument doc = ingestionService.ingest(file, knowledgeDomain, org, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Knowledge file ingested successfully", KnowledgeDocumentResponse.from(doc)));
    }

    /**
     * List all knowledge documents for the caller's organisation.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<KnowledgeDocumentResponse>>> list() {
        Long orgId = SecurityUtils.getCurrentOrgId();
        List<KnowledgeDocumentResponse> docs = documentRepository
                .findByOrganizationIdOrderByCreatedAtDesc(orgId)
                .stream()
                .map(KnowledgeDocumentResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(docs));
    }

    /**
     * Delete a knowledge document and all its associated vectors.
     * Scoped to the caller's organisation — cannot delete another org's documents.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Long orgId = SecurityUtils.getCurrentOrgId();
        ingestionService.deleteDocument(id, orgId);
        return ResponseEntity.ok(ApiResponse.success("Knowledge document deleted", null));
    }
}
