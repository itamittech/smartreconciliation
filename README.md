# Smart Reconciliation

An AI-powered, industry-agnostic reconciliation platform that transforms how businesses match and verify data across systems. Unlike traditional rule-based tools requiring extensive manual configuration, Smart Reconciliation uses AI to autonomously understand data formats, suggest intelligent mappings, and execute reconciliations with minimal user effort.

**Core Value Proposition:** *"Upload your data, describe what you need, and let AI handle the rest."*

## Features

### Chat-First AI Interface
- Natural language understanding for reconciliation requests
- Contextual follow-up questions when ambiguous
- AI decisions explained in plain English
- Accept corrections via conversation

### Zero-Config AI Magic
- **Autonomous Data Understanding:** Auto-detect file formats (CSV, Excel, JSON, XML), infer column types, detect delimiters and encoding
- **Intelligent Field Mapping:** Semantic matching (understands "Amt" = "Amount" = "Total"), cross-language support, confidence scores
- **Smart Reconciliation Rules:** Suggest matching strategies, propose tolerance thresholds, identify many-to-one matches

### Visual Rule Builder
- Drag-drop interface for creating matching rules
- Pre-built transformation blocks (field mapping, date parsing, currency conversion, aggregation)
- Rule library with version history

### Multi-Source Connectivity
- File uploads: CSV, Excel (.xlsx, .xls), JSON, XML
- Database connections: PostgreSQL, MySQL, SQL Server, Oracle
- REST API connector with webhook support

### Exception Management
- Intelligent flagging with severity levels
- AI-suggested resolutions
- Bulk actions and audit trail

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Java 21 + Spring Boot 3.5.10 |
| **AI Integration** | Spring AI 1.1.2 |
| **LLM Providers** | Anthropic Claude, OpenAI, DeepSeek |
| **Vector Store** | PostgreSQL + PGVector |
| **Database** | PostgreSQL |
| **Frontend** | React + TypeScript (planned) |

## Prerequisites

- Java 21
- Docker and Docker Compose
- API keys for AI providers (Anthropic, OpenAI, or DeepSeek)

## Getting Started

### 1. Start the Database

```bash
docker-compose up -d
```

This starts PostgreSQL with PGVector extension on port 5432.

### 2. Configure API Keys

Set your AI provider API keys in `src/main/resources/application.properties` or as environment variables:

```properties
spring.ai.anthropic.api-key=your-anthropic-key
spring.ai.openai.api-key=your-openai-key
spring.ai.deepseek.api-key=your-deepseek-key
```

### 3. Run the Application

**Windows:**
```bash
mvnw.cmd spring-boot:run
```

**Unix/Linux/macOS:**
```bash
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`.

## Development Commands

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

## API Endpoints

Base URL: `http://localhost:8080/api/v1`

### Core Resources

| Resource | Endpoints |
|----------|-----------|
| **Data Sources** | `POST/GET/PUT/DELETE /datasources` |
| **File Uploads** | `POST /files/upload`, `GET /files/{id}/preview` |
| **Reconciliations** | `POST/GET /reconciliations`, `GET /reconciliations/{id}/results` |
| **AI/Chat** | `POST /chat`, `POST /chat/stream`, `POST /ai/suggest-mapping` |
| **Rules** | `POST/GET/PUT/DELETE /rules` |
| **Exceptions** | `GET /exceptions`, `PUT /exceptions/{id}`, `POST /exceptions/bulk-resolve` |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  Web App (React)  │  REST API Clients  │  Webhooks Receivers    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                               │
│         (Authentication, Rate Limiting, Routing)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  Chat/NLP Service │ Reconciliation Engine │ Rule Engine          │
│  Connector Service │ AI/ML Service │ Exception Service           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  PostgreSQL (Primary DB) │ Redis (Cache) │ PGVector (Vectors)   │
│  File Storage (S3/MinIO) │ Audit Log Storage                    │
└─────────────────────────────────────────────────────────────────┘
```

## Database Configuration

PostgreSQL with PGVector is configured via Docker Compose:
- **Host:** localhost
- **Port:** 5432
- **User:** myuser
- **Password:** secret
- **Database:** mydatabase

## On-Premise Deployment

Smart Reconciliation supports air-gapped deployments with:
- Local LLM option via Ollama (Llama, Mistral)
- All data stays within customer infrastructure
- Docker-based deployment
- AES-256 encryption at rest, TLS 1.3 in transit

## License

Proprietary - All rights reserved.
