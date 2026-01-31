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

### [AI Chat Tools Specification](ai-chat-tools-specification.md)

Phase 1 chat tools implementation:
- **Function Calling** - Spring AI function calling architecture
- **Tool Definitions** - Available chat assistant tools
- **Implementation Status** - Phase 1 completion details
- **Integration Points** - How tools interact with services
- **Usage Examples** - Chat tool invocation patterns

### [AI Context Enhancement](ai-context-enhancement.md)

Hybrid context system design:
- **Context Architecture** - System + dynamic context approach
- **Context Retrieval** - How context is gathered
- **Context Building** - Template-based context assembly
- **Tool Integration** - Context-aware tool execution
- **Performance** - Context size optimization

### [AI Tools Implementation Status](ai-tools-implementation-status.md)

Current implementation tracking:
- **Completed Features** - Phase 1 deliverables
- **Pending Work** - Future enhancements
- **Known Limitations** - Current constraints
- **Performance Metrics** - Response times and accuracy

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
