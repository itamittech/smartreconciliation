package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.enums.KnowledgeDomain;

public class DomainDetectionResponse {

    private KnowledgeDomain domain;
    private double confidence;

    public DomainDetectionResponse() {}

    public DomainDetectionResponse(KnowledgeDomain domain, double confidence) {
        this.domain = domain;
        this.confidence = confidence;
    }

    public KnowledgeDomain getDomain() { return domain; }
    public void setDomain(KnowledgeDomain domain) { this.domain = domain; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
}
