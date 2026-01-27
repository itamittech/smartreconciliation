package com.amit.smartreconciliation.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.anthropic.AnthropicChatOptions;
import org.springframework.ai.anthropic.api.AnthropicApi;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.deepseek.DeepSeekChatModel;
import org.springframework.ai.deepseek.DeepSeekChatOptions;
import org.springframework.ai.deepseek.api.DeepSeekApi;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * AI Configuration - creates a single ChatModel bean based on the configured provider.
 *
 * Configure in application.properties:
 *   app.ai.provider=anthropic|openai|deepseek
 *
 * Set API keys in .env file (not committed to git):
 *   ANTHROPIC_API_KEY=your-key
 *   OPENAI_API_KEY=your-key
 *   DEEPSEEK_API_KEY=your-key
 */
@Configuration
public class AiConfig {

    private static final Logger log = LoggerFactory.getLogger(AiConfig.class);

    // Anthropic Configuration
    @Bean
    @ConditionalOnProperty(name = "app.ai.provider", havingValue = "anthropic", matchIfMissing = true)
    public ChatModel anthropicChatModel(
            @Value("${ANTHROPIC_API_KEY:}") String apiKey,
            @Value("${app.ai.anthropic.model:claude-sonnet-4-20250514}") String model,
            @Value("${app.ai.anthropic.max-tokens:4096}") int maxTokens) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                "ANTHROPIC_API_KEY is not set. Please set it in your .env file or environment variables.");
        }

        log.info("Initializing Anthropic ChatModel with model: {}", model);

        AnthropicApi api = AnthropicApi.builder()
                .apiKey(apiKey)
                .build();

        AnthropicChatOptions options = AnthropicChatOptions.builder()
                .model(model)
                .maxTokens(maxTokens)
                .build();

        return AnthropicChatModel.builder()
                .anthropicApi(api)
                .defaultOptions(options)
                .build();
    }

    // OpenAI Configuration
    @Bean
    @ConditionalOnProperty(name = "app.ai.provider", havingValue = "openai")
    public ChatModel openAiChatModel(
            @Value("${OPENAI_API_KEY:}") String apiKey,
            @Value("${app.ai.openai.model:gpt-4o}") String model,
            @Value("${app.ai.openai.max-tokens:4096}") int maxTokens) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                "OPENAI_API_KEY is not set. Please set it in your .env file or environment variables.");
        }

        log.info("Initializing OpenAI ChatModel with model: {}", model);

        OpenAiApi api = OpenAiApi.builder()
                .apiKey(apiKey)
                .build();

        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .model(model)
                .maxTokens(maxTokens)
                .build();

        return OpenAiChatModel.builder()
                .openAiApi(api)
                .defaultOptions(options)
                .build();
    }

    // DeepSeek Configuration
    @Bean
    @ConditionalOnProperty(name = "app.ai.provider", havingValue = "deepseek")
    public ChatModel deepSeekChatModel(
            @Value("${DEEPSEEK_API_KEY:}") String apiKey,
            @Value("${app.ai.deepseek.model:deepseek-chat}") String model,
            @Value("${app.ai.deepseek.max-tokens:4096}") int maxTokens) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                "DEEPSEEK_API_KEY is not set. Please set it in your .env file or environment variables.");
        }

        log.info("Initializing DeepSeek ChatModel with model: {}", model);

        DeepSeekApi api = DeepSeekApi.builder()
                .apiKey(apiKey)
                .build();

        DeepSeekChatOptions options = DeepSeekChatOptions.builder()
                .model(model)
                .maxTokens(maxTokens)
                .build();

        return DeepSeekChatModel.builder()
                .deepSeekApi(api)
                .defaultOptions(options)
                .build();
    }
}
