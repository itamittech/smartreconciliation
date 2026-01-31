# Deployment & Operations Documentation

Production deployment, configuration, and day-to-day operations.

## Documents in This Section

### [Deployment Guide](deployment-guide.md)

Production deployment instructions:
- **Deployment Options** - Docker, Kubernetes, Cloud platforms
- **Infrastructure Requirements** - Hardware and resource specs
- **Database Setup** - PostgreSQL with PGVector installation
- **Docker Deployment** - Docker Compose and containerization
- **Kubernetes Deployment** - Helm charts and K8s manifests
- **Cloud Platforms** - AWS, Azure, GCP deployment guides
- **Monitoring & Logging** - Prometheus, Grafana, ELK stack
- **Security Configuration** - SSL/TLS, secrets management
- **Backup & Recovery** - Disaster recovery procedures

### [Configuration Reference](configuration-reference.md)

Complete configuration documentation:
- **Application Properties** - All Spring Boot configuration options
- **Database Configuration** - Connection pools, performance tuning
- **AI Provider Configuration** - API keys and provider selection
- **File Upload Configuration** - Size limits, allowed formats
- **Security Configuration** - Authentication, CORS, JWT
- **Performance Tuning** - JVM options, connection pools
- **Logging Configuration** - Log levels and appenders
- **Environment-Specific Configs** - Dev, staging, production settings

### [Operations Guide](operations-guide.md)

Day-to-day operations and troubleshooting:
- **Health Checks** - Application and database health monitoring
- **Monitoring & Alerting** - Key metrics and alert thresholds
- **Performance Monitoring** - Response times, throughput, errors
- **Backup Procedures** - Database and file backup strategies
- **Recovery Procedures** - Disaster recovery and rollback
- **Troubleshooting** - Common issues and solutions
- **Maintenance Tasks** - Routine operations and updates
- **Security Operations** - Incident response and security monitoring

## Audience

- DevOps Engineers
- Site Reliability Engineers (SRE)
- System Administrators
- Platform Engineers
- Operations Teams

## Deployment Options

### 1. Docker Compose (Development/Small Production)
- **Setup Time:** 15 minutes
- **Complexity:** Low
- **Best For:** Development, small teams, simple deployments

### 2. Kubernetes (Production)
- **Setup Time:** 1-2 hours
- **Complexity:** Medium
- **Best For:** Enterprise production, high availability, scaling

### 3. Cloud Managed Services
- **AWS ECS/EKS**
- **Azure Container Instances/AKS**
- **Google Cloud Run/GKE**
- **Setup Time:** 30 minutes - 2 hours
- **Complexity:** Medium
- **Best For:** Cloud-native deployments, managed infrastructure

## Quick Start - Docker Deployment

```bash
# 1. Start PostgreSQL with PGVector
docker-compose up -d

# 2. Build application
mvnw.cmd clean package  # Windows
./mvnw clean package    # Unix/Linux/macOS

# 3. Run application
java -jar target/smartreconciliation-0.0.1-SNAPSHOT.jar

# 4. Verify health
curl http://localhost:8080/actuator/health
```

## Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `application.properties` | Main config | `src/main/resources/` |
| `application-dev.properties` | Development config | `src/main/resources/` |
| `application-prod.properties` | Production config | `src/main/resources/` |
| `compose.yaml` | Docker Compose | Project root |
| `Dockerfile` | Container build | Project root (if exists) |

## Monitoring Endpoints

Spring Boot Actuator endpoints for operations:

- **/actuator/health** - Application health status
- **/actuator/metrics** - Application metrics
- **/actuator/info** - Application information
- **/actuator/prometheus** - Prometheus metrics export

## Related Documentation

- [Architecture](../02-architecture/architecture.md) - System architecture
- [Database Schema](../02-architecture/database-schema.md) - Database design
- [Developer Guide](../03-development/developer-guide.md) - Development setup
- [AI Integration Guide](../04-ai-integration/ai-integration-guide.md) - AI configuration

---

For production deployment, start with the [Deployment Guide](deployment-guide.md).
