# AI Integration Documentation

AI capabilities, implementation guides, and Spring AI integration.

## Documents in This Section

### [AI Integration Guide](ai-integration-guide.md)

Comprehensive AI features documentation:
- **Spring AI Framework** - Architecture and abstractions
- **AI Providers** - Anthropic Claude, OpenAI, DeepSeek comparison
- **ChatClient API** - Unified interface for AI interactions
- **Field Mapping Suggestions** - AI-powered schema mapping
- **Rule Generation** - Automatic matching rule suggestions
- **Exception Resolution** - AI-powered discrepancy analysis
- **Chat Interface** - Conversational assistant implementation
- **Vector Store** - PGVector integration for semantic search
- **Prompt Engineering** - Best practices and examples
- **Cost Management** - Token usage and optimization

### [AI Tools Implementation Status](ai-tools-implementation-status.md)

Current state of all AI tool implementations:
- **Tool Services** - 5 `@Tool`-annotated beans wired into ChatClient
- **AI Capabilities** - Mapping suggestions, rule suggestions, exception analysis, streaming chat
- **Spring AI Pattern** - `@Tool` + `.tools(beans...)` per prompt (not `defaultFunctions()`)
- **Implementation Notes** - Correct approach vs. discarded alternatives

### [NotebookLM Knowledge Integration Plan](notebooklm-knowledge-integration-plan.md)

Domain-specific RAG strategy using local PGVector:
- **Local RAG Approach** - Export from NotebookLM → embed → store in PGVector
- **Domain Taxonomy** - Banking, Trading, AP, Inventory, Intercompany, E-commerce, Technical
- **Knowledge Ingestion** - `KnowledgeIngestionService` design
- **Retrieval Integration** - Pre-flight vector search in `AiService`

## Audience

- AI/ML Engineers
- Backend Developers
- Integration Developers
- Product Managers
- Technical Architects

## AI Capabilities Overview

Smart Reconciliation integrates AI for:

1. **Intelligent Field Mapping** - Automatically suggests column mappings between source and target files
2. **Rule Recommendations** - Proposes matching strategies based on data patterns
3. **Exception Analysis** - Provides natural language explanations of discrepancies
4. **Conversational Assistant** - Chat interface with context-aware responses
5. **Semantic Search** - Vector-based similarity search for fuzzy matching

## AI Provider Selection

| Provider | Best For | Strengths |
|----------|----------|-----------|
| **Anthropic Claude** | Primary (recommended) | Best accuracy, nuanced analysis, function calling |
| **OpenAI GPT-4o** | Alternative | Strong performance, widely adopted |
| **DeepSeek** | Cost-effective | High-volume operations, budget-conscious deployments |

## Configuration

AI providers configured in `application.properties`:

```properties
# Select provider: anthropic, openai, or deepseek
app.ai.provider=anthropic

# API Keys (only needed for selected provider)
spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY}
spring.ai.openai.api-key=${OPENAI_API_KEY}
spring.ai.deepseek.api-key=${DEEPSEEK_API_KEY}
```

## Related Documentation

- [Developer Guide](../03-development/developer-guide.md) - Development setup
- [API Reference](../03-development/api-reference.md) - AI API endpoints
- [Architecture](../02-architecture/architecture.md) - System architecture
- [Configuration Reference](../05-deployment/configuration-reference.md) - AI configuration options

---

For AI feature implementation, start with the [AI Integration Guide](ai-integration-guide.md).
