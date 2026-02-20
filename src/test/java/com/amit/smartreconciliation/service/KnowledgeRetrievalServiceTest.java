package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.enums.KnowledgeDomain;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.pgvector.PgVectorFilterExpressionConverter;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("KnowledgeRetrievalService Unit Tests")
class KnowledgeRetrievalServiceTest {

    @Mock
    private VectorStore vectorStore;

    @InjectMocks
    private KnowledgeRetrievalService service;

    @Test
    @DisplayName("GENERAL domain should search org-wide without domain filter")
    void generalDomainShouldSearchOrgWide() {
        when(vectorStore.similaritySearch(any(SearchRequest.class)))
                .thenReturn(List.of(new Document("banking knowledge")));

        List<String> result = service.search("entry date mapping", KnowledgeDomain.GENERAL, 1L, 5);

        assertThat(result).containsExactly("banking knowledge");

        ArgumentCaptor<SearchRequest> captor = ArgumentCaptor.forClass(SearchRequest.class);
        verify(vectorStore).similaritySearch(captor.capture());

        String sqlFilter = new PgVectorFilterExpressionConverter()
                .convertExpression(captor.getValue().getFilterExpression());
        assertThat(sqlFilter).contains("organizationId");
        assertThat(sqlFilter).doesNotContain("domain");
    }

    @Test
    @DisplayName("Specific domain should fall back to org-wide when no domain hits")
    void specificDomainShouldFallbackToOrgWide() {
        when(vectorStore.similaritySearch(any(SearchRequest.class)))
                .thenReturn(List.of(), List.of(new Document("fallback knowledge")));

        List<String> result = service.search("column mapping", KnowledgeDomain.BANKING, 1L, 5);

        assertThat(result).containsExactly("fallback knowledge");

        ArgumentCaptor<SearchRequest> captor = ArgumentCaptor.forClass(SearchRequest.class);
        verify(vectorStore, times(2)).similaritySearch(captor.capture());

        PgVectorFilterExpressionConverter converter = new PgVectorFilterExpressionConverter();
        String firstFilter = converter.convertExpression(captor.getAllValues().get(0).getFilterExpression());
        String secondFilter = converter.convertExpression(captor.getAllValues().get(1).getFilterExpression());

        assertThat(firstFilter).contains("organizationId");
        assertThat(firstFilter).contains("domain");
        assertThat(secondFilter).contains("organizationId");
        assertThat(secondFilter).doesNotContain("domain");
    }
}
