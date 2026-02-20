package com.amit.smartreconciliation.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Parses uploaded knowledge files (.md, .pdf, .txt) into text chunks
 * suitable for embedding and storage in PgVector.
 *
 * Chunk target: ~800 chars with 100-char overlap between adjacent chunks.
 */
@Service
public class KnowledgeParserService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeParserService.class);
    private static final int TARGET_CHUNK_SIZE = 800;
    private static final int OVERLAP = 100;

    public List<String> parse(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        if (filename.endsWith(".pdf")) {
            return parsePdf(file);
        } else if (filename.endsWith(".md")) {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            return parseMarkdown(content);
        } else {
            // .txt and anything else
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            return parsePlainText(content);
        }
    }

    // -------------------------------------------------------------------------
    // Markdown: split on ## / ### headings first, then chunk by paragraph
    // -------------------------------------------------------------------------
    List<String> parseMarkdown(String content) {
        // Split on heading lines (## or ###)
        String[] sections = content.split("(?m)(?=^#{2,3}\\s)");
        List<String> chunks = new ArrayList<>();
        for (String section : sections) {
            String trimmed = section.trim();
            if (trimmed.isEmpty()) continue;
            chunks.addAll(chunkText(trimmed));
        }
        return chunks;
    }

    // -------------------------------------------------------------------------
    // PDF: use Apache PDFBox to extract raw text, then chunk by paragraph
    // -------------------------------------------------------------------------
    List<String> parsePdf(MultipartFile file) throws IOException {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc);
            return parsePlainText(text);
        } catch (Exception e) {
            log.warn("PDF extraction failed for {}: {}", file.getOriginalFilename(), e.getMessage());
            return List.of();
        }
    }

    // -------------------------------------------------------------------------
    // Plain text: split on blank lines (paragraph breaks), then chunk
    // -------------------------------------------------------------------------
    List<String> parsePlainText(String content) {
        String[] paragraphs = content.split("\\n{2,}");
        List<String> chunks = new ArrayList<>();
        for (String para : paragraphs) {
            String trimmed = para.trim();
            if (trimmed.isEmpty()) continue;
            chunks.addAll(chunkText(trimmed));
        }
        return chunks;
    }

    // -------------------------------------------------------------------------
    // Sliding window chunker: break long texts into TARGET_CHUNK_SIZE segments
    // with OVERLAP chars of context carried over from the previous chunk.
    // -------------------------------------------------------------------------
    List<String> chunkText(String text) {
        List<String> chunks = new ArrayList<>();
        if (text.length() <= TARGET_CHUNK_SIZE) {
            chunks.add(text);
            return chunks;
        }

        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + TARGET_CHUNK_SIZE, text.length());

            // Try to break on a sentence boundary (. ) or newline near the end
            if (end < text.length()) {
                int breakAt = findBreakPoint(text, start, end);
                if (breakAt > start) {
                    end = breakAt;
                }
            }

            chunks.add(text.substring(start, end).trim());
            start = Math.max(start + 1, end - OVERLAP);
        }
        return chunks;
    }

    private int findBreakPoint(String text, int start, int end) {
        // Walk backwards from `end` to find a sentence-boundary character
        for (int i = end - 1; i > start + TARGET_CHUNK_SIZE / 2; i--) {
            char c = text.charAt(i);
            if (c == '\n' || (c == '.' && i + 1 < text.length() && text.charAt(i + 1) == ' ')) {
                return i + 1;
            }
        }
        return end;
    }
}
