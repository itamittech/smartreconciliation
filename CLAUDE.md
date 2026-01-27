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

## Workflow Rules

**IMPORTANT: Work in micro-steps to avoid losing progress in long sessions.**

1. Complete one small task at a time
2. Run build sanity check (`npm run build` for frontend, `mvnw.cmd compile` for backend)
3. Commit with a relevant message
4. Present next micro-step options to user
5. Wait for user approval before proceeding to next task
