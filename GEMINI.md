# GEMINI.md - Project Context for AI Agent

This document provides essential context for an AI agent working on the Smart Reconciliation project.

## 1. Project Overview

Smart Reconciliation is a full-stack, AI-native application designed for intelligent data reconciliation. It allows users to upload files (CSV, Excel, JSON, XML), match records using a powerful rules engine, and manage exceptions. The platform's core is its AI engine, which assists at every step, from suggesting field mappings and generating matching rules to providing insight into reconciliation exceptions.

**Core Workflow:**
1.  **Upload:** Users upload source and target data files.
2.  **AI Analysis:** The AI inspects the data schemas and suggests optimal field mappings and matching rules.
3.  **Review & Run:** The user reviews the AI's suggestions, makes adjustments, and executes the reconciliation. The engine performs deterministic matching, followed by an AI "second-pass" to find potential matches in the remaining records.
4.  **Manage Exceptions:** Every exception is automatically annotated with an AI-generated explanation and resolution suggestion.
5.  **AI Chat:** A chat assistant, with real-time access to the application's data via tools, provides answers to natural language questions.

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21 + Spring Boot 3.5.10 (Maven) |
| **AI / LLM** | Spring AI 1.1.2 — supporting Anthropic, OpenAI, and DeepSeek |
| **AI Tool Calling** | Spring AI `@Tool`-annotated services |
| **Vector Store** | PostgreSQL + PGVector |
| **Database** | PostgreSQL 16 (managed via Docker Compose) |
| **Frontend** | React 19 + TypeScript + Vite |
| **Frontend State** | Zustand (global UI state) + TanStack React Query (server state) |
| **Frontend Streaming** | Fetch API `ReadableStream` for Server-Sent Events (SSE) |

## 3. Architecture

### Backend (`com.amit.smartreconciliation`)
The backend follows a standard Spring Boot structure:
-   `controller/`: REST API endpoints.
-   `service/`: Core business logic.
-   `service/tool/`: A key sub-package containing `@Tool`-annotated Spring beans that expose application data and functionality to the AI chat assistant.
-   `entity/`: JPA data models.
-   `repository/`: Spring Data JPA repositories.
-   `dto/`: Data Transfer Objects for API requests and responses.
-   `config/`: Application configuration, including `AiConfig` which manages the primary `ChatModel`.

### Frontend (`frontend/src`)
-   **Component-Based:** Built with React 19 and TypeScript.
-   **State Management:** Uses Zustand for global UI state and React Query for managing server state, caching, and data fetching.
-   **API Interaction:** A centralized `services/api.ts` handles all communication with the backend.
-   **Routing:** The application uses a view-based routing system managed by the Zustand store, not traditional URL-based routing.

## 4. Build and Development Commands

**Prerequisites:**
- Java 21+
- Node.js 18+
- Docker and Docker Compose

### 1. Start Services (Required)
```bash
# Start PostgreSQL + PGVector database
docker-compose up -d
```

### 2. Run Backend
- **Configure AI Keys:** Add API keys to `src/main/resources/application.properties` (e.g., `spring.ai.openai.api-key=...`).
- **Run the application:**
  ```bash
  # On Windows
  ./mvnw.cmd spring-boot:run

  # On Unix/macOS
  ./mvnw spring-boot:run
  ```
- The backend will be available at `http://localhost:8080`.

### 3. Run Frontend
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
- The frontend will be available at `http://localhost:5173`.

### Other Important Commands
```bash
# Run all backend tests
./mvnw.cmd test

# Run all frontend E2E tests (requires running backend)
npx playwright test

# Compile backend without running
./mvnw.cmd compile
```

## 5. Development Conventions

- **Modular Design:** The backend is clearly separated by feature (controller, service, repository). The `service/tool` package is critical for AI context.
- **DTOs:** All API communication uses request/response DTOs defined in the `dto` package.
- **Async Operations:** Long-running tasks like reconciliation are handled asynchronously using `@Async`.
- **Documentation:** The `docs/` directory is highly organized by topic (`01-product`, `02-architecture`, etc.). **Never** add new files to the `docs/` root.
- **Micro-Commits:** The project prefers small, atomic commits. Always run a sanity check (`mvnw.cmd compile` or `npm run lint`) before committing.
