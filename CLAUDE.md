# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Reconciliation is a full-stack application: **Java Spring Boot 3.5.10 backend** + **React 19 TypeScript frontend**. It provides AI-powered data reconciliation, allowing users to upload files (CSV/Excel/JSON/XML), define rule sets, run reconciliations, and interact via AI chat (Claude, OpenAI, or DeepSeek).

## Build and Development Commands

### Backend (Maven Wrapper — no Maven install required)
```bash
# Windows
mvnw.cmd spring-boot:run                              # Run backend (port 8080)
mvnw.cmd test                                         # Run all backend tests
mvnw.cmd test -Dtest=TestClassName#methodName         # Run single test
mvnw.cmd compile                                      # Compile only (sanity check)
mvnw.cmd clean package                                # Full build

# Unix/macOS
./mvnw spring-boot:run
./mvnw test
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:5173
npm run build        # Production build
npm run lint         # ESLint check
npx playwright test  # Run E2E tests (requires running backend)
```

### Docker
```bash
docker-compose up -d   # Start PostgreSQL + PGVector (required for backend)
docker-compose down    # Stop services
```

Spring Boot Docker Compose support auto-starts the database when running the app.

## Architecture

### Backend Package Structure (`com.amit.smartreconciliation`)
- **controller/** — REST endpoints (File, Reconciliation, Rule, Chat, AI, DataSource, Exception, Dashboard)
- **service/** — Business logic; core services + `service/tool/` for AI context tools
- **entity/** — JPA entities (Reconciliation, RuleSet, ChatMessage, ReconciliationException, etc.)
- **repository/** — Spring Data JPA repositories
- **dto/** — Request/response models in `dto/request/` and `dto/response/`
- **config/** — Spring configuration (AiConfig, AsyncConfig, FileStorageConfig, WebConfig)
- **enums/** — Status/type enums (ReconciliationStatus, ExceptionSeverity, FileStatus, etc.)
- **exception/** — GlobalExceptionHandler + custom exceptions; all REST errors use `ApiResponse<T>`

### AI Integration (Spring AI 1.1.2)
Provider is selected via `app.ai.provider=anthropic|openai|deepseek` in `application.properties`. `AiConfig` marks the configured provider's `ChatModel` as `@Primary`.

**Tool services** in `service/tool/` expose `@Tool`-annotated methods that give the AI context about the current state (files, rule sets, reconciliations, dashboard metrics, exceptions). These are registered with `ChatClient` when building prompts.

Models configured:
- Anthropic: `claude-sonnet-4-20250514`, max 4096 tokens
- OpenAI: `gpt-4o`, max 4096 tokens
- DeepSeek: `deepseek-chat`, max 4096 tokens

### Frontend Architecture (`frontend/src/`)
- **State**: Zustand (`useAppStore`) manages global state — sidebar, active view, chat sessions, reconciliations, exceptions, files
- **API Layer**: Centralized `services/api.ts` with a generic `fetchApi<T>()` helper; responses typed as `ApiResponse<T>` matching the backend wrapper
- **Routing**: View-based (not URL-based) — active view in Zustand store, `App.tsx` renders the matching page
- **Pages**: Home (dashboard), Chat, Reconciliations, Exceptions, Rules, Files, Settings
- **Testing**: Playwright E2E tests in `frontend/tests/e2e/`; spec docs in `frontend/test-specs/`

### Data Flow
- **Reconciliation**: Upload files → detect schema → create rule set → execute reconciliation (async) → view results/exceptions
- **AI Chat**: Message → `ChatService` persists → `AiService` builds prompt with tool context → `ChatClient` calls LLM → response persisted
- **File Processing**: `FileUploadService` saves → `FileParserService` parses CSV/Excel/JSON/XML → `SchemaDetectionService` auto-detects column types

### Key Infrastructure
- PostgreSQL 16 with PGVector extension (Docker Compose, port 5432, user `myuser`/`secret`, db `mydatabase`)
- Async processing: `@Async` on long-running tasks, thread pool configured in `AsyncConfig` (core=4, max=8)
- CORS: allows `http://localhost:5173` (frontend dev) and `http://localhost:3000`
- File uploads: max 100MB, stored locally via `FileStorageConfig`
- `.env` file loaded at startup via Spring Dotenv

## Documentation Organization

**CRITICAL: Never create `.md` files directly in `docs/` root. Always use the appropriate subfolder.**

```
docs/
├── 01-product/      # Product strategy, requirements, roadmap
├── 02-architecture/ # System design, architecture decisions, database schema
├── 03-development/  # Developer guides, API reference
├── 04-ai-integration/ # AI features, prompts, tool definitions
├── 05-deployment/   # Deployment, configuration, operations
├── 06-testing/      # Test strategy, test cases, test data
└── 99-archive/      # Completed implementation docs (historical only)
```

Quick guide: product/features → `01-product/` | system design/DB → `02-architecture/` | dev guide/API → `03-development/` | AI features → `04-ai-integration/` | deployment/ops → `05-deployment/` | testing → `06-testing/` | completed implementation notes → `99-archive/`

When unsure, read the README in the target folder to confirm placement.

## Workflow Rules

**Work in micro-steps to avoid losing progress in long sessions.**

1. Complete one small task at a time
2. Run build sanity check (`npm run build` for frontend, `mvnw.cmd compile` for backend)
3. Commit with a relevant message
4. Present next micro-step options to user
5. Wait for user approval before proceeding to next task
