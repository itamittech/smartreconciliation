# NotebookLM Knowledge Integration Plan (Local RAG Strategy)

This document outlines the strategy for integrating domain-specific expertise from NotebookLM into the Smart Reconciliation application using a manual export and local Vector Store (PGVector) approach.

## 1. Overview

The goal is to enhance the AI's ability to suggest mappings and resolve exceptions by grounding its reasoning in industry-specific knowledge (e.g., Banking, Trading, Insurance). Since the consumer version of NotebookLM lacks a public API, we will use a "Local RAG" (Retrieval-Augmented Generation) strategy.

**Key Benefits:**
- **Domain Awareness:** The AI understands industry-specific field names and logic.
- **Privacy & Performance:** Knowledge is stored locally in our PostgreSQL database.
- **Cost Efficiency:** No recurring API costs for external knowledge retrieval.

---

## 2. Integration Workflow

### Phase 1: Knowledge Export (Manual)
1.  **Notebook Organization:** Maintain separate Notebooks in NotebookLM for each domain (e.g., "Equity Trading Reconciliation," "Interbank Cash Flow").
2.  **Export Format:** Use the "Export to Google Docs" or copy-paste feature in NotebookLM to consolidate insights into **Markdown (.md)** or **PDF** files.
3.  **Content Selection:** Prioritize "Source-to-Target mapping rules," "Common discrepancy causes," and "Glossary of terms."

### Phase 2: Knowledge Ingestion (Application Level)
To move data from the exported files into our `PGVector` store:

1.  **Text Splitting (Chunking):** Break the large exported files into smaller, semantically meaningful chunks (e.g., 500–1000 characters).
2.  **Metadata Tagging:** Each chunk must be tagged with a `domain` attribute (e.g., `domain=BANKING`).
3.  **Embedding Generation:** Use the application's configured `EmbeddingModel` (via Spring AI) to convert text chunks into high-dimensional vectors.
4.  **Persistence:** Store the vectors and text in a dedicated `knowledge_embeddings` table.

### Phase 3: Domain-Aware Retrieval
When a user starts a reconciliation:

1.  **Domain Identification:** The `SchemaDetectionService` or `AiService` analyzes the file headers to predict the domain (e.g., finding "ISIN" or "CUSIP" suggests "Trading").
2.  **Semantic Search:** Before generating suggestions, the `AiService` queries the `VectorStore`:
    - *Query:* "Standard mappings for [Detected Domain] with columns [List of Headers]"
    - *Filter:* `where metadata.domain = [Detected Domain]`
3.  **Context Injection:** The retrieved "expert snippets" are injected into the system prompt for the mapping and rule generation engines.

---

## 3. Architecture Modifications

### Database Additions
A new table (or reuse of the existing vector table if generic) to store domain expertise:

| Column | Type | Description |
|---|---|---|
| `id` | UUID / BIGINT | Primary Key |
| `content` | TEXT | The actual expert advice/rule snippet |
| `embedding` | VECTOR(1536) | Semantic vector (size depends on model) |
| `domain` | VARCHAR(50) | The identified domain (BANKING, TRADING, etc.) |
| `metadata` | JSONB | Source file name, last updated date |

### Service Enhancements
- **`KnowledgeIngestionService`:** (New) Handles the parsing of uploaded expert files and their insertion into the vector store.
- **`AiService`:** Updated to perform a "pre-flight" vector search before calling the LLM for reconciliation tasks.

---

## 4. Usage Scenarios

### Scenario A: Smart Mapping
- **Input:** Source file with column `TRX_TYP_CD`.
- **Knowledge Retrieval:** Knowledge base identifies this as "Transaction Type Code" in the Banking domain.
- **AI Output:** Suggests mapping to `TransactionCategory` and explains why based on industry standards.

### Scenario B: Exception Resolution
- **Input:** A discrepancy in "Value Date" vs "Post Date."
- **Knowledge Retrieval:** Knowledge base explains the standard T+2 settlement lag for the Trading domain.
- **AI Output:** Annotates the exception as "Potential Timing Difference" rather than a "Data Error."

---

## 5. Implementation Roadmap (Next Steps)

1.  **Data Definition:** Define the `domain` list (Enum) to be used across the app.
2.  **Admin UI:** Create a simple "Knowledge Management" tab where admins can upload exported Markdown/PDF files and assign them to a domain.
3.  **Retrieval Logic:** Integrate the `VectorStore.similaritySearch()` call into the `AiService.buildMappingSuggestionPrompt()` method.
4.  **Validation:** Test with sample Banking and Trading datasets to compare "Generic AI" vs "Domain-Grounded AI" results.
