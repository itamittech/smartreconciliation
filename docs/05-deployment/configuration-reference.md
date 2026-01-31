# Configuration Reference

Complete reference for all configuration options in Smart Reconciliation

## Table of Contents

1. [Configuration Overview](#configuration-overview)
2. [Application Configuration](#application-configuration)
3. [Database Configuration](#database-configuration)
4. [AI Provider Configuration](#ai-provider-configuration)
5. [File Upload Configuration](#file-upload-configuration)
6. [Security Configuration](#security-configuration)
7. [Performance Tuning](#performance-tuning)
8. [Logging Configuration](#logging-configuration)
9. [Monitoring Configuration](#monitoring-configuration)
10. [Environment-Specific Configuration](#environment-specific-configuration)

---

## Configuration Overview

Smart Reconciliation uses Spring Boot's configuration system with support for:

- **application.properties** - Main configuration file
- **.env file** - Environment variables (via spring-dotenv)
- **Environment variables** - System-level configuration
- **Profile-specific files** - application-{profile}.properties

### Configuration Precedence

1. Command-line arguments
2. Java system properties
3. OS environment variables
4. .env file
5. application-{profile}.properties
6. application.properties
7. Default values

### Configuration File Locations

```
src/main/resources/
├── application.properties          # Default configuration
├── application-dev.properties       # Development profile
├── application-test.properties      # Test profile
└── application-production.properties # Production profile
```

---

## Application Configuration

### Basic Application Settings

```properties
# Application Name
spring.application.name=smartreconciliation

# Server Configuration
server.port=8080
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s

# Context Path (optional)
server.servlet.context-path=/

# Compression
server.compression.enabled=true
server.compression.mime-types=application/json,application/xml,text/html,text/xml,text/plain

# Server Error
server.error.include-message=always
server.error.include-binding-errors=always
server.error.include-stacktrace=on_param
server.error.include-exception=false
```

**Available Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `spring.application.name` | String | smartreconciliation | Application name |
| `server.port` | Integer | 8080 | HTTP server port |
| `server.shutdown` | String | immediate | Shutdown mode (immediate, graceful) |
| `server.servlet.context-path` | String | / | Application context path |
| `server.compression.enabled` | Boolean | false | Enable response compression |

---

## Database Configuration

### PostgreSQL Connection

```properties
# Database URL
spring.datasource.url=jdbc:postgresql://localhost:5432/smartreconciliation
spring.datasource.username=smartrecon
spring.datasource.password=${POSTGRES_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# Connection Pool (HikariCP)
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
spring.datasource.hikari.leak-detection-threshold=60000
spring.datasource.hikari.pool-name=SmartReconciliationPool

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true

# Enable JSONB support
spring.jpa.properties.hibernate.type.json_format_mapper=io.hypersistence.utils.hibernate.type.json.internal.JacksonObjectMapperSupplier
```

**Available Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `spring.datasource.url` | String | - | JDBC URL |
| `spring.datasource.username` | String | - | Database username |
| `spring.datasource.password` | String | - | Database password |
| `spring.datasource.hikari.maximum-pool-size` | Integer | 10 | Max connections |
| `spring.datasource.hikari.minimum-idle` | Integer | 5 | Min idle connections |
| `spring.datasource.hikari.connection-timeout` | Long | 30000 | Connection timeout (ms) |
| `spring.jpa.hibernate.ddl-auto` | String | none | Schema management (none, validate, update, create, create-drop) |
| `spring.jpa.show-sql` | Boolean | false | Log SQL statements |
| `spring.jpa.properties.hibernate.format_sql` | Boolean | false | Format logged SQL |

### DDL Auto Options

- `none` - No schema changes (production)
- `validate` - Validate schema, no changes
- `update` - Update schema if needed (development)
- `create` - Drop and recreate schema (testing)
- `create-drop` - Drop schema on shutdown (testing)

**Production Recommendation:** Use `validate` with Flyway migrations

---

## AI Provider Configuration

### Anthropic Claude

```properties
# Anthropic Configuration
spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY}
spring.ai.anthropic.chat.options.model=claude-sonnet-4-20250514
spring.ai.anthropic.chat.options.max-tokens=4096
spring.ai.anthropic.chat.options.temperature=0.7
spring.ai.anthropic.chat.options.top-p=1.0
```

**Available Models:**
- `claude-opus-4-5-20251101` - Most capable, highest cost
- `claude-sonnet-4-20250514` - Balanced performance and cost
- `claude-haiku-3-5-20241022` - Fastest, lowest cost

**Available Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `spring.ai.anthropic.api-key` | String | - | Anthropic API key |
| `spring.ai.anthropic.chat.options.model` | String | claude-sonnet-4 | Model name |
| `spring.ai.anthropic.chat.options.max-tokens` | Integer | 4096 | Max output tokens |
| `spring.ai.anthropic.chat.options.temperature` | Double | 0.7 | Randomness (0.0-1.0) |
| `spring.ai.anthropic.chat.options.top-p` | Double | 1.0 | Nucleus sampling |

### OpenAI

```properties
# OpenAI Configuration
spring.ai.openai.api-key=${OPENAI_API_KEY}
spring.ai.openai.chat.options.model=gpt-4o
spring.ai.openai.chat.options.max-tokens=4096
spring.ai.openai.chat.options.temperature=0.7
spring.ai.openai.chat.options.top-p=1.0
spring.ai.openai.chat.options.frequency-penalty=0.0
spring.ai.openai.chat.options.presence-penalty=0.0
```

**Available Models:**
- `gpt-4o` - Latest GPT-4 Omni
- `gpt-4-turbo` - Fast GPT-4
- `gpt-4` - Original GPT-4
- `gpt-3.5-turbo` - Fastest, most economical

### DeepSeek

```properties
# DeepSeek Configuration
spring.ai.deepseek.api-key=${DEEPSEEK_API_KEY}
spring.ai.deepseek.chat.options.model=deepseek-chat
spring.ai.deepseek.chat.options.max-tokens=4096
spring.ai.deepseek.chat.options.temperature=0.7
```

### AI Provider Selection

```properties
# Select active provider (anthropic, openai, deepseek)
app.ai.provider=anthropic
```

### Vector Store (PGVector)

```properties
# PGVector Configuration
spring.ai.vectorstore.pgvector.initialize-schema=true
spring.ai.vectorstore.pgvector.dimensions=1536
spring.ai.vectorstore.pgvector.distance-type=COSINE_DISTANCE
spring.ai.vectorstore.pgvector.index-type=HNSW
```

**Available Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `spring.ai.vectorstore.pgvector.initialize-schema` | Boolean | true | Auto-create vector tables |
| `spring.ai.vectorstore.pgvector.dimensions` | Integer | 1536 | Vector dimensions |
| `spring.ai.vectorstore.pgvector.distance-type` | String | COSINE | Distance metric (COSINE, L2, INNER_PRODUCT) |
| `spring.ai.vectorstore.pgvector.index-type` | String | HNSW | Index type (HNSW, IVFFLAT) |

---

## File Upload Configuration

### Upload Limits

```properties
# File Upload Configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
spring.servlet.multipart.file-size-threshold=2KB
spring.servlet.multipart.resolve-lazily=false
```

**Available Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `spring.servlet.multipart.enabled` | Boolean | true | Enable multipart uploads |
| `spring.servlet.multipart.max-file-size` | DataSize | 1MB | Max file size |
| `spring.servlet.multipart.max-request-size` | DataSize | 10MB | Max request size |
| `spring.servlet.multipart.file-size-threshold` | DataSize | 0 | Threshold for temp storage |

**Size Format Examples:**
- `100MB` - 100 megabytes
- `1GB` - 1 gigabyte
- `10KB` - 10 kilobytes

### File Storage

```properties
# File Storage Configuration
app.file.storage-type=local
app.file.upload-dir=./uploads

# S3 Configuration (when storage-type=s3)
app.file.s3.bucket-name=${S3_BUCKET_NAME}
app.file.s3.region=${S3_REGION:us-east-1}
app.file.s3.access-key=${S3_ACCESS_KEY}
app.file.s3.secret-key=${S3_SECRET_KEY}
app.file.s3.endpoint=${S3_ENDPOINT:}

# Azure Blob Configuration (when storage-type=azure)
app.file.azure.connection-string=${AZURE_STORAGE_CONNECTION_STRING}
app.file.azure.container-name=${AZURE_CONTAINER_NAME}
```

**Storage Types:**
- `local` - Local filesystem
- `s3` - Amazon S3 or S3-compatible
- `azure` - Azure Blob Storage
- `gcs` - Google Cloud Storage

---

## Security Configuration

### CORS (Cross-Origin Resource Sharing)

```properties
# CORS Configuration
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173
app.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
app.cors.allowed-headers=*
app.cors.allow-credentials=true
app.cors.max-age=3600
```

**Available Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `app.cors.allowed-origins` | String | * | Comma-separated allowed origins |
| `app.cors.allowed-methods` | String | * | Allowed HTTP methods |
| `app.cors.allowed-headers` | String | * | Allowed request headers |
| `app.cors.allow-credentials` | Boolean | false | Allow credentials |
| `app.cors.max-age` | Integer | 3600 | Preflight cache time (seconds) |

### JWT Authentication (Future)

```properties
# JWT Configuration
app.security.jwt.secret=${JWT_SECRET}
app.security.jwt.expiration=86400000
app.security.jwt.refresh-expiration=604800000
app.security.jwt.header=Authorization
app.security.jwt.prefix=Bearer
```

### SSL/TLS

```properties
# SSL Configuration
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=smartreconciliation

# Force HTTPS
server.ssl.enabled-protocols=TLSv1.2,TLSv1.3
server.ssl.ciphers=HIGH:!aNULL:!MD5
```

---

## Performance Tuning

### Thread Pool Configuration

```properties
# Async Task Execution
spring.task.execution.pool.core-size=8
spring.task.execution.pool.max-size=16
spring.task.execution.pool.queue-capacity=200
spring.task.execution.pool.keep-alive=60s
spring.task.execution.thread-name-prefix=async-task-

# Task Scheduling
spring.task.scheduling.pool.size=5
spring.task.scheduling.thread-name-prefix=scheduled-task-
```

**Available Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `spring.task.execution.pool.core-size` | Integer | 8 | Core thread pool size |
| `spring.task.execution.pool.max-size` | Integer | 16 | Maximum thread pool size |
| `spring.task.execution.pool.queue-capacity` | Integer | 100 | Task queue capacity |

### JVM Options

Add to startup command or Dockerfile:

```bash
java -Xms2g -Xmx4g \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/var/log/heapdump.hprof \
     -jar app.jar
```

**JVM Parameters:**
- `-Xms2g` - Initial heap size (2GB)
- `-Xmx4g` - Maximum heap size (4GB)
- `-XX:+UseG1GC` - Use G1 garbage collector
- `-XX:MaxGCPauseMillis=200` - GC pause target

### Caching (Future)

```properties
# Redis Cache
spring.cache.type=redis
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.password=${REDIS_PASSWORD}
spring.data.redis.timeout=2000ms

# Cache Configuration
spring.cache.redis.time-to-live=600000
spring.cache.redis.cache-null-values=false
```

---

## Logging Configuration

### Log Levels

```properties
# Root logging level
logging.level.root=INFO

# Application logging
logging.level.com.amit.smartreconciliation=DEBUG

# Framework logging
logging.level.org.springframework.web=INFO
logging.level.org.springframework.ai=INFO
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Third-party libraries
logging.level.org.apache.commons=WARN
```

**Log Levels:** TRACE, DEBUG, INFO, WARN, ERROR, FATAL, OFF

### Log Output

```properties
# Console output
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n

# File output
logging.file.name=/var/log/smartreconciliation/application.log
logging.file.max-size=100MB
logging.file.max-history=30
logging.file.total-size-cap=1GB

# Log pattern
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

**Pattern Placeholders:**
- `%d{pattern}` - Date/time
- `%thread` - Thread name
- `%-5level` - Log level (padded)
- `%logger{36}` - Logger name (max 36 chars)
- `%msg` - Log message
- `%n` - Line separator

### JSON Logging (Production)

```properties
# Logstash JSON format
logging.config=classpath:logback-spring.xml
```

**logback-spring.xml:**

```xml
<configuration>
    <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
    </appender>

    <root level="INFO">
        <appender-ref ref="JSON"/>
    </root>
</configuration>
```

---

## Monitoring Configuration

### Spring Boot Actuator

```properties
# Actuator Endpoints
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoints.web.base-path=/actuator
management.endpoint.health.show-details=when-authorized
management.endpoint.health.show-components=when-authorized

# Health Indicators
management.health.defaults.enabled=true
management.health.db.enabled=true
management.health.diskspace.enabled=true
management.health.ping.enabled=true

# Info Endpoint
management.info.env.enabled=true
management.info.git.mode=full
management.info.build.enabled=true
```

**Available Endpoints:**
- `/actuator/health` - Application health status
- `/actuator/info` - Application information
- `/actuator/metrics` - Application metrics
- `/actuator/prometheus` - Prometheus metrics

### Prometheus Metrics

```properties
# Prometheus Configuration
management.metrics.export.prometheus.enabled=true
management.metrics.distribution.percentiles-histogram.http.server.requests=true
management.metrics.tags.application=${spring.application.name}
management.metrics.tags.environment=${ENVIRONMENT:dev}
```

### Custom Metrics

```properties
# Custom metric prefixes
management.metrics.enable.jvm=true
management.metrics.enable.process=true
management.metrics.enable.system=true
management.metrics.enable.tomcat=true
management.metrics.enable.hikaricp=true
```

---

## Environment-Specific Configuration

### Development Profile

**application-dev.properties:**

```properties
# Development-specific settings
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.com.amit.smartreconciliation=DEBUG

# Disable security for easier testing
app.security.enabled=false

# Use local storage
app.file.storage-type=local

# Mock AI for testing
app.ai.mock-enabled=true
```

**Activate:**
```bash
java -jar app.jar --spring.profiles.active=dev
```

### Test Profile

**application-test.properties:**

```properties
# Test database (H2 in-memory)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop

# Disable external services
app.ai.mock-enabled=true
app.file.storage-type=local

# Fast test execution
spring.jpa.properties.hibernate.jdbc.batch_size=50
```

### Production Profile

**application-production.properties:**

```properties
# Production settings
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
logging.level.root=WARN
logging.level.com.amit.smartreconciliation=INFO

# Security enabled
app.security.enabled=true

# Use cloud storage
app.file.storage-type=s3

# Production AI
app.ai.provider=anthropic
app.ai.mock-enabled=false

# Performance tuning
spring.datasource.hikari.maximum-pool-size=30
spring.task.execution.pool.core-size=16
spring.task.execution.pool.max-size=32
```

---

## Configuration Best Practices

### 1. Use Environment Variables for Secrets

Never commit secrets to version control:

```properties
# Good
spring.datasource.password=${POSTGRES_PASSWORD}
spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY}

# Bad
spring.datasource.password=mypassword123
spring.ai.anthropic.api-key=sk-ant-api03-xxx
```

### 2. Use Profiles for Different Environments

```bash
# Development
java -jar app.jar --spring.profiles.active=dev

# Production
java -jar app.jar --spring.profiles.active=production
```

### 3. Document Custom Properties

Create metadata for IDE autocomplete:

**additional-spring-configuration-metadata.json:**

```json
{
  "properties": [
    {
      "name": "app.ai.provider",
      "type": "java.lang.String",
      "description": "AI provider to use (anthropic, openai, deepseek)",
      "defaultValue": "anthropic"
    }
  ]
}
```

### 4. Use Spring Boot Configuration Processor

Add to `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

### 5. Validate Configuration on Startup

```java
@ConfigurationProperties(prefix = "app.ai")
@Validated
public class AiProperties {
    @NotNull
    private String provider;

    // Getters and setters
}
```

---

## Configuration Troubleshooting

### Check Active Configuration

```bash
# View all properties
curl http://localhost:8080/actuator/env

# Check specific property
curl http://localhost:8080/actuator/env/spring.datasource.url
```

### Override Configuration

**Command line:**
```bash
java -jar app.jar --server.port=9090
```

**Environment variable:**
```bash
export SERVER_PORT=9090
java -jar app.jar
```

**System property:**
```bash
java -Dserver.port=9090 -jar app.jar
```

### Configuration Binding Errors

Enable debug logging:

```properties
logging.level.org.springframework.boot.context.properties=DEBUG
```

---

## Complete Example Configuration

**Production-ready application.properties:**

```properties
# Application
spring.application.name=smartreconciliation
server.port=8080
server.shutdown=graceful

# Database
spring.datasource.url=jdbc:postgresql://${POSTGRES_HOST:localhost}:${POSTGRES_PORT:5432}/${POSTGRES_DB:smartreconciliation}
spring.datasource.username=${POSTGRES_USER}
spring.datasource.password=${POSTGRES_PASSWORD}
spring.datasource.hikari.maximum-pool-size=20
spring.jpa.hibernate.ddl-auto=validate

# AI
app.ai.provider=anthropic
spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY}
spring.ai.anthropic.chat.options.model=claude-sonnet-4-20250514

# File Upload
spring.servlet.multipart.max-file-size=100MB
app.file.storage-type=s3
app.file.s3.bucket-name=${S3_BUCKET_NAME}

# Security
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS}
app.security.jwt.secret=${JWT_SECRET}

# Performance
spring.task.execution.pool.core-size=8
spring.task.execution.pool.max-size=16

# Logging
logging.level.root=INFO
logging.level.com.amit.smartreconciliation=INFO
logging.file.name=/var/log/smartreconciliation/app.log

# Monitoring
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.metrics.export.prometheus.enabled=true
```

---

For more information, see:
- [Deployment Guide](deployment-guide.md)
- [Operations Guide](operations-guide.md)
- [Developer Guide](developer-guide.md)
