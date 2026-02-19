package com.amit.smartreconciliation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * AI Configuration update request
 */
public class AiConfigRequest {

    @NotBlank(message = "AI provider is required")
    @Pattern(regexp = "anthropic|openai|deepseek", message = "Provider must be one of: anthropic, openai, deepseek")
    private String provider;

    public AiConfigRequest() {}

    public AiConfigRequest(String provider) {
        this.provider = provider;
    }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
}
