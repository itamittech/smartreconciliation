package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.exception.AiServiceException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class PromptTemplateService {

    private final ConcurrentMap<String, String> templateCache = new ConcurrentHashMap<>();

    public String loadTemplate(String templatePath) {
        return templateCache.computeIfAbsent(templatePath, this::readTemplateFromClasspath);
    }

    public String renderTemplate(String templatePath, Map<String, String> variables) {
        String rendered = loadTemplate(templatePath);
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String token = "{{" + entry.getKey() + "}}";
            rendered = rendered.replace(token, entry.getValue() == null ? "" : entry.getValue());
        }
        return rendered;
    }

    private String readTemplateFromClasspath(String templatePath) {
        ClassPathResource resource = new ClassPathResource(templatePath);
        try (var inputStream = resource.getInputStream()) {
            return StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new AiServiceException("Failed to load prompt template: " + templatePath, e);
        }
    }
}
