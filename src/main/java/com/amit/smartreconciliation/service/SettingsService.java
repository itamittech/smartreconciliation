package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.AiConfigRequest;
import com.amit.smartreconciliation.dto.response.AiConfigResponse;
import com.amit.smartreconciliation.entity.AppSettings;
import com.amit.smartreconciliation.repository.AppSettingsRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing application settings
 */
@Service
public class SettingsService {

    private static final String AI_PROVIDER_KEY = "ai.provider";
    private static final String[] AVAILABLE_PROVIDERS = {"anthropic", "openai", "deepseek"};

    private final AppSettingsRepository settingsRepository;

    @Value("${app.ai.provider:anthropic}")
    private String defaultAiProvider;

    public SettingsService(AppSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    /**
     * Get current AI configuration
     */
    public AiConfigResponse getAiConfig() {
        String currentProvider = settingsRepository.findBySettingKey(AI_PROVIDER_KEY)
                .map(AppSettings::getSettingValue)
                .orElse(defaultAiProvider);

        return new AiConfigResponse(currentProvider, AVAILABLE_PROVIDERS, false);
    }

    /**
     * Update AI provider preference
     * Note: Changes take effect on next application restart
     */
    @Transactional
    public AiConfigResponse updateAiProvider(AiConfigRequest request) {
        AppSettings setting = settingsRepository.findBySettingKey(AI_PROVIDER_KEY)
                .orElse(new AppSettings(AI_PROVIDER_KEY, request.getProvider()));

        setting.setSettingValue(request.getProvider());
        settingsRepository.save(setting);

        return new AiConfigResponse(request.getProvider(), AVAILABLE_PROVIDERS, true);
    }

    /**
     * Get a setting value by key
     */
    public String getSetting(String key, String defaultValue) {
        return settingsRepository.findBySettingKey(key)
                .map(AppSettings::getSettingValue)
                .orElse(defaultValue);
    }

    /**
     * Set a setting value
     */
    @Transactional
    public void setSetting(String key, String value) {
        AppSettings setting = settingsRepository.findBySettingKey(key)
                .orElse(new AppSettings(key, value));

        setting.setSettingValue(value);
        settingsRepository.save(setting);
    }
}
