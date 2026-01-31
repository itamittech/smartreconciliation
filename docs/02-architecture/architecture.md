# Architecture Documentation

Smart Reconciliation System Architecture

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagrams](#architecture-diagrams)
3. [Component Details](#component-details)
4. [Data Flow](#data-flow)
5. [Technology Stack](#technology-stack)
6. [Integration Points](#integration-points)
7. [Scalability Considerations](#scalability-considerations)

---

## System Overview

Smart Reconciliation is a Spring Boot application that leverages AI capabilities to automate and intelligently manage data reconciliation across multiple sources. The system follows a layered architecture pattern with clear separation of concerns.

### Key Architectural Principles

- **Modularity**: Each component has a single, well-defined responsibility
- **Loose Coupling**: Components interact through well-defined interfaces
- **AI-First Design**: AI capabilities integrated throughout the reconciliation process
- **Scalability**: Designed to handle large datasets and concurrent reconciliations
- **Extensibility**: Easy to add new data sources, file formats, and matching algorithms

---

## Architecture Diagrams

### C4 Model - Context Diagram

```mermaid
graph TB
    User[Business User]
    Admin[System Administrator]
    Developer[Developer/Integrator]

    SmartRecon[Smart Reconciliation System]

    Anthropic[Anthropic Claude API]
    OpenAI[OpenAI API]
    DeepSeek[DeepSeek API]

    PostgreSQL[(PostgreSQL + PGVector)]
    FileStorage[(File Storage)]
    ExtDB[(External Databases)]
    RestAPI[External REST APIs]

    User -->|Upload files, run reconciliations| SmartRecon
    Admin -->|Configure rules, manage exceptions| SmartRecon
    Developer -->|Integrate via REST API| SmartRecon

    SmartRecon -->|AI suggestions, chat| Anthropic
    SmartRecon -->|AI suggestions, chat| OpenAI
    SmartRecon -->|AI suggestions, chat| DeepSeek

    SmartRecon -->|Store data, vectors| PostgreSQL
    SmartRecon -->|Read/Write files| FileStorage
    SmartRecon -->|Connect for data| ExtDB
    SmartRecon -->|Fetch reconciliation data| RestAPI
```

### C4 Model - Container Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WebApp[Web Application<br/>React + TypeScript]
        MobileApp[Mobile App<br/>Future]
        RestClient[REST API Clients]
    end

    subgraph "Smart Reconciliation System"
        API[API Gateway<br/>Spring Web]

        subgraph "Application Services"
            FileService[File Upload Service]
            ReconcileService[Reconciliation Engine]
            RuleService[Rule Engine]
            AIService[AI Service]
            ChatService[Chat Service]
            ExceptionService[Exception Management]
            DataSourceService[Data Source Connector]
        end

        subgraph "Data Layer"
            RepoLayer[JPA Repositories]
        end
    end

    subgraph "External Systems"
        PostgreSQL[(PostgreSQL<br/>Primary Database)]
        PGVector[(PGVector<br/>Vector Store)]
        Redis[(Redis Cache<br/>Future)]
        S3[(S3/MinIO<br/>File Storage)]
    end

    subgraph "AI Providers"
        Claude[Anthropic Claude]
        GPT[OpenAI GPT-4]
        DeepSeek[DeepSeek]
    end

    WebApp --> API
    RestClient --> API

    API --> FileService
    API --> ReconcileService
    API --> RuleService
    API --> AIService
    API --> ChatService
    API --> ExceptionService
    API --> DataSourceService

    FileService --> RepoLayer
    ReconcileService --> RepoLayer
    RuleService --> RepoLayer
    ChatService --> RepoLayer
    ExceptionService --> RepoLayer
    DataSourceService --> RepoLayer

    RepoLayer --> PostgreSQL
    AIService --> PGVector
    AIService --> Claude
    AIService --> GPT
    AIService --> DeepSeek

    FileService --> S3
    ReconcileService --> Redis
```

### Component Diagram - Reconciliation Engine

```mermaid
graph TB
    subgraph "Reconciliation Engine"
        Controller[Reconciliation Controller]
        Service[Reconciliation Service]

        subgraph "Core Components"
            Matcher[Data Matcher]
            Validator[Data Validator]
            Transformer[Data Transformer]
            Aggregator[Result Aggregator]
        end

        subgraph "Matching Algorithms"
            ExactMatch[Exact Match]
            FuzzyMatch[Fuzzy Match]
            RangeMatch[Range Match]
            AIMatch[AI-Powered Match]
        end

        ExceptionGen[Exception Generator]
        Stats[Statistics Calculator]
    end

    FileRepo[(File Repository)]
    RuleRepo[(Rule Repository)]
    ReconcileRepo[(Reconciliation Repository)]

    Controller --> Service
    Service --> Matcher
    Service --> Validator
    Service --> Transformer
    Service --> Aggregator

    Matcher --> ExactMatch
    Matcher --> FuzzyMatch
    Matcher --> RangeMatch
    Matcher --> AIMatch

    Matcher --> ExceptionGen
    Service --> Stats

    Service --> FileRepo
    Service --> RuleRepo
    Service --> ReconcileRepo
    ExceptionGen --> ReconcileRepo
```

### Component Diagram - AI Integration

```mermaid
graph TB
    subgraph "AI Service Layer"
        AIController[AI Controller]
        AIService[AI Service]
        ChatController[Chat Controller]
        ChatService[Chat Service]

        subgraph "AI Capabilities"
            FieldMapper[Field Mapping Suggester]
            RuleSuggester[Rule Suggester]
            ExceptionAdvisor[Exception Advisor]
            NLPProcessor[Natural Language Processor]
        end

        subgraph "Spring AI Integration"
            ChatClient[Chat Client]
            VectorStore[Vector Store Client]
            PromptTemplate[Prompt Templates]
        end
    end

    subgraph "AI Providers"
        Anthropic[Anthropic Claude<br/>Primary]
        OpenAI[OpenAI GPT-4<br/>Secondary]
        DeepSeek[DeepSeek<br/>Cost-effective]
    end

    PostgreSQL[(PostgreSQL<br/>PGVector)]

    AIController --> AIService
    ChatController --> ChatService

    AIService --> FieldMapper
    AIService --> RuleSuggester
    ChatService --> NLPProcessor
    AIService --> ExceptionAdvisor

    FieldMapper --> ChatClient
    RuleSuggester --> ChatClient
    ExceptionAdvisor --> ChatClient
    NLPProcessor --> ChatClient

    ChatClient --> PromptTemplate
    ChatClient --> Anthropic
    ChatClient --> OpenAI
    ChatClient --> DeepSeek

    AIService --> VectorStore
    VectorStore --> PostgreSQL
```

---

## Component Details

### 1. API Layer

#### Controllers

**Purpose:** Handle HTTP requests and responses, input validation, error handling.

**Key Controllers:**
- `ReconciliationController` - Manages reconciliation lifecycle
- `FileController` - File upload and management
- `RuleController` - Rule set CRUD operations
- `ExceptionController` - Exception management with filtering
- `ChatController` - Chat interface and streaming
- `AiController` - AI-powered suggestions
- `DataSourceController` - External data source management
- `DashboardController` - Metrics and statistics
- `HealthController` - Health checks

**Responsibilities:**
- Request validation using `@Valid` annotations
- Response wrapping in standard `ApiResponse` envelope
- Exception handling and error responses
- HTTP status code management

### 2. Service Layer

#### Core Services

**FileUploadService**
- Handles multipart file uploads
- Validates file types (CSV, Excel, JSON, XML)
- Coordinates schema detection
- Manages file metadata

**FileParserService**
- Parses different file formats
- Extracts data into standardized format
- Handles encoding detection
- Manages large file processing

**SchemaDetectionService**
- Auto-detects column types
- Infers data formats (dates, currencies, numbers)
- Identifies primary keys and unique fields
- Generates sample data for each column

**ReconciliationService**
- Orchestrates the reconciliation process
- Manages reconciliation lifecycle (PENDING → RUNNING → COMPLETED/FAILED)
- Coordinates matching algorithms
- Calculates statistics and match rates
- Generates reconciliation results

**RuleService**
- Manages rule sets and configurations
- Handles field mappings
- Maintains matching rules
- Validates rule consistency

**AiService**
- Provides AI-powered field mapping suggestions
- Generates matching rule recommendations
- Offers exception resolution suggestions
- Integrates with multiple AI providers

**ChatService**
- Manages chat sessions
- Handles message history
- Provides streaming responses
- Contextual AI conversations

**ExceptionService**
- Creates and manages reconciliation exceptions
- Categorizes exceptions by type and severity
- Provides filtering and pagination
- Bulk exception operations

**DataSourceService**
- Manages external data source connections
- Tests connectivity
- Handles authentication
- Coordinates data extraction

### 3. Data Layer

#### Entity Model

**Core Entities:**

```mermaid
erDiagram
    Organization ||--o{ User : has
    Organization ||--o{ DataSource : owns
    Organization ||--o{ UploadedFile : owns
    Organization ||--o{ RuleSet : owns
    Organization ||--o{ Reconciliation : owns
    Organization ||--o{ ChatSession : owns

    User ||--o{ UploadedFile : uploads
    User ||--o{ Reconciliation : creates
    User ||--o{ ChatSession : initiates

    UploadedFile ||--o{ Reconciliation : "source/target"
    RuleSet ||--o{ FieldMapping : contains
    RuleSet ||--o{ MatchingRule : contains
    RuleSet ||--o{ Reconciliation : "used in"

    Reconciliation ||--o{ ReconciliationException : generates
    ChatSession ||--o{ ChatMessage : contains
    Reconciliation ||--o{ ChatSession : "related to"
```

**Entity Descriptions:**

- **Organization** - Multi-tenant support, isolates data by organization
- **User** - System users with role-based access
- **DataSource** - External data source configurations
- **UploadedFile** - File metadata and parsing results
- **RuleSet** - Collection of field mappings and matching rules
- **FieldMapping** - Maps source fields to target fields with transformations
- **MatchingRule** - Defines matching logic (exact, fuzzy, range, etc.)
- **Reconciliation** - Reconciliation job with status and results
- **ReconciliationException** - Unmatched or problematic records
- **ChatSession** - Chat conversation container
- **ChatMessage** - Individual chat messages (user and assistant)

#### Repository Pattern

All data access uses Spring Data JPA repositories:

```java
public interface ReconciliationRepository extends JpaRepository<Reconciliation, Long> {
    List<Reconciliation> findByOrganizationId(Long organizationId);
    List<Reconciliation> findByStatus(ReconciliationStatus status);
}
```

### 4. AI Integration Layer

#### Spring AI Architecture

The system uses Spring AI 1.1.2 for AI integration, providing:

**Chat Clients:**
- `AnthropicChatClient` - Primary AI provider (Claude Sonnet 4)
- `OpenAiChatClient` - Secondary provider (GPT-4o)
- `DeepSeekChatClient` - Cost-effective alternative

**Vector Store:**
- `PGVectorStore` - PostgreSQL with PGVector extension for semantic search

**Prompt Engineering:**
- Template-based prompts for consistency
- Context injection from reconciliation data
- Few-shot learning examples

**AI Provider Selection:**

Configured via `application.properties`:
```properties
app.ai.provider=anthropic  # or openai, deepseek
```

Runtime provider switching based on:
- Configuration preference
- Availability
- Cost optimization
- Response time requirements

---

## Data Flow

### File Upload and Reconciliation Flow

```mermaid
sequenceDiagram
    participant User
    participant FileController
    participant FileUploadService
    participant FileParserService
    participant SchemaDetectionService
    participant Database

    User->>FileController: POST /files/upload
    FileController->>FileUploadService: uploadFile(multipartFile)
    FileUploadService->>FileParserService: parseFile(file)
    FileParserService-->>FileUploadService: ParsedData
    FileUploadService->>SchemaDetectionService: detectSchema(data)
    SchemaDetectionService-->>FileUploadService: SchemaResponse
    FileUploadService->>Database: save(UploadedFile)
    Database-->>FileUploadService: savedFile
    FileUploadService-->>FileController: UploadedFileResponse
    FileController-->>User: 201 Created
```

### Reconciliation Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant ReconcileController
    participant ReconcileService
    participant RuleService
    participant FileService
    participant Matcher
    participant ExceptionService
    participant Database

    User->>ReconcileController: POST /reconciliations
    ReconcileController->>ReconcileService: create(request)
    ReconcileService->>Database: save(Reconciliation - PENDING)
    ReconcileService->>RuleService: getById(ruleSetId)
    RuleService-->>ReconcileService: RuleSet
    ReconcileService->>FileService: getById(sourceFileId)
    FileService-->>ReconcileService: sourceData
    ReconcileService->>FileService: getById(targetFileId)
    FileService-->>ReconcileService: targetData

    ReconcileService->>Matcher: match(sourceData, targetData, rules)

    loop For each matching algorithm
        Matcher->>Matcher: applyMatchingRule()
        Matcher->>ExceptionService: createException(unmatched)
    end

    Matcher-->>ReconcileService: MatchResults
    ReconcileService->>Database: update(Reconciliation - COMPLETED)
    ReconcileService-->>ReconcileController: ReconciliationResponse
    ReconcileController-->>User: 201 Created
```

### AI-Powered Field Mapping Flow

```mermaid
sequenceDiagram
    participant User
    participant AiController
    participant AiService
    participant FileService
    participant ChatClient
    participant AnthropicAPI
    participant VectorStore

    User->>AiController: POST /ai/suggest-mapping
    AiController->>AiService: suggestMappings(request)
    AiService->>FileService: getSchema(sourceFileId)
    FileService-->>AiService: sourceSchema
    AiService->>FileService: getSchema(targetFileId)
    FileService-->>AiService: targetSchema

    AiService->>VectorStore: searchSimilar(fieldNames)
    VectorStore-->>AiService: semanticMatches

    AiService->>ChatClient: call(prompt + schemas)
    ChatClient->>AnthropicAPI: API request
    AnthropicAPI-->>ChatClient: AI response
    ChatClient-->>AiService: suggestions

    AiService-->>AiController: MappingSuggestionResponse
    AiController-->>User: 200 OK
```

### Chat Streaming Flow

```mermaid
sequenceDiagram
    participant User
    participant ChatController
    participant ChatService
    participant ChatClient
    participant AnthropicAPI

    User->>ChatController: POST /chat/stream
    ChatController->>ChatService: streamMessage(request)
    ChatService->>ChatClient: stream(prompt)

    ChatClient->>AnthropicAPI: streaming request

    loop Stream chunks
        AnthropicAPI-->>ChatClient: content chunk
        ChatClient-->>ChatService: chunk
        ChatService-->>ChatController: Flux<String>
        ChatController-->>User: SSE: data: chunk
    end

    ChatService->>ChatService: saveMessages()
```

---

## Technology Stack

### Backend Framework

- **Spring Boot 3.5.10**
  - Spring Web (REST API)
  - Spring Data JPA (Data access)
  - Spring Validation (Input validation)
  - Spring WebFlux (Reactive streaming)
  - Spring Boot DevTools (Development)

### Database

- **PostgreSQL 16**
  - Primary relational database
  - JSONB support for flexible data storage
  - Full-text search capabilities

- **PGVector Extension**
  - Vector storage for semantic search
  - AI embedding storage
  - Similarity search

### AI Integration

- **Spring AI 1.1.2**
  - Unified AI abstraction layer
  - Multiple provider support
  - Vector store integration
  - Prompt templating

- **AI Providers**
  - Anthropic Claude (Sonnet 4) - Primary
  - OpenAI GPT-4o - Secondary
  - DeepSeek - Cost-effective alternative

### File Processing

- **Apache Commons CSV 1.10.0** - CSV parsing
- **Apache POI 5.2.5** - Excel file processing (.xlsx, .xls)
- **Jackson** - JSON processing

### Build Tools

- **Maven 3.x** - Dependency management and build
- **Maven Wrapper** - Consistent Maven version

### Runtime

- **Java 21** - LTS version with modern features
- **Docker Compose** - Local development environment
- **PostgreSQL Docker Image** - pgvector/pgvector:pg16

### Development Tools

- **Lombok** - Reduces boilerplate code
- **Spring Boot DevTools** - Hot reload
- **Spring Dotenv** - Environment variable management

---

## Integration Points

### AI Service Integration

**Anthropic Claude API**
```
Endpoint: https://api.anthropic.com/v1/messages
Model: claude-sonnet-4-20250514
Max Tokens: 4096
```

**OpenAI API**
```
Endpoint: https://api.openai.com/v1/chat/completions
Model: gpt-4o
Max Tokens: 4096
```

**DeepSeek API**
```
Endpoint: https://api.deepseek.com/v1/chat/completions
Model: deepseek-chat
Max Tokens: 4096
```

### Database Integration

**PostgreSQL Connection**
```
JDBC URL: jdbc:postgresql://localhost:5432/mydatabase
Driver: org.postgresql.Driver
Pool: HikariCP (default)
```

**PGVector Extension**
```
Extension: vector
Vector Dimensions: Configurable (default 1536 for OpenAI embeddings)
Distance Metric: Cosine similarity
```

### File Storage

**Current Implementation:**
- Local filesystem: `./uploads`
- File organization: `{uploadDir}/{organizationId}/{fileId}/`

**Production Recommendations:**
- Amazon S3 or S3-compatible storage (MinIO)
- Azure Blob Storage
- Google Cloud Storage

### External Data Sources

**Supported Types:**
- PostgreSQL, MySQL, SQL Server, Oracle databases
- REST APIs with OAuth/API key authentication
- File-based sources (CSV, Excel, JSON, XML)
- Future: Webhooks, message queues

---

## Scalability Considerations

### Current Architecture (Single Instance)

**Suitable for:**
- Up to 1000 reconciliations/day
- File sizes up to 100MB
- Concurrent users: 10-50

### Horizontal Scaling Strategy

**Load Balancing:**
```mermaid
graph TB
    LB[Load Balancer]
    App1[App Instance 1]
    App2[App Instance 2]
    App3[App Instance 3]

    DB[(PostgreSQL<br/>Primary)]
    DBR[(PostgreSQL<br/>Read Replica)]
    Redis[(Redis Cache)]
    S3[(S3 Storage)]

    LB --> App1
    LB --> App2
    LB --> App3

    App1 --> Redis
    App2 --> Redis
    App3 --> Redis

    App1 --> DB
    App2 --> DB
    App3 --> DB

    App1 -.read.-> DBR
    App2 -.read.-> DBR
    App3 -.read.-> DBR

    App1 --> S3
    App2 --> S3
    App3 --> S3
```

### Performance Optimizations

**Database:**
- Connection pooling (HikariCP)
- Indexed queries on frequently accessed columns
- Partitioning for large tables
- Read replicas for reporting

**Caching:**
- Redis for session data
- Application-level caching for file schemas
- CDN for static assets

**Async Processing:**
- Thread pool for reconciliation execution
- Message queue for long-running tasks (RabbitMQ/Kafka)
- Async exception generation

**File Processing:**
- Streaming for large files
- Chunked processing
- Parallel processing for multiple files

---

## Security Architecture

### Current State (Development)

- No authentication implemented
- CORS enabled for localhost development
- Database credentials in configuration files
- API keys in `.env` file

### Production Security Requirements

**Authentication & Authorization:**
```mermaid
graph LR
    User[User] --> Auth[Authentication Service]
    Auth --> JWT[JWT Token]
    JWT --> API[API Gateway]
    API --> RBAC[Role-Based Access Control]
    RBAC --> Services[Application Services]
```

**Security Layers:**

1. **API Gateway**
   - JWT token validation
   - Rate limiting
   - IP whitelisting
   - Request/response logging

2. **Application Security**
   - Role-based access control (RBAC)
   - Organization-level data isolation
   - Input validation and sanitization
   - SQL injection prevention (JPA/Hibernate)

3. **Data Security**
   - Encryption at rest (database level)
   - Encryption in transit (TLS 1.3)
   - Sensitive data masking in logs
   - Secure API key storage (vault)

4. **AI Security**
   - API key rotation
   - Request/response audit logging
   - PII detection and redaction
   - Rate limiting per provider

---

## Deployment Architecture

### Development Environment

```
Local Machine
├── Spring Boot App (port 8080)
├── PostgreSQL Docker (port 5432)
└── File Storage (./uploads)
```

### Production Environment (Recommended)

```mermaid
graph TB
    subgraph "DMZ"
        LB[Load Balancer]
        WAF[Web Application Firewall]
    end

    subgraph "Application Tier"
        App1[App Container 1]
        App2[App Container 2]
        App3[App Container 3]
    end

    subgraph "Data Tier"
        DBPrimary[(PostgreSQL Primary)]
        DBReplica[(PostgreSQL Replica)]
        Redis[(Redis Cluster)]
    end

    subgraph "Storage Tier"
        S3[(S3/MinIO)]
        Backup[(Backup Storage)]
    end

    Internet[Internet] --> WAF
    WAF --> LB
    LB --> App1
    LB --> App2
    LB --> App3

    App1 --> DBPrimary
    App2 --> DBPrimary
    App3 --> DBPrimary

    App1 --> Redis
    App2 --> Redis
    App3 --> Redis

    App1 --> S3
    App2 --> S3
    App3 --> S3

    DBPrimary -.replication.-> DBReplica
    DBPrimary --> Backup
    S3 --> Backup
```

### Docker Deployment

**Multi-container deployment:**

```yaml
version: '3.8'
services:
  app:
    image: smartreconciliation:latest
    replicas: 3
    environment:
      - SPRING_PROFILES_ACTIVE=production
    depends_on:
      - postgres
      - redis

  postgres:
    image: pgvector/pgvector:pg16
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
```

---

## Monitoring and Observability

### Metrics to Monitor

**Application Metrics:**
- Request rate, latency, error rate
- Active reconciliations
- File upload success/failure rate
- AI API response times
- Exception rate

**Infrastructure Metrics:**
- CPU, memory, disk usage
- Database connection pool
- Thread pool utilization
- Network I/O

**Business Metrics:**
- Reconciliations per day
- Average match rate
- Exception resolution time
- User activity

### Logging Strategy

**Log Levels:**
- `ERROR` - System errors, exceptions
- `WARN` - Recoverable errors, deprecations
- `INFO` - Business events (reconciliation started, file uploaded)
- `DEBUG` - Detailed debugging information (development only)

**Log Aggregation:**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- CloudWatch Logs (AWS)

### Health Checks

**Liveness Probe:**
```http
GET /actuator/health/liveness
```

**Readiness Probe:**
```http
GET /actuator/health/readiness
```

---

## Future Architecture Enhancements

### Microservices Migration

Potential split into:
- **File Service** - File upload and parsing
- **Reconciliation Service** - Core matching engine
- **AI Service** - AI capabilities
- **Rule Service** - Rule management
- **Notification Service** - Email, webhooks

### Event-Driven Architecture

```mermaid
graph LR
    FileUpload[File Upload] -->|event| Queue[Message Queue]
    Queue --> ReconcileEngine[Reconciliation Engine]
    ReconcileEngine -->|event| Queue
    Queue --> Notification[Notification Service]
    Queue --> Analytics[Analytics Service]
```

### AI Enhancements

- Local LLM support (Ollama, LM Studio)
- Fine-tuned models for domain-specific matching
- Reinforcement learning from user feedback
- Multi-modal AI (OCR for scanned documents)

---

## Conclusion

The Smart Reconciliation architecture is designed to be:
- **Scalable** - Can handle increasing load through horizontal scaling
- **Maintainable** - Clear separation of concerns, modular design
- **Extensible** - Easy to add new features, data sources, AI providers
- **Resilient** - Graceful degradation, error handling
- **Observable** - Comprehensive monitoring and logging

For implementation details, see:
- [API Reference](api-reference.md)
- [Developer Guide](developer-guide.md)
- [Deployment Guide](deployment-guide.md)
- [Database Documentation](database-schema.md)
