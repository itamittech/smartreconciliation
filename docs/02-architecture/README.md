# Architecture Documentation

System architecture, design decisions, and database documentation.

## Documents in This Section

### [Architecture](architecture.md)

System architecture documentation covering:
- **C4 Model Diagrams** - Context, container, and component views
- **Technology Stack** - Java 21, Spring Boot 3.5.10, Spring AI 1.1.2
- **Component Design** - Layer responsibilities and interactions

### [Reconciliation Pipelines](reconciliation-pipelines.md)

Detailed architecture for N-way/chained matching:
- **Pipeline Data Flow** - Materialized intermediate artifacts
- **Input Resolver Pattern** - Decoupling engine from file storage
- **Stream Entities** - Managing complex multi-source workflows

### [Database Schema](database-schema.md)

Complete database documentation:
- **Entity Relationship Diagrams** - Visual schema representation
- **Table Definitions** - All 11 tables with columns and types
- **Relationships** - Foreign keys and constraints
- **Indexes** - Performance optimization
- **JSONB Structures** - Dynamic field specifications
- **PGVector Configuration** - Vector store setup for AI features
- **Migration Strategy** - Schema evolution approach

## Audience

- Software Architects
- Senior Developers
- Database Administrators
- Technical Leadership
- System Integrators

## Key Technologies

- **Backend:** Java 21, Spring Boot 3.5.10
- **AI Framework:** Spring AI 1.1.2 (Anthropic, OpenAI, DeepSeek)
- **Database:** PostgreSQL with PGVector extension
- **Build Tool:** Maven with Wrapper
- **Frontend:** React 19 + TypeScript (see [Product Requirements](../01-product/product-requirements.md))

## Related Documentation

- [Developer Guide](../03-development/developer-guide.md) - Development setup
- [Deployment Guide](../05-deployment/deployment-guide.md) - Production deployment
- [AI Integration Guide](../04-ai-integration/ai-integration-guide.md) - AI architecture

---

For system design and architectural decisions, start with [Architecture](architecture.md).
