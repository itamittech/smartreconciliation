package com.amit.smartreconciliation.dto.response;

/**
 * AI Configuration response including current provider and available options
 */
public class AiConfigResponse {
    private String currentProvider;
    private String[] availableProviders;
    private boolean requiresRestart;

    public AiConfigResponse() {}

    public AiConfigResponse(String currentProvider, String[] availableProviders, boolean requiresRestart) {
        this.currentProvider = currentProvider;
        this.availableProviders = availableProviders;
        this.requiresRestart = requiresRestart;
    }

    // Getters and Setters
    public String getCurrentProvider() { return currentProvider; }
    public void setCurrentProvider(String currentProvider) { this.currentProvider = currentProvider; }

    public String[] getAvailableProviders() { return availableProviders; }
    public void setAvailableProviders(String[] availableProviders) { this.availableProviders = availableProviders; }

    public boolean isRequiresRestart() { return requiresRestart; }
    public void setRequiresRestart(boolean requiresRestart) { this.requiresRestart = requiresRestart; }
}
