# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Reconciliation is a Java Spring Boot 3.5.10 application that integrates AI capabilities (Anthropic Claude, OpenAI, DeepSeek) with PostgreSQL PGvector for vector database support. Built with Spring AI 1.1.2.

## Build and Development Commands

Uses Maven Wrapper (no Maven installation required).

### Windows
```bash
mvnw.cmd spring-boot:run          # Run the application
mvnw.cmd test                     # Run all tests
mvnw.cmd test -Dtest=TestClassName#methodName  # Run single test
mvnw.cmd clean package            # Full build
mvnw.cmd dependency:tree          # View dependencies
```

### Unix/Linux/macOS
```bash
./mvnw spring-boot:run            # Run the application
./mvnw test                       # Run all tests
./mvnw test -Dtest=TestClassName#methodName  # Run single test
./mvnw clean package              # Full build
```

### Docker
```bash
docker-compose up -d              # Start PostgreSQL PGvector
docker-compose down               # Stop services
```

## Architecture

- **Framework**: Spring Boot 3.5.10 with Java 21
- **Package**: `com.amit.smartreconciliation`
- **Entry Point**: `SmartreconciliationApplication.java`

### AI Integration (Spring AI 1.1.2)
- Anthropic Claude via `spring-ai-starter-model-anthropic`
- OpenAI via `spring-ai-starter-model-openai`
- DeepSeek via `spring-ai-starter-model-deepseek`
- Vector store via `spring-ai-starter-vector-store-pgvector`

### Database
PostgreSQL with PGvector extension, configured via Docker Compose:
- Port: 5432
- User: `myuser` / Password: `secret` / Database: `mydatabase`

## Configuration

- Application properties: `src/main/resources/application.properties`
- Docker services: `compose.yaml`
- AI API keys should be configured in application.properties or environment variables

## Development

- DevTools enabled for hot-reload
- Application runs on port 8080 by default
- Spring Boot Docker Compose support auto-starts database when running the app

## Documentation Organization

**CRITICAL: Follow this structure for ALL documentation. Never create docs in the root docs/ folder.**

### Documentation Folder Structure

```
docs/
├── README.md                    # Navigation hub only - do not modify without review
├── 01-product/                  # Product strategy, requirements, roadmap
├── 02-architecture/             # System design, architecture decisions, database
├── 03-development/              # Developer guides, API reference, tutorials
├── 04-ai-integration/           # AI features, specifications, implementation
├── 05-deployment/               # Deployment, configuration, operations
├── 06-testing/                  # Test strategy, test cases, test data
└── 99-archive/                  # Completed implementation docs (historical only)
```

### Where to Place New Documentation

**BEFORE creating ANY new documentation, determine the correct folder:**

| Document Type | Folder | Examples |
|--------------|--------|----------|
| Product features, PRDs, roadmap | `01-product/` | Feature specs, user stories |
| Architecture diagrams, ADRs, database | `02-architecture/` | C4 diagrams, schema changes |
| Development guides, API docs | `03-development/` | Setup guides, API endpoints |
| AI features, prompts, tools | `04-ai-integration/` | AI specifications, prompts |
| Deployment, config, operations | `05-deployment/` | Docker guides, runbooks |
| Test plans, test cases | `06-testing/` | Test strategies, test data |
| Completed implementation notes | `99-archive/` | Post-implementation summaries |

### Documentation Rules

1. **NEVER create .md files directly in `docs/` root** - Always use the appropriate subfolder
2. **Check folder README first** - Each folder has a README explaining what belongs there
3. **Use descriptive names** - File names should clearly indicate content (e.g., `api-endpoints.md`, not `notes.md`)
4. **Update folder README** - If adding significant docs, update the folder's README to reference them
5. **Implementation summaries go to archive** - Temporary implementation docs belong in `99-archive/`
6. **Link to existing docs** - Cross-reference related documentation instead of duplicating

### Quick Decision Guide

**Ask yourself:**
- Is this about product strategy or features? → `01-product/`
- Is this about system design or database? → `02-architecture/`
- Is this a developer guide or API doc? → `03-development/`
- Is this about AI features or prompts? → `04-ai-integration/`
- Is this about deployment or operations? → `05-deployment/`
- Is this about testing? → `06-testing/`
- Is this a completed implementation summary? → `99-archive/`

**If unsure:** Read the README.md in the target folder to confirm it's the right place.

## Workflow Rules

**IMPORTANT: Work in micro-steps to avoid losing progress in long sessions.**

1. Complete one small task at a time
2. Run build sanity check (`npm run build` for frontend, `mvnw.cmd compile` for backend)
3. Commit with a relevant message
4. Present next micro-step options to user
6. Wait for user approval before proceeding to next task
