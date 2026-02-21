# Architecture: Reconciliation Pipelines

This document details the technical implementation of the Reconciliation Pipeline (N-Way Chaining) system.

## 1. Pipeline Data Flow

The following diagram illustrates how data flows from raw uploads through multiple reconciliation stages using **Materialized Intermediate Artifacts**.

```mermaid
graph TD
    %% Inputs
    S1[Source: Raw Orders.csv]
    T1[Target: Marketplace.csv]
    
    %% Step 1
    subgraph "Step 1: Orders vs Marketplace"
        R1[Reconciliation Engine]
        EX1[Exceptions / Unmatched]
    end
    
    %% Glue
    VF1[Materialized: Unmatched_Orders_S1.csv]
    
    %% Step 2
    T2[Target: Payment_Gateway.csv]
    subgraph "Step 2: Remaining Orders vs Gateway"
        R2[Reconciliation Engine]
        EX2[Final Exceptions]
    end

    S1 --> R1
    T1 --> R1
    R1 --> EX1
    EX1 -->|FileGenerator| VF1
    VF1 -->|InputResolver| R2
    T2 --> R2
    R2 --> EX2
```

## 2. Updated Entity Relationship

To support this, we move from a file-centric model to a source-agnostic model.

```mermaid
erDiagram
    RECONCILIATION_STREAM ||--o{ RECONCILIATION : contains
    RECONCILIATION ||--o{ RECONCILIATION_EXCEPTION : generates
    
    RECONCILIATION {
        bigint id
        varchar source_input_type "FILE | RESULT | DATA_SOURCE"
        bigint source_input_id
        varchar target_input_type
        bigint target_input_id
        bigint stream_id
        int step_order
    }
    
    RECONCILIATION_STREAM {
        bigint id
        varchar name
        varchar status "PENDING | IN_PROGRESS | COMPLETED"
        jsonb metadata "Contains recipe/template info"
    }
```

## 3. The Input Resolver Pattern

The `InputResolverService` abstracts the source of data. This allows the core engine to remain identical regardless of whether it's reading a real file or a result from 5 minutes ago.

```java
public interface InputProvider {
    Stream<Map<String, Object>> streamData();
    SchemaResponse getSchema();
}

@Service
public class InputResolverService {
    public InputProvider getProvider(DataSourceType type, Long id) {
        return switch (type) {
            case FILE -> new FileInputProvider(id);
            case RECONCILIATION_RESULT -> new ResultInputProvider(id);
            case DATA_SOURCE -> new ExternalSourceProvider(id);
        };
    }
}
```

## 4. Key Advantages

1.  **Traceability (Audit Ready):** Every step produces a downloadable file of "What was left." Auditors can verify exactly how the system arrived at the final exceptions.
2.  **Stateless Engine:** The `ReconciliationService` doesn't need to know about the "Stream". It just processes two inputs. This minimizes refactoring risk.
3.  **Scalability:** By materializing files to disk, we avoid keeping massive JSON results in the database or memory between steps.
4.  **Specialized Recipes:** We can create "Templates" (e.g., "Standard E-commerce Recipe") that are just JSON definitions of 3 chained reconciliation steps.
