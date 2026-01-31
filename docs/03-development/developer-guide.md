# Developer Guide

Complete guide for developers working on Smart Reconciliation

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Code Organization](#code-organization)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Code Style and Standards](#code-style-and-standards)
8. [Common Development Tasks](#common-development-tasks)
9. [Troubleshooting](#troubleshooting)
10. [Contributing Guidelines](#contributing-guidelines)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Java 21** (JDK)
  - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use [SDKMAN](https://sdkman.io/)
  - Verify: `java -version` should show version 21.x.x

- **Docker Desktop**
  - Download from [Docker](https://www.docker.com/products/docker-desktop)
  - Required for PostgreSQL with PGVector
  - Verify: `docker --version` and `docker-compose --version`

- **Git**
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify: `git --version`

- **IDE** (recommended)
  - IntelliJ IDEA (Ultimate or Community)
  - VS Code with Java extensions
  - Eclipse with Spring Tools

### Optional Tools

- **Postman** or **Insomnia** - API testing
- **DBeaver** or **pgAdmin** - Database management
- **curl** - Command-line API testing

---

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smartreconciliation.git
cd smartreconciliation
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# Windows
copy .env.example .env

# Unix/Linux/macOS
cp .env.example .env
```

Edit `.env` with your API keys:

```properties
# AI Provider API Keys
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
DEEPSEEK_API_KEY=your-key-here

# Database (optional, uses defaults from compose.yaml)
POSTGRES_DB=mydatabase
POSTGRES_USER=myuser
POSTGRES_PASSWORD=secret
```

**Where to get API keys:**
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys
- DeepSeek: https://platform.deepseek.com/

### 3. Start PostgreSQL Database

```bash
docker-compose up -d
```

This starts PostgreSQL with PGVector extension on port 5432.

**Verify database is running:**
```bash
docker-compose ps
```

### 4. Build the Application

**Windows:**
```bash
mvnw.cmd clean install
```

**Unix/Linux/macOS:**
```bash
./mvnw clean install
```

This downloads dependencies and builds the project.

### 5. Run the Application

**Windows:**
```bash
mvnw.cmd spring-boot:run
```

**Unix/Linux/macOS:**
```bash
./mvnw spring-boot:run
```

The application starts on `http://localhost:8080`.

**Verify it's running:**
```bash
curl http://localhost:8080/api/v1/health
```

### 6. Verify Database Schema

The application uses `spring.jpa.hibernate.ddl-auto=update`, so tables are created automatically.

**Connect to database:**
```bash
docker exec -it smartreconciliation-pgvector-1 psql -U myuser -d mydatabase
```

**List tables:**
```sql
\dt
```

You should see tables like `organizations`, `uploaded_files`, `reconciliations`, etc.

---

## Project Structure

```
smartreconciliation/
├── .env                          # Environment variables (not in git)
├── .env.example                  # Template for .env
├── .gitignore                    # Git ignore rules
├── CLAUDE.md                     # Instructions for Claude Code
├── README.md                     # Project overview
├── compose.yaml                  # Docker Compose configuration
├── mvnw / mvnw.cmd               # Maven wrapper scripts
├── pom.xml                       # Maven dependencies and build config
│
├── docs/                         # Documentation
│   ├── api-reference.md          # API documentation
│   ├── architecture.md           # System architecture
│   ├── developer-guide.md        # This file
│   ├── deployment-guide.md       # Deployment instructions
│   ├── database-schema.md        # Database documentation
│   ├── configuration-reference.md # Configuration options
│   ├── ai-integration-guide.md   # AI provider integration
│   └── operations-guide.md       # Operations and troubleshooting
│
├── frontend/                     # React frontend (future)
│
└── src/
    ├── main/
    │   ├── java/com/amit/smartreconciliation/
    │   │   ├── SmartreconciliationApplication.java  # Main entry point
    │   │   │
    │   │   ├── config/           # Configuration classes
    │   │   │   ├── CorsConfig.java
    │   │   │   ├── AiConfig.java
    │   │   │   └── AsyncConfig.java
    │   │   │
    │   │   ├── controller/       # REST API controllers
    │   │   │   ├── ReconciliationController.java
    │   │   │   ├── FileController.java
    │   │   │   ├── RuleController.java
    │   │   │   ├── ExceptionController.java
    │   │   │   ├── ChatController.java
    │   │   │   ├── AiController.java
    │   │   │   ├── DataSourceController.java
    │   │   │   ├── DashboardController.java
    │   │   │   └── HealthController.java
    │   │   │
    │   │   ├── dto/              # Data Transfer Objects
    │   │   │   ├── request/      # Request DTOs
    │   │   │   │   ├── ReconciliationRequest.java
    │   │   │   │   ├── RuleSetRequest.java
    │   │   │   │   └── ChatRequest.java
    │   │   │   └── response/     # Response DTOs
    │   │   │       ├── ApiResponse.java  # Standard wrapper
    │   │   │       ├── ReconciliationResponse.java
    │   │   │       └── FilePreviewResponse.java
    │   │   │
    │   │   ├── entity/           # JPA entities
    │   │   │   ├── Organization.java
    │   │   │   ├── User.java
    │   │   │   ├── DataSource.java
    │   │   │   ├── UploadedFile.java
    │   │   │   ├── RuleSet.java
    │   │   │   ├── FieldMapping.java
    │   │   │   ├── MatchingRule.java
    │   │   │   ├── Reconciliation.java
    │   │   │   ├── ReconciliationException.java
    │   │   │   ├── ChatSession.java
    │   │   │   └── ChatMessage.java
    │   │   │
    │   │   ├── enums/            # Enumeration types
    │   │   │   ├── ReconciliationStatus.java
    │   │   │   ├── ExceptionType.java
    │   │   │   ├── ExceptionSeverity.java
    │   │   │   ├── DataSourceType.java
    │   │   │   └── TransformationType.java
    │   │   │
    │   │   ├── exception/        # Custom exceptions
    │   │   │   ├── ResourceNotFoundException.java
    │   │   │   ├── FileProcessingException.java
    │   │   │   └── GlobalExceptionHandler.java
    │   │   │
    │   │   ├── repository/       # JPA repositories
    │   │   │   ├── ReconciliationRepository.java
    │   │   │   ├── UploadedFileRepository.java
    │   │   │   ├── RuleSetRepository.java
    │   │   │   └── ExceptionRepository.java
    │   │   │
    │   │   ├── service/          # Business logic services
    │   │   │   ├── ReconciliationService.java
    │   │   │   ├── FileUploadService.java
    │   │   │   ├── FileParserService.java
    │   │   │   ├── SchemaDetectionService.java
    │   │   │   ├── RuleService.java
    │   │   │   ├── AiService.java
    │   │   │   ├── ChatService.java
    │   │   │   ├── ExceptionService.java
    │   │   │   ├── DataSourceService.java
    │   │   │   └── DashboardService.java
    │   │   │
    │   │   └── util/             # Utility classes
    │   │       ├── FileUtil.java
    │   │       └── DateUtil.java
    │   │
    │   └── resources/
    │       ├── application.properties    # Application configuration
    │       └── static/                   # Static files (future)
    │
    └── test/
        ├── java/com/amit/smartreconciliation/
        │   ├── controller/       # Controller tests
        │   ├── service/          # Service tests
        │   └── integration/      # Integration tests
        │
        └── resources/
            ├── application-test.properties
            └── test-data/        # Test files and fixtures
```

---

## Code Organization

### Package Structure

#### Controllers (`controller/`)

REST API endpoints following RESTful conventions.

**Naming Convention:** `{Resource}Controller.java`

**Example:**
```java
@RestController
@RequestMapping("/api/v1/reconciliations")
public class ReconciliationController {

    private final ReconciliationService reconciliationService;

    public ReconciliationController(ReconciliationService reconciliationService) {
        this.reconciliationService = reconciliationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReconciliationResponse>> create(
            @Valid @RequestBody ReconciliationRequest request) {
        ReconciliationResponse response = reconciliationService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reconciliation started", response));
    }
}
```

#### Services (`service/`)

Business logic layer - single responsibility principle.

**Naming Convention:** `{Feature}Service.java`

**Example:**
```java
@Service
public class ReconciliationService {

    private final ReconciliationRepository reconciliationRepository;
    private final FileUploadService fileUploadService;
    private final RuleService ruleService;

    public ReconciliationResponse create(ReconciliationRequest request) {
        // Business logic here
    }
}
```

#### Repositories (`repository/`)

Data access layer using Spring Data JPA.

**Naming Convention:** `{Entity}Repository.java`

**Example:**
```java
public interface ReconciliationRepository extends JpaRepository<Reconciliation, Long> {
    List<Reconciliation> findByOrganizationId(Long organizationId);
    List<Reconciliation> findByStatus(ReconciliationStatus status);
}
```

#### Entities (`entity/`)

JPA entities mapping to database tables.

**Naming Convention:** Singular noun (e.g., `Reconciliation`, not `Reconciliations`)

**Best Practices:**
- Use `@CreationTimestamp` and `@UpdateTimestamp` for audit fields
- Use `@Type(JsonType.class)` for JSONB columns
- Use builder pattern for complex object creation
- Lazy load relationships by default

#### DTOs (`dto/`)

Data Transfer Objects for API requests and responses.

**Structure:**
- `dto/request/` - API request objects
- `dto/response/` - API response objects

**Naming Convention:**
- Request: `{Action}{Resource}Request.java`
- Response: `{Resource}Response.java`

#### Enums (`enums/`)

Type-safe enumeration types.

**Example:**
```java
public enum ReconciliationStatus {
    PENDING,
    RUNNING,
    COMPLETED,
    FAILED,
    CANCELLED
}
```

---

## Development Workflow

### Micro-Step Development Process

Follow the micro-step workflow defined in CLAUDE.md:

1. **Pick a small task** - One feature or fix at a time
2. **Implement the change** - Write code following standards
3. **Run sanity check** - Compile and verify it builds
4. **Test locally** - Manual testing or automated tests
5. **Commit** - Descriptive commit message
6. **Present options** - Show what was done, suggest next steps
7. **Wait for approval** - Get feedback before proceeding

### Example Workflow: Adding a New Endpoint

**Step 1: Create the DTO**

```java
// dto/request/DataSourceTestRequest.java
public class DataSourceTestRequest {
    @NotNull
    private Long dataSourceId;

    // Getters and setters
}
```

**Step 2: Update the Controller**

```java
@PostMapping("/{id}/test")
public ResponseEntity<ApiResponse<TestResultResponse>> testConnection(
        @PathVariable Long id) {
    TestResultResponse result = dataSourceService.testConnection(id);
    return ResponseEntity.ok(ApiResponse.success(result));
}
```

**Step 3: Implement Service Method**

```java
public TestResultResponse testConnection(Long id) {
    DataSource dataSource = dataSourceRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("DataSource not found"));

    // Test connection logic
    return new TestResultResponse(/* ... */);
}
```

**Step 4: Test**

```bash
mvnw.cmd spring-boot:run
curl -X POST http://localhost:8080/api/v1/datasources/1/test
```

**Step 5: Commit**

```bash
git add .
git commit -m "Add data source connection testing endpoint

- Add POST /datasources/{id}/test endpoint
- Implement connection testing logic
- Return test results with response time"
```

---

## Testing

### Test Structure

Tests follow the same package structure as main code:

```
src/test/java/com/amit/smartreconciliation/
├── controller/           # Controller tests
│   └── FileControllerTest.java
├── service/              # Service tests
│   ├── FileParserServiceTest.java
│   └── SchemaDetectionServiceTest.java
└── integration/          # Integration tests
    └── ReconciliationIntegrationTest.java
```

### Unit Tests

**Controller Test Example:**

```java
@WebMvcTest(FileController.class)
class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FileUploadService fileUploadService;

    @Test
    void uploadFile_ShouldReturn201Created() throws Exception {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.csv", "text/csv", "data".getBytes()
        );

        UploadedFileResponse response = new UploadedFileResponse();
        response.setId(1L);
        response.setFileName("test.csv");

        when(fileUploadService.uploadFile(any())).thenReturn(response);

        // Act & Assert
        mockMvc.perform(multipart("/api/v1/files/upload/single")
                .file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.fileName").value("test.csv"));
    }
}
```

**Service Test Example:**

```java
@SpringBootTest
class FileParserServiceTest {

    @Autowired
    private FileParserService fileParserService;

    @Test
    void parseCSVFile_ShouldReturnParsedData() throws IOException {
        // Arrange
        Path testFile = Paths.get("src/test/resources/test-data/sample.csv");

        // Act
        List<Map<String, String>> result = fileParserService.parseCSVFile(testFile);

        // Assert
        assertThat(result).isNotEmpty();
        assertThat(result.get(0)).containsKey("id");
        assertThat(result.get(0)).containsKey("amount");
    }
}
```

### Running Tests

**All tests:**
```bash
mvnw.cmd test
```

**Specific test class:**
```bash
mvnw.cmd test -Dtest=FileControllerTest
```

**Specific test method:**
```bash
mvnw.cmd test -Dtest=FileControllerTest#uploadFile_ShouldReturn201Created
```

**With coverage:**
```bash
mvnw.cmd test jacoco:report
```

### Integration Tests

Integration tests use a test database:

```java
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class ReconciliationIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
        .withDatabaseName("testdb");

    @Autowired
    private ReconciliationService reconciliationService;

    @Test
    void createAndRunReconciliation_ShouldComplete() {
        // Full end-to-end test
    }
}
```

---

## Code Style and Standards

### Java Code Style

**General Rules:**
- Use Java 21 features (records, pattern matching, sealed classes)
- Follow Google Java Style Guide
- 4 spaces for indentation (no tabs)
- Max line length: 120 characters
- Use meaningful variable names

**Naming Conventions:**
- Classes: `PascalCase`
- Methods: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Packages: `lowercase`

### Lombok Usage

Use Lombok to reduce boilerplate:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReconciliationRequest {
    private String name;
    private Long sourceFileId;
    private Long targetFileId;
}
```

### Exception Handling

**Custom Exceptions:**

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

**Global Exception Handler:**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(
            ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage()));
    }
}
```

### API Response Format

**All API responses use standard envelope:**

```java
@Data
@Builder
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
            .success(false)
            .message(message)
            .timestamp(LocalDateTime.now())
            .build();
    }
}
```

### Database Conventions

**Table Names:** Plural, snake_case
- `reconciliations`, `uploaded_files`, `field_mappings`

**Column Names:** snake_case
- `source_file_id`, `created_at`, `match_rate`

**Relationships:**
- Use `@JoinColumn` with explicit name
- Lazy loading by default
- Cascade operations carefully

---

## Common Development Tasks

### Adding a New Entity

1. **Create Entity Class:**

```java
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // Getters, setters, builder
}
```

2. **Create Repository:**

```java
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByAction(String action);
}
```

3. **Run Application** - Hibernate creates the table automatically

### Adding AI Functionality

1. **Inject ChatClient:**

```java
@Service
public class MyAiService {
    private final ChatClient chatClient;

    public MyAiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }
}
```

2. **Use ChatClient:**

```java
public String generateSuggestion(String prompt) {
    return chatClient.call(prompt);
}
```

3. **Streaming Response:**

```java
public Flux<String> streamResponse(String prompt) {
    return chatClient.stream(prompt);
}
```

### Adding a New File Format Parser

1. **Implement Parser:**

```java
public class XMLFileParser {
    public List<Map<String, String>> parse(Path filePath) throws IOException {
        // XML parsing logic
    }
}
```

2. **Update FileParserService:**

```java
public List<Map<String, String>> parseFile(Path filePath, FileType fileType) {
    return switch (fileType) {
        case CSV -> parseCSV(filePath);
        case EXCEL -> parseExcel(filePath);
        case XML -> parseXML(filePath);  // Add new case
        default -> throw new UnsupportedFileTypeException();
    };
}
```

### Configuring a New AI Provider

1. **Add Dependency to pom.xml:**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-model-{provider}</artifactId>
</dependency>
```

2. **Add Configuration to application.properties:**

```properties
spring.ai.{provider}.api-key=${PROVIDER_API_KEY}
spring.ai.{provider}.chat.options.model=model-name
```

3. **Update AiService to use provider:**

```java
@Value("${app.ai.provider}")
private String aiProvider;

public ChatClient getChatClient() {
    return switch (aiProvider) {
        case "anthropic" -> anthropicChatClient;
        case "openai" -> openAiChatClient;
        case "deepseek" -> deepSeekChatClient;
        default -> anthropicChatClient;
    };
}
```

---

## Troubleshooting

### Application Won't Start

**Problem:** Port 8080 already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Unix/Linux/macOS
lsof -i :8080
kill -9 <PID>
```

Or change port in `application.properties`:
```properties
server.port=8081
```

---

### Database Connection Issues

**Problem:** Can't connect to PostgreSQL

**Check if container is running:**
```bash
docker-compose ps
```

**Restart container:**
```bash
docker-compose down
docker-compose up -d
```

**Check logs:**
```bash
docker-compose logs pgvector
```

---

### File Upload Fails

**Problem:** File size exceeds limit

**Solution:** Increase limits in `application.properties`:
```properties
spring.servlet.multipart.max-file-size=500MB
spring.servlet.multipart.max-request-size=500MB
```

---

### AI Service Errors

**Problem:** API key not found

**Check .env file exists and is loaded:**
```bash
# Should show your API key
echo $ANTHROPIC_API_KEY  # Unix/Linux/macOS
echo %ANTHROPIC_API_KEY%  # Windows
```

**Verify application.properties references it correctly:**
```properties
spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY}
```

---

### Tests Failing

**Problem:** Tests can't connect to database

**Solution:** Use test profile with H2 database:

```properties
# src/test/resources/application-test.properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
```

Run tests with test profile:
```bash
mvnw.cmd test -Dspring.profiles.active=test
```

---

## Contributing Guidelines

### Branching Strategy

- `master` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Production hotfixes

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Build/tooling changes

**Examples:**

```
feat(reconciliation): Add fuzzy matching algorithm

Implement Levenshtein distance-based fuzzy matching for string fields.
Configurable threshold via matching rule weight parameter.

Closes #42
```

```
fix(file-upload): Handle large Excel files without memory overflow

Use streaming approach for files > 50MB to prevent OutOfMemoryError.
Added pagination for preview endpoint.

Fixes #56
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes following code standards
3. Write/update tests
4. Update documentation if needed
5. Commit with descriptive messages
6. Push branch and create PR
7. Request review from team members
8. Address feedback
9. Merge after approval

### Code Review Checklist

- [ ] Code follows style guide
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No hardcoded credentials or secrets
- [ ] Error handling implemented
- [ ] Logging added for important operations
- [ ] Performance considerations addressed
- [ ] Security implications reviewed

---

## IDE Setup

### IntelliJ IDEA

**Recommended Plugins:**
- Lombok Plugin
- Spring Boot Assistant
- Docker
- Database Navigator

**Import Project:**
1. File → Open
2. Select `pom.xml`
3. Import as Maven project

**Run Configuration:**
1. Run → Edit Configurations
2. Add new Spring Boot configuration
3. Main class: `com.amit.smartreconciliation.SmartreconciliationApplication`
4. Add environment variables from `.env`

### VS Code

**Recommended Extensions:**
- Extension Pack for Java
- Spring Boot Extension Pack
- Lombok Annotations Support
- Docker

**Settings:**

```json
{
  "java.configuration.updateBuildConfiguration": "automatic",
  "spring-boot.ls.java.home": "C:\\Program Files\\Java\\jdk-21",
  "java.compile.nullAnalysis.mode": "automatic"
}
```

---

## Next Steps

Now that your development environment is set up:

1. Read the [Architecture Documentation](architecture.md) to understand the system design
2. Review the [API Reference](api-reference.md) to learn the endpoints
3. Check out the [Database Schema](database-schema.md) for data model details
4. Read the [AI Integration Guide](ai-integration-guide.md) for AI features
5. Start with a simple task like adding a new endpoint or test

Happy coding!
