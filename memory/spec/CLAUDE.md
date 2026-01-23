# Smart Reconciliation - MVP Product Specification

> **Version:** 1.0 (MVP)
> **Last Updated:** January 2026
> **Status:** Draft

---

## 1. Executive Summary

**Smart Reconciliation** is an AI-powered, industry-agnostic reconciliation platform that transforms how businesses match and verify data across systems. Unlike traditional rule-based tools requiring extensive manual configuration, Smart Reconciliation uses AI to autonomously understand data formats, suggest intelligent mappings, and execute reconciliations with minimal user effort.

**Core Value Proposition:** *"Upload your data, describe what you need, and let AI handle the rest."*

---

## 2. Problem Statement

### The Pain
- **Manual Configuration Hell:** Traditional reconciliation tools require weeks of setup - defining schemas, writing transformation rules, mapping fields
- **Industry Silos:** Most solutions are built for specific industries (banking, retail), forcing businesses to use multiple tools
- **Technical Barrier:** Business users depend on IT teams for any reconciliation changes
- **Scale Challenges:** Growing transaction volumes make manual exception handling unsustainable
- **No Learning:** Systems don't improve over time - same errors, same manual fixes, repeatedly

### The Opportunity
Every business reconciles data - payments vs invoices, inventory vs orders, HR systems vs payroll. This is a **horizontal problem** affecting all industries, yet no solution offers true AI-native intelligence with zero-config simplicity.

---

## 3. Target Users

### Primary Personas

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| **Finance Analyst** | Performs daily/weekly reconciliations | Speed, accuracy, audit trail |
| **Operations Manager** | Oversees data integrity across systems | Visibility, exception management |
| **IT Administrator** | Manages integrations and deployments | Security, on-premise support, APIs |
| **Business Owner (SMB)** | Wears multiple hats, limited technical skills | Simplicity, affordability |

### Market Segments
- **Enterprise:** Banks, insurers, retailers, manufacturers with complex multi-system landscapes
- **SMB:** Growing businesses reconciling accounting software with payment gateways, e-commerce platforms

---

## 4. Core Features (MVP)

### 4.1 Chat-First AI Interface

The primary interaction model is conversational. Users describe what they need in natural language.

**Example Interactions:**
```
User: "I have a bank statement CSV and our accounting export.
       Reconcile payments for January 2026."

AI: "I've analyzed both files:
     - Bank statement: 2,847 transactions, columns detected: Date, Description, Amount, Balance
     - Accounting export: 3,102 entries, columns detected: Transaction_Date, Vendor, Debit, Credit

     I suggest matching on:
     • Date (Bank.Date ↔ Accounting.Transaction_Date) with ±1 day tolerance
     • Amount (Bank.Amount ↔ Accounting.Debit/Credit combined)

     Should I proceed with this mapping, or would you like to adjust?"
```

**Capabilities:**
- Natural language understanding for reconciliation requests
- Contextual follow-up questions when ambiguous
- Explain AI decisions in plain English
- Accept corrections via conversation ("No, match on invoice number instead")

### 4.2 Zero-Config AI Magic

**Autonomous Data Understanding:**
- Auto-detect file formats (CSV, Excel, JSON, XML)
- Infer column types (date, currency, identifier, description)
- Detect delimiters, encoding, header rows automatically
- Handle messy data (inconsistent date formats, currency symbols)

**Intelligent Field Mapping:**
- Semantic matching (understands "Amt" = "Amount" = "Total")
- Cross-language support (maps "Fecha" to "Date")
- Confidence scores for each mapping suggestion
- Learn from user corrections

**Smart Reconciliation Rules:**
- Suggest matching strategies based on data patterns
- Propose tolerance thresholds (date ranges, amount variances)
- Identify potential many-to-one matches (multiple payments → single invoice)
- Detect duplicates and anomalies

### 4.3 Visual Rule Builder

For users who want control beyond AI suggestions:

**Drag-Drop Interface:**
- Visual canvas showing source → transformation → target flow
- Pre-built transformation blocks:
  - Field mapping
  - Date parsing/formatting
  - Currency conversion
  - Aggregation (sum, count)
  - Conditional logic (if/then)
  - Text manipulation (trim, concat, split)

**Rule Library:**
- Save rules as templates
- Share across team/organization
- Version history with rollback
- AI can suggest modifications to existing rules

### 4.4 Multi-Source Connectivity

**File Uploads:**
- CSV, Excel (.xlsx, .xls), JSON, XML
- Drag-drop or programmatic upload
- Scheduled file pickup from SFTP/cloud storage

**Database Connections:**
- PostgreSQL, MySQL, SQL Server, Oracle
- Direct query or table sync
- Connection pooling for performance

**API Integrations:**
- REST API connector (configure endpoint, auth, mapping)
- Pre-built connectors (QuickBooks, Xero, Stripe, SAP - post-MVP)
- Webhook receiver for real-time data push

### 4.5 Exception Management

**Intelligent Flagging:**
- Categorize mismatches: Missing, Amount variance, Date mismatch, Duplicate
- Severity levels: Critical, Warning, Info
- Trend detection ("Amount variances increased 40% this week")

**AI-Suggested Resolutions:**
```
Exception: Invoice #4521 ($1,500) has no matching payment

AI Suggestion: "Found 3 payments totaling $1,500 on the same date:
               • Payment A: $500
               • Payment B: $750
               • Payment C: $250

               These likely combine to match Invoice #4521.
               [Accept Match] [Reject] [Investigate]"
```

**Workflow:**
- Bulk actions (approve all high-confidence suggestions)
- Assignment to team members
- Comments and notes on exceptions
- Audit trail of all resolutions

### 4.6 Client Rule Persistence

**Learning Loop:**
1. AI suggests initial mapping/rules
2. User adjusts and corrects
3. System saves learned rules for this client/data source combination
4. Future reconciliations use saved rules (with option to re-learn)

**Rule Management:**
- Named rule sets per client/use case
- A/B testing of rule variations
- Performance metrics (match rate, exception rate)
- Export/import rules across environments

---

## 5. User Experience

### 5.1 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Conversation First** | Chat is the primary interface, not a sidebar feature |
| **Progressive Disclosure** | Simple by default, advanced options available on demand |
| **Transparency** | Always explain what AI did and why |
| **Forgiving** | Easy to undo, correct, or start over |
| **Delightful** | Micro-animations, smart suggestions, celebratory moments |

### 5.2 Key Screens

**1. Home / Command Center**
- Recent reconciliations with status
- Quick actions: "New Reconciliation", "Upload Files", "View Exceptions"
- AI assistant prominently featured
- Key metrics: Match rate, pending exceptions, processing status

**2. Chat Interface**
- Full-screen conversational UI
- Rich message types: text, tables, charts, action buttons
- File upload inline in chat
- Suggested prompts for new users

**3. Reconciliation Dashboard**
- Visual summary: matched, unmatched, exceptions
- Interactive Sankey diagram showing data flow
- Drill-down to transaction level
- Time-series of reconciliation health

**4. Visual Rule Builder**
- Canvas-based editor
- Palette of transformation blocks
- Live preview of rule effects
- Validation and error highlighting

**5. Exception Queue**
- Filterable list view
- Side panel with exception details and AI suggestions
- Keyboard shortcuts for power users
- Bulk selection and actions

**6. Settings & Connections**
- Data source management
- User/team management
- Rule library
- Audit logs

### 5.3 UI Technology Recommendations

- **Frontend Framework:** React with TypeScript
- **Component Library:** Tailwind CSS + shadcn/ui (modern, customizable)
- **Chat UI:** Custom-built for rich interactions
- **Visual Builder:** React Flow for node-based editor
- **Charts:** Recharts or Apache ECharts
- **State Management:** Zustand or TanStack Query

---

## 6. Technical Architecture (High-Level)

### 6.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Web App    │  │  REST API   │  │  Webhooks   │              │
│  │  (React)    │  │  Clients    │  │  Receivers  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                               │
│         (Authentication, Rate Limiting, Routing)                 │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Chat/NLP     │  │ Reconciliation│  │ Rule Engine  │           │
│  │ Service      │  │ Engine        │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Connector    │  │ AI/ML        │  │ Exception    │           │
│  │ Service      │  │ Service      │  │ Service      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ PostgreSQL   │  │ Redis        │  │ Vector DB    │           │
│  │ (Primary DB) │  │ (Cache/Queue)│  │ (PGVector)   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │ File Storage │  │ Audit Log    │                             │
│  │ (S3/MinIO)   │  │ Storage      │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Backend** | Java 21 + Spring Boot 3.5 | Enterprise-grade, existing codebase |
| **AI Integration** | Spring AI 1.1.2 | Native Spring integration with multiple LLM providers |
| **LLM Providers** | Anthropic Claude, OpenAI, DeepSeek | Flexibility, fallback options |
| **Vector Store** | PostgreSQL + PGVector | Semantic search for rule matching, already integrated |
| **Database** | PostgreSQL | Robust, scalable, JSON support |
| **Cache** | Redis | Session management, job queues |
| **File Storage** | MinIO (on-prem) / S3 (cloud) | Scalable object storage |
| **Frontend** | React + TypeScript | Modern, component-based |
| **Deployment** | Docker + Kubernetes | On-premise support, scalability |

### 6.3 Scale Considerations (10K - 1M rows)

- **Chunked Processing:** Process large files in 10K row batches
- **Async Jobs:** Background processing with progress tracking
- **Indexed Matching:** B-tree and hash indexes for fast lookups
- **Streaming Responses:** Don't load entire datasets in memory
- **Connection Pooling:** Efficient database resource usage

---

## 7. AI Architecture

### 7.1 AI Capabilities Breakdown

| Capability | Approach | Models |
|------------|----------|--------|
| **Natural Language Understanding** | LLM-based intent extraction | Claude/GPT-4 |
| **Schema Detection** | Heuristics + LLM validation | Rule-based + Claude |
| **Field Mapping** | Embedding similarity + LLM reasoning | PGVector + Claude |
| **Rule Suggestion** | Few-shot prompting with examples | Claude |
| **Exception Resolution** | RAG over past resolutions + reasoning | PGVector + Claude |
| **Learning** | Fine-tuned embeddings, saved prompts | Custom training |

### 7.2 Prompt Engineering Strategy

- **System Prompts:** Carefully crafted prompts for each task type
- **Few-Shot Examples:** Include examples of good mappings/rules
- **Chain of Thought:** Force reasoning before conclusions
- **Guardrails:** Validate AI outputs against schemas
- **Fallbacks:** Graceful degradation if AI confidence is low

### 7.3 Vector Store Usage

- Store embeddings of column names, sample values
- Semantic search for similar past reconciliations
- Retrieve relevant rules based on data characteristics
- Exception resolution knowledge base

---

## 8. Security & Compliance

### 8.1 On-Premise Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Air-gapped Support** | Local LLM option (DeepSeek/Ollama) |
| **Data Residency** | All data stays within customer infrastructure |
| **No External Calls** | Optional mode with all AI running locally |
| **Encryption** | AES-256 at rest, TLS 1.3 in transit |

### 8.2 Access Control

- Role-based access control (RBAC)
- SSO integration (SAML, OIDC)
- Audit logging of all actions
- Data masking for sensitive fields

### 8.3 Compliance Readiness

- SOC 2 Type II (post-MVP)
- GDPR data handling
- Audit trail retention policies
- Data deletion capabilities

---

## 9. MVP Scope Boundaries

### In Scope (MVP)
- [x] Chat-first AI interface
- [x] File upload (CSV, Excel, JSON)
- [x] Database connections (PostgreSQL, MySQL)
- [x] REST API connector (generic)
- [x] AI schema detection and field mapping
- [x] AI rule suggestion
- [x] Visual rule builder (basic)
- [x] Exception flagging with AI suggestions
- [x] Client rule persistence
- [x] Single-tenant on-premise deployment
- [x] Basic RBAC (admin, analyst roles)

### Out of Scope (Post-MVP)
- [ ] Pre-built connectors (QuickBooks, SAP, etc.)
- [ ] Multi-tenant SaaS
- [ ] Real-time streaming reconciliation
- [ ] Advanced collaboration (comments, assignments)
- [ ] Mobile app
- [ ] Custom ML model training per client
- [ ] White-labeling
- [ ] Advanced reporting and analytics

---

## 10. Success Metrics

### Product Metrics

| Metric | Target (MVP) | Measurement |
|--------|--------------|-------------|
| **First Reconciliation Time** | < 10 minutes | Time from upload to first match |
| **AI Mapping Accuracy** | > 85% | User acceptance of AI suggestions |
| **Match Rate** | > 95% | Automated matches / total transactions |
| **Exception Resolution Time** | 50% reduction | vs. manual baseline |

### Business Metrics

| Metric | Target (Year 1) |
|--------|-----------------|
| **Pilot Customers** | 5-10 |
| **Paid Conversions** | 3-5 |
| **NPS Score** | > 40 |

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **AI Hallucinations** | Wrong mappings, bad matches | Confidence thresholds, human review |
| **Performance at Scale** | Slow for 1M+ rows | Chunking, async processing, indexing |
| **On-Prem Complexity** | Difficult deployments | Docker-based, comprehensive docs |
| **LLM Cost** | High API costs | Caching, local model fallback |
| **Data Privacy Concerns** | Customer hesitation | On-prem option, local LLM mode |

---

## 12. Future Roadmap (Post-MVP)

### Phase 2: Connectivity Expansion
- Pre-built connectors for top 20 business systems
- Real-time webhook-based reconciliation
- Scheduled automated runs

### Phase 3: Collaboration & Enterprise
- Multi-user workflows with approval chains
- Advanced audit and compliance reporting
- Multi-tenant SaaS option

### Phase 4: Intelligence Enhancement
- Cross-client pattern learning (anonymized)
- Anomaly prediction before it happens
- Natural language report generation

---

## 13. REST API Documentation

### 13.1 API Overview

Base URL: `https://{host}/api/v1`

Authentication: Bearer token (JWT) or API Key

### 13.2 Core Endpoints

#### Data Sources

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/datasources` | Register a new data source |
| `GET` | `/datasources` | List all data sources |
| `GET` | `/datasources/{id}` | Get data source details |
| `PUT` | `/datasources/{id}` | Update data source config |
| `DELETE` | `/datasources/{id}` | Remove data source |
| `POST` | `/datasources/{id}/test` | Test connection |

#### File Uploads

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/files/upload` | Upload file(s) for reconciliation |
| `GET` | `/files/{id}` | Get file metadata and status |
| `GET` | `/files/{id}/preview` | Preview first N rows |
| `GET` | `/files/{id}/schema` | Get detected schema |

#### Reconciliations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/reconciliations` | Start new reconciliation |
| `GET` | `/reconciliations` | List reconciliations (with filters) |
| `GET` | `/reconciliations/{id}` | Get reconciliation details |
| `GET` | `/reconciliations/{id}/status` | Get processing status |
| `GET` | `/reconciliations/{id}/results` | Get match results |
| `GET` | `/reconciliations/{id}/exceptions` | Get exceptions list |
| `POST` | `/reconciliations/{id}/cancel` | Cancel running reconciliation |

#### AI/Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Send message to AI assistant |
| `POST` | `/chat/stream` | Stream AI response (SSE) |
| `GET` | `/chat/history/{sessionId}` | Get conversation history |
| `POST` | `/ai/suggest-mapping` | Get AI field mapping suggestions |
| `POST` | `/ai/suggest-rules` | Get AI rule suggestions |

#### Rules

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/rules` | Create new rule set |
| `GET` | `/rules` | List all rule sets |
| `GET` | `/rules/{id}` | Get rule set details |
| `PUT` | `/rules/{id}` | Update rule set |
| `DELETE` | `/rules/{id}` | Delete rule set |
| `POST` | `/rules/{id}/validate` | Validate rule against sample data |

#### Exceptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/exceptions` | List exceptions (with filters) |
| `GET` | `/exceptions/{id}` | Get exception details |
| `PUT` | `/exceptions/{id}` | Update exception (resolve, assign) |
| `POST` | `/exceptions/bulk-resolve` | Bulk resolve exceptions |
| `GET` | `/exceptions/{id}/suggestions` | Get AI resolution suggestions |

### 13.3 Request/Response Examples

**Start Reconciliation:**
```json
POST /api/v1/reconciliations
{
  "name": "January Bank Reconciliation",
  "sourceA": {
    "type": "file",
    "fileId": "file_abc123"
  },
  "sourceB": {
    "type": "database",
    "datasourceId": "ds_xyz789",
    "query": "SELECT * FROM transactions WHERE date >= '2026-01-01'"
  },
  "ruleSetId": "rule_existing456",  // optional, use existing rules
  "useAiMapping": true               // let AI suggest if no rules
}
```

**Response:**
```json
{
  "id": "recon_123",
  "status": "processing",
  "createdAt": "2026-01-23T10:30:00Z",
  "estimatedCompletion": "2026-01-23T10:35:00Z",
  "progress": {
    "phase": "mapping",
    "percentComplete": 15
  }
}
```

**Chat with AI:**
```json
POST /api/v1/chat
{
  "sessionId": "session_abc",
  "message": "The amount tolerance should be $0.01, not $1.00",
  "context": {
    "reconciliationId": "recon_123"
  }
}
```

### 13.4 Webhooks

Subscribe to events for async notifications:

| Event | Payload |
|-------|---------|
| `reconciliation.started` | Reconciliation ID, source info |
| `reconciliation.completed` | Results summary, match rate |
| `reconciliation.failed` | Error details |
| `exception.created` | Exception details |
| `exception.resolved` | Resolution details |

---

## 14. Data Model

### 14.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Organization  │       │      User       │       │     DataSource  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │───┐   │ id              │   ┌───│ id              │
│ name            │   │   │ email           │   │   │ organization_id │
│ settings (JSON) │   │   │ name            │   │   │ name            │
│ created_at      │   │   │ role            │   │   │ type (enum)     │
└─────────────────┘   │   │ organization_id │───┘   │ config (JSON)   │
                      │   └─────────────────┘       │ status          │
                      │                             └─────────────────┘
                      │
┌─────────────────┐   │   ┌─────────────────┐       ┌─────────────────┐
│   Reconciliation│   │   │    RuleSet      │       │   FieldMapping  │
├─────────────────┤   │   ├─────────────────┤       ├─────────────────┤
│ id              │   │   │ id              │───────│ id              │
│ organization_id │───┘   │ organization_id │       │ rule_set_id     │
│ name            │       │ name            │       │ source_field    │
│ status (enum)   │       │ description     │       │ target_field    │
│ source_a_id     │       │ version         │       │ transform (JSON)│
│ source_b_id     │       │ is_ai_generated │       │ confidence      │
│ rule_set_id     │───────│ created_at      │       └─────────────────┘
│ results (JSON)  │       └─────────────────┘
│ created_at      │                                 ┌─────────────────┐
│ completed_at    │       ┌─────────────────┐       │  MatchingRule   │
└─────────────────┘       │    Exception    │       ├─────────────────┤
        │                 ├─────────────────┤       │ id              │
        │                 │ id              │       │ rule_set_id     │
        │                 │ reconciliation_id│──────│ name            │
        │                 │ type (enum)     │       │ match_type      │
        └─────────────────│ severity        │       │ tolerance (JSON)│
                          │ source_record   │       │ priority        │
                          │ details (JSON)  │       └─────────────────┘
                          │ status          │
                          │ resolution      │       ┌─────────────────┐
                          │ assigned_to     │       │   AuditLog      │
                          │ ai_suggestion   │       ├─────────────────┤
                          └─────────────────┘       │ id              │
                                                    │ entity_type     │
┌─────────────────┐       ┌─────────────────┐       │ entity_id       │
│   UploadedFile  │       │  ChatSession    │       │ action          │
├─────────────────┤       ├─────────────────┤       │ user_id         │
│ id              │       │ id              │       │ changes (JSON)  │
│ organization_id │       │ user_id         │       │ timestamp       │
│ filename        │       │ context (JSON)  │       └─────────────────┘
│ file_path       │       │ created_at      │
│ file_size       │       └────────┬────────┘
│ mime_type       │                │
│ detected_schema │       ┌────────┴────────┐
│ row_count       │       │  ChatMessage    │
│ status          │       ├─────────────────┤
└─────────────────┘       │ id              │
                          │ session_id      │
                          │ role (user/ai)  │
                          │ content         │
                          │ metadata (JSON) │
                          │ timestamp       │
                          └─────────────────┘
```

### 14.2 Core Tables

#### organizations
```sql
CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### users
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    email           VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255),
    role            VARCHAR(50) DEFAULT 'analyst',  -- admin, analyst, viewer
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### data_sources
```sql
CREATE TABLE data_sources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL,  -- file, database, api
    config          JSONB NOT NULL,        -- connection details (encrypted)
    status          VARCHAR(50) DEFAULT 'active',
    last_tested_at  TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### uploaded_files
```sql
CREATE TABLE uploaded_files (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    filename        VARCHAR(255) NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    file_size       BIGINT,
    mime_type       VARCHAR(100),
    detected_schema JSONB,          -- columns, types, sample values
    row_count       INTEGER,
    status          VARCHAR(50) DEFAULT 'pending',  -- pending, analyzed, error
    uploaded_by     UUID REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### rule_sets
```sql
CREATE TABLE rule_sets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    version         INTEGER DEFAULT 1,
    is_ai_generated BOOLEAN DEFAULT false,
    source_schema   JSONB,          -- expected source A schema
    target_schema   JSONB,          -- expected source B schema
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### field_mappings
```sql
CREATE TABLE field_mappings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_set_id     UUID REFERENCES rule_sets(id) ON DELETE CASCADE,
    source_field    VARCHAR(255) NOT NULL,
    target_field    VARCHAR(255) NOT NULL,
    transform       JSONB,          -- transformation logic
    confidence      DECIMAL(3,2),   -- AI confidence score (0.00-1.00)
    is_key_field    BOOLEAN DEFAULT false
);
```

#### matching_rules
```sql
CREATE TABLE matching_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_set_id     UUID REFERENCES rule_sets(id) ON DELETE CASCADE,
    name            VARCHAR(255),
    match_type      VARCHAR(50),    -- exact, fuzzy, range, aggregate
    fields          JSONB NOT NULL, -- fields involved in matching
    tolerance       JSONB,          -- tolerance settings (amount, date, etc.)
    priority        INTEGER DEFAULT 0
);
```

#### reconciliations
```sql
CREATE TABLE reconciliations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name            VARCHAR(255),
    status          VARCHAR(50) DEFAULT 'pending',  -- pending, processing, completed, failed
    source_a_type   VARCHAR(50),
    source_a_ref    UUID,           -- file_id or datasource_id
    source_a_config JSONB,          -- query, filters, etc.
    source_b_type   VARCHAR(50),
    source_b_ref    UUID,
    source_b_config JSONB,
    rule_set_id     UUID REFERENCES rule_sets(id),
    results         JSONB,          -- summary stats
    error_message   TEXT,
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### exceptions
```sql
CREATE TABLE exceptions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reconciliation_id UUID REFERENCES reconciliations(id) ON DELETE CASCADE,
    type              VARCHAR(50) NOT NULL,  -- missing_source, missing_target, mismatch, duplicate
    severity          VARCHAR(20) DEFAULT 'warning',  -- critical, warning, info
    source_record_id  VARCHAR(255),
    target_record_id  VARCHAR(255),
    source_data       JSONB,
    target_data       JSONB,
    details           JSONB,         -- specific mismatch details
    status            VARCHAR(50) DEFAULT 'open',  -- open, resolved, ignored
    resolution        JSONB,         -- how it was resolved
    ai_suggestion     JSONB,         -- AI-suggested resolution
    assigned_to       UUID REFERENCES users(id),
    resolved_by       UUID REFERENCES users(id),
    resolved_at       TIMESTAMP,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID NOT NULL,
    action          VARCHAR(50) NOT NULL,  -- create, update, delete, resolve
    user_id         UUID REFERENCES users(id),
    changes         JSONB,
    ip_address      INET,
    user_agent      TEXT,
    timestamp       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 14.3 Vector Store Tables (PGVector)

```sql
-- For semantic search on field names and rules
CREATE TABLE field_embeddings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    field_name      VARCHAR(255),
    field_context   TEXT,           -- description, sample values
    embedding       vector(1536),   -- OpenAI embedding dimension
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON field_embeddings USING ivfflat (embedding vector_cosine_ops);

-- For retrieving similar past reconciliations
CREATE TABLE reconciliation_embeddings (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reconciliation_id UUID REFERENCES reconciliations(id),
    description       TEXT,
    embedding         vector(1536),
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 15. User Stories

### Epic 1: Data Onboarding

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| **US-1.1** | As a Finance Analyst, I want to upload CSV/Excel files by drag-drop so I can quickly start reconciliation | - Drag-drop zone on home screen<br>- Support CSV, XLSX, XLS<br>- Show upload progress<br>- Max file size: 100MB |
| **US-1.2** | As a Finance Analyst, I want the system to auto-detect column types so I don't have to manually configure schema | - Detect: date, number, currency, text, identifier<br>- Handle various date formats<br>- Show confidence score<br>- Allow manual override |
| **US-1.3** | As an IT Admin, I want to connect to our PostgreSQL database so reconciliation can pull live data | - Secure connection form (host, port, user, password)<br>- Test connection button<br>- Save connection for reuse<br>- Encrypted credential storage |
| **US-1.4** | As an IT Admin, I want to configure a REST API connector so we can reconcile with external systems | - Configure endpoint URL, auth method<br>- Set headers, query params<br>- Map response JSON to tabular format<br>- Schedule periodic pulls |

### Epic 2: AI-Powered Reconciliation

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| **US-2.1** | As a Finance Analyst, I want to describe my reconciliation need in plain English so AI can set it up for me | - Chat input prominently displayed<br>- AI understands: "reconcile bank statement with accounting"<br>- AI asks clarifying questions if needed |
| **US-2.2** | As a Finance Analyst, I want AI to suggest field mappings so I don't have to manually match columns | - AI analyzes both schemas<br>- Suggests mappings with confidence %<br>- Explains reasoning<br>- One-click accept or modify |
| **US-2.3** | As a Finance Analyst, I want AI to recommend matching rules based on my data patterns | - Suggest: exact match, fuzzy match, date tolerance, amount tolerance<br>- Show sample matches with each rule<br>- Allow adjustment via chat |
| **US-2.4** | As a Finance Analyst, I want to correct AI suggestions via conversation so the system learns my preferences | - "Change date tolerance to 2 days"<br>- "Match on invoice number, not description"<br>- AI confirms understanding<br>- Corrections saved for future |

### Epic 3: Visual Rule Builder

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| **US-3.1** | As an Operations Manager, I want to visually create matching rules using drag-drop so I have full control | - Canvas with source/target columns<br>- Drag lines to create mappings<br>- Transformation blocks palette<br>- Live preview of results |
| **US-3.2** | As an Operations Manager, I want to save rule sets as templates so I can reuse them monthly | - Name and describe rule set<br>- Save to library<br>- Load existing rule set<br>- Version history |
| **US-3.3** | As an Operations Manager, I want to see a live preview of how my rules affect matching so I can tune them | - Sample data panel<br>- Real-time match results as rules change<br>- Highlight matched/unmatched rows |

### Epic 4: Exception Management

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| **US-4.1** | As a Finance Analyst, I want to see a prioritized list of exceptions so I can focus on critical issues first | - Exception queue with filters<br>- Sort by severity, amount, date<br>- Search exceptions<br>- Pagination |
| **US-4.2** | As a Finance Analyst, I want AI to suggest resolutions for exceptions so I can resolve them faster | - AI analyzes exception<br>- Suggests: "These 3 transactions likely match"<br>- One-click accept suggestion<br>- Explain reasoning |
| **US-4.3** | As a Finance Analyst, I want to bulk-resolve high-confidence matches so I can process exceptions efficiently | - Select multiple exceptions<br>- "Accept all AI suggestions above 90% confidence"<br>- Undo bulk actions |
| **US-4.4** | As an Operations Manager, I want an audit trail of all exception resolutions for compliance | - Log who resolved, when, how<br>- Store original values and resolution<br>- Export audit report<br>- Retention policy |

### Epic 5: Reporting & Insights

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| **US-5.1** | As an Operations Manager, I want a dashboard showing reconciliation health so I can monitor status | - Match rate over time<br>- Exception trends<br>- Processing status<br>- Recent reconciliations |
| **US-5.2** | As a Finance Analyst, I want to export reconciliation results so I can share with stakeholders | - Export to CSV, Excel, PDF<br>- Include: matched, unmatched, exceptions<br>- Summary statistics |
| **US-5.3** | As an Operations Manager, I want to see trends in exceptions so I can identify systemic issues | - "Amount variances up 40% this month"<br>- Group exceptions by type/source<br>- Historical comparison |

### Epic 6: Administration

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| **US-6.1** | As an IT Admin, I want to manage users and roles so I can control access | - Create/edit/delete users<br>- Assign roles: admin, analyst, viewer<br>- Deactivate users |
| **US-6.2** | As an IT Admin, I want to deploy the system on-premise so our data stays within our network | - Docker-based deployment<br>- Configuration via environment variables<br>- Health check endpoints<br>- Backup/restore procedures |
| **US-6.3** | As an IT Admin, I want to configure local LLM (Ollama) so we can run AI without internet | - Ollama integration settings<br>- Model selection (Llama, Mistral)<br>- Fallback to cloud if local fails<br>- Performance monitoring |

---

## 16. Open Questions

| Question | Status | Decision |
|----------|--------|----------|
| **Pricing Model** | Open | Per-transaction, per-user, or flat subscription? |
| **Local LLM** | Decided | **Ollama + Llama/Mistral** for air-gapped environments |
| **Branding** | Open | Final product name? "Smart Reconciliation" or alternative? |
| **Initial Vertical** | Decided | **Financial Services** - banks, fintech, insurance as GTM focus |

---

## 17. Next Steps

1. **Validate spec** with stakeholders
2. **Technical spike** on AI mapping accuracy
3. **UI/UX wireframes** for chat interface
4. **Architecture deep-dive** for on-premise deployment
5. **Build Phase 1:** Core reconciliation engine + chat UI

---

*This specification is a living document and will evolve based on customer feedback and technical discoveries.*
