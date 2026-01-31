# Operations Guide

Operational procedures and troubleshooting for Smart Reconciliation

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Monitoring and Health Checks](#monitoring-and-health-checks)
3. [Backup and Recovery](#backup-and-recovery)
4. [Performance Tuning](#performance-tuning)
5. [Troubleshooting](#troubleshooting)
6. [Maintenance Tasks](#maintenance-tasks)
7. [Security Operations](#security-operations)
8. [Incident Response](#incident-response)
9. [Runbook](#runbook)

---

## Daily Operations

### Morning Health Check

**1. Check Application Status:**

```bash
# Health endpoint
curl http://localhost:8080/actuator/health

# Expected response
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "diskSpace": {"status": "UP"}
  }
}
```

**2. Check Database Connectivity:**

```bash
docker exec smartreconciliation-db psql -U myuser -d smartreconciliation -c "SELECT 1"
```

**3. Review Logs:**

```bash
# Check for errors in the last 24 hours
docker logs smartreconciliation-app --since 24h | grep ERROR

# Or on filesystem
tail -f /var/log/smartreconciliation/application.log | grep ERROR
```

**4. Check Disk Space:**

```bash
df -h
du -sh /app/uploads
du -sh /var/log/smartreconciliation
```

**5. Verify AI Services:**

Test each AI provider is accessible:

```bash
# Test Anthropic
curl -X POST http://localhost:8080/api/v1/ai/suggest-mapping \
  -H "Content-Type: application/json" \
  -d '{"sourceFileId":1,"targetFileId":2}'
```

---

## Monitoring and Health Checks

### Health Endpoints

**Application Health:**

```bash
GET /actuator/health
```

Response:
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 268435456000,
        "free": 200000000000,
        "threshold": 10485760
      }
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

**Liveness Probe:**

```bash
GET /actuator/health/liveness
```

**Readiness Probe:**

```bash
GET /actuator/health/readiness
```

### Metrics

**Application Info:**

```bash
GET /actuator/info
```

**All Metrics:**

```bash
GET /actuator/metrics
```

**Specific Metrics:**

```bash
# JVM memory
GET /actuator/metrics/jvm.memory.used

# HTTP requests
GET /actuator/metrics/http.server.requests

# Database connections
GET /actuator/metrics/hikaricp.connections.active
```

**Prometheus Metrics:**

```bash
GET /actuator/prometheus
```

### Setting Up Prometheus

**prometheus.yml:**

```yaml
scrape_configs:
  - job_name: 'smartreconciliation'
    scrape_interval: 15s
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['app:8080']
```

### Grafana Dashboards

Import Spring Boot Dashboard (ID: 4701) and customize with:

**Key Panels:**
- JVM memory usage
- HTTP request rate and latency
- Database connection pool
- Active reconciliations
- Exception count
- AI API response times

---

## Backup and Recovery

### Database Backup

**Automated Backup Script:**

```bash
#!/bin/bash
# /opt/scripts/backup-database.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="smartreconciliation"
DB_USER="myuser"
DB_HOST="localhost"

# Create backup
docker exec smartreconciliation-db pg_dump \
  -U ${DB_USER} \
  -h ${DB_HOST} \
  ${DB_NAME} | gzip > "${BACKUP_DIR}/backup_${DATE}.sql.gz"

# Verify backup
if [ $? -eq 0 ]; then
    echo "Backup successful: backup_${DATE}.sql.gz"

    # Upload to S3 (optional)
    aws s3 cp "${BACKUP_DIR}/backup_${DATE}.sql.gz" \
        s3://my-backup-bucket/smartreconciliation/

    # Clean old backups (keep 30 days)
    find ${BACKUP_DIR} -name "backup_*.sql.gz" -mtime +30 -delete
else
    echo "Backup failed!"
    exit 1
fi
```

**Schedule with Cron:**

```bash
# Daily at 2 AM
0 2 * * * /opt/scripts/backup-database.sh >> /var/log/backup.log 2>&1
```

### Database Restoration

**Restore from Backup:**

```bash
#!/bin/bash
BACKUP_FILE="/backups/postgres/backup_20260131_020000.sql.gz"

# Stop application
docker-compose stop app

# Restore database
gunzip -c ${BACKUP_FILE} | \
  docker exec -i smartreconciliation-db psql \
  -U myuser -d smartreconciliation

# Restart application
docker-compose start app
```

### File Storage Backup

**Backup Uploads Directory:**

```bash
#!/bin/bash
UPLOAD_DIR="/app/uploads"
BACKUP_DIR="/backups/files"
DATE=$(date +%Y%m%d)

# Create tarball
tar -czf "${BACKUP_DIR}/uploads_${DATE}.tar.gz" ${UPLOAD_DIR}

# Upload to S3
aws s3 cp "${BACKUP_DIR}/uploads_${DATE}.tar.gz" \
    s3://my-backup-bucket/smartreconciliation/files/
```

### Disaster Recovery Plan

**Recovery Time Objective (RTO):** 1 hour
**Recovery Point Objective (RPO):** 15 minutes

**Recovery Steps:**

1. **Provision New Infrastructure** (if needed)
2. **Restore Database** from latest backup
3. **Restore File Storage** from latest backup
4. **Deploy Application** from container registry
5. **Verify Application Health**
6. **Update DNS** (if IP changed)
7. **Notify Stakeholders**

---

## Performance Tuning

### Database Optimization

**Check Slow Queries:**

```sql
SELECT
    pid,
    now() - query_start as duration,
    query
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - query_start > interval '5 seconds'
ORDER BY duration DESC;
```

**Analyze Table Statistics:**

```sql
VACUUM ANALYZE reconciliations;
VACUUM ANALYZE uploaded_files;
VACUUM ANALYZE reconciliation_exceptions;
```

**Check Index Usage:**

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public';
```

**Connection Pool Tuning:**

```properties
# HikariCP settings
spring.datasource.hikari.maximum-pool-size=30
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
```

### Application Performance

**JVM Tuning:**

```bash
java -Xms4g -Xmx8g \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/var/log/heapdump.hprof \
     -XX:+PrintGCDetails \
     -XX:+PrintGCTimeStamps \
     -Xloggc:/var/log/gc.log \
     -jar app.jar
```

**Thread Pool Tuning:**

```properties
spring.task.execution.pool.core-size=16
spring.task.execution.pool.max-size=32
spring.task.execution.pool.queue-capacity=500
```

### Monitoring Performance Metrics

**Key Metrics to Track:**

| Metric | Threshold | Action |
|--------|-----------|--------|
| Response time (p95) | > 2s | Investigate slow queries |
| CPU usage | > 80% | Scale horizontally |
| Memory usage | > 85% | Increase heap size or scale |
| DB connection pool usage | > 90% | Increase pool size |
| Disk I/O wait | > 20% | Optimize queries or upgrade disk |
| Error rate | > 1% | Review logs, check dependencies |

---

## Troubleshooting

### Application Won't Start

**Check 1: Port Already in Use**

```bash
# Find process using port 8080
netstat -tulpn | grep :8080

# Kill the process
kill -9 <PID>
```

**Check 2: Database Not Accessible**

```bash
# Test database connection
psql -h localhost -U myuser -d smartreconciliation

# Check if container is running
docker ps | grep postgres
```

**Check 3: Missing Environment Variables**

```bash
# Check required variables
printenv | grep -E 'POSTGRES|ANTHROPIC|OPENAI'
```

**Check 4: Review Startup Logs**

```bash
docker logs smartreconciliation-app --tail 100
```

### High Memory Usage

**Check Memory Usage:**

```bash
# Overall memory
free -h

# Application memory
docker stats smartreconciliation-app
```

**Generate Heap Dump:**

```bash
# Find Java process
jps -l

# Generate heap dump
jmap -dump:format=b,file=/tmp/heap-dump.hprof <PID>

# Analyze with VisualVM or Eclipse MAT
```

**Fix:**

```bash
# Increase JVM heap
export JAVA_OPTS="-Xms4g -Xmx8g"

# Restart application
docker-compose restart app
```

### Database Connection Pool Exhausted

**Symptoms:**
- "HikariPool - Connection is not available" errors
- Slow response times
- Timeouts

**Diagnosis:**

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'smartreconciliation';

-- Find long-running queries
SELECT pid, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '1 minute';
```

**Fix:**

```properties
# Increase pool size
spring.datasource.hikari.maximum-pool-size=40

# Decrease timeout for faster failure
spring.datasource.hikari.connection-timeout=10000
```

### AI Service Errors

**Problem: 429 Rate Limit**

```
Solution: Implement exponential backoff
```

```java
@Retryable(
    value = {RateLimitException.class},
    maxAttempts = 5,
    backoff = @Backoff(delay = 2000, multiplier = 2, maxDelay = 30000)
)
```

**Problem: Timeout**

```
Solution: Increase timeout
```

```properties
spring.ai.anthropic.chat.options.timeout=60s
```

**Problem: Invalid API Key**

```bash
# Verify API key is set
echo $ANTHROPIC_API_KEY

# Update .env file
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Restart application
docker-compose restart app
```

### Disk Space Issues

**Check Disk Usage:**

```bash
df -h
du -sh /app/uploads/*
du -sh /var/log/smartreconciliation/*
```

**Clean Up:**

```bash
# Remove old uploads (older than 90 days)
find /app/uploads -type f -mtime +90 -delete

# Rotate logs
logrotate /etc/logrotate.d/smartreconciliation

# Clean Docker
docker system prune -a --volumes
```

### Slow Queries

**Enable Query Logging:**

```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

**PostgreSQL Slow Query Log:**

```sql
-- Enable slow query log
ALTER SYSTEM SET log_min_duration_statement = '1000';  -- 1 second
SELECT pg_reload_conf();

-- View slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

---

## Maintenance Tasks

### Weekly Tasks

**1. Review Error Logs:**

```bash
grep ERROR /var/log/smartreconciliation/application.log | tail -100
```

**2. Check Database Size:**

```sql
SELECT
    pg_size_pretty(pg_database_size('smartreconciliation')) as db_size;
```

**3. Analyze Table Growth:**

```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**4. Review Reconciliation Statistics:**

```sql
SELECT
    status,
    COUNT(*) as count,
    AVG(match_rate) as avg_match_rate
FROM reconciliations
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY status;
```

### Monthly Tasks

**1. Database Maintenance:**

```sql
-- Full vacuum
VACUUM FULL;

-- Reindex
REINDEX DATABASE smartreconciliation;

-- Update statistics
ANALYZE;
```

**2. Update Dependencies:**

```bash
# Check for updates
mvn versions:display-dependency-updates

# Update Spring Boot
mvn versions:update-parent

# Rebuild
mvn clean install
```

**3. Security Updates:**

```bash
# Update base image
docker pull eclipse-temurin:21-jre-alpine

# Rebuild application image
docker build -t smartreconciliation:latest .
```

**4. Certificate Renewal:**

```bash
# Renew Let's Encrypt certificates
certbot renew

# Reload NGINX
docker exec smartreconciliation-nginx nginx -s reload
```

### Quarterly Tasks

**1. Disaster Recovery Test:**
- Perform full backup
- Restore to test environment
- Verify application functionality

**2. Capacity Planning:**
- Review growth trends
- Project resource needs
- Plan infrastructure scaling

**3. Security Audit:**
- Review access logs
- Update passwords
- Rotate API keys
- Review firewall rules

---

## Security Operations

### Access Control

**Review User Access:**

```sql
SELECT id, email, role, active, last_login
FROM users
ORDER BY last_login DESC;
```

**Disable Inactive Users:**

```sql
UPDATE users
SET active = false
WHERE last_login < NOW() - INTERVAL '90 days';
```

### Audit Logging

**Enable Audit Logging:**

```properties
logging.level.org.springframework.security=DEBUG
```

**Review Audit Logs:**

```bash
grep "AUDIT" /var/log/smartreconciliation/application.log
```

### API Key Rotation

**Rotate AI Provider Keys:**

```bash
# 1. Generate new API key from provider console
# 2. Update .env file
# 3. Restart application
docker-compose restart app

# 4. Verify new key works
curl -X POST http://localhost:8080/api/v1/ai/suggest-mapping \
  -H "Content-Type: application/json" \
  -d '{"sourceFileId":1,"targetFileId":2}'

# 5. Revoke old key from provider console
```

### Security Scanning

**Scan Docker Image:**

```bash
# Using Trivy
trivy image smartreconciliation:latest

# Using Snyk
snyk container test smartreconciliation:latest
```

**Dependency Vulnerability Scan:**

```bash
mvn dependency:check
```

---

## Incident Response

### Incident Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P1 - Critical** | Complete service outage | 15 minutes | Application down, database crash |
| **P2 - High** | Major functionality impaired | 1 hour | AI service unavailable, upload failures |
| **P3 - Medium** | Minor functionality impaired | 4 hours | Slow response times, minor bugs |
| **P4 - Low** | Cosmetic issues | 1 business day | UI glitches, typos |

### Incident Response Plan

**1. Detection:**
- Monitoring alerts
- User reports
- Health check failures

**2. Assessment:**
- Determine severity
- Identify impacted users
- Estimate scope

**3. Communication:**
- Notify stakeholders
- Update status page
- Set expectations

**4. Resolution:**
- Follow runbook procedures
- Implement fix or workaround
- Verify resolution

**5. Post-Mortem:**
- Document root cause
- Identify improvements
- Update runbooks

### Common Incidents

**Application Down:**

```bash
# 1. Check if container is running
docker ps | grep smartreconciliation-app

# 2. Check logs
docker logs smartreconciliation-app --tail 100

# 3. Restart application
docker-compose restart app

# 4. Verify health
curl http://localhost:8080/actuator/health
```

**Database Connection Lost:**

```bash
# 1. Check database container
docker ps | grep postgres

# 2. Restart database
docker-compose restart postgres

# 3. Check connectivity
psql -h localhost -U myuser -d smartreconciliation -c "SELECT 1"

# 4. Restart application
docker-compose restart app
```

**Out of Disk Space:**

```bash
# 1. Check disk usage
df -h

# 2. Clean old uploads
find /app/uploads -mtime +30 -delete

# 3. Rotate logs
logrotate -f /etc/logrotate.d/smartreconciliation

# 4. Clean Docker
docker system prune -a -f
```

---

## Runbook

### Runbook Template

```markdown
# Runbook: [Incident Type]

## Symptoms
- [Symptom 1]
- [Symptom 2]

## Diagnosis Steps
1. [Step 1]
2. [Step 2]

## Resolution Steps
1. [Step 1]
2. [Step 2]

## Prevention
- [Prevention measure 1]
- [Prevention measure 2]

## Rollback Plan
1. [Rollback step 1]
2. [Rollback step 2]
```

### Application Deployment

**Pre-Deployment Checklist:**
- [ ] Code reviewed and approved
- [ ] Tests passing
- [ ] Database migrations tested
- [ ] Backup completed
- [ ] Rollback plan documented
- [ ] Stakeholders notified

**Deployment Steps:**

```bash
# 1. Backup database
/opt/scripts/backup-database.sh

# 2. Pull latest image
docker pull registry.example.com/smartreconciliation:v1.2.0

# 3. Stop current version
docker-compose stop app

# 4. Run database migrations (if any)
docker run --rm \
  --network smartreconciliation_network \
  registry.example.com/smartreconciliation:v1.2.0 \
  flyway migrate

# 5. Start new version
docker-compose up -d app

# 6. Verify health
sleep 30
curl http://localhost:8080/actuator/health

# 7. Monitor logs
docker logs -f smartreconciliation-app
```

**Rollback Steps:**

```bash
# 1. Stop new version
docker-compose stop app

# 2. Start old version
docker tag registry.example.com/smartreconciliation:v1.1.0 \
  smartreconciliation:latest
docker-compose up -d app

# 3. Restore database (if needed)
gunzip -c /backups/postgres/backup_latest.sql.gz | \
  docker exec -i smartreconciliation-db psql \
  -U myuser -d smartreconciliation
```

---

## Conclusion

This operations guide provides procedures for:
- Daily health checks
- Monitoring and alerts
- Backup and recovery
- Performance tuning
- Troubleshooting common issues
- Incident response

For more information, see:
- [Deployment Guide](deployment-guide.md)
- [Configuration Reference](configuration-reference.md)
- [Architecture Documentation](architecture.md)
