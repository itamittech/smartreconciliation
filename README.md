# Smart Reconciliation

An AI-native, industry-agnostic reconciliation platform. AI is the core engine — it identifies field mappings, generates rule sets, performs a second-pass on unmatched records, and auto-explains every exception. The deterministic matching engine handles speed and precision; AI handles intelligence and insight.

**Core Value Proposition:** *"Upload your files, let AI analyze the patterns, review the suggestions, and reconcile with confidence."*

---

## How It Works

1. **Upload** source and target files (CSV, Excel)
2. **AI Analysis** — click "Let AI Analyze Files" in the wizard or rule modal; AI inspects column schemas and suggests optimal field mappings with confidence scores
3. **Review & Adjust** — accept or reject individual mappings and matching rules; confidence badges (green ≥80%, yellow 50–79%, red <50%) guide decisions
4. **Run Reconciliation** — deterministic engine matches records using your rule set (6 match types); AI runs a second pass on any unmatched records to find POTENTIAL_MATCH candidates missed by key-based logic
5. **Exceptions with AI Insight** — every exception is auto-annotated with an AI suggestion the moment reconciliation completes; no manual "request suggestion" step
6. **Chat Assistant** — ask questions in plain English; AI queries live reconciliation data via tool calls and responds with streaming tokens in real time

---

## Features

### AI-First Rule Creation
- **Reconciliation Wizard (Step 3):** "Let AI Analyze Files" CTA → field mapping review panel → "Suggest Matching Rules" → rule review → auto-creates rule set
- **Create Rule Set Modal:** Manual | AI-Assisted mode toggle; AI-Assisted path has the same suggest-mappings + suggest-rules flow
- AI-generated rule sets display a sparkle badge in the rule library

### Intelligent Matching Engine
- 6 match types: `EXACT`, `FUZZY` (Levenshtein), `RANGE`, `CONTAINS`, `STARTS_WITH`, `ENDS_WITH`
- Key-based composite matching, async execution with progress tracking
- **AI second-pass:** after deterministic matching, AI evaluates unmatched records (≤200) and creates `POTENTIAL_MATCH` exceptions for probable cross-file matches (typos, formatting differences)

### Exception Management with Auto-AI
- 7 exception types: `MISSING_SOURCE`, `MISSING_TARGET`, `VALUE_MISMATCH`, `DUPLICATE`, `FORMAT_ERROR`, `TOLERANCE_EXCEEDED`, `POTENTIAL_MATCH`
- AI suggestions auto-populated on every exception during reconciliation (batched, up to 50 per run) — always available inline, no extra click
- Status workflow: `OPEN` → `RESOLVED` / `IGNORED`, bulk actions, audit trail

### Real-Time AI Chat
- SSE streaming: responses render word-by-word with a live cursor via `POST /chat/stream`
- AI has live tool access: queries reconciliations, exceptions, files, rule sets, and dashboard metrics in real time
- Context-aware: pass reconciliation ID for scoped assistance

### File Management
- Upload CSV and Excel (.xlsx/.xls) files
- Async schema detection (column names, types, nullable flags, sample values)
- File preview, row/column counts, status tracking

### Dashboard
- KPI cards: match rate, open exceptions, reconciliation counts
- Exception breakdown by type and severity
- Recent reconciliation activity; auto-refreshes every 60 seconds

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Java 21 + Spring Boot 3.5.10 |
| **AI / LLM** | Spring AI 1.1.2 — Anthropic Claude, OpenAI, DeepSeek |
| **AI Tool Calling** | Spring AI `@Tool` — DashboardTools, ExceptionTools, FileTools, ReconciliationTools, RuleSetTools |
| **Vector Store** | PostgreSQL + PGVector |
| **Database** | PostgreSQL 16 (Docker) |
| **Frontend** | React 19 + TypeScript + Vite |
| **Frontend State** | Zustand (UI state) + TanStack React Query (server state) |
| **Frontend Streaming** | Fetch API `ReadableStream` → SSE parser |

---

## Prerequisites

- Java 21+ (tested with OpenJDK 24)
- Node.js 18+
- Docker and Docker Compose
- API key for at least one AI provider (Anthropic, OpenAI, or DeepSeek)

---

## Getting Started

### 1. Start the Database

```bash
docker-compose up -d
```

Starts PostgreSQL with PGVector on port 5432.

### 2. Configure AI API Keys

Edit `src/main/resources/application.properties` or set environment variables:

```properties
spring.ai.anthropic.api-key=your-anthropic-key
spring.ai.openai.api-key=your-openai-key
spring.ai.deepseek.api-key=your-deepseek-key
```

### 3. Run the Backend

**Windows:**
```bash
mvnw.cmd spring-boot:run
```

**Unix/Linux/macOS:**
```bash
./mvnw spring-boot:run
```

Backend starts at `http://localhost:8080`.

### 4. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`.

---

## Development Commands

### Backend

```bash
# Windows
mvnw.cmd spring-boot:run
mvnw.cmd compile
mvnw.cmd test
mvnw.cmd test -Dtest=TestClassName#methodName
mvnw.cmd clean package

# Unix/Linux/macOS
./mvnw spring-boot:run
./mvnw compile
./mvnw test
./mvnw clean package
```

### Frontend

```bash
cd frontend
npm run dev        # Development server (port 5173)
npm run build      # Production build
npm run lint       # ESLint
```

---

## API Endpoints

Base URL: `http://localhost:8080/api/v1`

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/files/upload` | Upload CSV or Excel file |
| `GET` | `/files` | List all uploaded files |
| `GET` | `/files/{id}` | Get file metadata |
| `GET` | `/files/{id}/preview` | Preview rows and column schema |
| `DELETE` | `/files/{id}` | Delete a file |

### Reconciliations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/reconciliations` | Create reconciliation |
| `GET` | `/reconciliations` | List reconciliations (paginated) |
| `GET` | `/reconciliations/{id}` | Get reconciliation details |
| `POST` | `/reconciliations/{id}/start` | Start reconciliation run |
| `POST` | `/reconciliations/{id}/cancel` | Cancel in-progress run |
| `DELETE` | `/reconciliations/{id}` | Delete reconciliation |

### Rules
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/rules` | Create rule set (`isAiGenerated` flag supported) |
| `GET` | `/rules` | List all rule sets |
| `GET` | `/rules/{id}` | Get rule set with mappings and rules |
| `PUT` | `/rules/{id}` | Update rule set |
| `DELETE` | `/rules/{id}` | Delete rule set |
| `POST` | `/rules/{id}/duplicate` | Duplicate a rule set |
| `POST` | `/rules/{id}/test` | Dry-run test a rule set |
| `POST` | `/rules/{id}/mappings` | Add field mapping |
| `POST` | `/rules/{id}/matching-rules` | Add matching rule |

### Exceptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/exceptions` | List exceptions (filter by type, severity, status, reconciliationId) |
| `GET` | `/exceptions/{id}` | Get exception detail |
| `PUT` | `/exceptions/{id}/resolve` | Resolve an exception |
| `PUT` | `/exceptions/{id}/ignore` | Ignore an exception |
| `POST` | `/exceptions/bulk-resolve` | Bulk resolve |
| `POST` | `/exceptions/bulk-ignore` | Bulk ignore |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/suggest-mappings` | Suggest field mappings for two files |
| `POST` | `/ai/suggest-rules` | Suggest matching rules given accepted mappings |
| `POST` | `/ai/suggest-resolution/{exceptionId}` | Suggest resolution for a specific exception |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat/stream` | **SSE streaming** chat — `text/event-stream`, `data: {token}\n\n` |
| `POST` | `/chat/message` | Synchronous chat (single response) |
| `POST` | `/chat/sessions` | Create chat session |
| `GET` | `/chat/sessions` | List sessions |
| `GET` | `/chat/sessions/{id}/messages` | Get session history |
| `DELETE` | `/chat/sessions/{id}` | Delete session |

### Dashboard & Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/metrics` | Aggregate KPIs |
| `GET` | `/health` | Health check |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND (React 19)                      │
│  ReconciliationWizard  │  RulesPage  │  ExceptionsPage        │
│  ChatContainer (SSE)   │  Dashboard  │  FilesPage             │
│  Zustand + React Query │  api.ts (streamPost for SSE)         │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP / SSE
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND (Spring Boot 3.5.10)                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   AI LAYER (Core)                       │  │
│  │  AiService (Claude/OpenAI/DeepSeek via Spring AI)      │  │
│  │  • suggestMappings   • suggestRules                     │  │
│  │  • suggestPotentialMatches (AI second-pass)             │  │
│  │  • getExceptionSuggestion (auto-populates on run)       │  │
│  │  • chat / streamMessage (SSE)                           │  │
│  │                                                         │  │
│  │  Tool Services (@Tool beans wired to ChatClient):       │  │
│  │  DashboardTools │ ExceptionTools │ FileTools            │  │
│  │  ReconciliationTools │ RuleSetTools                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              RECONCILIATION ENGINE                      │  │
│  │  Deterministic matching (6 types) → AI second-pass     │  │
│  │  → Auto-populate exception AI suggestions (batched)    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Controllers: Files │ Reconciliations │ Rules │ Exceptions   │
│               Chat  │ AI              │ Dashboard            │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                        DATA LAYER                             │
│         PostgreSQL + PGVector (Docker, port 5432)            │
└──────────────────────────────────────────────────────────────┘
```

---

## Database Configuration

PostgreSQL with PGVector, started via Docker Compose:

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| User | `myuser` |
| Password | `secret` |
| Database | `mydatabase` |

---

## License

Proprietary — All rights reserved.
