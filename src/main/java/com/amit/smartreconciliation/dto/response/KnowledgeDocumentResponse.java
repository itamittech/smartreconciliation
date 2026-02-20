package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.KnowledgeDocument;
import com.amit.smartreconciliation.enums.KnowledgeDomain;

import java.time.LocalDateTime;

public class KnowledgeDocumentResponse {

    private Long id;
    private String title;
    private KnowledgeDomain domain;
    private String fileType;
    private Integer chunkCount;
    private String createdByEmail;
    private LocalDateTime createdAt;

    public KnowledgeDocumentResponse() {}

    public static KnowledgeDocumentResponse from(KnowledgeDocument doc) {
        KnowledgeDocumentResponse r = new KnowledgeDocumentResponse();
        r.id = doc.getId();
        r.title = doc.getTitle();
        r.domain = doc.getDomain();
        r.fileType = doc.getFileType();
        r.chunkCount = doc.getChunkCount();
        r.createdByEmail = doc.getCreatedBy() != null ? doc.getCreatedBy().getEmail() : null;
        r.createdAt = doc.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public KnowledgeDomain getDomain() { return domain; }
    public String getFileType() { return fileType; }
    public Integer getChunkCount() { return chunkCount; }
    public String getCreatedByEmail() { return createdByEmail; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
