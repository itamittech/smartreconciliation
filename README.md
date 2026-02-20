# Smart Reconciliation: The Global Reconciliation Engine

![The Global Reconciliation Engine: AI-Powered Integrity Across Every Domain](docs/01-product/globalreconengine.png)

Smart Reconciliation is an AI-native, enterprise-grade platform designed for high-integrity data matching across complex financial and operational landscapes. By fusing a high-performance deterministic engine with advanced LLM reasoning, we automate the end-to-end reconciliation lifecycle—from autonomous schema mapping to intelligent exception resolution.

### What is Reconciliation?
Reconciliation is the critical process of ensuring two sets of records (often from different systems or entities) are in agreement. It is the bedrock of financial integrity, operational consistency, and regulatory compliance.

[**▶ Watch the Financial Reconciliation Overview**](docs/01-product/Financial_Reconciliation.mp4)

<video src="https://github.com/itamittech/smartreconciliation/raw/master/docs/01-product/Financial_Reconciliation.mp4" width="100%" controls></video>

---

## Domain Expertise

Our platform is pre-configured with deep architectural and semantic knowledge across seven critical business domains, allowing for context-aware reconciliation that understands industry-specific nuances:

1.  **Banking & Cash Management:** NOSTRO/VOSTRO matching, SWIFT MT940 statement reconciliation, and "Bank-to-Book" break resolution.
2.  **Capital Markets & Investment Banking:** Trade-to-Custodian reconciliation (ISIN/CUSIP), T+1/T+2 settlement logic, and complex corporate action adjustments.
3.  **Intercompany Accounting:** Automated subsidiary eliminations, cross-border FX translation matching, and timing difference identification.
4.  **Accounts Payable (AP) & Procurement:** Three-way matching (PO vs. GRN vs. Invoice) with configurable price and quantity tolerances.
5.  **E-commerce & Payment Gateways:** Settlement-to-order reconciliation for platforms like Shopify, Amazon, Stripe, and PayPal.
6.  **Inventory & Supply Chain:** WMS vs. ERP synchronization, cycle count reconciliation, and in-transit inventory tracking.
7.  **Technological & Architectural:** Kafka-to-Database integrity checks, API message audit reconciliation, and distributed system consistency loops.

---

## Core Value Proposition

> *"Upload your datasets, let AI architect the logic, and reconcile with 99.7% precision."*

Smart Reconciliation replaces the manual "spreadsheet-and-stress" model with a **Research-Strategy-Execution** framework:
- **Research:** AI autonomously inspects schemas to identify fields and hidden relationships.
- **Strategy:** AI suggests optimal matching rules and tolerances based on detected domain context.
- **Execution:** High-speed deterministic matching followed by a cognitive "second-pass" to catch potential matches missed by traditional logic.

---

## Key Features

### AI-Native Intelligence
- **Autonomous Mapping:** 85.5% reduction in manual setup through AI-driven schema alignment with confidence scoring.
- **Cognitive Matching:** Beyond exact keys—AI identifies probable matches despite typos, formatting shifts, or missing references.
- **Auto-Annotated Exceptions:** Every exception is born with an AI-generated explanation and resolution strategy.

### Interactive AI Assistant
- **Context-Aware Chat:** A real-time assistant with "eyes" on your live data. Ask about specific breaks or dashboard trends.
- **Tool-Enabled Reasoning:** The AI can query reconciliations, exceptions, and files directly to provide evidence-based answers.
- **Streaming Tokens:** High-performance SSE streaming for instantaneous word-by-word feedback.

### Hybrid Engine Performance
- **Deterministic Precision:** 6 core match types (`EXACT`, `FUZZY`, `RANGE`, `CONTAINS`, `STARTS_WITH`, `ENDS_WITH`).
- **Asynchronous Scalability:** Background processing with real-time progress tracking for high-volume datasets.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Java 21 + Spring Boot 3.5.10 |
| **AI / LLM** | Spring AI 1.1.2 (Anthropic Claude 3.5, OpenAI GPT-4o, DeepSeek) |
| **Vector Store** | PostgreSQL 16 + PGVector for semantic knowledge |
| **Frontend** | React 19 + TypeScript + Vite |
| **State** | Zustand (Global) + TanStack React Query (Server) |
| **Streaming** | Server-Sent Events (SSE) via Fetch API `ReadableStream` |

---

## Getting Started

### 1. Infrastructure Setup
Ensure Docker is running and start the database:
```bash
docker-compose up -d
```

### 2. Configuration
Add your AI provider keys to `src/main/resources/application.properties`:
```properties
spring.ai.anthropic.api-key=your-key
spring.ai.openai.api-key=your-key
```

### 3. Build & Run
**Backend:**
```bash
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend && npm install && npm run dev
```

Access the dashboard at `http://localhost:5173`.

---

## License
Proprietary — All rights reserved.
