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

## 4. Domain-Specific Extraction Examples

To get the most effective data for your local RAG, use these structured prompts within NotebookLM to transform raw information into "AI-ready" knowledge blocks.

### Example 1: Banking and Cash Management Domain
**Focus:** NOSTRO/VOSTRO reconciliation, bank statement matching, and liquidity management.

*   **Taxonomy Prompt:** *"List all standard fields in a MT940 bank statement and their equivalent fields in an internal General Ledger. Provide a Markdown table with 'Field Name', 'SWIFT Tag', and 'Common GL Alias'."*
*   **Logic Prompt:** *"Define the rules for 'One-to-Many' matching in cash management (e.g., one bulk deposit matching multiple individual invoices). Explain the logic for matching based on 'Reference Number' and 'Value Date' tolerances."*
*   **Exception Prompt:** *"Identify the top 5 causes for 'Bank-to-Book' breaks, such as 'Bank Fees', 'FX Rate Fluctuations', and 'Unpresented Checks'. Provide a resolution strategy for each."*

### Example 2: Accounts Payable (AP) and Procurement Domain
**Focus:** Three-way matching (PO, Invoice, Receipt), vendor management, and tax compliance.

*   **Taxonomy Prompt:** *"Generate a mapping guide for 'Three-Way Matching'. Map fields across 'Purchase Order', 'Goods Receipt Note (GRN)', and 'Vendor Invoice'. Highlight fields that must match exactly (e.g., SKU, Quantity) vs. fields with tolerances (e.g., Unit Price)."*
*   **Logic Prompt:** *"Describe the standard 'Net 30' and '2/10 Net 30' payment terms and how they affect reconciliation dates. Explain how to handle 'Partial Shipments' in the reconciliation workflow."*
*   **Exception Prompt:** *"List common AP discrepancies like 'Duplicate Invoices', 'Tax Rate Mismatches (VAT/GST)', and 'Quantity Variances'. Provide a 'Reason Code' and 'Next Step' for each."*

### Example 3: Capital Markets and Investment Banking (CMIB) Domain
**Focus:** Trade reconciliation, position matching, and corporate actions.

*   **Taxonomy Prompt:** *"Create a 'Rosetta Stone' for Trade Reconciliation. Map fields between a 'Custodian Report' and an 'Internal OMS Report' for fields like ISIN, CUSIP, SEDOL, Trade Date, Settlement Date, and Net Proceeds."*
*   **Logic Prompt:** *"Define the 'T+2' and 'T+1' settlement logic for different global markets. Explain the rules for 'Fuzzy Matching' on counterparty names (e.g., 'Goldman Sachs' vs 'GS & Co') and 'Price Tolerance' (e.g., matching within 0.01 bps)."*
*   **Exception Prompt:** *"Analyze common 'Trade Breaks' such as 'Failed Trades', 'Accrued Interest Mismatches', and 'Dividend Withholding Tax discrepancies'. Provide a technical explanation and resolution guide."*

### Example 4: Inventory and Supply Chain Domain
**Focus:** Physical inventory counts (Wall-to-Wall), warehouse management (WMS) vs. ERP, and returns (RMA).

*   **Taxonomy Prompt:** *"Map fields for Inventory Reconciliation. Compare 'WMS Pick List' with 'ERP Sales Order'. Provide a table for SKU, Barcode (EAN/UPC), Batch/Lot Number, Serial Number, and Bin Location."*
*   **Logic Prompt:** *"Explain the logic for 'Cycle Counting' vs 'Annual Physical Inventory'. Define the rules for 'Unit of Measure (UoM)' conversion (e.g., eaches vs. cases vs. pallets) and how to reconcile fractional quantities."*
*   **Exception Prompt:** *"Identify causes for 'Phantom Inventory' and 'Stock-outs'. Provide a resolution guide for 'In-Transit' inventory discrepancies and 'Damaged Goods' write-offs."*

### Example 5: Intercompany Accounting Domain
**Focus:** Subsidiary eliminations, transfer pricing, and cross-border currency translation.

*   **Taxonomy Prompt:** *"Create a mapping for Intercompany Reconciliation. Map 'Due From' account in Entity A to 'Due To' account in Entity B. Include fields for 'IC Transaction ID', 'Internal Partner Code', and 'Entity ID'."*
*   **Logic Prompt:** *"Define the rules for 'Elimination Entries' in consolidated financial statements. Explain how to handle 'FX Rate Mismatches' when two subsidiaries record the same transaction in different functional currencies (e.g., USD vs EUR)."*
*   **Exception Prompt:** *"Identify the top 3 'Unbalanced Intercompany Breaks', such as 'Timing Differences' (shipment in Month 1, receipt in Month 2) and 'One-sided Entries'. Provide a reconciliation workflow for each."*

### Example 6: E-commerce and Payment Gateway Domain
**Focus:** Shopify/Amazon settlement reports vs. Stripe/PayPal/Adyen gateway data and internal bank deposits.

*   **Taxonomy Prompt:** *"Map fields between a 'Shopify Order Export' and a 'Stripe Payout Report'. Include 'Order ID', 'Transaction ID', 'Gross Amount', 'Gateway Fees', 'Net Amount', and 'Payout Date'."*
*   **Logic Prompt:** *"Explain the logic for 'Batch Settlement' (multiple orders in one daily payout). Describe how to reconcile 'Refunds' and 'Chargebacks' that occur days after the original order. Include rules for matching 'Store Credit' usage."*
*   **Exception Prompt:** *"Identify 'Payout Gaps' such as 'Pending Transactions', 'Rolling Reserves', and 'Fee Discrepancies'. Provide a guide for investigating 'Missing Orders' that exist in the gateway but not the store."*

### Example 7: Technological and Architectural Domain (for Developers)
**Focus:** Log-to-database reconciliation, API message integrity, and distributed system consistency (Eventual Consistency).

*   **Taxonomy Prompt:** *"Generate a mapping for 'Technical Audit Reconciliation'. Map 'Kafka Event Payload' to 'PostgreSQL Table Schema'. Include 'Message UUID', 'Correlation ID', 'Timestamp (ISO-8601)', and 'Version ID'."*
*   **Logic Prompt:** *"Define the 'Check-sum' and 'Hash' verification logic for ensuring file integrity after transfer (MD5/SHA-256). Explain the 'Reconciliation Loop' logic used in Kubernetes or distributed microservices to ensure desired state matches actual state."*
*   **Exception Prompt:** *"Analyze technical exceptions like 'Out-of-Order Messages', 'Duplicate Events (Idempotency issues)', and 'Dead Letter Queue (DLQ) entries'. Provide a technical 'Root Cause Analysis' guide."*

---

## 5. Usage Scenarios

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
