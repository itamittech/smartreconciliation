package com.amit.smartreconciliation.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.deepseek.DeepSeekChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * AI Configuration - selects the primary ChatModel based on app.ai.provider property.
 *
 * All providers are auto-configured by Spring AI when their API keys are set.
 * This config simply marks the selected provider as @Primary.
 *
 * Usage:
 *   1. Set API keys in .env file
 *   2. Set app.ai.provider=anthropic|openai|deepseek in application.properties
 */
@Configuration
public class AiConfig {

    private static final Logger log = LoggerFactory.getLogger(AiConfig.class);

    @Value("${app.ai.provider:anthropic}")
    private String aiProvider;

    @Bean
    @Primary
    public ChatModel primaryChatModel(
            AnthropicChatModel anthropicChatModel,
            OpenAiChatModel openAiChatModel,
            DeepSeekChatModel deepSeekChatModel) {

        ChatModel selected = switch (aiProvider.toLowerCase()) {
            case "openai" -> {
                log.info("Using OpenAI as the primary AI provider");
                yield openAiChatModel;
            }
            case "deepseek" -> {
                log.info("Using DeepSeek as the primary AI provider");
                yield deepSeekChatModel;
            }
            default -> {
                log.info("Using Anthropic as the primary AI provider");
                yield anthropicChatModel;
            }
        };

        return selected;
    }
}
