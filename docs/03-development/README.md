# Development Documentation

Developer guides and API reference for building with Smart Reconciliation.

## Documents in This Section

### [Developer Guide](developer-guide.md)

Complete development setup and workflow:
- **Environment Setup** - Prerequisites and installation
- **Project Structure** - Code organization and packages
- **Development Workflow** - Micro-step development process
- **Build Commands** - Maven wrapper usage
- **Testing Strategies** - Unit and integration testing
- **Code Standards** - Style guide and best practices
- **Common Tasks** - Frequently used operations
- **Troubleshooting** - Common issues and solutions

### [API Reference](api-reference.md)

Complete REST API documentation:
- **Authentication** - API security and tokens
- **Endpoints** - All REST endpoints with examples
- **Request/Response** - Complete schemas and formats
- **Error Codes** - Error handling and status codes
- **Rate Limiting** - API usage limits
- **Pagination** - List endpoint pagination
- **File Upload** - Multipart form data handling

## Audience

- Software Developers
- Frontend Developers
- API Integrators
- Technical Contributors
- QA Engineers

## Quick Start

1. **Prerequisites:** Java 21, Docker (for PostgreSQL)
2. **Clone repository**
3. **Start database:** `docker-compose up -d`
4. **Run application:** `mvnw.cmd spring-boot:run` (Windows) or `./mvnw spring-boot:run` (Unix)
5. **Access API:** http://localhost:8080

## Development Tools

- **IDE:** IntelliJ IDEA, Eclipse, or VS Code with Java extensions
- **Build:** Maven Wrapper (included, no Maven install required)
- **Database:** PostgreSQL with PGVector (via Docker Compose)
- **API Testing:** Postman, curl, or Insomnia
- **Version Control:** Git

## Related Documentation

- [Architecture](../02-architecture/architecture.md) - System design
- [Testing Documentation](../06-testing/README.md) - Testing strategy
- [AI Integration Guide](../04-ai-integration/ai-integration-guide.md) - AI features
- [Configuration Reference](../05-deployment/configuration-reference.md) - Configuration options

---

For getting started with development, begin with the [Developer Guide](developer-guide.md).
